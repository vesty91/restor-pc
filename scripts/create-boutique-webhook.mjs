import { readFileSync, writeFileSync } from "fs";
import Stripe from "stripe";

const path = ".env.local";
const raw0 = readFileSync(path, "utf8");
const env = Object.fromEntries(
  raw0
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    })
);

const stripe = new Stripe(env.STRIPE_SECRET_KEY);
const url = "https://www.restor-pc.fr/api/stripe/webhook";

const list = await stripe.webhookEndpoints.list({ limit: 20 });
console.log("=== Webhooks actuels ===");
for (const w of list.data) {
  console.log(`- ${w.id} | ${w.url} | ${w.status}`);
}

let ep = list.data.find((w) => w.url === url);
if (!ep) {
  ep = await stripe.webhookEndpoints.create({
    url,
    enabled_events: ["checkout.session.completed"],
    description: "Boutique Restor-PC (site Next.js)",
    metadata: { app: "restor-pc-boutique" },
  });
  console.log("\nCREATED boutique webhook:", ep.id);
  console.log("URL:", ep.url);
  console.log("SECRET:", ep.secret);
} else {
  console.log("\nBoutique webhook already exists:", ep.id);
  console.log("Secret only returned at creation — not rotated.");
}

let raw = raw0;
const espace =
  env.STRIPE_WEBHOOK_SECRET_ESPACE_CLIENT ||
  env.STRIPE_WEBHOOK_SECRET ||
  "whsec_3ho0I4xoCriHXzoFvjWWJ88X2wRvA6Uk";

if (!/^STRIPE_WEBHOOK_SECRET_ESPACE_CLIENT=/m.test(raw)) {
  raw = raw.replace(
    /^STRIPE_WEBHOOK_SECRET=.*$/m,
    `STRIPE_WEBHOOK_SECRET_ESPACE_CLIENT=${espace}\nSTRIPE_WEBHOOK_SECRET=`
  );
}

if (ep.secret) {
  if (/^STRIPE_WEBHOOK_SECRET=/m.test(raw)) {
    raw = raw.replace(/^STRIPE_WEBHOOK_SECRET=.*$/m, `STRIPE_WEBHOOK_SECRET=${ep.secret}`);
  } else {
    raw += `\nSTRIPE_WEBHOOK_SECRET=${ep.secret}\n`;
  }
  writeFileSync(path, raw);
  console.log("\n.env.local: STRIPE_WEBHOOK_SECRET = boutique (nouveau)");
  console.log(".env.local: STRIPE_WEBHOOK_SECRET_ESPACE_CLIENT conserve (espace-client)");
} else {
  console.log("\nPas de nouveau secret (endpoint existait deja).");
}

const again = await stripe.webhookEndpoints.list({ limit: 20 });
console.log("\n=== Webhooks apres ===");
for (const w of again.data) {
  console.log(`- ${w.id} | ${w.url}`);
}
