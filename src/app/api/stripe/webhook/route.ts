import { fulfillToolOrder } from "@/lib/fulfillment";
import { getStripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET manquant" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "signature manquante" }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "signature invalide";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const slug = session.metadata?.tool_slug;
    const email =
      session.customer_details?.email ||
      session.customer_email ||
      undefined;

    if (!slug || !email) {
      console.error("webhook: slug/email manquants", session.id);
      return NextResponse.json({ received: true, skipped: true });
    }

    try {
      await fulfillToolOrder({
        email,
        toolSlug: slug,
        orderRef: session.id,
        source: "stripe",
        sendEmail: true,
      });
    } catch (err) {
      console.error("webhook fulfill error", err);
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "fulfill failed" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
