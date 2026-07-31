import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  __resetMemoryRateLimitsForTests,
  enforceRateLimit,
  getTrustedIp,
  isTrustProxyHeadersEnabled,
  rateLimitKey,
} from "@/lib/security/rate-limit";

function requestWith(headers: Record<string, string>): Request {
  return new Request("http://localhost/api/test", { headers });
}

describe("TRUST_PROXY_HEADERS / getTrustedIp", () => {
  const prev = { ...process.env };

  beforeEach(() => {
    __resetMemoryRateLimitsForTests();
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.TRUST_PROXY_HEADERS;
  });

  afterEach(() => {
    process.env = { ...prev };
    __resetMemoryRateLimitsForTests();
    vi.restoreAllMocks();
  });

  it("désactivé par défaut (absence de variable)", () => {
    delete process.env.TRUST_PROXY_HEADERS;
    expect(isTrustProxyHeadersEnabled()).toBe(false);
    expect(
      getTrustedIp(requestWith({ "x-forwarded-for": "9.9.9.9" }))
    ).toBe("unknown");
  });

  it("TRUST_PROXY_HEADERS=false ignore X-Forwarded-For falsifié", () => {
    process.env.TRUST_PROXY_HEADERS = "false";
    expect(isTrustProxyHeadersEnabled()).toBe(false);
    expect(
      getTrustedIp(requestWith({ "x-forwarded-for": "203.0.113.99" }))
    ).toBe("unknown");
  });

  it("TRUST_PROXY_HEADERS=true utilise X-Real-IP en priorité", () => {
    process.env.TRUST_PROXY_HEADERS = "true";
    expect(
      getTrustedIp(
        requestWith({
          "x-real-ip": "198.51.100.10",
          "x-forwarded-for": "203.0.113.1, 10.0.0.1",
        })
      )
    ).toBe("198.51.100.10");
  });

  it("TRUST_PROXY_HEADERS=true prend le premier hop de X-Forwarded-For", () => {
    process.env.TRUST_PROXY_HEADERS = "true";
    expect(
      getTrustedIp(
        requestWith({ "x-forwarded-for": "203.0.113.50, 10.0.0.2, 192.168.1.1" })
      )
    ).toBe("203.0.113.50");
  });

  it("sans trust, des XFF différents partagent la même clé (anti-contournement)", async () => {
    delete process.env.TRUST_PROXY_HEADERS;
    const a = requestWith({ "x-forwarded-for": "1.1.1.1" });
    const b = requestWith({ "x-forwarded-for": "2.2.2.2" });
    expect(rateLimitKey(a, "unit")).toBe(rateLimitKey(b, "unit"));

    await enforceRateLimit({
      request: a,
      scope: "spoof-bypass",
      limit: 1,
      windowMs: 60_000,
    });
    const blocked = await enforceRateLimit({
      request: b,
      scope: "spoof-bypass",
      limit: 1,
      windowMs: 60_000,
    });
    expect(blocked.ok).toBe(false);
  });
});

describe("enforceRateLimit (memory fallback public)", () => {
  beforeEach(() => {
    __resetMemoryRateLimitsForTests();
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.TRUST_PROXY_HEADERS;
  });

  it("autorise jusqu'à la limite puis bloque", async () => {
    process.env.TRUST_PROXY_HEADERS = "true";
    const req = requestWith({ "x-forwarded-for": "10.0.0.1" });
    for (let i = 0; i < 3; i++) {
      const r = await enforceRateLimit({
        request: req,
        scope: "unit-test",
        limit: 3,
        windowMs: 60_000,
      });
      expect(r.ok).toBe(true);
    }
    const blocked = await enforceRateLimit({
      request: req,
      scope: "unit-test",
      limit: 3,
      windowMs: 60_000,
    });
    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("isole les scopes", async () => {
    process.env.TRUST_PROXY_HEADERS = "true";
    const req = requestWith({ "x-forwarded-for": "10.0.0.2" });
    await enforceRateLimit({
      request: req,
      scope: "a",
      limit: 1,
      windowMs: 60_000,
    });
    const other = await enforceRateLimit({
      request: req,
      scope: "b",
      limit: 1,
      windowMs: 60_000,
    });
    expect(other.ok).toBe(true);
  });
});

describe("enforceRateLimit mode auth fail-closed", () => {
  beforeEach(() => {
    __resetMemoryRateLimitsForTests();
    delete process.env.TRUST_PROXY_HEADERS;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    vi.resetModules();
  });

  afterEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("mode public : fallback mémoire si Supabase indisponible", async () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-test";
    vi.doMock("@/lib/fulfillment/supabase", () => ({
      getSupabaseAdmin: () => ({
        rpc: async () => ({ data: null, error: { message: "down" } }),
      }),
    }));

    const mod = await import("@/lib/security/rate-limit");
    mod.__resetMemoryRateLimitsForTests();
    const r = await mod.enforceRateLimit({
      request: requestWith({}),
      scope: "contact",
      limit: 5,
      windowMs: 60_000,
      mode: "public",
    });
    expect(r.ok).toBe(true);
  });

  it("mode auth : refuse si Supabase configuré mais RPC indisponible", async () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-test";
    vi.doMock("@/lib/fulfillment/supabase", () => ({
      getSupabaseAdmin: () => ({
        rpc: async () => ({ data: null, error: { message: "down" } }),
      }),
    }));

    const mod = await import("@/lib/security/rate-limit");
    const r = await mod.enforceRateLimit({
      request: requestWith({}),
      scope: "atelier-auth",
      limit: 8,
      windowMs: 60_000,
      mode: "auth",
    });
    expect(r.ok).toBe(false);
    expect(r.remaining).toBe(0);
  });

  it("mode auth : mémoire OK si Supabase non configuré", async () => {
    const mod = await import("@/lib/security/rate-limit");
    mod.__resetMemoryRateLimitsForTests();
    const r = await mod.enforceRateLimit({
      request: requestWith({}),
      scope: "atelier-auth-local",
      limit: 2,
      windowMs: 60_000,
      mode: "auth",
    });
    expect(r.ok).toBe(true);
  });
});
