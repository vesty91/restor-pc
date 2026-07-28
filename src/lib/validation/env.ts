/**
 * Schéma env serveur — source unique : `src/lib/env.ts`.
 * Ne jamais importer `env.ts` depuis un Client Component.
 */
export {
  getServerEnv,
  getPublicSiteUrl,
  getTermsVersion,
  getConsumerMediator,
  assertStripeMode,
  clearServerEnvCache,
  type ServerEnv,
} from "@/lib/env";
