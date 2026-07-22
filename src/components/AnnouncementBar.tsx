"use client";

import { getOpenStatus } from "@/lib/hours";
import { siteConfig } from "@/lib/site";
import { Phone, X } from "lucide-react";
import { useEffect, useState } from "react";

const DISMISS_KEY = "restor-pc-banner-dismissed";

export function AnnouncementBar() {
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState(() => getOpenStatus());

  useEffect(() => {
    setStatus(getOpenStatus());
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* ignore */
    }
    setVisible(true);
    const id = window.setInterval(() => setStatus(getOpenStatus()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  if (!visible) return null;

  return (
    <div
      className={
        status.open
          ? "border-b border-teal/20 bg-teal-soft text-ink"
          : "border-b border-line bg-surface-2 text-ink-soft"
      }
    >
      <div className="container-wide flex items-center justify-between gap-3 py-2 text-sm">
        <p className="min-w-0 truncate">
          <span className="font-semibold">
            {status.open ? "Atelier ouvert" : "Atelier fermé"}
          </span>
          <span className="text-ink-muted">
            {" "}
            · {status.detail} · {siteConfig.addressShort}
          </span>
        </p>
        <div className="flex items-center gap-2 shrink-0">
          {status.open ? (
            <a
              href={siteConfig.phoneHref}
              className="inline-flex items-center gap-1.5 rounded-lg bg-panel px-2.5 py-1.5 text-xs font-semibold text-panel-fg"
            >
              <Phone className="h-3.5 w-3.5" />
              {siteConfig.phone}
            </a>
          ) : (
            <a
              href="/contact?type=urgence&urgency=asap"
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber px-2.5 py-1.5 text-xs font-semibold text-white dark:text-[#1a1205]"
            >
              Demander un rappel
            </a>
          )}
          <button
            type="button"
            aria-label="Fermer le bandeau"
            className="grid h-8 w-8 place-items-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
            onClick={() => {
              setVisible(false);
              try {
                sessionStorage.setItem(DISMISS_KEY, "1");
              } catch {
                /* ignore */
              }
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
