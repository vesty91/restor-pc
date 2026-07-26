import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ToolGuiPreview } from "@/components/boutique/ToolGuiPreview";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Section";
import { getOutilDetails } from "@/lib/data/outils-details";
import {
  formatOutilPrice,
  getAllProducts,
  packComplet,
  outilsCatalog,
} from "@/lib/data/outils";
import { cn } from "@/lib/utils";
import { Shield, Wifi, Download } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Boutique outils atelier",
  description:
    "Achetez les outils Restor-PC : fiches détaillées, licence 1 PC, téléchargement sécurisé (1 fois), guides inclus.",
  alternates: { canonical: "/boutique" },
};

export default function BoutiquePage({
  searchParams,
}: {
  searchParams?: Promise<{ canceled?: string }>;
}) {
  return <BoutiqueInner searchParams={searchParams} />;
}

async function BoutiqueInner({
  searchParams,
}: {
  searchParams?: Promise<{ canceled?: string }>;
}) {
  const sp = searchParams ? await searchParams : {};
  const products = getAllProducts();
  const packDetails = getOutilDetails(packComplet.slug);

  return (
    <>
      <Section className="noise-bg pt-20 md:pt-28 pb-8">
        <Breadcrumbs items={[{ label: "Boutique" }]} />
        <SectionHeader
          eyebrow="Boutique"
          title="Outils atelier Restor-PC"
          description="Fiches détaillées (usage, étapes, conseils). Licence 1 PC. Après paiement : email avec clé + lien de téléchargement (1 fois)."
        />
        {sp.canceled === "1" ? (
          <p className="mt-4 rounded-[12px] border border-line bg-surface px-4 py-3 text-sm text-ink-muted">
            Paiement annulé. Vous pouvez réessayer quand vous voulez.
          </p>
        ) : null}
        <ul className="mt-8 flex flex-wrap gap-4 text-sm text-ink-muted">
          <li className="inline-flex items-center gap-2">
            <Shield className="size-4 text-teal" aria-hidden /> 1 licence = 1 PC
          </li>
          <li className="inline-flex items-center gap-2">
            <Download className="size-4 text-teal" aria-hidden /> Lien NAS 1 téléchargement
          </li>
          <li className="inline-flex items-center gap-2">
            <Wifi className="size-4 text-teal" aria-hidden /> Guides HTML/PDF inclus
          </li>
        </ul>
      </Section>

      <Section className="pt-0">
        <article className="grid gap-6 overflow-hidden rounded-[24px] border border-teal/40 bg-panel p-6 text-panel-fg md:grid-cols-[1.1fr_0.9fr] md:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Pack</p>
            <h2 className="mt-2 font-display text-3xl tracking-tight">{packComplet.title}</h2>
            <p className="mt-2 max-w-2xl text-white/65">{packComplet.tagline}</p>
            <p className="mt-3 text-sm text-white/55">{packDetails.when}</p>
            <p className="mt-4 font-display text-3xl">{formatOutilPrice(packComplet.priceCents)}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href={`/boutique/${packComplet.slug}`} variant="primary" size="lg">
                Voir le détail du pack
              </Button>
            </div>
          </div>
          <ToolGuiPreview
            title={packComplet.title}
            kind={packDetails.preview}
            exe={packDetails.exe}
            className="border-white/10"
          />
        </article>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {outilsCatalog.map((tool) => {
            const d = getOutilDetails(tool.slug);
            return (
              <Link
                key={tool.slug}
                href={`/boutique/${tool.slug}`}
                className={cn(
                  "group flex flex-col overflow-hidden rounded-[20px] border border-line bg-paper transition",
                  "hover:border-line-strong hover:shadow-[var(--shadow-lift)]"
                )}
              >
                <ToolGuiPreview
                  title={tool.title}
                  kind={d.preview}
                  exe={d.exe}
                  className="rounded-none border-0 border-b border-line shadow-none"
                />
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-xl tracking-tight group-hover:text-teal">
                    {tool.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted line-clamp-3">
                    {tool.tagline}
                  </p>
                  <p className="mt-3 text-xs text-ink-muted line-clamp-2">{d.when}</p>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <p className="text-lg font-semibold">{formatOutilPrice(tool.priceCents)}</p>
                    <p className="text-xs text-ink-muted">
                      {tool.admin ? "Admin" : "Standard"}
                      {tool.needsInternet ? " · Net" : ""}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        <p className="mt-8 text-center text-sm text-ink-muted">
          {products.length} produits · paiement sécurisé Stripe
        </p>
      </Section>
    </>
  );
}
