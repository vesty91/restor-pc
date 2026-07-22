import { CtaBand } from "@/components/CtaBand";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { ServiceIcon } from "@/components/ServiceIcon";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { getService, services } from "@/lib/data/services";
import { articles } from "@/lib/data/articles";
import { siteConfig } from "@/lib/site";
import { formatPrice } from "@/lib/utils";
import { Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return {
    title: service.seoTitle,
    description: service.seoDescription,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: {
      title: service.seoTitle,
      description: service.seoDescription,
      url: `/services/${service.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: service.seoTitle,
      description: service.seoDescription,
    },
  };
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
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">
              Service · {siteConfig.city}
            </p>
            <div className="mt-4 flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-teal-soft text-teal">
                <ServiceIcon name={service.icon} className="h-6 w-6" />
              </span>
              <h1 className="text-3xl md:text-5xl leading-tight">{service.title}</h1>
            </div>
            <p className="mt-5 max-w-2xl text-lg text-ink-muted leading-relaxed">
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
            <p className="mt-4 text-sm text-ink-muted">{siteConfig.guarantee}</p>
          </div>
          <aside className="rounded-[24px] border border-line bg-paper p-6 shadow-[var(--shadow-soft)]">
            <p className="text-sm text-ink-muted">À partir de</p>
            <p className="font-display text-4xl tracking-tight">
              {formatPrice(service.priceFrom)}
            </p>
            <p className="mt-2 text-sm text-ink-muted">Durée indicative : {service.duration}</p>
            <ul className="mt-6 space-y-3">
              {service.features.map((f) => (
                <li key={f} className="flex gap-2.5 text-sm leading-snug">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </Section>

      <Section>
        <h2 className="text-2xl md:text-3xl">Comment ça se passe</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {service.process.map((step, i) => (
            <div key={step.title} className="rounded-[20px] border border-line bg-paper p-5">
              <p className="font-mono text-xs text-teal">0{i + 1}</p>
              <h3 className="mt-2 text-lg">{step.title}</h3>
              <p className="mt-2 text-sm text-ink-muted leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {service.faqs.length > 0 ? (
        <Section className="pt-0">
          <h2 className="text-2xl md:text-3xl">Questions fréquentes</h2>
          <div className="mt-8 divide-y divide-line rounded-[22px] border border-line bg-paper">
            {service.faqs.map((item) => (
              <details key={item.q} className="group px-5 py-4">
                <summary className="cursor-pointer list-none font-semibold pr-6 relative">
                  {item.q}
                  <span className="absolute right-0 top-0 text-teal group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-ink-muted leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </Section>
      ) : null}

      <Section className="bg-paper border-y border-line">
        <h2 className="text-2xl">Autres services</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {others.map((s) => (
            <Link
              key={s.slug}
              href={`/services/${s.slug}`}
              className="rounded-2xl border border-line px-4 py-4 hover:border-teal/40"
            >
              <p className="font-semibold">{s.shortTitle}</p>
              <p className="mt-1 text-sm text-ink-muted">{s.excerpt}</p>
            </Link>
          ))}
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
                className="rounded-2xl border border-line bg-paper px-4 py-4 hover:border-teal/40"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">
                  {a.category}
                </p>
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
