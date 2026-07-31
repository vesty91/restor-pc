import { getGaMeasurementId } from "@/lib/analytics/config";
import type { GaEventName } from "@/lib/analytics/events";

type GtagConsent = {
  analytics_storage: "granted" | "denied";
  ad_storage: "denied";
  ad_user_data: "denied";
  ad_personalization: "denied";
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let scriptLoaded = false;

function ensureDataLayer() {
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
  }
}

export function applyGtagConsent(granted: boolean) {
  if (typeof window === "undefined") return;
  ensureDataLayer();
  const state: GtagConsent = {
    analytics_storage: granted ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  };
  window.gtag!("consent", "update", state);
}

/** Initialise Consent Mode (denied) + charge gtag uniquement si consentement accordé. */
export function loadGoogleAnalytics(consentGranted: boolean) {
  const id = getGaMeasurementId();
  if (!id || typeof window === "undefined") return;

  ensureDataLayer();

  // Consent Mode v2 — défaut refusé tant qu’on n’a pas accepté
  window.gtag!("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500,
  });

  if (!consentGranted) {
    applyGtagConsent(false);
    return;
  }

  applyGtagConsent(true);

  if (!scriptLoaded) {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(s);
    scriptLoaded = true;
  }

  window.gtag!("js", new Date());
  window.gtag!("config", id, {
    anonymize_ip: true,
    send_page_view: true,
  });
}

export function trackEvent(
  name: GaEventName | string,
  params?: Record<string, string | number | boolean | undefined>
) {
  if (typeof window === "undefined") return;
  if (!getGaMeasurementId()) return;
  if (!window.gtag) return;

  const clean: Record<string, string | number | boolean> = {};
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) clean[k] = v;
    }
  }
  window.gtag("event", name, clean);
}

/** Réinitialise le flag de script (tests uniquement). */
export function __resetGtagForTests() {
  scriptLoaded = false;
}
