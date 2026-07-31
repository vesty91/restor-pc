export { getGaMeasurementId, isGaConfigured } from "@/lib/analytics/config";
export {
  ANALYTICS_CONSENT_KEY,
  clearAnalyticsConsent,
  readAnalyticsConsent,
  writeAnalyticsConsent,
  type AnalyticsConsentValue,
} from "@/lib/analytics/consent";
export { GA_EVENTS, contactLeadEvents } from "@/lib/analytics/events";
export {
  trackPhoneClick,
  trackEmailClick,
  trackWhatsappClick,
  trackContactSuccess,
  trackBeginQuote,
  trackBeginCheckout,
  trackPurchase,
  classifyOutboundHref,
} from "@/lib/analytics/track";
