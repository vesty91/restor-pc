import { describe, expect, it } from "vitest";
import { getProductBySlug } from "@/lib/data/outils";

describe("stripe price mapping (catalogue)", () => {
  it("résout un produit connu", () => {
    const p = getProductBySlug("changer-dns");
    expect(p).toBeTruthy();
    expect(p?.scriptId).toBeTruthy();
    expect(p?.stripePriceEnv).toMatch(/^STRIPE_PRICE_/);
  });

  it("refuse un slug inconnu", () => {
    expect(getProductBySlug("produit-inexistant-xyz")).toBeUndefined();
  });
});
