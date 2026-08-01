import Stripe from "stripe";
import type StripeTypes from "stripe";

const WHSEC = "whsec_test_phase4_restor_pc_not_real";

/** Secret webhook de test (jamais une vraie valeur prod). */
export const TEST_WEBHOOK_SECRET = WHSEC;

export function createTestStripe(): Stripe {
  return new Stripe("sk_test_phase4_restor_pc_not_real");
}

export function signStripePayload(payload: string, secret = WHSEC): string {
  const stripe = createTestStripe();
  return stripe.webhooks.generateTestHeaderString({
    payload,
    secret,
  });
}

export function buildCheckoutSessionEvent(opts: {
  eventId?: string;
  sessionId?: string;
  paymentStatus?: StripeTypes.Checkout.Session.PaymentStatus;
  toolSlug?: string;
  userId?: string | null;
  email?: string;
  priceId?: string | null;
  paymentIntent?: string;
  type?: "checkout.session.completed" | "checkout.session.async_payment_succeeded";
}): { payload: string; event: StripeTypes.Event } {
  const sessionId = opts.sessionId ?? `cs_test_${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`;
  const eventId = opts.eventId ?? `evt_test_${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`;
  const session = {
    id: sessionId,
    object: "checkout.session",
    payment_status: opts.paymentStatus ?? "paid",
    customer_email: opts.email ?? "buyer@example.com",
    customer_details: { email: opts.email ?? "buyer@example.com" },
    amount_total: 1900,
    currency: "eur",
    payment_intent: opts.paymentIntent ?? `pi_test_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`,
    metadata: {
      tool_slug: opts.toolSlug ?? "changer-dns",
      user_id: opts.userId === null ? undefined : (opts.userId ?? "11111111-2222-4333-a444-555555555555"),
      stripe_price_id: opts.priceId === null ? undefined : (opts.priceId ?? "price_test_changer_dns"),
      terms_version: "2026-07-01",
      terms_accepted_at: new Date().toISOString(),
      withdrawal_consent_at: new Date().toISOString(),
      digital_delivery_requested_at: new Date().toISOString(),
    },
  };

  // Nettoie metadata undefined
  for (const k of Object.keys(session.metadata)) {
    if ((session.metadata as Record<string, unknown>)[k] === undefined) {
      delete (session.metadata as Record<string, unknown>)[k];
    }
  }

  const event = {
    id: eventId,
    object: "event",
    api_version: "2026-06-24.dahlia",
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    pending_webhooks: 0,
    request: { id: null, idempotency_key: null },
    type: opts.type ?? "checkout.session.completed",
    data: { object: session },
  } as unknown as StripeTypes.Event;

  return { payload: JSON.stringify(event), event };
}

export function buildRefundEvent(opts: {
  eventId?: string;
  paymentIntent: string;
  type?: "charge.refunded" | "charge.dispute.created";
}): { payload: string; event: StripeTypes.Event } {
  const eventId = opts.eventId ?? `evt_test_${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`;
  const charge = {
    id: `ch_test_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`,
    object: "charge",
    payment_intent: opts.paymentIntent,
  };
  const event = {
    id: eventId,
    object: "event",
    api_version: "2026-06-24.dahlia",
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    pending_webhooks: 0,
    request: { id: null, idempotency_key: null },
    type: opts.type ?? "charge.refunded",
    data: { object: charge },
  } as unknown as StripeTypes.Event;
  return { payload: JSON.stringify(event), event };
}
