import { expect, test, type Page, type Request } from "@playwright/test";

/**
 * Validation GA4 production (Chromium réel).
 * Lancer uniquement contre le site live :
 *   PLAYWRIGHT_BASE_URL=https://www.restor-pc.fr npx playwright test tests/e2e/ga4-production.spec.ts
 */
const GA_ID = "G-61YXXVVVYX";
const CONSENT_KEY = "restor-pc-analytics-consent";

function isGaCollect(url: string): boolean {
  try {
    const u = new URL(url);
    return (
      (u.hostname.endsWith("google-analytics.com") ||
        u.hostname.endsWith("analytics.google.com")) &&
      (u.pathname.includes("/g/collect") || u.pathname.includes("/collect"))
    );
  } catch {
    return false;
  }
}

function isGtagScript(url: string): boolean {
  return url.includes("googletagmanager.com/gtag/js") && url.includes(`id=${GA_ID}`);
}

function isAnalyticsCspBlock(blocked: string, directive: string): boolean {
  const d = directive.toLowerCase();
  if (!d.includes("connect") && !d.includes("script") && !d.includes("img")) {
    return false;
  }
  return /google-analytics|analytics\.google|googletagmanager/i.test(blocked);
}

function collectEventNames(urls: string[]): string[] {
  const names: string[] = [];
  for (const url of urls) {
    try {
      const u = new URL(url);
      // GA4 MP : en=event_name (peut apparaître plusieurs fois)
      for (const [k, v] of u.searchParams.entries()) {
        if (k === "en" || k.endsWith("en")) names.push(v);
      }
      const enAll = u.searchParams.getAll("en");
      names.push(...enAll);
    } catch {
      /* ignore */
    }
  }
  return [...new Set(names)];
}

async function waitForClientId(page: Page, timeoutMs = 12_000): Promise<string | null> {
  return page.evaluate(
    ({ id, timeoutMs: ms }) =>
      new Promise<string | null>((resolve) => {
        const started = Date.now();
        const tick = () => {
          if (typeof window.gtag !== "function") {
            if (Date.now() - started > ms) return resolve(null);
            return setTimeout(tick, 150);
          }
          let done = false;
          const timer = setTimeout(
            () => {
              if (!done) {
                done = true;
                resolve(null);
              }
            },
            Math.max(500, ms - (Date.now() - started)),
          );
          try {
            window.gtag!("get", id, "client_id", (value: unknown) => {
              if (done) return;
              done = true;
              clearTimeout(timer);
              resolve(typeof value === "string" && value ? value : null);
            });
          } catch {
            if (!done) {
              done = true;
              clearTimeout(timer);
              resolve(null);
            }
          }
        };
        tick();
      }),
    { id: GA_ID, timeoutMs },
  );
}

