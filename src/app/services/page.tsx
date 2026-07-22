import { CtaBand } from "@/components/CtaBand";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ServicesExplorer } from "@/components/services/ServicesExplorer";
import { Section, SectionHeader } from "@/components/ui/Section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services de dépannage informatique — Yerres",
  description:
    "Prestations Restor-PC à Yerres (91) : dépannage, réparation, virus, réinstallation, récupération de données, montage PC et assistance.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <Section className="noise-bg pt-20 md:pt-28 pb-8">
        <Breadcrumbs items={[{ label: "Services" }]} />
        <SectionHeader
          eyebrow="Services"
          title="Des interventions claires pour chaque situation"
          description="Filtrez, cherchez, ou décrivez simplement votre problème — on vous oriente vers la bonne solution."
        />
      </Section>

      <Section className="pt-0">
        <ServicesExplorer />
      </Section>
      <CtaBand title="Vous ne savez pas quel service choisir ?" />
    </>
  );
}
