import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/csp-report/route";
import { __resetMemoryRateLimitsForTests } from "@/lib/security/rate-limit";

const EXPECTED_ENFORCEMENT = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' https://js.stripe.com https://checkout.stripe.com https://www.googletagmanager.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://checkout.stripe.com https://api.resend.com https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://www.googletagmanager.com https://*.googletagmanager.com",
  "frame-src https://js.stripe.com https://checkout.stripe.com https://hooks.stripe.com https://maps.google.com https://www.google.com",
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
].join("; ");

const EXPECTED_REPORT_ONLY = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "script-src-attr 'none'",
  "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://www.googletagmanager.com https://*.googletagmanager.com",
  "frame-src https://maps.google.com https://www.google.com",
  "worker-src 'self'",
  "upgrade-insecure-requests",
  "report-to csp-endpoint",
  "report-uri /api/csp-report",
].join("; ");

/** Hosts GA4 requis (apex + wildcards) — *.host ne couvre pas l’apex. */
const GA4_CONNECT_HOSTS = [
  "https://www.google-analytics.com",
  "https://*.google-analytics.com",
  "https://analytics.google.com",
  "https://*.analytics.google.com",
  "https://www.googletagmanager.com",
  "https://*.googletagmanager.com",
] as const;

const FORBIDDEN_CSP_PATTERNS = [
  /(?:^|;\s*)default-src\s+\*/i,
  /(?:^|;\s*)script-src[^;]*\s\*(?:\s|;|$)/i,
  /(?:^|;\s*)connect-src[^;]*\s\*(?:\s|;|$)/i,
  /unsafe-eval/i,
] as const;

function findHeader(
  headers: Array<{ key: string; value: string }>,
  key: string
) {
  return headers.find((h) => h.key === key);
}

function postCsp(
  body: string,
  contentType: string,
  ip = "203.0.113.10"
): NextRequest {
  return new NextRequest("http://localhost/api/csp-report", {
    method: "POST",
    headers: {
      "content-type": contentType,
      "x-forwarded-for": ip,
    },
    body,
  });
}

