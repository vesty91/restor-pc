process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { readFileSync } from "fs";
import { fulfillToolOrder } from "../src/lib/fulfillment/index.ts";
import Stripe from "stripe";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  if (!line || line.startsWith("#") || !line.includes("=")) continue;
  const i = line.indexOf("=");
  process.env[line.slice(0, i)] = line.slice(i + 1);
}

const sid =
  process.argv[2] ||
  "cs_test_a1BUanDQ4iDp6TpCjQudoSZIa7WHlBfjRf30BvSersNhbXa3tkSki1IwNb";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("STRIPE_SECRET_KEY manquant");
  process.exit(1);
}

const stripe = new Stripe(key);
const session = await stripe.checkout.sessions.retrieve(sid);
const email =
  session.customer_details?.email || session.customer_email || undefined;
const slug = session.metadata?.tool_slug;

if (!email || !slug) {
  console.error("Session sans email/slug", { email, slug, status: session.status });
  process.exit(1);
}

console.log("Fulfill", { sid, email, slug, payment: session.payment_status });
const result = await fulfillToolOrder({
  email,
  toolSlug: slug,
  orderRef: sid,
  source: "stripe",
  sendEmail: true,
});
console.log("OK", {
  licenseKey: result.licenseKey,
  downloadUrl: result.downloadUrl,
  password: result.downloadPassword,
  orderId: result.orderId,
});
