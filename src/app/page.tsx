import { QuickDiagnostic } from "@/components/home/QuickDiagnostic";
import { CtaBand } from "@/components/CtaBand";
import { BeforeAfter } from "@/components/home/BeforeAfter";
import { GuaranteeStrip } from "@/components/home/GuaranteeStrip";
import { Hero } from "@/components/home/Hero";
import { HomeServices } from "@/components/home/HomeServices";
import { ConfiguratorTeaser, Testimonials } from "@/components/home/Testimonials";
import { TrustSection } from "@/components/home/TrustSection";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Section";
import { articles } from "@/lib/data/articles";
import { siteConfig } from "@/lib/site";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    absolute: `${siteConfig.name} — Dépannage informatique à Yerres (91)`,
  },
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

function HomeLocal() {
  return (
    <Section className="bg-paper border-y border-line">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">
            Ancré à Yerres
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl leading-tight text-balance">
            Un atelier local, une zone d’intervention claire
          </h2>
          <p className="mt-4 text-ink-muted leading-relaxed max-w-lg">
            Basés au {siteConfig.address}, nous intervenons en priorité sur Yerres
            et les communes voisines — à domicile, ou en dépôt atelier.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {siteConfig.nearbyCities.slice(0, 6).map((city) => (
              <li
                key={city}
                className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-medium"
              >
                {city}
              </li>
            ))}
          </ul>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button href="/zone-intervention">Voir la zone</Button>
            <Button href={siteConfig.mapsDirectionsUrl} variant="secondary">
              <MapPin className="h-4 w-4" />
              Itinéraire atelier
            </Button>
          </div>
        </div>
        <Reveal>
          <div className="rounded-[24px] border border-line bg-surface p-6 md:p-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted">
              Atelier
            </p>
            <p className="mt-3 font-display text-2xl tracking-tight">
              {siteConfig.street}
            </p>
            <p className="text-lg text-ink-soft">
              {siteConfig.postalCode} {siteConfig.city}
            </p>
            <p className="mt-3 text-sm text-ink-muted">{siteConfig.transport}</p>
            <p className="mt-2 text-sm text-ink-muted">{siteConfig.hours}</p>
            <p className="mt-5 text-sm font-semibold text-teal">{siteConfig.phone}</p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

function HomeConseils() {
  const featured = articles.slice(0, 3);
  return (
    <Section>
      <SectionHeader
        eyebrow="Conseils"
        title="Mieux comprendre pour mieux décider"
        description="Guides courts issus de l’atelier Yerres — utiles avant même de nous appeler."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {featured.map((article, i) => (
          <Reveal key={article.slug} delay={i * 60}>
            <Link
              href={`/conseils/${article.slug}`}
              className="group flex h-full flex-col rounded-[20px] border border-line bg-paper p-5 transition-all hover:border-teal/35 hover:shadow-[var(--shadow-soft)]"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">
                {article.category}
              </span>
              <h3 className="mt-3 text-lg leading-snug">{article.title}</h3>
              <p className="mt-2 flex-1 text-sm text-ink-muted leading-relaxed">
                {article.excerpt}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal">
                Lire
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
      <div className="mt-6">
        <Link href="/conseils" className="text-sm font-semibold text-teal hover:text-teal-deep">
          Tous les conseils →
        </Link>
      </div>
    </Section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <GuaranteeStrip />
      <QuickDiagnostic />
      <HomeServices />
      <HomeLocal />
      <TrustSection />
      <BeforeAfter />
      <ConfiguratorTeaser />
      <Testimonials />
      <HomeConseils />
      <CtaBand />
    </>
  );
}
