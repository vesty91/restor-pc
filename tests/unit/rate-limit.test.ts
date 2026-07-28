import { describe, expect, it, beforeEach } from "vitest";
import {
  __resetMemoryRateLimitsForTests,
  enforceRateLimit,
} from "@/lib/security/rate-limit";

function fakeRequest(ip = "1.2.3.4"): Request {
  return new Request("http://localhost/api/test", {
    headers: { "x-forwarded-for": ip },
  });
}

describe("enforceRateLimit (memory fallback)", () => {
  beforeEach(() => {
    __resetMemoryRateLimitsForTests();
    // Force memory path: no supabase in unit tests
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("autorise jusqu'à la limite puis bloque", async () => {
    const req = fakeRequest("10.0.0.1");
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
    const req = fakeRequest("10.0.0.2");
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
