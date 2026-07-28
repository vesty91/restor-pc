import { CtaBand } from "@/components/CtaBand";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { MaintenanceSpotlight } from "@/components/tarifs/MaintenanceSpotlight";
import { PricingHero } from "@/components/tarifs/PricingHero";
import { PricingTiers } from "@/components/tarifs/PricingTiers";
import { StatusBadge } from "@/components/restor-pc/status-badge";
import { Badge } from "@/components/ui/badge";
import { Section, SectionHeader } from "@/components/ui/Section";
import {
  DOMICILE_MIN,
  URGENCY_RATES,
  priceList,
  pricingNotes,
  urgencyRates,
} from "@/lib/data/pricing";
import { formatPrice } from "@/lib/utils";
import { CalendarDays, Check, Clock, Moon } from "lucide-react";
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
      <Section className="noise-bg pb-8 pt-20 md:pt-28">
        <Breadcrumbs items={[{ label: "Tarifs" }]} />
        <div className="mt-6">
          <PricingHero />
        </div>
      </Section>

      <Section className="pt-2 md:pt-4">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Badge variant="info">3 formules</Badge>
          <Badge variant="outline">Clair dès le premier échange</Badge>
        </div>
        <PricingTiers />
      </Section>

      <Section className="border-y border-line bg-paper">
        <div className="mb-3 flex flex-wrap gap-2">
          <StatusBadge status="urgent" />
          <Badge variant="outline">Créneau confirmé avant déplacement</Badge>
        </div>
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
                className="tile-wow group rounded-[22px] p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-soft text-teal transition-transform duration-300 group-hover:scale-110 group-hover:border group-hover:border-teal/40 motion-reduce:transition-none">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <Badge variant={i === 0 ? "warning" : "muted"}>
                    {i === 0 ? "Jour même" : i === 1 ? "Soirée" : "WE / férié"}
                  </Badge>
                </div>
                <h3 className="mt-4 text-lg font-semibold leading-snug">{row.label}</h3>
                <p className="mt-3 font-display text-3xl tracking-tight md:text-4xl">
                  {formatPrice(row.rate)}
                  <span className="ml-1.5 text-sm font-sans font-medium text-ink-muted">
                    / 1ʳᵉ h
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
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge variant="info">Grille indicative</Badge>
          <Badge variant="outline">Hors pièces détachées</Badge>
        </div>
        <h2 className="text-2xl md:text-3xl">Toutes les prestations en un coup d’œil</h2>
        <p className="mt-2 max-w-2xl text-ink-muted">
          Pièces détachées et cas complexes (récupération avancée, multipostes)
          font l’objet d’un devis personnalisé.
        </p>
        <div className="mt-8 overflow-hidden rounded-[22px] border border-line shadow-[var(--shadow-soft)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-ink-muted">
              <tr>
                <th className="px-4 py-3.5 font-semibold">Prestation</th>
                <th className="px-4 py-3.5 font-semibold">À partir de</th>
                <th className="hidden px-4 py-3.5 font-semibold sm:table-cell">Note</th>
              </tr>
            </thead>
            <tbody>
              {priceList.map((row, i) => (
                <tr
                  key={row.service}
                  className={
                    i % 2 === 0
                      ? "border-t border-line bg-paper"
                      : "border-t border-line bg-surface/40"
                  }
                >
                  <td className="px-4 py-3.5 font-medium">{row.service}</td>
                  <td className="px-4 py-3.5">
                    {row.from === 0 ? (
                      <Badge variant="success">Offert</Badge>
                    ) : (
                      <span className="font-display text-lg">{formatPrice(row.from)}</span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3.5 text-ink-muted sm:table-cell">
                    {row.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section>
        <MaintenanceSpotlight />
      </Section>

      <CtaBand
        title="Besoin d’un devis précis ?"
        text="Décrivez votre machine et le problème : on vous répond avec une estimation réaliste."
      />
    </>
  );
}
