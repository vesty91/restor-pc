import { AddressMap } from "@/components/AddressMap";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactSidebar } from "@/components/contact/ContactSidebar";
import { StatusBadge } from "@/components/restor-pc/status-badge";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/Section";
import { faqs } from "@/lib/data/faq";
import { siteConfig } from "@/lib/site";
import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact & devis — Yerres (91)",
  description: `Contactez Restor-PC au ${siteConfig.phone} — atelier ${siteConfig.address}. Devis, urgence, assistance Yerres & Essonne.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <Section className="noise-bg pb-8 pt-20 md:pt-28">
        <Breadcrumbs items={[{ label: "Contact" }]} />
        <div className="mt-6">
          <ContactHero />
        </div>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-[24px] border border-line bg-paper p-6 shadow-[var(--shadow-soft)] md:p-8">
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge variant="info">Formulaire</Badge>
                <Badge variant="outline">Réponse humaine</Badge>
                <StatusBadge status="urgent" className="hidden sm:inline-flex" />
              </div>
              <h2 className="text-2xl">Formulaire de contact</h2>
              <p className="mt-2 text-sm text-ink-muted">
                Décrivez le problème ou joignez le résumé de votre configuration.
                Pour une panne bloquante, cochez urgence ou{" "}
                <a href={siteConfig.phoneHref} className="font-semibold text-teal">
                  appelez directement
                </a>
                .
              </p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>
            <AddressMap />
          </div>

          <div className="space-y-4">
            <ContactSidebar />

            <div className="rounded-[24px] border border-line bg-paper p-6">
              <div className="flex items-center gap-2 text-teal">
                <ShieldCheck className="h-5 w-5" aria-hidden />
                <p className="font-semibold text-ink">Ce que vous obtenez</p>
              </div>
              <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
                {[
                  "Réponse humaine, pas un chatbot opaque",
                  "Estimation claire avant engagement",
                  "Choix domicile ou atelier Yerres",
                  "Confidentialité de vos données",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <Badge variant="success" className="mt-0.5 shrink-0 px-1.5 py-0">
                      ✓
                    </Badge>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[24px] border border-line bg-paper p-6">
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge variant="muted">Mini FAQ</Badge>
                <Link
                  href="/faq"
                  className="text-xs font-semibold text-teal hover:text-teal-deep"
                >
                  Voir toute la FAQ →
                </Link>
              </div>
              <div className="space-y-3">
                {faqs.slice(0, 3).map((f) => (
                  <details
                    key={f.q}
                    className="rounded-xl border border-line bg-surface px-4 py-3 text-sm"
                  >
                    <summary className="cursor-pointer list-none font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal rounded-md">
                      {f.q}
                    </summary>
                    <p className="mt-2 leading-relaxed text-ink-muted">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
