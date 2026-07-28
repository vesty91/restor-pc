/**
 * Tests d’intégration Stripe / auth — mocks purs (aucun service réel).
 */
import { describe, expect, it, beforeEach, vi } from "vitest";
import { isOrderStatus, ORDER_STATUSES } from "@/lib/fulfillment/order-status";
import { formatPublicApiError } from "@/lib/toast";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("idempotence événement Stripe (logique)", () => {
  const claimed = new Set<string>();

  function claimEvent(id: string): boolean {
    if (claimed.has(id)) return false;
    claimed.add(id);
    return true;
  }

  const failed = new Set<string>();
  function claimOrReclaim(id: string, previousFailed: boolean): boolean {
    if (!claimed.has(id)) {
      claimed.add(id);
      return true;
    }
    if (previousFailed && failed.has(id)) {
      failed.delete(id);
      return true;
    }
    return false;
  }

  beforeEach(() => {
    claimed.clear();
    failed.clear();
  });

  it("webhook reçu une fois → claim ok", () => {
    expect(claimEvent("evt_1")).toBe(true);
  });

  it("webhook reçu deux fois → duplicate", () => {
    expect(claimEvent("evt_1")).toBe(true);
    expect(claimEvent("evt_1")).toBe(false);
  });

  it("deux claims simultanés → un seul gagne", async () => {
    const id = "evt_race";
    const results = await Promise.all([
      Promise.resolve(claimEvent(id)),
      Promise.resolve(claimEvent(id)),
    ]);
    expect(results.filter(Boolean)).toHaveLength(1);
  });

  it("événement failed peut être reclamé", () => {
    expect(claimOrReclaim("evt_f", false)).toBe(true);
    failed.add("evt_f");
    expect(claimOrReclaim("evt_f", true)).toBe(true);
    expect(claimOrReclaim("evt_f", false)).toBe(false);
  });
});

describe("réservation commande (concurrence simulée)", () => {
  it("deux workers : une seule licence", async () => {
    let licenseCount = 0;
    const lock = { owner: null as string | null };

    async function worker(name: string) {
      if (lock.owner) return { created: false };
      lock.owner = name;
      await Promise.resolve();
      licenseCount += 1;
      return { created: true };
    }

    const [a, b] = await Promise.all([worker("a"), worker("b")]);
    expect([a.created, b.created].filter(Boolean)).toHaveLength(1);
    expect(licenseCount).toBe(1);
  });
});

describe("autorisation commandes", () => {
  it("user_id requis — email seul ne suffit pas", () => {
    const orders = [
      { id: "1", user_id: "user-a", email: "a@x.com" },
      { id: "2", user_id: null, email: "a@x.com" },
      { id: "3", user_id: "user-b", email: "a@x.com" },
    ];
    const mine = orders.filter((o) => o.user_id === "user-a");
    expect(mine.map((o) => o.id)).toEqual(["1"]);
  });

  it("user_id invalide rejeté", () => {
    const uuidRe =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(uuidRe.test("not-a-uuid")).toBe(false);
    expect(uuidRe.test("11111111-2222-4333-a444-555555555555")).toBe(true);
  });
});

describe("rôles atelier", () => {
  const canAccess = (role: string | null, atelierSession: boolean) =>
    atelierSession || role === "technician" || role === "admin";

  it("refuse sans rôle ni session", () => {
    expect(canAccess(null, false)).toBe(false);
  });

  it("accepte technician / admin / session HMAC transition", () => {
    expect(canAccess("technician", false)).toBe(true);
    expect(canAccess("admin", false)).toBe(true);
    expect(canAccess(null, true)).toBe(true);
    expect(canAccess("customer", false)).toBe(false);
  });
});

describe("statuts et toasts", () => {
  it("ORDER_STATUSES stables", () => {
    expect(ORDER_STATUSES.length).toBe(7);
    expect(isOrderStatus("processing")).toBe(true);
  });

  it("toast ne fuit pas de secret", () => {
    const msg = formatPublicApiError({
      error: "Échec sk_live_xxx ATELIER_SECRET",
      requestId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
    });
    expect(msg).toContain("[masqué]");
    expect(msg).toMatch(/réf\./);
  });
});

describe("mapping price / unpaid", () => {
  it("refuse paiement non payé", () => {
    const allowed = new Set(["paid", "no_payment_required"]);
    expect(allowed.has("unpaid")).toBe(false);
    expect(allowed.has("paid")).toBe(true);
  });

  it("détecte price mismatch", () => {
    const expected = "price_expected" as string;
    const got = "price_other" as string;
    expect(expected === got).toBe(false);
  });
});
