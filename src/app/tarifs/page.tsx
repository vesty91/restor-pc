import { CtaBand } from "@/components/CtaBand";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Section";
import {
  DOMICILE_MIN,
  URGENCY_RATES,
  priceList,
  pricingNotes,
  pricingTiers,
  urgencyRates,
} from "@/lib/data/pricing";
import { formatPrice, cn } from "@/lib/utils";
import { Check, Clock, Moon, CalendarDays } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tarifs & forfaits — Yerres",
  description: `Tarifs Restor-PC Yerres : domicile dès ${DOMICILE_MIN} € la première heure, urgence dès ${URGENCY_RATES.standard} €, atelier au forfait.`,
  alternates: { canonical: "/tarifs" },
};

const urgencyIcons = [Clock, Moon, CalendarDays] as const;

export default function TarifsPage() {
  return (
    <>
      <Section className="noise-bg pt-20 md:pt-28 pb-8">
        <Breadcrumbs items={[{ label: "Tarifs" }]} />
        <SectionHeader
          eyebrow="Tarifs"
          title="Des prix lisibles, des devis sans surprise"
          description={`Domicile dès ${DOMICILE_MIN} € la première heure · urgence dès ${URGENCY_RATES.standard} € · atelier au forfait. Pas d’intervention à distance — vous venez, ou je me déplace.`}
        />
      </Section>

      <Section className="pt-0">
        <div className="grid gap-4 lg:grid-cols-3">
          {pricingTiers.map((tier) => (
            <article
              key={tier.id}
              className={cn(
                "flex flex-col rounded-[24px] border p-6 md:p-7",
                tier.highlight
                  ? "border-teal bg-panel text-panel-fg shadow-[var(--shadow-lift)]"
                  : "border-line bg-paper"
              )}
            >
              <p
                className={cn(
                  "text-xs font-semibold uppercase tracking-[0.16em]",
                  tier.highlight ? "text-teal" : "text-ink-muted"
                )}
              >
                {tier.name}
              </p>
              <p
                className={cn(
                  "mt-1 text-xs font-medium",
                  tier.highlight ? "text-white/45" : "text-ink-muted"
                )}
              >
                {tier.id === "atelier" ? "À partir de" : "Minimum"}
              </p>
              <p className="mt-1 font-display text-4xl tracking-tight">
                {formatPrice(tier.priceFrom)}
                <span
                  className={cn(
                    "ml-1.5 text-sm font-sans font-medium",
                    tier.highlight ? "text-white/50" : "text-ink-muted"
                  )}
                >
                  {tier.unitLabel}
                </span>
              </p>
              <p
                className={cn(
                  "mt-3 text-sm leading-relaxed",
                  tier.highlight ? "text-white/65" : "text-ink-muted"
                )}
              >
                {tier.description}
              </p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {tier.includes.map((item) => (
                  <li key={item} className="flex gap-2 text-sm">
                    <Check
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0",
                        "text-teal"
                      )}
                    />
                    <span className={tier.highlight ? "text-white/85" : ""}>{item}</span>
                  </li>
                ))}
              </ul>
              <Button
                href={tier.href}
                variant={tier.highlight ? "primary" : "secondary"}
                className="mt-8 w-full"
              >
                {tier.cta}
              </Button>
            </article>
          ))}
        </div>
      </Section>

      <Section className="bg-paper border-y border-line">
        <SectionHeader
          eyebrow="Urgence"
          title="Majoration selon le créneau"
          description="Quand la panne ne peut pas attendre : montant de la première heure annoncé clairement avant le déplacement."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {urgencyRates.map((row, i) => {
            const Icon = urgencyIcons[i] ?? Clock;
            return (
              <article
                key={row.label}
                className="rounded-[22px] border border-line bg-surface p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal/10 text-teal">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mt-4 text-lg font-semibold leading-snug">{row.label}</h3>
                <p className="mt-3 font-display text-3xl tracking-tight">
                  {formatPrice(row.rate)}
                  <span className="ml-1.5 text-sm font-sans font-medium text-ink-muted">
                    la première heure
                  </span>
                </p>
                <p className="mt-2 text-sm text-ink-muted">{row.detail}</p>
              </article>
            );
          })}
        </div>
        <ul className="mt-8 space-y-2 text-sm text-ink-muted">
          {pricingNotes.map((note) => (
            <li key={note} className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <h2 className="text-2xl md:text-3xl">Grille indicative</h2>
        <p className="mt-2 max-w-2xl text-ink-muted">
          Pièces détachées et cas complexes (récupération avancée, multipostes)
          font l’objet d’un devis personnalisé.
        </p>
        <div className="mt-8 overflow-hidden rounded-[20px] border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Prestation</th>
                <th className="px-4 py-3 font-semibold">À partir de</th>
                <th className="hidden sm:table-cell px-4 py-3 font-semibold">Note</th>
              </tr>
            </thead>
            <tbody>
              {priceList.map((row) => (
                <tr key={row.service} className="border-t border-line bg-paper">
                  <td className="px-4 py-3.5 font-medium">{row.service}</td>
                  <td className="px-4 py-3.5 font-display text-lg">
                    {row.from === 0 ? "Offert" : formatPrice(row.from)}
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3.5 text-ink-muted">
                    {row.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center rounded-[28px] border border-line bg-panel p-6 md:p-10 text-panel-fg">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">
              Abonnement
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl leading-tight text-white">
              Contrat maintenance — sérénité mensuelle
            </h2>
            <p className="mt-4 text-white/65 leading-relaxed max-w-lg">
              Check-up trimestriel, assistance prioritaire, mises à jour critiques
              et suivi santé disque. Idéal indépendants et TPE qui ne peuvent pas
              se permettre une panne.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-white/80">
              <li className="flex gap-2">
                <Check className="h-4 w-4 shrink-0 text-teal mt-0.5" />
                1 check-up atelier / trimestre inclus
              </li>
              <li className="flex gap-2">
                <Check className="h-4 w-4 shrink-0 text-teal mt-0.5" />
                File prioritaire sous 1 h en journée
              </li>
              <li className="flex gap-2">
                <Check className="h-4 w-4 shrink-0 text-teal mt-0.5" />
                Rapport santé machine + alertes
              </li>
            </ul>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-white/50">À partir de</p>
            <p className="font-display text-5xl tracking-tight">29 €<span className="text-lg text-white/45"> / mois</span></p>
            <p className="mt-2 text-sm text-white/55">Engagement 3 mois · résiliable ensuite</p>
            <Button href="/contact?type=maintenance" className="mt-6 w-full">
              Demander une offre
            </Button>
          </div>
        </div>
      </Section>

      <CtaBand title="Besoin d’un devis précis ?" text="Décrivez votre machine et le problème : on vous répond avec une estimation réaliste." />
    </>
  );
}
