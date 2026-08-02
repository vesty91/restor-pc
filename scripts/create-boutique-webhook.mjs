import { readFileSync, writeFileSync } from "fs";
import Stripe from "stripe";

/** Events traités par src/app/api/stripe/webhook/route.ts (Vague 1) */
const ENABLED_EVENTS = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "charge.refunded",
  "charge.dispute.created",
  "charge.dispute.closed",
];

const path = ".env.local";
const raw0 = readFileSync(path, "utf8");
const env = Object.fromEntries(
  raw0
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);

if (!env.STRIPE_SECRET_KEY?.startsWith("sk_")) {
  console.error("STRIPE_SECRET_KEY manquant ou invalide dans .env.local");
  process.exit(1);
}

if (env.STRIPE_SECRET_KEY.startsWith("sk_live_") && env.ALLOW_STRIPE_LIVE !== "true") {
  console.error("Clé Live refusée (ALLOW_STRIPE_LIVE !== true)");
  process.exit(1);
}

const stripe = new Stripe(env.STRIPE_SECRET_KEY);
const url =
  (env.NEXT_PUBLIC_SITE_URL || "https://www.restor-pc.fr").replace(/\/$/, "") +
  "/api/stripe/webhook";

const list = await stripe.webhookEndpoints.list({ limit: 20 });
console.log("=== Webhooks actuels ===");
for (const w of list.data) {
  console.log(`- ${w.id} | ${w.url} | ${w.status}`);
  console.log(`  events (${w.enabled_events.length}): ${w.enabled_events.join(", ") || "(all)"}`);
}

let ep = list.data.find((w) => w.url === url);
if (!ep) {
  ep = await stripe.webhookEndpoints.create({
    url,
    enabled_events: ENABLED_EVENTS,
    description: "Boutique Restor-PC (site Next.js) — Vague 1",
    metadata: { app: "restor-pc-boutique", wave: "1" },
  });
  console.log("\nCREATED boutique webhook:", ep.id);
  console.log("URL:", ep.url);
  console.log("SECRET:", ep.secret);
} else {
  ep = await stripe.webhookEndpoints.update(ep.id, {
    enabled_events: ENABLED_EVENTS,
    description: "Boutique Restor-PC (site Next.js) — Vague 1",
    disabled: false,
    metadata: { app: "restor-pc-boutique", wave: "1" },
  });
  console.log("\nUPDATED boutique webhook:", ep.id);
  console.log("URL:", ep.url);
  console.log("Events:", ep.enabled_events.join(", "));
  console.log("Secret inchangé (déjà dans .env.local / Vercel).");
}

let raw = raw0;
const espace = env.STRIPE_WEBHOOK_SECRET_ESPACE_CLIENT || env.STRIPE_WEBHOOK_SECRET;
if (!espace) {
  console.warn("STRIPE_WEBHOOK_SECRET_ESPACE_CLIENT absent — pas d'archivage espace-client.");
}

if (espace && !/^STRIPE_WEBHOOK_SECRET_ESPACE_CLIENT=/m.test(raw)) {
  raw = raw.replace(
    /^STRIPE_WEBHOOK_SECRET=.*$/m,
    `STRIPE_WEBHOOK_SECRET_ESPACE_CLIENT=${espace}\nSTRIPE_WEBHOOK_SECRET=`,
  );
}

if (ep.secret) {
  if (/^STRIPE_WEBHOOK_SECRET=/m.test(raw)) {
    raw = raw.replace(/^STRIPE_WEBHOOK_SECRET=.*$/m, `STRIPE_WEBHOOK_SECRET=${ep.secret}`);
  } else {
    raw += `\nSTRIPE_WEBHOOK_SECRET=${ep.secret}\n`;
  }
  writeFileSync(path, raw);
  console.log("\n.env.local: STRIPE_WEBHOOK_SECRET mis à jour (nouvel endpoint)");
} else {
  console.log("\nPas de nouveau secret (update uniquement).");
}

const again = await stripe.webhookEndpoints.retrieve(ep.id);
console.log("\n=== Endpoint final ===");
console.log(`id: ${again.id}`);
console.log(`url: ${again.url}`);
console.log(`status: ${again.status}`);
console.log(`events:\n  - ${again.enabled_events.join("\n  - ")}`);
