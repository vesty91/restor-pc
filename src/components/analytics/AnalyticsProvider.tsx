"use client";

import { isGaConfigured } from "@/lib/analytics/config";
import {
  readAnalyticsConsent,
  writeAnalyticsConsent,
  type AnalyticsConsentValue,
} from "@/lib/analytics/consent";
import { applyGtagConsent, loadGoogleAnalytics } from "@/lib/analytics/gtag";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AnalyticsContextValue = {
  configured: boolean;
  hydrated: boolean;
  consent: AnalyticsConsentValue | null;
  setConsent: (value: AnalyticsConsentValue) => void;
  openPreferences: () => void;
  preferencesOpen: boolean;
};

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

export function useAnalyticsConsent() {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) {
    throw new Error("useAnalyticsConsent must be used within AnalyticsProvider");
  }
  return ctx;
}

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const configured = isGaConfigured();
  const [consent, setConsentState] = useState<AnalyticsConsentValue | null>(null);
  const [hydrated, setHydrated] = useState(() => !configured);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    if (!configured) return;
    const id = window.setTimeout(() => {
      const stored = readAnalyticsConsent();
      setConsentState(stored);
      if (stored === "granted") {
        loadGoogleAnalytics(true);
      } else if (stored === "denied") {
        loadGoogleAnalytics(false);
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, [configured]);

  useEffect(() => {
    function onOpen() {
      setPreferencesOpen(true);
    }
    window.addEventListener("restor-pc:open-cookie-prefs", onOpen);
    return () => window.removeEventListener("restor-pc:open-cookie-prefs", onOpen);
  }, []);

  const setConsent = useCallback(
    (value: AnalyticsConsentValue) => {
      writeAnalyticsConsent(value);
      setConsentState(value);
      setPreferencesOpen(false);
      if (!configured) return;
      if (value === "granted") {
        loadGoogleAnalytics(true);
      } else {
        applyGtagConsent(false);
      }
    },
    [configured],
  );

  const openPreferences = useCallback(() => {
    setPreferencesOpen(true);
  }, []);

  const value = useMemo(
    () => ({
      configured,
      hydrated,
      consent,
      setConsent,
      openPreferences,
      preferencesOpen,
    }),
    [configured, hydrated, consent, setConsent, openPreferences, preferencesOpen],
  );

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}
