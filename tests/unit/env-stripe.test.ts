import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { assertStripeMode, isStripeLiveKey } from "@/lib/env";

describe("Stripe live lock", () => {
  const prev = { ...process.env };

  afterEach(() => {
    process.env = { ...prev };
  });

  beforeEach(() => {
    process.env = { ...prev };
  });

  it("détecte une clé live", () => {
    expect(isStripeLiveKey("sk_live_abc")).toBe(true);
    expect(isStripeLiveKey("sk_test_abc")).toBe(false);
    expect(isStripeLiveKey(undefined)).toBe(false);
  });

  it("refuse sk_live_ sans ALLOW_STRIPE_LIVE", () => {
    expect(() =>
      assertStripeMode({
        STRIPE_SECRET_KEY: "sk_live_xxx",
        ALLOW_STRIPE_LIVE: "false",
        NODE_ENV: "production",
      })
    ).toThrow(/ALLOW_STRIPE_LIVE/);
  });

  it("autorise sk_live_ si ALLOW_STRIPE_LIVE=true", () => {
    expect(() =>
      assertStripeMode({
        STRIPE_SECRET_KEY: "sk_live_xxx",
        ALLOW_STRIPE_LIVE: "true",
        NODE_ENV: "production",
      })
    ).not.toThrow();
  });

  it("autorise sk_test_ toujours", () => {
    expect(() =>
      assertStripeMode({
        STRIPE_SECRET_KEY: "sk_test_xxx",
        ALLOW_STRIPE_LIVE: "false",
        NODE_ENV: "development",
      })
    ).not.toThrow();
  });
});
