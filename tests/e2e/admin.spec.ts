import { test, expect, type Page, type Route } from "@playwright/test";

/**
 * E2E admin / atelier — aucun appel distant Supabase/Stripe/Resend/NAS.
 * Routes /api/atelier/licenses* mockées après auth HMAC locale.
 * Mot de passe : ATELIER_SECRET du serveur de test (jamais un secret de production).
 */

const MOCK_LICENSES = {
  licenses: [
    {
      id: "11111111-1111-4111-8111-111111111111",
      license_key: "RPC-TEST-KEY-001",
      script_id: "change-dns",
      status: "active",
      note: "e2e-mock",
      created_at: "2026-01-15T10:00:00.000Z",
      expires_at: null,
      machine_id: null,
      machine_name: null,
      bios_serial: null,
      machine_bound_at: null,
      max_machines: 1,
    },
    {
      id: "22222222-2222-4222-8222-222222222222",
      license_key: "RPC-TEST-KEY-002",
      script_id: "nettoyage-windows",
      status: "revoked",
      note: "revoked-mock",
      created_at: "2026-01-10T10:00:00.000Z",
      expires_at: null,
      machine_id: null,
      machine_name: null,
      bios_serial: null,
      machine_bound_at: null,
      max_machines: 1,
    },
  ],
  total: 2,
  pageCount: 1,
};

async function fulfillLicenses(route: Route) {
  const method = route.request().method();
  if (method === "GET") {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_LICENSES),
    });
    return;
  }
  if (method === "PATCH") {
    const body = route.request().postDataJSON() as { id?: string; status?: string };
    const row = MOCK_LICENSES.licenses.find((l) => l.id === body.id);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        license: {
          ...(row ?? MOCK_LICENSES.licenses[0]),
          status: body.status ?? "revoked",
          note: "patched-e2e",
        },
      }),
    });
    return;
  }
  if (method === "POST") {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        license: {
          ...MOCK_LICENSES.licenses[0],
          id: "33333333-3333-4333-8333-333333333333",
          license_key: "RPC-TEST-KEY-NEW",
        },
      }),
    });
    return;
  }
  await route.fulfill({
    status: 405,
    contentType: "application/json",
    body: JSON.stringify({ error: "Method not allowed" }),
  });
}

async function mockLicensesApi(page: Page) {
  await page.route("**/api/atelier/licenses**", fulfillLicenses);
}

async function loginAdmin(page: Page) {
  const secret = process.env.ATELIER_SECRET?.trim();
  test.skip(!secret, "ATELIER_SECRET requis pour la session admin E2E locale");

  await page.goto("/admin");
  await page.getByLabel(/mot de passe atelier/i).fill(secret!);
  await page.getByRole("button", { name: /se connecter/i }).click();
  await expect(page.getByText(/session active/i)).toBeVisible({ timeout: 15_000 });
}

test.describe("Admin — sans session", () => {
  test("visite /admin affiche l’écran de connexion", async ({ page }) => {
    await page.goto("/admin");
    await expect(
      page.getByRole("heading", { name: /Admin Restor-PC/i })
    ).toBeVisible();
    await expect(page.getByLabel(/mot de passe atelier/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /se connecter/i })).toBeVisible();
  });

  test("refus d’accès à /admin/licences sans session", async ({ page }) => {
    await page.goto("/admin/licences");
    await expect(page).toHaveURL(/\/admin\/?$/);
    await expect(
      page.getByRole("heading", { name: /Admin Restor-PC/i })
    ).toBeVisible();
  });

  test("mot de passe incorrect est refusé", async ({ page }) => {
    await page.goto("/admin");
    await page.getByLabel(/mot de passe atelier/i).fill("wrong-password-not-real");
    await page.getByRole("button", { name: /se connecter/i }).click();
    await expect(page.getByText(/acc[eè]s\s+refus/i)).toBeVisible({
      timeout: 10_000,
    });
  });
});

test.describe("Admin — API atelier sans rôle", () => {
  test("GET /api/atelier/licenses sans cookie → 401/403", async ({ request }) => {
    const res = await request.get("/api/atelier/licenses");
    expect([401, 403]).toContain(res.status());
    const body = (await res.json()) as { error?: string; code?: string };
    expect(body.error || body.code).toBeTruthy();
  });

  test("POST /api/atelier/fulfill sans cookie → 401/403", async ({ request }) => {
    const res = await request.post("/api/atelier/fulfill", {
      data: { email: "nobody@example.com", scriptId: "change-dns" },
    });
    expect([401, 403]).toContain(res.status());
  });
});

test.describe("Admin — session simulée + licences mockées", () => {
  test("login + tableau + filtre + pagination", async ({ page }) => {
    await mockLicensesApi(page);
    await loginAdmin(page);

    await page.goto("/admin/licences");
    await expect(page.getByRole("heading", { name: /^Licences$/i })).toBeVisible();
    await expect(page.getByText("RPC-TEST-KEY-001").first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/2 licence\(s\) au total/i).first()).toBeVisible();

    await page.getByPlaceholder(/clé, note, script_id/i).fill("RPC-TEST");
    await page.getByRole("button", { name: /^Filtrer$/i }).click();
    await expect(page.getByText("RPC-TEST-KEY-001").first()).toBeVisible();

    const statusSelect = page.locator("label").filter({ hasText: "Statut" }).locator("select");
    await statusSelect.selectOption("revoked");
    await page.getByRole("button", { name: /^Filtrer$/i }).click();

    await expect(page.getByRole("button", { name: /précédent/i }).first()).toBeDisabled();
    await expect(page.getByRole("button", { name: /suivant/i }).first()).toBeDisabled();
  });

  test("toast d’erreur simulé au chargement", async ({ page }) => {
    await page.route("**/api/atelier/licenses**", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({
            error: "Chargement impossible (mock)",
            requestId: "e2e-err-abcdef12",
          }),
        });
        return;
      }
      await fulfillLicenses(route);
    });

    await loginAdmin(page);
    await page.goto("/admin/licences");
    await expect(page.getByText(/chargement impossible/i).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator("[data-sonner-toast]").first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("toast de succès simulé après révocation", async ({ page }) => {
    await mockLicensesApi(page);
    await loginAdmin(page);
    await page.goto("/admin/licences");
    await expect(page.getByText("RPC-TEST-KEY-001").first()).toBeVisible({
      timeout: 15_000,
    });

    await page.getByRole("button", { name: /^Révoquer$/i }).first().click();
    await expect(page.getByText(/licence mise à jour/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });
});
