import { describe, expect, it } from "vitest";
import { formatPublicApiError, sanitizeToastMessage } from "@/lib/toast";
import { ORDER_STATUSES, isOrderStatus } from "@/lib/fulfillment/order-status";

describe("toast sanitize", () => {
  it("masque les secrets Stripe / Bearer / env", () => {
    expect(sanitizeToastMessage("clé sk_live_abc123XYZ")).toContain("[masqué]");
    expect(sanitizeToastMessage("Bearer tokensecret")).toContain("[masqué]");
    expect(sanitizeToastMessage("ATELIER_SECRET leak")).toContain("[masqué]");
    expect(sanitizeToastMessage("whsec_abc123")).toContain("[masqué]");
  });

  it("n’expose pas d’UUID complets", () => {
    const msg = sanitizeToastMessage("Erreur 11111111-2222-3333-4444-555555555555");
    expect(msg).toContain("[id]");
    expect(msg).not.toContain("11111111-2222");
  });

  it("formatPublicApiError ajoute une réf. courte", () => {
    const msg = formatPublicApiError({
      error: "Modification échouée",
      requestId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    });
    expect(msg).toMatch(/réf\./i);
    expect(msg).not.toMatch(/sk_live/);
  });
});

describe("order statuses", () => {
  it("liste canonique", () => {
    expect(ORDER_STATUSES).toContain("fulfilled");
    expect(ORDER_STATUSES).toContain("disputed");
    expect(isOrderStatus("fulfilled")).toBe(true);
    expect(isOrderStatus("paid")).toBe(false);
  });
});
