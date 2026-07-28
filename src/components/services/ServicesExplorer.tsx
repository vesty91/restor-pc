"use client";

import { ServiceIcon } from "@/components/ServiceIcon";
import { BentoGrid, BentoGridItem } from "@/components/aceternity/bento-grid";
import { Badge } from "@/components/ui/badge";
import { services } from "@/lib/data/services";
import { cn, formatPrice } from "@/lib/utils";
import { ArrowUpRight, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const filters = [
  { id: "all", label: "Tous" },
  { id: "panne", label: "Pannes & réparation" },
  { id: "logiciel", label: "Logiciel & sécu" },
  { id: "data", label: "Données" },
  { id: "pc", label: "PC sur mesure" },
] as const;

const filterMap: Record<string, string[]> = {
  panne: ["depannage-informatique", "reparation-pc", "maintenance"],
  logiciel: [
    "virus-optimisation",
    "reinstallation-windows",
    "sauvegarde-securite",
    "maintenance",
  ],
  data: ["recuperation-donnees", "sauvegarde-securite"],
  pc: ["montage-pc"],
};

const serviceBadge: Record<string, string> = {
  "depannage-informatique": "Dépannage",
  "reparation-pc": "Hardware",
  "virus-optimisation": "Performance",
  "reinstallation-windows": "Système",
  "recuperation-donnees": "Données",
  "montage-pc": "Sur mesure",
  "sauvegarde-securite": "NAS",
  maintenance: "Entretien",
};

export function ServicesExplorer() {
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    let items = services;
    if (filter !== "all") {
      items = items.filter((s) => filterMap[filter]?.includes(s.slug));
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.excerpt.toLowerCase().includes(q) ||
          s.features.some((f) => f.toLowerCase().includes(q))
      );
    }
    return items;
  }, [filter, query]);

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filtrer les services"
        >
          {filters.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={active}
                className={cn(
                  "rounded-full outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                  active ? "" : "hover:opacity-90"
                )}
              >
                <Badge
                  variant={active ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer px-3.5 py-1.5 text-sm",
                    active && "bg-panel text-panel-fg hover:bg-panel"
                  )}
                >
                  {f.label}
                </Badge>
              </button>
            );
          })}
        </div>
        <label className="relative block sm:w-72">
          <span className="sr-only">Rechercher un service</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un service…"
            className="w-full rounded-xl border border-line bg-paper py-2.5 pl-10 pr-4 text-sm outline-none focus:border-teal focus-visible:ring-2 focus-visible:ring-teal/30"
          />
        </label>
      </div>

      <p className="mt-4 text-sm text-ink-muted" aria-live="polite">
        {list.length} service{list.length > 1 ? "s" : ""} trouvé
        {list.length > 1 ? "s" : ""}
      </p>

      {list.length > 0 ? (
        <BentoGrid className="mt-4 lg:grid-cols-3">
          {list.map((service) => (
            <BentoGridItem
              key={service.slug}
              href={`/services/${service.slug}`}
              header={
                <Badge variant="info">
                  {serviceBadge[service.slug] ?? "Service"}
                </Badge>
              }
              icon={
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-teal-soft text-teal transition-transform duration-300 group-hover/bento:scale-110 group-hover/bento:border-teal/40 motion-reduce:transition-none">
                  <ServiceIcon name={service.icon} className="h-5 w-5" />
                </span>
              }
              title={service.title}
              description={service.excerpt}
              meta={
                <span className="inline-flex w-full items-center justify-between gap-2">
                  <span>
                    À partir de {formatPrice(service.priceFrom)}
                    <span className="font-normal text-ink-muted">
                      {" "}
                      · {service.duration}
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-ink-muted transition-transform duration-300 group-hover/bento:translate-x-1 group-hover/bento:-translate-y-1 group-hover/bento:scale-110 group-hover/bento:text-teal motion-reduce:transition-none" />
                </span>
              }
            />
          ))}
        </BentoGrid>
      ) : (
        <div className="mt-8 rounded-[22px] border border-line bg-surface px-6 py-10 text-center">
          <Badge variant="muted" className="mb-3">
            Aucun résultat
          </Badge>
          <p className="text-ink-muted">
            Aucun service ne correspond à votre recherche.{" "}
            <Link href="/contact" className="font-semibold text-teal underline-offset-2 hover:underline">
              Décrivez votre problème
            </Link>{" "}
            — on vous oriente.
          </p>
        </div>
      )}
    </div>
  );
}
