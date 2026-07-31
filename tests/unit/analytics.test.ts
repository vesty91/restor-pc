import { describe, expect, it } from "vitest";
import { getGaMeasurementId, isGaConfigured } from "@/lib/analytics/config";
import {
  classifyOutboundHref,
  contactLeadEvents,
  GA_EVENTS,
} from "@/lib/analytics";

describe("analytics config", () => {
  const prev = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  it("accepte un ID G- valide", () => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-ABC123XYZ";
    expect(getGaMeasurementId()).toBe("G-ABC123XYZ");
    expect(isGaConfigured()).toBe(true);
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = prev;
  });

  it("refuse un ID invalide ou vide", () => {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "";
    expect(getGaMeasurementId()).toBeNull();
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "UA-123";
    expect(getGaMeasurementId()).toBeNull();
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "GTM-XXXX";
    expect(getGaMeasurementId()).toBeNull();
    delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    expect(isGaConfigured()).toBe(false);
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = prev;
  });
});

describe("analytics events mapping", () => {
  it("contact devis → contact_submit + create_quote", () => {
    expect(contactLeadEvents("devis")).toEqual([
      GA_EVENTS.contactSubmit,
      GA_EVENTS.createQuote,
    ]);
  });

  it("contact config → create_quote", () => {
    expect(contactLeadEvents("config")).toContain(GA_EVENTS.createQuote);
  });

  it("contact urgence → request_appointment", () => {
    expect(contactLeadEvents("urgence")).toEqual([
      GA_EVENTS.contactSubmit,
      GA_EVENTS.requestAppointment,
    ]);
  });

  it("contact autre → contact_submit seul", () => {
    expect(contactLeadEvents("autre")).toEqual([GA_EVENTS.contactSubmit]);
  });
});

describe("outbound href classification", () => {
  it("classe tel, mailto et WhatsApp", () => {
    expect(classifyOutboundHref("tel:+33767282365")).toBe("phone");
    expect(classifyOutboundHref("mailto:contact@restor-pc.fr")).toBe("email");
    expect(
      classifyOutboundHref("https://wa.me/33767282365?text=Bonjour")
    ).toBe("whatsapp");
    expect(classifyOutboundHref("/contact")).toBeNull();
  });
});