test.describe("GA4 production — Chromium", () => {
  test.beforeAll(() => {
    const base = process.env.PLAYWRIGHT_BASE_URL || "";
    test.skip(
      !base.includes("www.restor-pc.fr"),
      "Définir PLAYWRIGHT_BASE_URL=https://www.restor-pc.fr",
    );
  });

  test("consentement → gtag → client_id → g/collect → events métier", async ({ browser }) => {
    const context = await browser.newContext({
      locale: "fr-FR",
      colorScheme: "light",
      // Contexte vierge : pas de consentement localStorage
      storageState: undefined,
    });
    const page = await context.newPage();

    const collectBefore: string[] = [];
    const collectAfter: string[] = [];
    const gtagScriptLoads: string[] = [];
    let accepted = false;

    page.on("request", (req: Request) => {
      const url = req.url();
      if (isGtagScript(url)) gtagScriptLoads.push(url);
      if (isGaCollect(url)) {
        if (accepted) collectAfter.push(url);
        else collectBefore.push(url);
      }
    });

    await page.addInitScript(() => {
      const hits: Array<{ directive: string; blocked: string; disposition: string }> = [];
      (window as unknown as { __cspAnalyticsHits: typeof hits }).__cspAnalyticsHits = hits;
      document.addEventListener("securitypolicyviolation", (e) => {
        hits.push({
          directive: e.effectiveDirective,
          blocked: e.blockedURI,
          disposition: e.disposition,
        });
      });
    });

    await page.goto("/", { waitUntil: "networkidle" });

    // 1. Bandeau cookies si consentement absent
    const dialog = page.getByRole("dialog", { name: /mesure d’audience|mesure d'audience/i });
    await expect(dialog).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("button", { name: "Accepter" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Refuser" })).toBeVisible();

    const consentBefore = await page.evaluate((key) => localStorage.getItem(key), CONSENT_KEY);
    expect(consentBefore).toBeNull();

    // 2. Aucun hit GA4 avant acceptation
    await page.waitForTimeout(1500);
    expect(collectBefore, `Hits collect avant consentement: ${collectBefore.join("\n")}`).toEqual(
      [],
    );
    expect(await page.locator('script[src*="googletagmanager.com/gtag/js"]').count()).toBe(0);

    // 3–4. Accepter → gtag + consent granted
    accepted = true;
    await page.getByRole("button", { name: "Accepter" }).click();
    await expect(dialog).toBeHidden({ timeout: 10_000 });

    await expect
      .poll(async () => page.evaluate((key) => localStorage.getItem(key), CONSENT_KEY), {
        timeout: 10_000,
      })
      .toBe("granted");

    await expect
      .poll(
        async () => page.locator(`script[src*="googletagmanager.com/gtag/js?id=${GA_ID}"]`).count(),
        { timeout: 15_000 },
      )
      .toBe(1);

    const gtagSrc = await page
      .locator(`script[src*="googletagmanager.com/gtag/js?id=${GA_ID}"]`)
      .getAttribute("src");
    expect(gtagSrc).toContain(`id=${GA_ID}`);

    // Consent Mode : update granted présent dans dataLayer
    // (entries = Arguments-like, pas des Array — cf. stub gtag)
    const consentGranted = await page.evaluate(() => {
      const dl = window.dataLayer || [];
      return dl.some((entry) => {
        const row = entry as ArrayLike<unknown> & { 0?: unknown; 1?: unknown; 2?: unknown };
        if (!row || typeof row !== "object" || row.length == null) return false;
        if (row[0] !== "consent" || row[1] !== "update") return false;
        const state = row[2] as { analytics_storage?: string } | undefined;
        return state?.analytics_storage === "granted";
      });
    });
    expect(consentGranted, "consent update analytics_storage=granted").toBe(true);

    // 5. client_id
    const clientId = await waitForClientId(page);
    expect(clientId, "gtag client_id doit être défini").toBeTruthy();
    expect(String(clientId)).toMatch(/^\d+\.\d+$/);

    // 6. Requête automatique g/collect
    await expect.poll(() => collectAfter.length, { timeout: 20_000 }).toBeGreaterThan(0);
    expect(
      collectAfter.some((u) => u.includes("/g/collect") || u.includes("collect")),
      collectAfter[0],
    ).toBe(true);

    // 7. Événements métier (click_phone via délégation)
    const phone = page.locator('a[href^="tel:"]').first();
    await expect(phone).toBeVisible();
    await phone.dispatchEvent("click");

    await expect
      .poll(
        () => {
          const ens = collectEventNames(collectAfter);
          const dlHint = ens.includes("click_phone");
          return dlHint || collectAfter.some((u) => u.includes("click_phone"));
        },
        { timeout: 15_000 },
      )
      .toBe(true);

    // Fallback : vérifier aussi dataLayer si le param en= est fragmenté
    const phoneInDataLayer = await page.evaluate(() => {
      const dl = window.dataLayer || [];
      return dl.some((entry) => {
        const row = entry as ArrayLike<unknown> & { 0?: unknown; 1?: unknown };
        return (
          !!row &&
          typeof row === "object" &&
          row.length != null &&
          row[0] === "event" &&
          row[1] === "click_phone"
        );
      });
    });
    expect(phoneInDataLayer || collectAfter.some((u) => u.includes("click_phone"))).toBe(true);

    // 8. Pas d’erreur CSP Analytics
    const cspHits = await page.evaluate(() => {
      return (
        (
          window as unknown as {
            __cspAnalyticsHits?: Array<{ directive: string; blocked: string; disposition: string }>;
          }
        ).__cspAnalyticsHits || []
      );
    });
    const analyticsCsp = cspHits.filter(
      (h) => h.disposition === "enforce" && isAnalyticsCspBlock(h.blocked, h.directive),
    );
    expect(analyticsCsp, `CSP Analytics: ${JSON.stringify(analyticsCsp)}`).toEqual([]);

    // 9. Pas de double chargement gtag.js
    const scriptCount = await page.locator('script[src*="googletagmanager.com/gtag/js"]').count();
    expect(scriptCount).toBe(1);
    const uniqueGtag = new Set(gtagScriptLoads.map((u) => u.split("&")[0]));
    expect(uniqueGtag.size, `Chargements gtag: ${[...uniqueGtag].join(", ")}`).toBe(1);

    // Rapport console
    const summary = {
      consent: "granted",
      gtagSrc,
      clientId,
      collectCount: collectAfter.length,
      collectHosts: [
        ...new Set(
          collectAfter.map((u) => {
            try {
              return new URL(u).hostname;
            } catch {
              return u;
            }
          }),
        ),
      ],
      eventNames: collectEventNames(collectAfter),
      gtagLoads: gtagScriptLoads.length,
      cspAnalyticsEnforce: analyticsCsp.length,
    };
    console.log("[GA4-PROD-VALIDATE]", JSON.stringify(summary, null, 2));

    await context.close();
  });
});
