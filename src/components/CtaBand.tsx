"use client";

import { Button } from "@/components/ui/Button";
import { getOpenStatus } from "@/lib/hours";
import { siteConfig } from "@/lib/site";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { MessageCircle, Phone } from "lucide-react";
import { useEffect, useState } from "react";

export function CtaBand({
  title = "Un PC en panne ? Un projet de config ?",
  text = `Atelier à Yerres (${siteConfig.postalCode}). Décrivez votre besoin : on vous répond rapidement avec un diagnostic ou un devis clair.`,
}: {
  title?: string;
  text?: string;
}) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setOpen(getOpenStatus().open);
    const id = window.setInterval(() => setOpen(getOpenStatus().open), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const whatsapp = buildWhatsAppUrl(
    open
      ? "Bonjour Restor-PC, j’aimerais un devis / diagnostic pour mon PC."
      : "Bonjour Restor-PC, atelier fermé — je souhaite un rappel dès que possible pour mon PC."
  );

  return (
    <section className="py-16 md:py-20">
      <div className="container-site">
        <div className="relative overflow-hidden rounded-[28px] bg-panel px-6 py-12 md:px-12 md:py-14 text-white">
          <div
            className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-teal/30 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-white/5 blur-3xl"
            aria-hidden
          />
          <div className="relative grid gap-8 md:grid-cols-[1.4fr_auto] md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">
                {open ? "Atelier ouvert" : "Atelier fermé · rappel possible"}
              </p>
              <h2 className="mt-3 max-w-xl text-3xl md:text-4xl leading-tight text-white text-balance">
                {title}
              </h2>
              <p className="mt-4 max-w-lg text-white/65 leading-relaxed">{text}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {open ? (
                <>
                  <Button href="/contact" size="lg">
                    Demander un devis
                  </Button>
                  <Button
                    href={siteConfig.phoneHref}
                    variant="secondary"
                    size="lg"
                    className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                  >
                    <Phone className="h-4 w-4" />
                    {siteConfig.phone}
                  </Button>
                </>
              ) : (
                <>
                  <Button href="/contact?type=urgence&urgency=asap" size="lg">
                    Demander un rappel
                  </Button>
                  <Button
                    href={whatsapp}
                    variant="secondary"
                    size="lg"
                    className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
