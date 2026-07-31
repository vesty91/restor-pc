export const ANALYTICS_CONSENT_KEY = "restor-pc-analytics-consent";

export type AnalyticsConsentValue = "granted" | "denied";

export function readAnalyticsConsent(): AnalyticsConsentValue | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(ANALYTICS_CONSENT_KEY);
    if (v === "granted" || v === "denied") return v;
  } catch {
    /* private mode */
  }
  return null;
}

export function writeAnalyticsConsent(value: AnalyticsConsentValue): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ANALYTICS_CONSENT_KEY, value);
  } catch {
    /* ignore */
  }
}

export function clearAnalyticsConsent(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ANALYTICS_CONSENT_KEY);
  } catch {
    /* ignore */
  }
}
