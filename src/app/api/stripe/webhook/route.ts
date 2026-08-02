import { fulfillToolOrder } from "@/lib/fulfillment";
import { revokeAccessByPaymentIntent } from "@/lib/fulfillment/revoke";
import { createRequestId, jsonError, publicErrorResponse } from "@/lib/errors";
import { logEvent } from "@/lib/logging/logger";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/fulfillment/supabase";
import { getProductBySlug, getStripePriceId } from "@/lib/data/outils";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

export const runtime = "nodejs";

async function claimEvent(event: Stripe.Event): Promise<boolean> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.rpc("claim_stripe_event", {
    p_id: event.id,
    p_type: event.type,
  });
  if (error) {
    // Fallback si RPC pas encore migré : insert manuel
    const { error: insErr } = await sb.from("stripe_events").insert({
      id: event.id,
      type: event.type,
    });
    if (insErr) {
      if (insErr.code === "23505") return false;
      throw insErr;
    }
    return true;
  }
  return data === true;
}

async function markEvent(eventId: string, result: string, errorCode?: string): Promise<void> {
  const sb = getSupabaseAdmin();
  await sb
    .from("stripe_events")
    .update({
      processed_at: new Date().toISOString(),
      result,
      error_code: errorCode ?? null,
    })
    .eq("id", eventId);
}

async function fulfillFromSession(
  session: Stripe.Checkout.Session,
  eventId: string,
): Promise<void> {
  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
    logEvent("warn", "stripe.webhook.unpaid", {
      stripeEventId: eventId,
      paymentStatus: session.payment_status,
    });
    await markEvent(eventId, "skipped_unpaid");
    return;
  }

  const slug = session.metadata?.tool_slug;
  const userId = session.metadata?.user_id ?? null;
  const email = session.customer_details?.email || session.customer_email || undefined;

  if (!slug || !email) {
    logEvent("error", "stripe.webhook.missing_meta", { stripeEventId: eventId });
    await markEvent(eventId, "failed", "MISSING_META");
    return;
  }

  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!userId || !uuidRe.test(userId)) {
    logEvent("error", "stripe.webhook.missing_user", { stripeEventId: eventId });
    await markEvent(eventId, "failed", "MISSING_USER_ID");
    return;
  }

  const product = getProductBySlug(slug);
  if (!product) {
    await markEvent(eventId, "failed", "UNKNOWN_PRODUCT");
    throw new Error("unknown product");
  }

  const expectedPrice = getStripePriceId(product);
  const linePrice =
    typeof session.metadata?.stripe_price_id === "string" ? session.metadata.stripe_price_id : null;

  // Vérifie le price id passé au checkout (metadata) si présent
  if (expectedPrice && linePrice && linePrice !== expectedPrice) {
    await markEvent(eventId, "failed", "PRICE_MISMATCH");
    throw new Error("price mismatch");
  }

  await fulfillToolOrder({
    email,
    toolSlug: slug,
    orderRef: session.id,
    source: "stripe",
    sendEmail: true,
    userId,
    stripeEventId: eventId,
    stripePaymentIntentId:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.payment_intent?.id ?? null),
    stripePriceId: expectedPrice || linePrice,
    amountTotal: session.amount_total,
    currency: session.currency,
    termsVersion: session.metadata?.terms_version ?? null,
    termsAcceptedAt: session.metadata?.terms_accepted_at ?? null,
    withdrawalConsentAt: session.metadata?.withdrawal_consent_at ?? null,
    digitalDeliveryRequestedAt: session.metadata?.digital_delivery_requested_at ?? null,
  });

  await markEvent(eventId, "fulfilled");
}

async function handleRefundOrDispute(event: Stripe.Event): Promise<void> {
  const obj = event.data.object as {
    payment_intent?: string | { id?: string };
    charge?: string;
    id?: string;
  };

  let pi: string | null = null;
  if (typeof obj.payment_intent === "string") pi = obj.payment_intent;
  else if (obj.payment_intent && typeof obj.payment_intent === "object") {
    pi = obj.payment_intent.id ?? null;
  }

  if (!pi) {
    await markEvent(event.id, "skipped_no_pi");
    return;
  }

  const status = event.type.startsWith("charge.dispute") ? "disputed" : "refunded";

  const result = await revokeAccessByPaymentIntent({
    paymentIntentId: pi,
    reason: status,
    stripeEventId: event.id,
  });

  await markEvent(event.id, status, result.orders.length === 0 ? "REVOKED_PI_ONLY" : undefined);
}

export async function POST(request: Request) {
  const requestId = createRequestId();
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return jsonError("WEBHOOK_NOT_CONFIGURED", "Webhook non configure.", 500, requestId);
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return jsonError("MISSING_SIGNATURE", "Signature manquante.", 400, requestId);
  }

  const stripe = getStripe();
  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    return jsonError("INVALID_SIGNATURE", "Signature invalide.", 400, requestId);
  }

  logEvent("info", "stripe.webhook.received", {
    requestId,
    stripeEventId: event.id,
    type: event.type,
  });

  let claimed = false;
  try {
    claimed = await claimEvent(event);
  } catch (err) {
    return publicErrorResponse(err, "EVENT_CLAIM_FAILED", requestId);
  }

  if (!claimed) {
    logEvent("info", "stripe.webhook.duplicate", {
      requestId,
      stripeEventId: event.id,
    });
    return NextResponse.json({ received: true, duplicate: true, requestId });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        await fulfillFromSession(session, event.id);
        break;
      }
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const sb = getSupabaseAdmin();
        await sb
          .from("tool_orders")
          .update({ status: "failed", error_code: "ASYNC_PAYMENT_FAILED" })
          .eq("order_ref", session.id);
        await markEvent(event.id, "async_payment_failed");
        break;
      }
      case "charge.refunded":
      case "charge.dispute.created":
      case "charge.dispute.closed": {
        await handleRefundOrDispute(event);
        break;
      }
      default:
        await markEvent(event.id, "ignored");
    }
  } catch (err) {
    logEvent("error", "stripe.webhook.handler_failed", {
      requestId,
      stripeEventId: event.id,
    });
    try {
      await markEvent(event.id, "failed", "HANDLER_ERROR");
    } catch {
      /* ignore */
    }
    return publicErrorResponse(err, "ORDER_FULFILLMENT_FAILED", requestId);
  }

  return NextResponse.json({ received: true, requestId });
}
