"use client";

import { useAnalyticsConsent } from "@/components/analytics/AnalyticsProvider";
import Link from "next/link";

export function CookieConsentBanner() {
  const { configured, hydrated, consent, setConsent, preferencesOpen } = useAnalyticsConsent();

  if (!configured || !hydrated) return null;
  const show = consent === null || preferencesOpen;
  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      className="fixed inset-x-0 bottom-0 z-[90] border-t border-line bg-paper/95 p-4 shadow-[0_-8px_32px_rgb(0_0_0/12%)] backdrop-blur-md md:p-5"
    >
      <div className="container-wide flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p
            id="cookie-consent-title"
            className="font-display text-base font-semibold tracking-tight text-ink"
          >
            Mesure d’audience
          </p>
          <p id="cookie-consent-desc" className="mt-1.5 text-sm leading-relaxed text-ink-muted">
            Avec votre accord, nous utilisons Google Analytics 4 pour compter les visites et les
            demandes (appel, e-mail, formulaire, devis, paiement). Pas de publicité ciblée.{" "}
            <Link
              href="/politique-confidentialite#cookies"
              className="font-medium text-teal underline underline-offset-2"
            >
              En savoir plus
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            className="h-11 rounded-[12px] border border-line bg-paper px-4 text-sm font-semibold text-ink hover:border-line-strong hover:bg-surface"
            onClick={() => setConsent("denied")}
          >
            Refuser
          </button>
          <button
            type="button"
            className="h-11 rounded-[12px] bg-teal px-4 text-sm font-semibold text-white hover:bg-teal-deep"
            onClick={() => setConsent("granted")}
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
