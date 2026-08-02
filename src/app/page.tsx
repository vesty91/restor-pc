import { QuickDiagnostic } from "@/components/home/QuickDiagnostic";
import { CtaBand } from "@/components/CtaBand";
import { BeforeAfter } from "@/components/home/BeforeAfter";
import { GuaranteeStrip } from "@/components/home/GuaranteeStrip";
import { Hero } from "@/components/home/Hero";
import { HomeServices } from "@/components/home/HomeServices";
import { InterventionTimeline } from "@/components/home/InterventionTimeline";
import { ConfiguratorTeaser, Testimonials } from "@/components/home/Testimonials";
import { TrustSection } from "@/components/home/TrustSection";
import { BackupIllustrations } from "@/components/restor-pc/backup-illustrations";
import { TechMarquee } from "@/components/restor-pc/tech-marquee";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Section, SectionHeader } from "@/components/ui/Section";
import { articles } from "@/lib/data/articles";
import { siteConfig } from "@/lib/site";
import { buildPageMetadata } from "@/lib/seo";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: {
      absolute: `Dépannage informatique à Yerres (91) | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    path: "/",
    openGraphTitle: `Dépannage informatique à Yerres | ${siteConfig.name}`,
  }),
};

function HomeLocal() {
  return (
    <Section className="border-y border-line bg-paper">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <Badge variant="info" className="mb-3">
            Ancré à Yerres
          </Badge>
          <h2 className="mt-1 text-balance text-3xl leading-tight md:text-4xl">
            Réparateur informatique à Yerres et communes voisines
          </h2>
          <p className="mt-4 max-w-lg leading-relaxed text-ink-muted">
            Basés au {siteConfig.address}, nous prenons en charge PC et portables : pannes, virus,
            Windows, récupération de données et montage — à domicile dans un rayon d’environ 15 km,
            ou en dépôt atelier.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {siteConfig.nearbyCities.slice(0, 6).map((city) => (
              <li key={city}>
                <Badge variant="outline" className="rounded-lg px-3 py-1.5 text-sm font-medium">
                  {city}
                </Badge>
              </li>
            ))}
          </ul>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button href="/zone-intervention">Voir les zones d’intervention</Button>
            <Button href={siteConfig.mapsDirectionsUrl} variant="secondary">
              <MapPin className="h-4 w-4" />
              Itinéraire atelier
            </Button>
          </div>
        </div>
        <Reveal>
          <div className="rounded-[24px] border border-line bg-surface p-6 md:p-8">
            <Badge variant="muted">Atelier</Badge>
            <p className="mt-3 font-display text-2xl tracking-tight">{siteConfig.street}</p>
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
              className="tile-wow group flex h-full flex-col rounded-[20px] p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              <Badge variant="info">{article.category}</Badge>
              <h3 className="mt-3 text-lg leading-snug">{article.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">
                {article.excerpt}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal">
                Lire
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" />
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

/**
 * Parcours home — bibliothèques UI utilisées une seule fois chacune par rôle :
 * Cult/Three (Hero) → Badge → Bento → Marquee → Timeline → Compare → Animata NAS → Border Beam CTA.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <GuaranteeStrip />
      <QuickDiagnostic />
      <HomeServices />
      <TechMarquee />
      <InterventionTimeline />
      <BeforeAfter />
      <BackupIllustrations />
      <HomeLocal />
      <TrustSection />
      <ConfiguratorTeaser />
      <Testimonials />
      <HomeConseils />
      <CtaBand />
    </>
  );
}
