import { defineConfig, mergeConfig } from "vitest/config";
import base from "./vitest.config";

/**
 * Couverture ciblée modules critiques (Phase 4).
 * Ne pas brancher en bloquant sur le job unit-tests CI tant que
 * les seuils ne sont pas stabilisés — script local / job dédié.
 */
export default mergeConfig(
  base,
  defineConfig({
    test: {
      coverage: {
        include: [
          "src/lib/fulfillment/**/*.ts",
          "src/lib/auth/roles.ts",
          "src/lib/stripe.ts",
          "src/app/api/stripe/**/*.ts",
        ],
        thresholds: {
          "src/lib/auth/roles.ts": {
            lines: 70,
            functions: 70,
            statements: 70,
          },
          "src/lib/fulfillment/index.ts": {
            lines: 55,
            functions: 50,
            statements: 55,
          },
          "src/app/api/stripe/webhook/route.ts": {
            lines: 55,
            functions: 50,
            statements: 55,
          },
        },
      },
    },
  }),
);
