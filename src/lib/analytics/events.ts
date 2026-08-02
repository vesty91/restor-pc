/**
 * Noms d’événements GA4 Restor-PC.
 * À marquer comme « événements clés » dans Admin GA4 → Événements.
 */
export const GA_EVENTS = {
  clickPhone: "click_phone",
  clickEmail: "click_email",
  clickWhatsapp: "click_whatsapp",
  contactSubmit: "contact_submit",
  requestAppointment: "request_appointment",
  createQuote: "create_quote",
  beginQuote: "begin_quote",
  beginCheckout: "begin_checkout",
  purchase: "purchase",
} as const;

export type GaEventName = (typeof GA_EVENTS)[keyof typeof GA_EVENTS];

export type ContactLeadType =
  "devis" | "urgence" | "config" | "serenite" | "maintenance" | "autre" | string;

/** Types formulaire = devis / config / packs → create_quote */
const QUOTE_TYPES = new Set(["devis", "config", "serenite", "maintenance"]);

/** Types formulaire = prise de RDV / rappel urgent */
const APPOINTMENT_TYPES = new Set(["urgence"]);

export function contactLeadEvents(type: ContactLeadType): GaEventName[] {
  const events: GaEventName[] = [GA_EVENTS.contactSubmit];
  const t = (type || "autre").toLowerCase();
  if (QUOTE_TYPES.has(t)) events.push(GA_EVENTS.createQuote);
  if (APPOINTMENT_TYPES.has(t)) events.push(GA_EVENTS.requestAppointment);
  return events;
}
