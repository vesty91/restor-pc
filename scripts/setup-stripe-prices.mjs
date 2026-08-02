/**
 * Crée les produits Stripe (mode de la clé) + écrit les price_… dans .env.local
 *
 * Prérequis : STRIPE_SECRET_KEY=sk_test_… (ou sk_live_…) dans .env.local
 * Usage : npm run stripe:setup-prices
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const envPath = resolve(root, ".env.local");

const PRODUCTS = [
  { env: "STRIPE_PRICE_CHANGER_DNS", name: "Changer DNS", cents: 1900 },
  { env: "STRIPE_PRICE_CONTROLE_INTEGRITE", name: "Contrôle Intégrité", cents: 2900 },
  { env: "STRIPE_PRICE_CREATEUR_ISO", name: "Créateur ISO", cents: 3900 },
  { env: "STRIPE_PRICE_DESACTIVER_SERVICES", name: "Désactiver Services", cents: 1900 },
  { env: "STRIPE_PRICE_EXPORT_IDENTIFIANTS", name: "Export Identifiants", cents: 3900 },
  { env: "STRIPE_PRICE_INSTALLATEUR_ATELIER", name: "Installateur Atelier", cents: 2900 },
  { env: "STRIPE_PRICE_MAPPER_PARTAGES", name: "Mapper Partages Réseau", cents: 1900 },
  { env: "STRIPE_PRICE_NETTOYAGE_WINDOWS", name: "Nettoyage Windows", cents: 1900 },
  { env: "STRIPE_PRICE_PILOTES_HORS_LIGNE", name: "Pilotes Hors-Ligne", cents: 2900 },
  { env: "STRIPE_PRICE_RAPPORT_BATTERIE", name: "Rapport Batterie", cents: 1500 },
  { env: "STRIPE_PRICE_RAPPORT_LOGICIELS", name: "Rapport Logiciels", cents: 1500 },
  { env: "STRIPE_PRICE_RESET_RESEAU", name: "Reset Réseau Complet", cents: 2900 },
  { env: "STRIPE_PRICE_SAUVEGARDE_PROFILS", name: "Sauvegarde Profils Navigateur", cents: 2900 },
  { env: "STRIPE_PRICE_SAUVEGARDE_USB", name: "Sauvegarde USB", cents: 1900 },
  { env: "STRIPE_PRICE_SAUVEGARDE_WIFI", name: "Sauvegarde Wi-Fi", cents: 1900 },
  { env: "STRIPE_PRICE_TELEMETRIE", name: "Télémétrie Windows", cents: 1900 },
  { env: "STRIPE_PRICE_TEST_RESEAU_DUAL", name: "Test Réseau Dual Pro", cents: 2900 },
  { env: "STRIPE_PRICE_PACK_COMPLET", name: "Pack complet Restor-PC", cents: 19900 },
];

function loadEnvFile(path) {
  const map = new Map();
  let raw = "";
  try {
    raw = readFileSync(path, "utf8");
  } catch {
    throw new Error(`.env.local introuvable : ${path}`);
  }
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.trimStart().startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i === -1) continue;
    map.set(line.slice(0, i).trim(), line.slice(i + 1).trim());
  }
  return { raw, map };
}

function upsertEnv(raw, key, value) {
  const re = new RegExp(`^${key}=.*$`, "m");
  if (re.test(raw)) return raw.replace(re, `${key}=${value}`);
  return `${raw.replace(/\s*$/, "")}\n${key}=${value}\n`;
}

async function main() {
  const { raw, map } = loadEnvFile(envPath);
  const secret = map.get("STRIPE_SECRET_KEY");
  if (!secret) {
    console.error(
      "STRIPE_SECRET_KEY manquant dans .env.local.\n" +
        "1. Dashboard Stripe → Mode test → Développeurs → Clés API\n" +
        "2. Colle sk_test_… dans STRIPE_SECRET_KEY\n" +
        "3. Relance : npm run stripe:setup-prices",
    );
    process.exit(1);
  }

  const stripe = new Stripe(secret);
  let next = raw;

  for (const p of PRODUCTS) {
    const existing = map.get(p.env);
    if (existing && existing.startsWith("price_")) {
      console.log(`OK (déjà) ${p.name} → ${existing}`);
      continue;
    }

    const product = await stripe.products.create({
      name: p.name,
      metadata: { restorpc_env: p.env },
    });
    const price = await stripe.prices.create({
      product: product.id,
      currency: "eur",
      unit_amount: p.cents,
    });

    next = upsertEnv(next, p.env, price.id);
    map.set(p.env, price.id);
    console.log(`Créé ${p.name} → ${price.id} (${(p.cents / 100).toFixed(2)} €)`);
  }

  writeFileSync(envPath, next, "utf8");
  console.log("\n.env.local mis à jour. Redémarre npm run dev.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
