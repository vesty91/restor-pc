"use client";

import {
  classifyOutboundHref,
  trackEmailClick,
  trackPhoneClick,
  trackWhatsappClick,
} from "@/lib/analytics";
import { useEffect } from "react";

/**
 * Capture les clics tel: / mailto: / WhatsApp via délégation (tous les CTA).
 * N’envoie un event que si gtag est chargé (consentement accordé).
 */
export function OutboundClickTracker() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      const kind = classifyOutboundHref(href);
      if (!kind) return;
      const source =
        anchor.getAttribute("data-analytics") ||
        anchor.closest("[data-analytics-source]")?.getAttribute("data-analytics-source") ||
        undefined;
      if (kind === "phone") trackPhoneClick(source);
      else if (kind === "email") trackEmailClick(source);
      else trackWhatsappClick(source);
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
