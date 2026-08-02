import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  createAtelierSessionToken,
  verifyAtelierSessionToken,
  verifyAtelierPassword,
} from "@/lib/atelier-auth";
import { clearServerEnvCache } from "@/lib/env";

describe("atelier session HMAC", () => {
  const prevSecret = process.env.ATELIER_SECRET;
  const prevSession = process.env.ATELIER_SESSION_SECRET;

  beforeEach(() => {
    process.env.ATELIER_SECRET = "unit-test-atelier-secret-32chars!!";
    process.env.ATELIER_SESSION_SECRET = "unit-test-session-secret-32chars!";
    clearServerEnvCache();
  });

  afterEach(() => {
    process.env.ATELIER_SECRET = prevSecret;
    process.env.ATELIER_SESSION_SECRET = prevSession;
    clearServerEnvCache();
  });

  it("crée et vérifie un token opaque", () => {
    const token = createAtelierSessionToken();
    expect(token.startsWith("v1.")).toBe(true);
    expect(verifyAtelierSessionToken(token)).toBe(true);
  });

  it("rejette un token altéré", () => {
    const token = createAtelierSessionToken();
    const bad = token.slice(0, -4) + "xxxx";
    expect(verifyAtelierSessionToken(bad)).toBe(false);
  });

  it("ne stocke pas le secret dans le token", () => {
    const token = createAtelierSessionToken();
    expect(token.includes(process.env.ATELIER_SECRET!)).toBe(false);
  });

  it("vérifie le mot de passe atelier", () => {
    expect(verifyAtelierPassword("unit-test-atelier-secret-32chars!!")).toBe(true);
    expect(verifyAtelierPassword("wrong")).toBe(false);
  });
});
