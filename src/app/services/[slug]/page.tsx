import { CtaBand } from "@/components/CtaBand";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { ServiceIcon } from "@/components/ServiceIcon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { getService, services } from "@/lib/data/services";
import { articles } from "@/lib/data/articles";
import { siteConfig } from "@/lib/site";
import { formatPrice } from "@/lib/utils";
import { Check, Clock3, ShieldCheck } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

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

export async function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return buildPageMetadata({
    title: service.seoTitle,
    description: service.seoDescription,
    path: `/services/${service.slug}`,
    openGraphTitle: `${service.seoTitle} | ${siteConfig.name}`,
  });
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const others = services.filter((s) => s.slug !== slug).slice(0, 3);
  const relatedArticles = articles
    .filter((a) => a.relatedServices.includes(slug))
    .slice(0, 3);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.seoDescription,
    provider: {
      "@type": "LocalBusiness",
      name: siteConfig.name,
      telephone: siteConfig.phone,
      address: {
        "@type": "PostalAddress",
        streetAddress: siteConfig.street,
        postalCode: siteConfig.postalCode,
        addressLocality: siteConfig.city,
        addressCountry: siteConfig.countryCode,
      },
      areaServed: [
        { "@type": "City", name: siteConfig.city },
        { "@type": "AdministrativeArea", name: siteConfig.department },
        { "@type": "AdministrativeArea", name: siteConfig.region },
      ],
    },
    areaServed: [
      { "@type": "City", name: siteConfig.city },
      { "@type": "AdministrativeArea", name: siteConfig.department },
    ],
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: service.priceFrom,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <>
      <JsonLd data={serviceSchema} />
      {service.faqs.length > 0 ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: service.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }}
        />
      ) : null}

      <Section className="noise-bg pt-20 md:pt-28">
        <Breadcrumbs
          items={[
            { label: "Services", href: "/services" },
            { label: service.shortTitle },
          ]}
        />
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="info">
                {serviceBadge[service.slug] ?? "Service"}
              </Badge>
              <Badge variant="outline">{siteConfig.city}</Badge>
              <Badge variant="success">Devis avant réparation</Badge>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-teal-soft text-teal">
                <ServiceIcon name={service.icon} className="h-6 w-6" />
              </span>
              <h1 className="text-3xl leading-tight md:text-5xl">{service.title}</h1>
            </div>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">
              {service.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={`/contact?service=${service.slug}`} size="lg">
                Demander un devis
              </Button>
              <Button href="/tarifs" variant="secondary" size="lg">
                Voir les tarifs
              </Button>
            </div>
            <p className="mt-4 inline-flex items-center gap-2 text-sm text-ink-muted">
              <ShieldCheck className="h-4 w-4 text-teal" aria-hidden />
              {siteConfig.guarantee}
            </p>
          </div>

          <aside className="rounded-[24px] border border-line bg-paper p-6 shadow-[var(--shadow-soft)]">
            <div className="flex flex-wrap gap-2">
              <Badge variant="muted">À partir de</Badge>
              <Badge variant="outline" className="gap-1">
                <Clock3 className="size-3" aria-hidden />
                {service.duration}
              </Badge>
            </div>
            <p className="mt-3 font-display text-4xl tracking-tight">
              {formatPrice(service.priceFrom)}
            </p>
            <ul className="mt-6 space-y-3">
              {service.features.map((f) => (
                <li key={f} className="flex gap-2.5 text-sm leading-snug">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </Section>

      <Section className="border-y border-line bg-paper">
        <div className="mb-2">
          <Badge variant="info">Parcours</Badge>
        </div>
        <h2 className="mt-3 text-2xl md:text-3xl">Comment ça se passe</h2>
        <p className="mt-3 max-w-xl text-ink-muted">
          Étapes propres à cette prestation — le cadre global d’intervention est
          aussi détaillé sur la page d’accueil.
        </p>
        <ol className="mt-8 grid list-none gap-4 p-0 md:grid-cols-3">
          {service.process.map((step, i) => (
            <li
              key={step.title}
              className="relative rounded-[20px] border border-line bg-surface p-5"
            >
              <Badge variant="outline" className="font-mono">
                Étape {String(i + 1).padStart(2, "0")}
              </Badge>
              <h3 className="mt-3 text-lg">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      {service.faqs.length > 0 ? (
        <Section>
          <Badge variant="muted" className="mb-3">
            FAQ
          </Badge>
          <h2 className="text-2xl md:text-3xl">Questions fréquentes</h2>
          <div className="mt-8 divide-y divide-line rounded-[22px] border border-line bg-paper">
            {service.faqs.map((item) => (
              <details key={item.q} className="group px-5 py-4">
                <summary className="relative cursor-pointer list-none pr-6 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal rounded-md">
                  {item.q}
                  <span
                    className="absolute right-0 top-0 text-teal transition-transform group-open:rotate-45"
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </Section>
      ) : null}

      <Section className="border-y border-line bg-paper">
        <h2 className="text-2xl">Autres services</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {others.map((s) => (
            <Link
              key={s.slug}
              href={`/services/${s.slug}`}
              className="tile-wow rounded-2xl bg-surface px-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              <Badge variant="info" className="mb-2">
                {serviceBadge[s.slug] ?? "Service"}
              </Badge>
              <p className="font-semibold">{s.shortTitle}</p>
              <p className="mt-1 text-sm text-ink-muted">{s.excerpt}</p>
            </Link>
          ))}
        </div>
        <div className="mt-6">
          <Link
            href="/services"
            className="text-sm font-semibold text-teal hover:text-teal-deep"
          >
            Voir tous les services →
          </Link>
        </div>
      </Section>

      {relatedArticles.length > 0 ? (
        <Section>
          <h2 className="text-2xl">Guides utiles</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {relatedArticles.map((a) => (
              <Link
                key={a.slug}
                href={`/conseils/${a.slug}`}
                className="tile-wow rounded-2xl px-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                <Badge variant="info">{a.category}</Badge>
                <p className="mt-2 font-semibold leading-snug">{a.title}</p>
              </Link>
            ))}
          </div>
        </Section>
      ) : null}

      <CtaBand title={`Besoin de « ${service.shortTitle} » ?`} />
    </>
  );
}
