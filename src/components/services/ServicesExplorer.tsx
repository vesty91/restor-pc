"use client";

import { ServiceIcon } from "@/components/ServiceIcon";
import { services } from "@/lib/data/services";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
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
  logiciel: ["virus-optimisation", "reinstallation-windows", "sauvegarde-securite", "maintenance"],
  data: ["recuperation-donnees", "sauvegarde-securite"],
  pc: ["montage-pc"],
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors",
                filter === f.id
                  ? "bg-panel text-panel-fg"
                  : "border border-line bg-paper text-ink-muted hover:text-ink"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <label className="block sm:w-64">
          <span className="sr-only">Rechercher un service</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher…"
            className="w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-teal"
          />
        </label>
      </div>

      <p className="mt-4 text-sm text-ink-muted">
        {list.length} service{list.length > 1 ? "s" : ""} trouvé
        {list.length > 1 ? "s" : ""}
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {list.map((service) => (
          <Link
            key={service.slug}
            href={`/services/${service.slug}`}
            className="group flex gap-5 rounded-[22px] border border-line bg-paper p-6 transition-all hover:border-teal/35 hover:shadow-[var(--shadow-soft)]"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-teal-soft text-teal">
              <ServiceIcon name={service.icon} className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl leading-[1.35]">{service.title}</h2>
                <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-ink-muted group-hover:text-teal" />
              </div>
              <p className="mt-2 text-sm leading-[1.6] text-ink-muted">
                {service.excerpt}
              </p>
              <p className="mt-4 text-sm font-semibold">
                À partir de {formatPrice(service.priceFrom)} · {service.duration}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-line bg-surface p-6 text-center text-ink-muted">
          Aucun service ne correspond.{" "}
          <Link href="/contact" className="font-semibold text-teal">
            Décrivez votre problème
          </Link>{" "}
          — on vous oriente.
        </p>
      ) : null}
    </div>
  );
}
