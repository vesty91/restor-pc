"use client";

import { ToolGuiPreview } from "@/components/boutique/ToolGuiPreview";
import { Badge } from "@/components/ui/badge";
import { getOutilDetails } from "@/lib/data/outils-details";
import { formatOutilPrice, type OutilProduct } from "@/lib/data/outils";
import { cn } from "@/lib/utils";
import { ArrowUpRight, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const filters = [
  { id: "all", label: "Tous" },
  { id: "standard", label: "Standard" },
  { id: "admin", label: "Admin requis" },
  { id: "offline", label: "Hors-ligne" },
  { id: "online", label: "Internet" },
] as const;

type FilterId = (typeof filters)[number]["id"];

export function BoutiqueCatalog({ tools }: { tools: OutilProduct[] }) {
  const [filter, setFilter] = useState<FilterId>("all");
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    let items = tools;
    if (filter === "admin") items = items.filter((t) => t.admin);
    if (filter === "standard") items = items.filter((t) => !t.admin);
    if (filter === "offline") items = items.filter((t) => !t.needsInternet);
    if (filter === "online") items = items.filter((t) => t.needsInternet);
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(
        (t) => t.title.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q),
      );
    }
    return items;
  }, [tools, filter, query]);

  return (
    <div className="mt-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer les outils">
          {filters.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={active}
                className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                <Badge
                  variant={active ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer px-3.5 py-1.5 text-sm",
                    active && "bg-panel text-panel-fg hover:bg-panel",
                  )}
                >
                  {f.label}
                </Badge>
              </button>
            );
          })}
        </div>
        <label className="relative block sm:w-72" htmlFor="boutique-search">
          <span className="sr-only">Rechercher un outil</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
            aria-hidden
          />
          <input
            id="boutique-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un outil…"
            className="w-full rounded-xl border border-line bg-paper py-2.5 pl-10 pr-4 text-sm outline-none focus:border-teal focus-visible:ring-2 focus-visible:ring-teal/30"
          />
        </label>
      </div>

      <p className="mt-4 text-sm text-ink-muted" aria-live="polite">
        {list.length} outil{list.length > 1 ? "s" : ""}
      </p>

      {list.length > 0 ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((tool) => {
            const d = getOutilDetails(tool.slug);
            return (
              <Link
                key={tool.slug}
                href={`/boutique/${tool.slug}`}
                className="tile-wow group flex h-full flex-col overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                <ToolGuiPreview
                  title={tool.title}
                  kind={d.preview}
                  exe={d.exe}
                  className="rounded-none border-0 border-b border-line shadow-none"
                />
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant={tool.admin ? "warning" : "muted"}>
                      {tool.admin ? "Admin" : "Standard"}
                    </Badge>
                    <Badge variant="outline">
                      {tool.needsInternet ? "Internet" : "Hors-ligne"}
                    </Badge>
                  </div>
                  <h3 className="mt-3 text-[1.05rem] font-semibold leading-snug tracking-tight group-hover:text-teal">
                    {tool.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-ink-muted">
                    {tool.tagline}
                  </p>
                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
                    <p className="text-base font-semibold">{formatOutilPrice(tool.priceCents)}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal">
                      Détail
                      <ArrowUpRight
                        className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
                        aria-hidden
                      />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 rounded-[22px] border border-line bg-surface px-6 py-10 text-center">
          <Badge variant="muted" className="mb-3">
            Aucun résultat
          </Badge>
          <p className="text-ink-muted">
            Aucun outil ne correspond.{" "}
            <Link
              href="/contact"
              className="font-semibold text-teal underline-offset-2 hover:underline"
            >
              Contactez-nous
            </Link>{" "}
            pour une demande atelier.
          </p>
        </div>
      )}
    </div>
  );
}
