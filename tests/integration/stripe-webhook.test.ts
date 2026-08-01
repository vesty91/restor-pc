/**
 * Tests d’intégration : webhook Stripe avec signatures réelles (SDK)
 * et store Supabase mémoire. NAS / Resend mockés uniquement.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryDb, type MemoryDb } from "../helpers/memory-db";
import {
  TEST_WEBHOOK_SECRET,
  buildCheckoutSessionEvent,
  buildRefundEvent,
  signStripePayload,
} from "../helpers/stripe-signed";
import { clearServerEnvCache } from "@/lib/env";

const nasMock = vi.fn();
const emailMock = vi.fn();

let db: MemoryDb;

vi.mock("@/lib/fulfillment/supabase", () => ({
  getSupabaseAdmin: () => db.client,
}));

vi.mock("@/lib/fulfillment/nas", () => ({
  createNasOneTimeShare: (...args: unknown[]) => nasMock(...args),
}));

vi.mock("@/lib/fulfillment/email", () => ({
  sendPurchaseEmail: (...args: unknown[]) => emailMock(...args),
}));

const USER_A = "11111111-2222-4333-a444-555555555555";
const USER_B = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const PRICE = "price_test_changer_dns";

async function postWebhook(opts: {
  payload: string;
  signature?: string | null;
  secretEnv?: string | null;
}) {
  process.env.STRIPE_WEBHOOK_SECRET =
    opts.secretEnv === null ? "" : (opts.secretEnv ?? TEST_WEBHOOK_SECRET);
  process.env.STRIPE_SECRET_KEY = "sk_test_phase4_restor_pc_not_real";
  process.env.ALLOW_STRIPE_LIVE = "false";
  process.env.STRIPE_PRICE_CHANGER_DNS = PRICE;
  clearServerEnvCache();

  const { POST } = await import("@/app/api/stripe/webhook/route");
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (opts.signature !== null) {
    headers["stripe-signature"] =
      opts.signature ?? signStripePayload(opts.payload);
  }
  return POST(
    new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      headers,
      body: opts.payload,
    })
  );
}

describe("stripe webhook — signatures et fulfillment", () => {
  beforeEach(() => {
    vi.resetModules();
    db = createMemoryDb();
    nasMock.mockReset();
    emailMock.mockReset();
    nasMock.mockResolvedValue({
      id: "share-1",
      url: "https://nas.example/share/one",
      password: "PwTest123!",
    });
    emailMock.mockResolvedValue({ id: "email_test_1" });
    process.env.STRIPE_PRICE_CHANGER_DNS = PRICE;
    process.env.STRIPE_SECRET_KEY = "sk_test_phase4_restor_pc_not_real";
    process.env.STRIPE_WEBHOOK_SECRET = TEST_WEBHOOK_SECRET;
    process.env.ALLOW_STRIPE_LIVE = "false";
    clearServerEnvCache();
  });

  afterEach(() => {
    clearServerEnvCache();
  });

  it("1. signature Stripe valide → 200 + licence", async () => {
    const { payload, event } = buildCheckoutSessionEvent({
      userId: USER_A,
      priceId: PRICE,
    });
    const res = await postWebhook({ payload });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.received).toBe(true);
    expect(db.tables.script_licenses).toHaveLength(1);
    expect(db.tables.tool_orders).toHaveLength(1);
    expect(db.tables.tool_orders[0]?.status).toBe("fulfilled");
    expect(db.tables.stripe_events.find((e) => e.id === event.id)?.result).toBe(
      "fulfilled"
    );
    expect(nasMock).toHaveBeenCalledTimes(1);
    expect(emailMock).toHaveBeenCalledTimes(1);
  });

  it("2. signature Stripe invalide → 400", async () => {
    const { payload } = buildCheckoutSessionEvent({ userId: USER_A });
    const res = await postWebhook({
      payload,
      signature: "t=1,v1=deadbeef",
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe("INVALID_SIGNATURE");
    expect(db.tables.tool_orders).toHaveLength(0);
  });

  it("2b. signature absente → 400", async () => {
    const { payload } = buildCheckoutSessionEvent({ userId: USER_A });
    const res = await postWebhook({ payload, signature: null });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe("MISSING_SIGNATURE");
  });

  it("3. événement dupliqué → duplicate sans double licence", async () => {
    const { payload } = buildCheckoutSessionEvent({
      eventId: "evt_dup_fixed",
      sessionId: "cs_dup_fixed",
      userId: USER_A,
      priceId: PRICE,
    });
    const first = await postWebhook({ payload });
    expect(first.status).toBe(200);
    const second = await postWebhook({ payload });
    expect(second.status).toBe(200);
    const body = await second.json();
    expect(body.duplicate).toBe(true);
    expect(db.tables.script_licenses).toHaveLength(1);
    expect(db.tables.tool_orders).toHaveLength(1);
  });

  it("4. événement failed puis reclamé → retraité", async () => {
    const { payload, event } = buildCheckoutSessionEvent({
      eventId: "evt_reclaim",
      sessionId: "cs_reclaim",
      userId: USER_A,
      priceId: PRICE,
    });
    db.tables.stripe_events.push({
      id: event.id,
      type: event.type,
      result: "failed",
      processing_status: "failed",
      error_code: "HANDLER_ERROR",
      processed_at: new Date().toISOString(),
      retry_count: 0,
    });
    const res = await postWebhook({ payload });
    expect(res.status).toBe(200);
    expect(db.tables.script_licenses).toHaveLength(1);
    expect(
      db.tables.stripe_events.find((e) => e.id === event.id)?.result
    ).toBe("fulfilled");
  });

  it("5. paiement non payé → skipped, pas de licence", async () => {
    const { payload, event } = buildCheckoutSessionEvent({
      userId: USER_A,
      paymentStatus: "unpaid",
      priceId: PRICE,
    });
    const res = await postWebhook({ payload });
    expect(res.status).toBe(200);
    expect(db.tables.script_licenses).toHaveLength(0);
    expect(
      db.tables.stripe_events.find((e) => e.id === event.id)?.result
    ).toBe("skipped_unpaid");
  });

  it("6. produit inconnu → failed", async () => {
    const { payload, event } = buildCheckoutSessionEvent({
      userId: USER_A,
      toolSlug: "produit-inexistant",
      priceId: PRICE,
    });
    const res = await postWebhook({ payload });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(
      db.tables.stripe_events.find((e) => e.id === event.id)?.error_code
    ).toBe("HANDLER_ERROR");
  });

  it("7. price ID incorrect → failed PRICE_MISMATCH", async () => {
    const { payload, event } = buildCheckoutSessionEvent({
      userId: USER_A,
      priceId: "price_wrong_other",
    });
    const res = await postWebhook({ payload });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(
      db.tables.stripe_events.find((e) => e.id === event.id)?.error_code
    ).toBe("HANDLER_ERROR");
  });

  it("8. user_id absent → failed MISSING_USER_ID sans licence", async () => {
    const { payload, event } = buildCheckoutSessionEvent({
      userId: null,
      priceId: PRICE,
    });
    const res = await postWebhook({ payload });
    expect(res.status).toBe(200);
    expect(db.tables.script_licenses).toHaveLength(0);
    expect(
      db.tables.stripe_events.find((e) => e.id === event.id)?.result
    ).toBe("failed");
    expect(
      db.tables.stripe_events.find((e) => e.id === event.id)?.error_code
    ).toBe("MISSING_USER_ID");
  });

  it("8b. user_id invalide → failed MISSING_USER_ID", async () => {
    const { payload, event } = buildCheckoutSessionEvent({
      userId: "not-a-uuid",
      priceId: PRICE,
    });
    const res = await postWebhook({ payload });
    expect(res.status).toBe(200);
    expect(
      db.tables.stripe_events.find((e) => e.id === event.id)?.error_code
    ).toBe("MISSING_USER_ID");
  });

  it("15. remboursement → statut refunded", async () => {
    const pi = "pi_refund_test_1";
    db.tables.tool_orders.push({
      id: crypto.randomUUID(),
      order_ref: "cs_already",
      status: "fulfilled",
      stripe_payment_intent_id: pi,
      user_id: USER_A,
      email: "buyer@example.com",
      license_key: "RPC-TEST-KEY",
    });
    const { payload, event } = buildRefundEvent({
      paymentIntent: pi,
      type: "charge.refunded",
    });
    const res = await postWebhook({ payload });
    expect(res.status).toBe(200);
    expect(db.tables.tool_orders[0]?.status).toBe("refunded");
    expect(
      db.tables.stripe_events.find((e) => e.id === event.id)?.result
    ).toBe("refunded");
  });

  it("16. litige → statut disputed", async () => {
    const pi = "pi_dispute_test_1";
    db.tables.tool_orders.push({
      id: crypto.randomUUID(),
      order_ref: "cs_dispute",
      status: "fulfilled",
      stripe_payment_intent_id: pi,
      user_id: USER_B,
      email: "b@example.com",
      license_key: "RPC-TEST-KEY-2",
    });
    const { payload } = buildRefundEvent({
      paymentIntent: pi,
      type: "charge.dispute.created",
    });
    const res = await postWebhook({ payload });
    expect(res.status).toBe(200);
    expect(db.tables.tool_orders[0]?.status).toBe("disputed");
  });
});
