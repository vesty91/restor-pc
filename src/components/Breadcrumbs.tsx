import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/seo";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all = [{ label: "Accueil", href: "/" }, ...items];

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: absoluteUrl(item.href) } : {}),
    })),
  };

  return (
    <>
      <JsonLd data={schema} />
      <nav aria-label="Fil d’Ariane" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-muted">
          {all.map((item, i) => {
            const last = i === all.length - 1;
            return (
              <li key={`${item.label}-${i}`} className="inline-flex items-center gap-1.5">
                {i > 0 ? <ChevronRight className="h-3.5 w-3.5 opacity-50" aria-hidden /> : null}
                {last || !item.href ? (
                  <span
                    className={last ? "font-medium text-ink" : undefined}
                    aria-current={last ? "page" : undefined}
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link href={item.href} className="hover:text-teal transition-colors">
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
