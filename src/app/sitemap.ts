import { siteConfig } from "@/lib/site";
import { services } from "@/lib/data/services";
import { articles } from "@/lib/data/articles";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const staticRoutes = [
    "",
    "/services",
    "/configurateur",
    "/tarifs",
    "/a-propos",
    "/contact",
    "/faq",
    "/conseils",
    "/zone-intervention",
    "/mentions-legales",
    "/politique-confidentialite",
  ];

  return [
    ...staticRoutes.map((path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : path === "/configurateur" ? 0.9 : 0.7,
    })),
    ...services.map((s) => ({
      url: `${base}/services/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...articles.map((a) => ({
      url: `${base}/conseils/${a.slug}`,
      lastModified: new Date(a.date),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
  ];
}
