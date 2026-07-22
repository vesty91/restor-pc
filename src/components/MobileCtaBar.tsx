"use client";

import { getOpenStatus } from "@/lib/hours";
import { siteConfig } from "@/lib/site";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function MobileCtaBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setOpen(getOpenStatus().open);
    const id = window.setInterval(() => setOpen(getOpenStatus().open), 60_000);
    return () => window.clearInterval(id);
  }, []);

  if (pathname.startsWith("/contact")) return null;

  const urgentWhatsApp = buildWhatsAppUrl(
    "Bonjour Restor-PC, j’ai une panne urgente sur mon PC et j’aimerais un rappel."
  );

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 p-2.5 backdrop-blur-xl md:hidden safe-bottom">
      <div className="container-wide grid grid-cols-3 gap-2">
        <a
          href={siteConfig.phoneHref}
          className={
            open
              ? "inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-teal text-xs font-semibold text-white sm:text-sm"
              : "inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-panel text-xs font-semibold text-panel-fg sm:text-sm"
          }
        >
          <Phone className="h-4 w-4 shrink-0" />
          {open ? "Appeler" : "Appeler"}
        </a>
        <a
          href={open ? siteConfig.whatsappHref : urgentWhatsApp}
          target="_blank"
          rel="noopener noreferrer"
          className={
            open
              ? "inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-line bg-surface text-xs font-semibold text-ink sm:text-sm"
              : "inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-teal text-xs font-semibold text-white sm:text-sm"
          }
        >
          <MessageCircle className="h-4 w-4 shrink-0" />
          WhatsApp
        </a>
        <Link
          href={open ? "/contact" : "/contact?type=urgence&urgency=asap"}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-line bg-surface text-xs font-semibold text-ink sm:text-sm"
        >
          {open ? "Devis" : "Rappel"}
        </Link>
      </div>
    </div>
  );
}
