import { ServiceIcon } from "@/components/ServiceIcon";
import { BentoGrid, BentoGridItem } from "@/components/aceternity/bento-grid";
import { Section, SectionHeader } from "@/components/ui/Section";
import { getService, type Service } from "@/lib/data/services";
import { formatPrice } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

type BentoCard = {
  slug: string;
  className?: string;
  titleOverride?: string;
  excerptOverride?: string;
};

/** Cartes métier — textes issus du catalogue services (pas de doublon inventé). */
const BENTO_CARDS: BentoCard[] = [
  {
    slug: "depannage-informatique",
    className: "md:col-span-2",
    titleOverride: "Dépannage Windows & PC",
  },
  { slug: "recuperation-donnees" },
  {
    slug: "virus-optimisation",
    titleOverride: "Nettoyage et optimisation",
  },
  {
    slug: "reparation-pc",
    titleOverride: "Installation et remplacement de composants",
  },
  {
    slug: "montage-pc",
    className: "md:col-span-2",
    titleOverride: "Montage PC sur mesure",
  },
  {
    slug: "sauvegarde-securite",
    titleOverride: "NAS et solutions de sauvegarde",
    excerptOverride:
      "Mise en place de sauvegardes fiables, NAS et stratégie 3-2-1 adaptée à votre usage.",
  },
  {
    slug: "depannage-informatique",
    titleOverride: "Assistance informatique à domicile",
    excerptOverride:
      "Intervention à domicile sur Yerres et communes voisines — diagnostic clair, devis avant réparation.",
  },
  {
    slug: "reparation-pc",
    className: "md:col-span-2",
    titleOverride: "Diagnostic matériel et logiciel",
    excerptOverride:
      "Méthode atelier : tests composants, analyse système, cause réelle avant toute facturation.",
  },
];

function resolveCard(card: BentoCard): Service | undefined {
  return getService(card.slug);
}

export function HomeServices() {
  return (
    <Section>
      <SectionHeader
        eyebrow="Services"
        title="Tout ce qu’il faut pour faire revivre votre machine"
        description="Du diagnostic express au montage sur mesure, chaque prestation est pensée pour être claire, efficace et rassurante."
      />

      <BentoGrid>
        {BENTO_CARDS.map((card, i) => {
          const service = resolveCard(card);
          if (!service) return null;
          const title = card.titleOverride ?? service.title;
          const description = card.excerptOverride ?? service.excerpt;
          return (
            <BentoGridItem
              key={`${card.slug}-${title}-${i}`}
              className={card.className}
              href={`/services/${service.slug}`}
              title={title}
              description={description}
              icon={
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-soft text-teal">
                  <ServiceIcon name={service.icon} className="h-5 w-5" />
                </span>
              }
              meta={
                <span className="inline-flex w-full items-center justify-between gap-2">
                  <span>À partir de {formatPrice(service.priceFrom)}</span>
                  <ArrowUpRight className="h-4 w-4 text-ink-muted transition-transform group-hover/bento:translate-x-0.5 group-hover/bento:-translate-y-0.5 group-hover/bento:text-teal" />
                </span>
              }
            />
          );
        })}
      </BentoGrid>

      <div className="mt-8">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-sm font-semibold text-teal hover:text-teal-deep"
        >
          Voir tous les services
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </Section>
  );
}
