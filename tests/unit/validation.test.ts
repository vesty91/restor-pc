import { describe, expect, it } from "vitest";
import { contactSchema } from "@/lib/validation/contact";
import { checkoutSchema } from "@/lib/validation/checkout";
import { licensesListQuerySchema } from "@/lib/validation/licenses";
import { sanitizeToastMessage } from "@/lib/toast";

describe("validation/contact", () => {
  it("accepte un payload valide", () => {
    const parsed = contactSchema.safeParse({
      name: "Alice",
      email: "alice@example.com",
      phone: "06 12 34 56 78",
      message: "Bonjour, mon PC ne démarre plus.",
      consent: true,
    });
    expect(parsed.success).toBe(true);
  });

  it("refuse sans consentement", () => {
    const parsed = contactSchema.safeParse({
      name: "Alice",
      email: "alice@example.com",
      phone: "0612345678",
      message: "Message assez long.",
      consent: false,
    });
    expect(parsed.success).toBe(false);
  });
});

describe("validation/checkout", () => {
  it("exige le consentement retrait", () => {
    expect(checkoutSchema.safeParse({ slug: "change-dns", withdrawalConsent: true }).success).toBe(
      true,
    );
    expect(checkoutSchema.safeParse({ slug: "change-dns" }).success).toBe(false);
  });
});

describe("validation/licenses query", () => {
  it("coerce page / pageSize", () => {
    const parsed = licensesListQuerySchema.parse({
      page: "2",
      pageSize: "10",
      status: "active",
    });
    expect(parsed.page).toBe(2);
    expect(parsed.pageSize).toBe(10);
    expect(parsed.status).toBe("active");
  });
});

describe("toast sanitize", () => {
  it("masque les secrets", () => {
    expect(sanitizeToastMessage("clé sk_live_abc123XYZ")).toContain("[masqué]");
    expect(sanitizeToastMessage("Bearer tokensecret")).toContain("[masqué]");
  });
});
