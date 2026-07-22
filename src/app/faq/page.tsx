import { CtaBand } from "@/components/CtaBand";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSearch } from "@/components/FaqSearch";
import { JsonLd } from "@/components/JsonLd";
import { Section, SectionHeader } from "@/components/ui/Section";
import { faqs } from "@/lib/data/faq";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — Dépannage informatique Yerres",
  description:
    "Questions fréquentes Restor-PC Yerres : délais, devis, garantie, atelier, domicile, montage PC.",
  alternates: { canonical: "/faq" },
};

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
        <Breadcrumbs items={[{ label: "FAQ" }]} />
        <SectionHeader
          eyebrow="FAQ"
          title="Les réponses aux questions qu’on nous pose le plus"
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
