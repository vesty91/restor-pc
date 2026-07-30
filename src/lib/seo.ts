import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

/** URL publique canonique (sans slash final). */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return siteConfig.url;
}

/** Sérialisation JSON-LD sûre (évite l’injection via `</script>`). */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function absoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = getSiteUrl();
  return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
}

type PageMetadataInput = {
  title?: Metadata["title"];
  description: string;
  /** Chemin canonique relatif, ex. `/services` ou `/`. */
  path: string;
  robots?: Metadata["robots"];
  openGraphTitle?: string;
  openGraphType?: "website" | "article";
};

/**
 * Métadonnées page avec canonical + og:url alignés et og:image par défaut.
 * Évite les pages sans `og:url` / sans image quand openGraph est partiel.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  robots,
  openGraphTitle,
  openGraphType = "website",
}: PageMetadataInput): Metadata {
  const canonical = path.startsWith("/") ? path : `/${path}`;
  const ogTitle =
    openGraphTitle ??
    (typeof title === "string" ? `${title} | ${siteConfig.name}` : undefined);

  return {
    ...(title !== undefined ? { title } : {}),
    description,
    alternates: { canonical },
    ...(robots ? { robots } : {}),
    openGraph: {
      type: openGraphType,
      url: canonical,
      description,
      ...(ogTitle ? { title: ogTitle } : {}),
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      description,
      ...(ogTitle ? { title: ogTitle } : {}),
    },
  };
}
