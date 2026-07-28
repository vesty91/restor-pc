import Stripe from "stripe";
import { assertStripeMode, getServerEnv } from "@/lib/env";

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  const env = getServerEnv();
  assertStripeMode(env);
  const key = env.STRIPE_SECRET_KEY?.trim();
  if (!key) throw new Error("STRIPE_SECRET_KEY manquant");
  if (!stripe) {
    stripe = new Stripe(key);
  }
  return stripe;
}
