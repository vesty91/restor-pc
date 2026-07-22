import { CtaBand } from "@/components/CtaBand";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CopyPageLink } from "@/components/CopyPageLink";
import { JsonLd } from "@/components/JsonLd";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { articles, getArticle } from "@/lib/data/articles";
import { getService } from "@/lib/data/services";
import { siteConfig } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  const url = `/conseils/${article.slug}`;
  return {
    title: article.title,
    description: article.seoDescription,
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description: article.seoDescription,
      url,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.seoDescription,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const others = articles.filter((a) => a.slug !== slug).slice(0, 2);
  const related = article.relatedServices
    .map((s) => getService(s))
    .filter(Boolean);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.seoDescription,
    datePublished: article.date,
    dateModified: article.date,
    author: {
      "@type": "Organization",
      name: siteConfig.name,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntityOfPage: `${siteConfig.url}/conseils/${article.slug}`,
  };

  return (
    <>
      <JsonLd data={articleSchema} />
      <Section className="noise-bg pt-20 md:pt-28">
        <Breadcrumbs
          items={[
            { label: "Conseils", href: "/conseils" },
            { label: article.title },
          ]}
        />
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">
          {article.category} · {article.readTime}
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl md:text-5xl leading-tight text-balance">
          {article.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-muted leading-relaxed">
          {article.excerpt}
        </p>
        <div className="mt-5">
          <CopyPageLink />
        </div>
      </Section>

      <Section className="pt-0">
        <article className="mx-auto max-w-2xl">
          {article.content.map((block, i) => (
            <div key={i} className={i > 0 ? "mt-8" : ""}>
              {block.heading ? (
                <h2 className="text-2xl leading-snug">{block.heading}</h2>
              ) : null}
              {block.paragraphs.map((p) => (
                <p
                  key={p.slice(0, 24)}
                  className="mt-3 text-[17px] leading-relaxed text-ink-soft"
                >
                  {p}
                </p>
              ))}
            </div>
          ))}

          {related.length > 0 ? (
            <div className="mt-10 rounded-[20px] border border-line bg-paper p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">
                Services liés
              </p>
              <ul className="mt-3 space-y-2">
                {related.map((s) =>
                  s ? (
                    <li key={s.slug}>
                      <Link
                        href={`/services/${s.slug}`}
                        className="font-semibold text-ink hover:text-teal"
                      >
                        {s.title}
                      </Link>
                      <p className="text-sm text-ink-muted">{s.excerpt}</p>
                    </li>
                  ) : null
                )}
              </ul>
              {article.relatedConfigurator ? (
                <Button href="/configurateur" className="mt-4" variant="secondary">
                  Ouvrir le configurateur PC
                </Button>
              ) : null}
            </div>
          ) : null}

          <div className="mt-6 rounded-[20px] border border-line bg-surface p-5">
            <p className="font-semibold">Besoin d’un diagnostic à Yerres ?</p>
            <p className="mt-1 text-sm text-ink-muted">
              Atelier {siteConfig.addressShort}. On vous oriente vers la bonne
              intervention — domicile ou atelier Yerres.
            </p>
            <Button
              href={
                related[0]
                  ? `/contact?service=${related[0].slug}&type=devis`
                  : "/contact"
              }
              className="mt-4"
            >
              Demander un devis
            </Button>
          </div>
        </article>

        {others.length > 0 ? (
          <div className="mx-auto mt-14 max-w-2xl border-t border-line pt-10">
            <h2 className="text-xl">À lire aussi</h2>
            <ul className="mt-4 space-y-3">
              {others.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/conseils/${a.slug}`}
                    className="font-semibold text-teal hover:text-teal-deep"
                  >
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Section>
      <CtaBand />
    </>
  );
}
