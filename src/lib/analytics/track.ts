import { contactLeadEvents, GA_EVENTS } from "@/lib/analytics/events";
import { trackEvent } from "@/lib/analytics/gtag";

export function trackPhoneClick(source?: string) {
  trackEvent(GA_EVENTS.clickPhone, source ? { source } : undefined);
}

export function trackEmailClick(source?: string) {
  trackEvent(GA_EVENTS.clickEmail, source ? { source } : undefined);
}

export function trackWhatsappClick(source?: string) {
  trackEvent(GA_EVENTS.clickWhatsapp, source ? { source } : undefined);
}

export function trackContactSuccess(input: {
  type: string;
  service?: string;
  mode?: string;
  urgency?: string;
}) {
  const params = {
    lead_type: input.type || "autre",
    ...(input.service ? { service: input.service } : {}),
    ...(input.mode ? { mode: input.mode } : {}),
    ...(input.urgency ? { urgency: input.urgency } : {}),
  };
  for (const name of contactLeadEvents(input.type)) {
    trackEvent(name, params);
  }
}

export function trackBeginQuote(input: { usage?: string; budget?: string; total?: number }) {
  trackEvent(GA_EVENTS.beginQuote, {
    usage: input.usage,
    budget: input.budget,
    value: input.total,
    currency: "EUR",
  });
}

export function trackBeginCheckout(slug: string) {
  trackEvent(GA_EVENTS.beginCheckout, {
    item_id: slug,
    currency: "EUR",
  });
}

const PURCHASE_DEDUP_PREFIX = "restor-pc-purchase-tracked:";

export function trackPurchase(sessionId: string) {
  if (!sessionId || typeof window === "undefined") return;
  try {
    const key = `${PURCHASE_DEDUP_PREFIX}${sessionId}`;
    if (sessionStorage.getItem(key) === "1") return;
    sessionStorage.setItem(key, "1");
  } catch {
    /* continue once */
  }
  trackEvent(GA_EVENTS.purchase, {
    transaction_id: sessionId,
    currency: "EUR",
  });
}

export function classifyOutboundHref(href: string): "phone" | "email" | "whatsapp" | null {
  const h = href.trim().toLowerCase();
  if (h.startsWith("tel:")) return "phone";
  if (h.startsWith("mailto:")) return "email";
  if (h.includes("wa.me/") || h.includes("api.whatsapp.com")) return "whatsapp";
  return null;
}
