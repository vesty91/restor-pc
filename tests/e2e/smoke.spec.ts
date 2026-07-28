import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function expectNoCriticalA11y(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page })
    .exclude("canvas")
    .exclude("[data-hero-webgl]")
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
    await expect(page.getByRole("heading", { name: /formulaire de contact/i })).toBeVisible();
    await expect(page.locator('form[novalidate]')).toBeVisible({ timeout: 20_000 });
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
    await expect(page.locator('form[novalidate]')).toBeVisible({ timeout: 20_000 });
    const toggle = page.getByRole("button", { name: /ouvrir le menu/i });
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.getByRole("button", { name: /fermer le menu/i })).toBeVisible({
      timeout: 10_000,
    });
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

async function fillContactForm(page: import("@playwright/test").Page) {
  await expect(page.locator('form[novalidate]')).toBeVisible({ timeout: 20_000 });
  await page.locator('input[autocomplete="name"]').fill("Alice Test");
  await page.locator('input[autocomplete="email"]').fill("alice@example.com");
  await page.locator('input[autocomplete="tel"]').fill("0612345678");
  await page.locator("textarea").first().fill("Bonjour, mon PC ne démarre plus du tout.");
  await page.locator('form[novalidate] input[type="checkbox"]').check();
}

test.describe("Toasts Sonner (contact mock)", () => {
  test("succès contact affiche un toast sans secret", async ({ page }) => {
    await page.route("**/api/contact", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          delivered: true,
          message: "Demande reçue.",
        }),
      });
    });

    await page.goto("/contact");
    await fillContactForm(page);
    await page.getByRole("button", { name: /envoyer/i }).click();

    const toast = page.locator("[data-sonner-toast]").first();
    await expect(toast).toBeVisible({ timeout: 10_000 });
    const text = await toast.innerText();
    expect(text.toLowerCase()).not.toMatch(/sk_live|bearer|atelier_secret|service_role/);
    await expect(page.locator("[data-sonner-toast]")).toHaveCount(1);
  });

  test("erreur contact affiche un toast", async ({ page }) => {
    await page.route("**/api/contact", async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          ok: false,
          delivered: false,
          error: "L’envoi automatique a échoué.",
          requestId: "11111111-2222-3333-4444-555555555555",
        }),
      });
    });

    await page.goto("/contact");
    await fillContactForm(page);
    await page.locator('input[autocomplete="name"]').fill("Bob Test");
    await page.locator('input[autocomplete="email"]').fill("bob@example.com");
    await page.getByRole("button", { name: /envoyer/i }).click();

    const toast = page.locator("[data-sonner-toast]").first();
    await expect(toast).toBeVisible({ timeout: 10_000 });
    const text = await toast.innerText();
    expect(text).toMatch(/échoué|erreur|réessayez/i);
    expect(text).not.toMatch(/sk_live|Bearer |ATELIER_SECRET/);
  });
});
