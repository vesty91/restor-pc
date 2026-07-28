import { ServiceIcon } from "@/components/ServiceIcon";
import { BentoGrid, BentoGridItem } from "@/components/aceternity/bento-grid";
import { Badge } from "@/components/ui/badge";
import { Section, SectionHeader } from "@/components/ui/Section";
import { getService, type Service } from "@/lib/data/services";
import { formatPrice } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

type ServiceCard = {
  slug: string;
  titleOverride?: string;
  excerptOverride?: string;
  badge?: string;
};

/** 8 cartes égales — grille alignée (pas de bento irrégulier). */
const SERVICE_CARDS: ServiceCard[] = [
  {
    slug: "depannage-informatique",
    titleOverride: "Dépannage Windows & PC",
    badge: "Prioritaire",
  },
  { slug: "recuperation-donnees", badge: "Données" },
  {
    slug: "virus-optimisation",
    titleOverride: "Nettoyage et optimisation",
    badge: "Performance",
  },
  {
    slug: "reparation-pc",
    titleOverride: "Pièces & composants",
    badge: "Hardware",
  },
  {
    slug: "montage-pc",
    titleOverride: "Montage PC sur mesure",
    badge: "Sur mesure",
  },
  {
    slug: "sauvegarde-securite",
    titleOverride: "NAS & sauvegarde",
    excerptOverride:
      "Sauvegardes fiables, NAS et stratégie 3-2-1 adaptée à votre usage.",
    badge: "NAS",
  },
  {
    slug: "depannage-informatique",
    titleOverride: "Assistance à domicile",
    excerptOverride:
      "Intervention à domicile sur Yerres et communes voisines — devis avant réparation.",
    badge: "Domicile",
  },
  {
    slug: "reparation-pc",
    titleOverride: "Diagnostic matériel",
    excerptOverride:
      "Tests composants et analyse système : la cause réelle avant toute facturation.",
    badge: "Atelier",
  },
];

function resolveCard(card: ServiceCard): Service | undefined {
  return getService(card.slug);
}

export function HomeServices() {
  return (
    <Section>
      <SectionHeader
        eyebrow="Services"
        title="Tout ce qu’il faut pour faire revivre votre machine"
        description="Huit prestations claires — cliquez pour le détail, les tarifs et le devis."
      />

      <BentoGrid>
        {SERVICE_CARDS.map((card, i) => {
          const service = resolveCard(card);
          if (!service) return null;
          const title = card.titleOverride ?? service.title;
          const description = card.excerptOverride ?? service.excerpt;
          return (
            <BentoGridItem
              key={`${card.slug}-${title}-${i}`}
              href={`/services/${service.slug}`}
              header={
                card.badge ? (
                  <Badge variant="info" className="shrink-0">
                    {card.badge}
                  </Badge>
                ) : null
              }
              title={title}
              description={description}
              icon={
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-teal-soft text-teal">
                  <ServiceIcon name={service.icon} className="h-5 w-5" />
                </span>
              }
              meta={
                <span className="inline-flex w-full items-center justify-between gap-2">
                  <span className="text-ink">
                    À partir de {formatPrice(service.priceFrom)}
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 text-ink-muted transition-transform group-hover/bento:translate-x-0.5 group-hover/bento:-translate-y-0.5 group-hover/bento:text-teal"
                    aria-hidden
                  />
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
