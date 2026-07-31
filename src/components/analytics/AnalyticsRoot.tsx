"use client";

import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { CookieConsentBanner } from "@/components/analytics/CookieConsentBanner";
import { OutboundClickTracker } from "@/components/analytics/OutboundClickTracker";
import type { ReactNode } from "react";

export function AnalyticsRoot({ children }: { children?: ReactNode }) {
  return (
    <AnalyticsProvider>
      <OutboundClickTracker />
      <CookieConsentBanner />
      {children}
    </AnalyticsProvider>
  );
}
