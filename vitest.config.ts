import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.{test,spec}.ts", "tests/integration/**/*.{test,spec}.ts"],
    exclude: ["node_modules", ".next", "tests/e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      // Inclure largement pour les rapports ; les seuils critiques
      // sont appliqués via `npm run test:coverage:critical` (config dédiée).
      include: ["src/lib/**/*.ts", "src/app/api/stripe/**/*.ts"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
