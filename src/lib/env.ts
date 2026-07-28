import { z } from "zod";

/**
 * Validation centralisée des variables d'environnement (serveur).
 * Ne jamais importer ce module depuis un composant client.
 */

const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

const optionalUrl = z.preprocess(
  emptyToUndefined,
  z.string().url().optional()
);

const optionalString = z.preprocess(
  emptyToUndefined,
  z.string().min(1).optional()
);

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  NEXT_PUBLIC_SITE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalString,

  SUPABASE_URL: optionalUrl,
  SUPABASE_SERVICE_ROLE_KEY: optionalString,

  STRIPE_SECRET_KEY: optionalString,
  STRIPE_WEBHOOK_SECRET: optionalString,
  ALLOW_STRIPE_LIVE: z
    .preprocess(emptyToUndefined, z.enum(["true", "false"]).optional())
    .default("false"),

  RESEND_API_KEY: optionalString,
  CONTACT_TO_EMAIL: optionalString,
  CONTACT_FROM_EMAIL: optionalString,
  PURCHASE_EMAIL_BCC: optionalString,

  NAS_DSM_URL: optionalUrl,
  NAS_USER: optionalString,
  NAS_PASS: optionalString,
  NAS_PUBLIC_BASE: optionalUrl,
  NAS_SSH_HOST: optionalString,
  NAS_SSH_USER: optionalString,
  NAS_SSH_PASS: optionalString,
  NAS_SSH_FALLBACK_ENABLED: z
    .preprocess(emptyToUndefined, z.enum(["true", "false"]).optional())
    .default("false"),

  ATELIER_SECRET: optionalString,
  ATELIER_SESSION_SECRET: optionalString,

  CONSUMER_MEDIATOR_NAME: optionalString,
  CONSUMER_MEDIATOR_ADDRESS: optionalString,
  CONSUMER_MEDIATOR_WEBSITE: optionalUrl,

  TERMS_VERSION: z.preprocess(emptyToUndefined, z.string().optional()).default("2026-07-01"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Configuration invalide: ${details}`);
  }
  cached = parsed.data;
  assertStripeMode(cached);
  return cached;
}

/** Valide Stripe sans planter le build si la clé est absente (pages statiques). */
export function assertStripeMode(env: Pick<ServerEnv, "STRIPE_SECRET_KEY" | "ALLOW_STRIPE_LIVE" | "NODE_ENV"> = getServerEnv()): void {
  const key = env.STRIPE_SECRET_KEY;
  if (!key) return;
  const isLive = key.startsWith("sk_live_");
  if (isLive && env.ALLOW_STRIPE_LIVE !== "true") {
    throw new Error(
      "Clé Stripe Live détectée (sk_live_) mais ALLOW_STRIPE_LIVE n'est pas 'true'. " +
        "Refus de démarrer — restez en mode test tant que la validation n'est pas explicite."
    );
  }
}

export function getPublicSiteUrl(fallbackOrigin?: string): string {
  const env = getServerEnv();
  if (env.NEXT_PUBLIC_SITE_URL) {
    return env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (fallbackOrigin) return fallbackOrigin.replace(/\/$/, "");
  return "https://www.restor-pc.fr";
}

export function isStripeLiveKey(key?: string | null): boolean {
  return Boolean(key?.startsWith("sk_live_"));
}

export function getConsumerMediator() {
  const env = getServerEnv();
  if (!env.CONSUMER_MEDIATOR_NAME && !env.CONSUMER_MEDIATOR_WEBSITE) {
    return null;
  }
  return {
    name: env.CONSUMER_MEDIATOR_NAME ?? null,
    address: env.CONSUMER_MEDIATOR_ADDRESS ?? null,
    website: env.CONSUMER_MEDIATOR_WEBSITE ?? null,
  };
}

export function getTermsVersion(): string {
  return getServerEnv().TERMS_VERSION ?? "2026-07-01";
}
