import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function expectNoCriticalA11y(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page })
    .disableRules(["color-contrast"])
    .analyze();
  const critical = results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious"
  );
  expect(critical, JSON.stringify(critical, null, 2)).toEqual([]);
}

test.describe("Pages publiques", () => {
  test("accueil charge et a un h1", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoCriticalA11y(page);
  });

  test("contact affiche le formulaire", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("form").first()).toBeVisible();
  });

  test("boutique catalogue", async ({ page }) => {
    await page.goto("/boutique");
    await expect(page.locator("main#contenu")).toBeVisible();
    await expect(page.getByRole("heading").first()).toBeVisible();
  });

  test("compte page auth", async ({ page }) => {
    await page.goto("/compte");
    await expect(page.locator("main#contenu")).toBeVisible();
    await expect(page.getByRole("heading").first()).toBeVisible();
  });

  test("admin login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: /Admin Restor-PC/i })).toBeVisible();
  });
});

test.describe("Navigation", () => {
  test("menu mobile s’ouvre", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/contact");
    const toggle = page.getByRole("button", { name: /ouvrir le menu/i });
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.getByRole("button", { name: /fermer le menu/i })).toBeVisible();
    await expect(page.getByRole("dialog", { name: /menu de navigation/i })).toBeVisible();
  });

  test("skip link et focus clavier", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: /aller au contenu/i });
    await expect(skip).toBeFocused();
  });
});

test.describe("Reduced motion", () => {
  test("accueil reste utilisable avec reduced-motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("main#contenu")).toBeVisible();
  });
});