describe("CSP Phase 1 — Report-Only + /api/csp-report", () => {
  const originalEnv = { ...process.env };
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    __resetMemoryRateLimitsForTests();
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    (process.env as Record<string, string | undefined>).NODE_ENV =
      originalNodeEnv;
    __resetMemoryRateLimitsForTests();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("accepte le format historique csp-report", async () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});

    const body = JSON.stringify({
      "csp-report": {
        "document-uri": "https://restor-pc.fr/page?x=1#frag",
        "effective-directive": "script-src",
        "blocked-uri": "https://evil.example/path?y=2#z",
        disposition: "report",
        "status-code": 200,
      },
    });

    const res = await POST(postCsp(body, "application/csp-report"));
    expect(res.status).toBe(204);
    expect(await res.text()).toBe("");
    expect(spy).toHaveBeenCalledWith("[CSP-Report]", {
      effectiveDirective: "script-src",
      blockedSource: "https://evil.example",
      pagePath: "/page",
      disposition: "report",
      statusCode: 200,
    });
  });

  it("accepte le format moderne reports+json (tableau + body)", async () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});

    const body = JSON.stringify([
      {
        type: "csp-violation",
        url: "https://restor-pc.fr/page",
        body: {
          effectiveDirective: "worker-src",
          blockedURL: "blob",
          documentURL: "https://restor-pc.fr/page",
          disposition: "report",
          statusCode: 200,
        },
      },
    ]);

    const res = await POST(postCsp(body, "application/reports+json"));
    expect(res.status).toBe(204);
    expect(spy).toHaveBeenCalledWith("[CSP-Report]", {
      effectiveDirective: "worker-src",
      blockedSource: "blob",
      pagePath: "/page",
      disposition: "report",
      statusCode: 200,
    });
  });

  it("ignore les rapports modernes dont type n'est pas csp-violation", async () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});

    const body = JSON.stringify([
      {
        type: "deprecation",
        url: "https://restor-pc.fr/page",
        body: {
          effectiveDirective: "script-src",
          blockedURL: "inline",
        },
      },
    ]);

    const res = await POST(postCsp(body, "application/reports+json"));
    expect(res.status).toBe(204);
    expect(spy).not.toHaveBeenCalled();
  });

  it("conserve blockedURL inline", async () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});

    const body = JSON.stringify([
      {
        type: "csp-violation",
        url: "https://restor-pc.fr/",
        body: {
          effectiveDirective: "script-src",
          blockedURL: "inline",
          documentURL: "https://restor-pc.fr/",
          disposition: "report",
          statusCode: 200,
        },
      },
    ]);

    await POST(postCsp(body, "application/reports+json"));
    expect(spy.mock.calls[0]?.[1]).toMatchObject({
      blockedSource: "inline",
    });
  });

  it("conserve blockedURL blob:", async () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});

    const body = JSON.stringify([
      {
        type: "csp-violation",
        url: "https://restor-pc.fr/",
        body: {
          effectiveDirective: "worker-src",
          blockedURL: "blob:",
          documentURL: "https://restor-pc.fr/",
          disposition: "report",
          statusCode: 200,
        },
      },
    ]);

    await POST(postCsp(body, "application/reports+json"));
    expect(spy.mock.calls[0]?.[1]).toMatchObject({
      blockedSource: "blob:",
    });
  });

  it("ne conserve que l'origine d'une URL HTTP avec query et fragment", async () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});

    const body = JSON.stringify([
      {
        type: "csp-violation",
        url: "https://restor-pc.fr/a",
        body: {
          effectiveDirective: "connect-src",
          blockedURL: "https://cdn.bad.com/path?token=secret#frag",
          documentURL: "https://restor-pc.fr/a",
          disposition: "report",
          statusCode: 200,
        },
      },
    ]);

    await POST(postCsp(body, "application/reports+json"));
    const useful = spy.mock.calls[0]?.[1] as { blockedSource?: string };
    expect(useful.blockedSource).toBe("https://cdn.bad.com");
    expect(useful.blockedSource).not.toContain("?");
    expect(useful.blockedSource).not.toContain("#");
    expect(useful.blockedSource).not.toContain("secret");
  });

  it("ne conserve que le pathname d'un documentURL avec query et fragment", async () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});

    const body = JSON.stringify([
      {
        type: "csp-violation",
        url: "https://restor-pc.fr/fallback",
        body: {
          effectiveDirective: "script-src",
          blockedURL: "inline",
          documentURL: "https://restor-pc.fr/compte/orders?id=1#top",
          disposition: "report",
          statusCode: 200,
        },
      },
    ]);

    await POST(postCsp(body, "application/reports+json"));
    const useful = spy.mock.calls[0]?.[1] as { pagePath?: string };
    expect(useful.pagePath).toBe("/compte/orders");
    expect(useful.pagePath).not.toContain("?");
    expect(useful.pagePath).not.toContain("#");
  });

  it("traite au maximum 20 rapports par requête", async () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});

    const reports = Array.from({ length: 25 }, (_, i) => ({
      type: "csp-violation",
      url: `https://restor-pc.fr/p${i}`,
      body: {
        effectiveDirective: "script-src",
        blockedURL: "inline",
        documentURL: `https://restor-pc.fr/p${i}`,
        disposition: "report",
        statusCode: 200,
      },
    }));

    const res = await POST(
      postCsp(JSON.stringify(reports), "application/reports+json")
    );
    expect(res.status).toBe(204);
    expect(spy).toHaveBeenCalledTimes(20);
  });

  it("retourne 413 si le corps dépasse 16 Ko", async () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const oversized = JSON.stringify({
      "csp-report": {
        "document-uri": "https://restor-pc.fr/",
        "effective-directive": "script-src",
        "blocked-uri": "inline",
        padding: "x".repeat(17 * 1024),
      },
    });
    expect(Buffer.byteLength(oversized, "utf8")).toBeGreaterThan(16 * 1024);

    const res = await POST(postCsp(oversized, "application/csp-report"));
    expect(res.status).toBe(413);
    expect(await res.text()).toBe("");
    expect(spy).not.toHaveBeenCalled();
  });

  it("retourne 204 sur JSON invalide", async () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const res = await POST(
      postCsp("{ invalid json", "application/csp-report")
    );
    expect(res.status).toBe(204);
    expect(await res.text()).toBe("");
    expect(spy).not.toHaveBeenCalled();
  });

  it("retourne 204 sur content-type inconnu sans journaliser", async () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const body = JSON.stringify({
      "csp-report": {
        "document-uri": "https://restor-pc.fr/",
        "effective-directive": "script-src",
        "blocked-uri": "inline",
      },
    });
    const res = await POST(postCsp(body, "text/plain"));
    expect(res.status).toBe(204);
    expect(spy).not.toHaveBeenCalled();
  });

  it("n'enregistre jamais sample ni le corps brut", async () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});

    const body = JSON.stringify({
      "csp-report": {
        "document-uri": "https://restor-pc.fr/page",
        "effective-directive": "script-src",
        "blocked-uri": "inline",
        disposition: "report",
        "status-code": 200,
        sample: "SECRET_SAMPLE_PAYLOAD",
        originalPolicy: "default-src 'self'",
        sourceFile: "/_next/static/secret.js",
      },
    });

    await POST(postCsp(body, "application/csp-report"));
    expect(spy).toHaveBeenCalledTimes(1);
    const logged = JSON.stringify(spy.mock.calls);
    expect(logged).not.toContain("SECRET_SAMPLE_PAYLOAD");
    expect(logged).not.toContain("originalPolicy");
    expect(logged).not.toContain("sourceFile");
    expect(logged).not.toContain(body);
    expect(spy.mock.calls[0]?.[1]).toEqual({
      effectiveDirective: "script-src",
      blockedSource: "inline",
      pagePath: "/page",
      disposition: "report",
      statusCode: 200,
    });
  });

  it("ajoute Report-Only et Reporting-Endpoints uniquement hors développement", async () => {
    vi.resetModules();
    (process.env as Record<string, string>).NODE_ENV = "production";
    const prodConfig = (await import("../../next.config")).default;
    const prodHeaders = (await prodConfig.headers!())[0].headers;

    expect(findHeader(prodHeaders, "Reporting-Endpoints")?.value).toBe(
      'csp-endpoint="/api/csp-report"'
    );
    expect(
      findHeader(prodHeaders, "Content-Security-Policy-Report-Only")?.value
    ).toBe(EXPECTED_REPORT_ONLY);

    vi.resetModules();
    (process.env as Record<string, string>).NODE_ENV = "development";
    const devConfig = (await import("../../next.config")).default;
    const devHeaders = (await devConfig.headers!())[0].headers;
    const keys = devHeaders.map((h) => h.key);

    expect(keys).not.toContain("Reporting-Endpoints");
    expect(keys).not.toContain("Content-Security-Policy-Report-Only");
    expect(keys).not.toContain("Content-Security-Policy");
    expect(keys).not.toContain("Strict-Transport-Security");
  });

  it("ne définit pas HSTS (responsabilité du reverse proxy TLS)", async () => {
    vi.resetModules();
    (process.env as Record<string, string>).NODE_ENV = "production";
    const config = (await import("../../next.config")).default;
    const headers = (await config.headers!())[0].headers;
    expect(headers.map((h) => h.key)).not.toContain("Strict-Transport-Security");
  });

  it("conserve la CSP enforcement (incl. hosts GA4 apex + wildcards)", async () => {
    vi.resetModules();
    (process.env as Record<string, string>).NODE_ENV = "production";
    const config = (await import("../../next.config")).default;
    const headers = (await config.headers!())[0].headers;
    const enforcement = findHeader(headers, "Content-Security-Policy");
    expect(enforcement?.value).toBe(EXPECTED_ENFORCEMENT);
  });

  it("autorise GA4 dans script-src et connect-src (enforcement + report-only)", async () => {
    vi.resetModules();
    (process.env as Record<string, string>).NODE_ENV = "production";
    const config = (await import("../../next.config")).default;
    const headers = (await config.headers!())[0].headers;
    const enforcement = findHeader(headers, "Content-Security-Policy")!.value;
    const reportOnly = findHeader(
      headers,
      "Content-Security-Policy-Report-Only"
    )!.value;

    for (const policy of [enforcement, reportOnly]) {
      expect(policy).toMatch(/script-src[^;]*https:\/\/www\.googletagmanager\.com/);
      for (const host of GA4_CONNECT_HOSTS) {
        expect(policy).toContain(host);
      }
      // img-src actuel : https: couvre déjà les pixels GA (pas de wildcard global dangereux)
      expect(policy).toMatch(/img-src[^;]*https:/);
    }
  });

  it("n'affaiblit pas la CSP avec * / unsafe-eval", async () => {
    vi.resetModules();
    (process.env as Record<string, string>).NODE_ENV = "production";
    const config = (await import("../../next.config")).default;
    const headers = (await config.headers!())[0].headers;
    const enforcement = findHeader(headers, "Content-Security-Policy")!.value;
    const reportOnly = findHeader(
      headers,
      "Content-Security-Policy-Report-Only"
    )!.value;

    for (const policy of [enforcement, reportOnly]) {
      for (const pattern of FORBIDDEN_CSP_PATTERNS) {
        expect(policy).not.toMatch(pattern);
      }
    }
  });
});
