import { serializeJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export function JsonLd({
  data,
}: {
  data?: Record<string, unknown> | Record<string, unknown>[];
}) {
  const areaCities = siteConfig.nearbyCities.filter(
    (name) => name !== siteConfig.city
  );

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ComputerStore"],
    "@id": `${siteConfig.url}/#business`,
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    image: `${siteConfig.url}/opengraph-image`,
    logo: `${siteConfig.url}/brand/restor-pc-logo.png`,
    areaServed: [
      { "@type": "City", name: siteConfig.city },
      { "@type": "AdministrativeArea", name: siteConfig.department },
      { "@type": "AdministrativeArea", name: siteConfig.region },
      ...areaCities.map((name) => ({
        "@type": "City",
        name,
      })),
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "09:00",
        closes: "19:00",
      },
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: siteConfig.phoneHref.replace("tel:", ""),
        contactType: "customer service",
        areaServed: "FR",
        availableLanguage: ["French"],
      },
    ],
    priceRange: "€€",
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.street,
      postalCode: siteConfig.postalCode,
      addressLocality: siteConfig.city,
      addressRegion: siteConfig.region,
      addressCountry: siteConfig.countryCode,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.geo.lat,
      longitude: siteConfig.geo.lng,
    },
    hasMap: siteConfig.mapsUrl,
  };

  const sameAs = [
    siteConfig.googleBusinessUrl,
    siteConfig.social.facebook,
    siteConfig.social.instagram,
    siteConfig.social.linkedin,
  ].filter((v): v is string => Boolean(v));

  if (sameAs.length > 0) {
    Object.assign(localBusiness, { sameAs });
  }

  // Pas d'aggregateRating / review dans le JSON-LD tant que note et avis
  // ne sont pas vérifiés, affichés de façon maintenue et issus d'avis réels.

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: "fr-FR",
    publisher: { "@id": `${siteConfig.url}/#business` },
  };

  const payload = data ?? [website, localBusiness];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(payload) }}
    />
  );
}
