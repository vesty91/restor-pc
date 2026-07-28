import { CtaBand } from "@/components/CtaBand";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section, SectionHeader } from "@/components/ui/Section";
import { articles } from "@/lib/data/articles";
import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Conseils & guides informatiques",
  description:
    "Guides Restor-PC (Yerres) : PC lent, sauvegarde, config gaming, dépannage à domicile en Essonne. Conseils clairs par un atelier pro.",
  alternates: { canonical: "/conseils" },
};

export default function ConseilsPage() {
  return (
    <>
      <Section className="noise-bg pt-20 md:pt-28 pb-8">
        <Breadcrumbs items={[{ label: "Conseils" }]} />
        <SectionHeader
          eyebrow="Conseils"
          title="Des guides utiles, sans jargon inutile"
          description="Des articles écrits comme on explique en atelier à Yerres : concrets, actionnables, orientés résultats."
        />
      </Section>
      <Section className="pt-0">
        <div className="grid gap-4 md:grid-cols-2">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/conseils/${article.slug}`}
              className="tile-wow group flex flex-col rounded-[22px] p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">
                  {article.category}
                </span>
                <span className="text-xs text-ink-muted">{article.readTime}</span>
              </div>
              <h2 className="mt-3 text-xl leading-snug group-hover:text-teal-deep transition-colors">
                {article.title}
              </h2>
              <p className="mt-3 flex-1 text-sm text-ink-muted leading-relaxed">
                {article.excerpt}
              </p>
              <p className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-teal">
                Lire l’article
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" />
              </p>
            </Link>
          ))}
        </div>
      </Section>
      <CtaBand title="Une question hors article ?" />
    </>
  );
}
