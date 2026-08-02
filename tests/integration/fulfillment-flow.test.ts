/**
 * Tests d’intégration fulfillToolOrder — logique réelle,
 * mocks uniquement NAS + Resend + store mémoire.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryDb, type MemoryDb } from "../helpers/memory-db";
import { clearServerEnvCache } from "@/lib/env";
import { AppError } from "@/lib/errors";

const nasMock = vi.fn();
const emailMock = vi.fn();
const authUser = vi.fn();

let db: MemoryDb;

vi.mock("@/lib/fulfillment/supabase", () => ({
  getSupabaseAdmin: () => db.client,
}));

vi.mock("@/lib/fulfillment/nas", () => ({
  createNasOneTimeShare: (...args: unknown[]) => nasMock(...args),
  revokeNasShare: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/fulfillment/email", () => ({
  sendPurchaseEmail: (...args: unknown[]) => emailMock(...args),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: authUser() } }),
    },
  }),
}));

const USER_A = "11111111-2222-4333-a444-555555555555";
const USER_B = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";

async function loadFulfill() {
  return import("@/lib/fulfillment");
}

describe("fulfillToolOrder — flux critiques", () => {
  beforeEach(() => {
    vi.resetModules();
    db = createMemoryDb();
    nasMock.mockReset();
    emailMock.mockReset();
    authUser.mockReset();
    nasMock.mockResolvedValue({
      id: "share-ok",
      url: "https://nas.example/share/ok",
      password: "SharePw1!",
    });
    emailMock.mockResolvedValue({ id: "re_ok" });
    process.env.STRIPE_PRICE_CHANGER_DNS = "price_test_changer_dns";
    clearServerEnvCache();
  });

  afterEach(() => {
    clearServerEnvCache();
  });

  it("6. produit inconnu → AppError UNKNOWN_PRODUCT", async () => {
    const { fulfillToolOrder } = await loadFulfill();
    await expect(
      fulfillToolOrder({
        email: "a@example.com",
        toolSlug: "nope",
        orderRef: "atelier-unknown",
        source: "atelier",
      }),
    ).rejects.toMatchObject({ code: "UNKNOWN_PRODUCT" } satisfies Partial<AppError>);
  });

  it("8. user_id invalide → INVALID_USER_ID", async () => {
    const { fulfillToolOrder } = await loadFulfill();
    await expect(
      fulfillToolOrder({
        email: "a@example.com",
        toolSlug: "changer-dns",
        orderRef: "atelier-bad-user",
        source: "atelier",
        userId: "bad",
      }),
    ).rejects.toMatchObject({ code: "INVALID_USER_ID" } satisfies Partial<AppError>);
  });

  it("9+10. concurrence même order_ref → une seule licence", async () => {
    const { fulfillToolOrder } = await loadFulfill();
    const input = {
      email: "race@example.com",
      toolSlug: "changer-dns",
      orderRef: "cs_race_same",
      source: "stripe" as const,
      userId: USER_A,
      sendEmail: true,
    };

    const results = await Promise.allSettled([fulfillToolOrder(input), fulfillToolOrder(input)]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    expect(fulfilled.length).toBeGreaterThanOrEqual(1);
    expect(db.tables.script_licenses).toHaveLength(1);
    expect(db.tables.tool_orders).toHaveLength(1);
    expect(db.tables.tool_orders[0]?.status).toBe("fulfilled");
  });

  it("11. échec NAS après réservation → commande failed", async () => {
    nasMock.mockRejectedValueOnce(new Error("NAS down"));
    const { fulfillToolOrder } = await loadFulfill();
    await expect(
      fulfillToolOrder({
        email: "nasfail@example.com",
        toolSlug: "changer-dns",
        orderRef: "cs_nas_fail",
        source: "stripe",
        userId: USER_A,
      }),
    ).rejects.toMatchObject({ code: "NAS_LINK_FAILED" } satisfies Partial<AppError>);

    expect(db.tables.tool_orders[0]?.status).toBe("failed");
    expect(db.tables.tool_orders[0]?.error_code).toBe("NAS_LINK_FAILED");
    expect(db.tables.script_licenses.length).toBe(1);
  });

  it("12. reprise après échec NAS → fulfilled", async () => {
    nasMock.mockRejectedValueOnce(new Error("NAS down"));
    const { fulfillToolOrder } = await loadFulfill();
    const input = {
      email: "retry@example.com",
      toolSlug: "changer-dns",
      orderRef: "cs_nas_retry",
      source: "stripe" as const,
      userId: USER_A,
    };
    await expect(fulfillToolOrder(input)).rejects.toMatchObject({
      code: "NAS_LINK_FAILED",
    });

    nasMock.mockResolvedValueOnce({
      id: "share-retry",
      url: "https://nas.example/share/retry",
      password: "RetryPw1!",
    });
    const result = await fulfillToolOrder(input);
    expect(result.status).toBe("fulfilled");
    expect(db.tables.tool_orders[0]?.status).toBe("fulfilled");
    expect(result.downloadUrl).toContain("nas.example");
  });

  it("13. échec Resend sans perdre la licence", async () => {
    emailMock.mockRejectedValueOnce(new Error("Resend 500"));
    const { fulfillToolOrder } = await loadFulfill();
    const result = await fulfillToolOrder({
      email: "mailfail@example.com",
      toolSlug: "changer-dns",
      orderRef: "cs_email_fail",
      source: "stripe",
      userId: USER_A,
    });
    expect(result.status).toBe("fulfilled");
    expect(result.licenseKey).toMatch(/^RPC-/);
    expect(result.emailError).toMatch(/Resend/);
    expect(db.tables.tool_orders[0]?.status).toBe("fulfilled");
    expect(db.tables.tool_orders[0]?.email_retry_needed).toBe(true);
    expect(db.tables.script_licenses).toHaveLength(1);
  });

  it("14. renvoi e-mail idempotent (déjà envoyé → pas de 2e envoi)", async () => {
    const { fulfillToolOrder } = await loadFulfill();
    const input = {
      email: "idem@example.com",
      toolSlug: "changer-dns",
      orderRef: "cs_email_idem",
      source: "stripe" as const,
      userId: USER_A,
    };
    await fulfillToolOrder(input);
    expect(emailMock).toHaveBeenCalledTimes(1);

    const again = await fulfillToolOrder(input);
    expect(again.status).toBe("fulfilled");
    expect(emailMock).toHaveBeenCalledTimes(1);

    await fulfillToolOrder({ ...input, forceEmail: true });
    expect(emailMock).toHaveBeenCalledTimes(2);
  });

  it("10. happy path → une licence + assets", async () => {
    const { fulfillToolOrder } = await loadFulfill();
    const result = await fulfillToolOrder({
      email: "ok@example.com",
      toolSlug: "changer-dns",
      orderRef: "cs_happy",
      source: "stripe",
      userId: USER_A,
    });
    expect(result.status).toBe("fulfilled");
    expect(result.licenseKey).toMatch(/^RPC-/);
    expect(result.downloadPassword).toBeTruthy();
    expect(db.tables.script_licenses).toHaveLength(1);
    expect(db.tables.tool_orders[0]?.user_id).toBe(USER_A);
  });
});

describe("isolation commandes client (user_id)", () => {
  beforeEach(() => {
    vi.resetModules();
    db = createMemoryDb();
    authUser.mockReset();
  });

  it("17. données d’un client jamais accessibles à un autre", async () => {
    authUser.mockReturnValue({ id: USER_A, email: "shared@example.com" });
    db.tables.tool_orders.push(
      {
        id: "o1",
        order_ref: "cs_a",
        user_id: USER_A,
        email: "shared@example.com",
        license_key: "RPC-AAA",
        status: "fulfilled",
        created_at: "2026-01-01T00:00:00Z",
        tool_slug: "changer-dns",
        tool_title: "Changer DNS",
        script_id: "change-dns",
        source: "stripe",
        share_url: "https://nas/a",
        share_password: "a",
        expire_times: 1,
        email_sent_at: null,
        email_retry_needed: false,
        terms_version: "2026-07-01",
        withdrawal_consent_at: null,
      },
      {
        id: "o2",
        order_ref: "cs_b",
        user_id: USER_B,
        email: "shared@example.com",
        license_key: "RPC-BBB",
        status: "fulfilled",
        created_at: "2026-01-02T00:00:00Z",
        tool_slug: "changer-dns",
        tool_title: "Changer DNS",
        script_id: "change-dns",
        source: "stripe",
        share_url: "https://nas/b",
        share_password: "b",
        expire_times: 1,
        email_sent_at: null,
        email_retry_needed: false,
        terms_version: "2026-07-01",
        withdrawal_consent_at: null,
      },
      {
        id: "o3",
        order_ref: "cs_orphan",
        user_id: null,
        email: "shared@example.com",
        license_key: "RPC-ORPH",
        status: "fulfilled",
        created_at: "2026-01-03T00:00:00Z",
        tool_slug: "changer-dns",
        tool_title: "Changer DNS",
        script_id: "change-dns",
        source: "stripe",
        share_url: "https://nas/o",
        share_password: "o",
        expire_times: 1,
        email_sent_at: null,
        email_retry_needed: false,
        terms_version: "2026-07-01",
        withdrawal_consent_at: null,
      },
    );

    const { GET } = await import("@/app/api/compte/orders/route");
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.orders).toHaveLength(1);
    expect(body.orders[0].id).toBe("o1");
    expect(body.orders[0].license_key).toBe("RPC-AAA");
    expect(body.orders.every((o: { user_id: string }) => o.user_id === USER_A)).toBe(true);
  });
});
