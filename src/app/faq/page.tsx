import { CtaBand } from "@/components/CtaBand";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSearch } from "@/components/FaqSearch";
import { JsonLd } from "@/components/JsonLd";
import { Section, SectionHeader } from "@/components/ui/Section";
import { faqs } from "@/lib/data/faq";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "FAQ — Dépannage informatique Yerres",
  description: "FAQ Restor-PC Yerres : délais d’intervention, devis, garantie 90 jours, dépôt en atelier, domicile et montage PC sur mesure.",
  path: "/faq",
});

export default function FaqPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <JsonLd data={faqSchema} />
      <Section className="noise-bg pt-20 md:pt-28 pb-8">
        <Breadcrumbs items={[{ label: "FAQ", href: "/faq" }]} />
        <SectionHeader
          as="h1"
          eyebrow="FAQ"
          title="Questions fréquentes sur le dépannage à Yerres"
          description="Recherchez un mot-clé, ou contactez l’atelier Yerres directement."
        />
      </Section>
      <Section className="pt-0">
        <FaqSearch />
      </Section>
      <CtaBand />
    </>
  );
}
