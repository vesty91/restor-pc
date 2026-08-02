import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Contrôles Axe avec color-contrast activé.
 * Exclusion ciblée : canvas / WebGL Hero (mesure Axe peu fiable sur WebGL).
 */
async function expectA11y(page: import("@playwright/test").Page, path: string) {
  await page.goto(path);
  await expect(page.locator("main#contenu")).toBeVisible();

  const results = await new AxeBuilder({ page })
    .exclude("canvas")
    .exclude("[data-hero-webgl]")
    .analyze();

  const serious = results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious",
  );
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
}

test.describe("Accessibilité Axe (WCAG contrast inclus)", () => {
  test("accueil", async ({ page }) => {
    await expectA11y(page, "/");
  });

  test("contact", async ({ page }) => {
    await expectA11y(page, "/contact");
  });

  test("boutique", async ({ page }) => {
    await expectA11y(page, "/boutique");
  });

  test("compte", async ({ page }) => {
    await expectA11y(page, "/compte");
  });

  test("admin login", async ({ page }) => {
    await expectA11y(page, "/admin");
  });
});
