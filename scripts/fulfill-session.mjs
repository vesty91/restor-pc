import { readFileSync, existsSync } from "fs";
import { fulfillToolOrder } from "../src/lib/fulfillment/index.ts";
import Stripe from "stripe";

const envPath = ".env.local";
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    const k = line.slice(0, i).trim();
    const v = line.slice(i + 1).trim();
    if (!(k in process.env)) process.env[k] = v;
  }
}

const sid = process.argv[2]?.trim();
if (!sid || !sid.startsWith("cs_")) {
  console.error("Usage: npm run fulfill:session -- cs_test_xxx");
  console.error("L'identifiant de session Stripe est obligatoire.");
  process.exit(1);
}

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("STRIPE_SECRET_KEY manquant");
  process.exit(1);
}

if (key.startsWith("sk_live_") && process.env.ALLOW_STRIPE_LIVE !== "true") {
  console.error("Clé Live refusée (ALLOW_STRIPE_LIVE !== true)");
  process.exit(1);
}

const stripe = new Stripe(key);
const session = await stripe.checkout.sessions.retrieve(sid);
const email =
  session.customer_details?.email || session.customer_email || undefined;
const slug = session.metadata?.tool_slug;
const userId = session.metadata?.user_id ?? null;

if (!email || !slug) {
  console.error("Session sans email/slug", {
    hasEmail: Boolean(email),
    hasSlug: Boolean(slug),
    status: session.status,
  });
  process.exit(1);
}

console.log("Fulfill", {
  sid,
  slug,
  payment: session.payment_status,
  hasUserId: Boolean(userId),
});

const result = await fulfillToolOrder({
  email,
  toolSlug: slug,
  orderRef: sid,
  source: "stripe",
  sendEmail: true,
  userId,
  stripePriceId: session.metadata?.stripe_price_id ?? null,
  amountTotal: session.amount_total,
  currency: session.currency,
  termsVersion: session.metadata?.terms_version ?? null,
  termsAcceptedAt: session.metadata?.terms_accepted_at ?? null,
  withdrawalConsentAt: session.metadata?.withdrawal_consent_at ?? null,
  digitalDeliveryRequestedAt:
    session.metadata?.digital_delivery_requested_at ?? null,
});

console.log("OK", {
  orderId: result.orderId,
  status: result.status,
  toolTitle: result.toolTitle,
  emailSent: Boolean(result.emailId),
  emailError: Boolean(result.emailError),
  // Pas de licence / mot de passe / URL dans les logs
});
