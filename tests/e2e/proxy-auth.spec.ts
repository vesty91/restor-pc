import { test, expect } from "@playwright/test";

test.describe("Proxy — pages publiques", () => {
  test("accueil, services, tarifs, contact et mentions légales sans boucle", async ({
    page,
  }) => {
    const paths = ["/", "/services", "/tarifs", "/contact", "/mentions-legales"];
    for (const path of paths) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBeLessThan(400);
      expect(page.url()).toContain(path === "/" ? "://" : path);
      await expect(page.locator("main#contenu")).toBeVisible();
    }
  });

  test("pas de boucle de redirection sur l’accueil", async ({ page }) => {
    let redirects = 0;
    page.on("response", (res) => {
      if (res.status() >= 300 && res.status() < 400) redirects += 1;
    });
    await page.goto("/");
    expect(redirects).toBeLessThan(3);
  });
});

test.describe("Proxy — assets statiques", () => {
  test("favicon, health et CSS ne sont pas cassés", async ({ page, request }) => {
    await page.goto("/");
    const favicon = await request.get("/favicon.ico");
    expect(favicon.status()).toBeLessThan(400);

    const health = await request.get("/api/health");
    expect(health.ok()).toBe(true);

    const stylesheet = page.locator("link[rel='stylesheet']").first();
    await expect(stylesheet).toHaveAttribute("href", /.+/);
    const href = await stylesheet.getAttribute("href");
    if (href) {
      const css = await request.get(href.startsWith("http") ? href : new URL(href, page.url()).href);
      expect(css.status()).toBe(200);
    }
  });

  test("_next/static répond", async ({ page, request }) => {
    await page.goto("/");
    const script = page.locator("script[src*='/_next/static']").first();
    await expect(script).toHaveAttribute("src", /\/_next\/static/);
    const src = await script.getAttribute("src");
    if (src) {
      const asset = await request.get(src.startsWith("http") ? src : new URL(src, page.url()).href);
      expect(asset.status()).toBe(200);
    }
  });
});

test.describe("Proxy — compte Supabase", () => {
  test("accès /compte sans session affiche le contenu", async ({ page }) => {
    await page.goto("/compte");
    await expect(page.locator("main#contenu")).toBeVisible();
    await expect(page.getByRole("heading").first()).toBeVisible();
  });

  test("rafraîchissement et navigation directe sur /compte", async ({ page }) => {
    await page.goto("/compte");
    await page.reload();
    await expect(page.locator("main#contenu")).toBeVisible();
    await page.goto("/compte?mode=login");
    await expect(page.locator("main#contenu")).toBeVisible();
  });
});

test.describe("Proxy — auth callback", () => {
  test("callback sans code redirige vers compte avec erreur", async ({ page }) => {
    await page.goto("/auth/callback");
    await expect(page).toHaveURL(/\/compte/);
    expect(page.url()).toMatch(/error=oauth|mode=login/);
  });

  test("callback avec code invalide ne redirige pas vers un domaine externe", async ({
    page,
  }) => {
    await page.goto("/auth/callback?code=e2e-invalid-code&next=//evil.example");
    await expect(page).toHaveURL(/\/compte/);
    expect(page.url()).not.toContain("evil.example");
  });
});

test.describe("Proxy — boutique", () => {
  test("catalogue accessible sans session", async ({ page }) => {
    await page.goto("/boutique");
    await expect(page.locator("main#contenu")).toBeVisible();
    await expect(page.getByRole("heading").first()).toBeVisible();
  });

  test("checkout ne provoque pas une erreur cookie visible", async ({ page }) => {
    await page.goto("/boutique");
    const checkoutLink = page.getByRole("link", { name: /commander|acheter|checkout/i }).first();
    if (await checkoutLink.isVisible()) {
      await checkoutLink.click();
      await expect(page.locator("main#contenu")).toBeVisible();
    }
  });
});

test.describe("Proxy — administration", () => {
  test("admin sans session affiche le login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: /Admin Restor-PC/i })).toBeVisible();
  });

  test("API atelier sans cookie retourne 401 ou 403", async ({ request }) => {
    const res = await request.get("/api/atelier/licenses");
    expect([401, 403]).toContain(res.status());
  });
});
