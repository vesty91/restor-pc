import { AddressMap } from "@/components/AddressMap";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContactForm } from "@/components/contact/ContactForm";
import { CopyPhoneButton } from "@/components/CopyPhoneButton";
import { OpenStatusBadge } from "@/components/OpenStatusBadge";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { faqs } from "@/lib/data/faq";
import { siteConfig } from "@/lib/site";
import { Clock3, Mail, MapPin, MessageCircle, Phone, ShieldCheck, Train } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Contact & devis — Yerres (91)",
  description: `Contactez Restor-PC au ${siteConfig.phone} — atelier ${siteConfig.address}. Devis, urgence, assistance Yerres & Essonne.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <Section className="noise-bg pt-20 md:pt-28 pb-8">
        <Breadcrumbs items={[{ label: "Contact" }]} />
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">
          Contact
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl md:text-5xl leading-tight">
          Parlons de votre panne ou de votre projet
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-muted leading-relaxed">
          Atelier à Yerres · {siteConfig.responseTime}. Devis clair. Pas de jargon
          inutile.
        </p>
        <div className="mt-5">
          <OpenStatusBadge />
        </div>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-[24px] border border-line bg-paper p-6 md:p-8 shadow-[var(--shadow-soft)]">
              <h2 className="text-2xl">Formulaire de contact</h2>
              <p className="mt-2 text-sm text-ink-muted">
                Décrivez le problème ou joignez le résumé de votre configuration.
              </p>
              <div className="mt-6">
                <Suspense fallback={<p className="text-sm text-ink-muted">Chargement…</p>}>
                  <ContactForm />
                </Suspense>
              </div>
            </div>
            <AddressMap />
          </div>

          <aside className="space-y-4">
            <div className="rounded-[24px] border border-white/10 bg-panel p-6 text-panel-fg">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
                Coordonnées
              </p>
              <OpenStatusBadge tone="dark" className="mt-4 w-full justify-start" />
              <ul className="mt-5 space-y-4">
                <li>
                  <div className="flex items-center justify-between gap-3">
                    <a
                      href={siteConfig.phoneHref}
                      className="flex items-center gap-3 hover:text-teal"
                    >
                      <Phone className="h-5 w-5 text-teal" />
                      <span className="font-semibold text-lg">{siteConfig.phone}</span>
                    </a>
                    <CopyPhoneButton />
                  </div>
                </li>
                <li>
                  <a
                    href={siteConfig.whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 hover:text-teal"
                  >
                    <MessageCircle className="h-5 w-5 text-teal" />
                    WhatsApp · {siteConfig.phone}
                  </a>
                </li>
                <li>
                  <a
                    href={siteConfig.emailHref}
                    className="flex items-center gap-3 hover:text-teal"
                  >
                    <Mail className="h-5 w-5 text-teal" />
                    {siteConfig.email}
                  </a>
                </li>
                <li className="flex items-start gap-3 text-white/80">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-teal" />
                  <span>
                    <a
                      href={siteConfig.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold hover:text-teal"
                    >
                      {siteConfig.street}
                      <br />
                      {siteConfig.postalCode} {siteConfig.city}
                    </a>
                    <span className="mt-1 flex items-center gap-1.5 text-sm text-white/50">
                      <Train className="h-3.5 w-3.5" />
                      {siteConfig.transport}
                    </span>
                  </span>
                </li>
                <li className="flex items-center gap-3 text-white/70">
                  <Clock3 className="h-5 w-5 text-teal" />
                  {siteConfig.hours}
                </li>
              </ul>
              <div className="mt-6 grid gap-2">
                <Button href={siteConfig.phoneHref} className="w-full">
                  Appeler {siteConfig.phone}
                </Button>
                <Button
                  href={siteConfig.whatsappHref}
                  variant="secondary"
                  className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Button>
                <Button
                  href={siteConfig.mapsDirectionsUrl}
                  variant="secondary"
                  className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10"
                >
                  Itinéraire vers l’atelier
                </Button>
              </div>
              <p className="mt-4 text-xs text-white/45">{siteConfig.guarantee}</p>
            </div>

            <div className="rounded-[24px] border border-line bg-paper p-6">
              <div className="flex items-center gap-2 text-teal">
                <ShieldCheck className="h-5 w-5" />
                <p className="font-semibold text-ink">Ce que vous obtenez</p>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-ink-muted">
                <li>• Réponse humaine, pas un chatbot opaque</li>
                <li>• Estimation claire avant engagement</li>
                <li>• Choix domicile ou atelier Yerres</li>
                <li>• Confidentialité de vos données</li>
              </ul>
            </div>

            <div className="rounded-[24px] border border-line bg-paper p-6">
              <h3 className="text-lg">Mini FAQ</h3>
              <div className="mt-3 space-y-3">
                {faqs.slice(0, 3).map((f) => (
                  <details key={f.q} className="text-sm">
                    <summary className="cursor-pointer font-semibold">{f.q}</summary>
                    <p className="mt-1.5 text-ink-muted leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
