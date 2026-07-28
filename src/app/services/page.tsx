import { CtaBand } from "@/components/CtaBand";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ServicesExplorer } from "@/components/services/ServicesExplorer";
import { TechMarquee } from "@/components/restor-pc/tech-marquee";
import { Badge } from "@/components/ui/badge";
import { Section, SectionHeader } from "@/components/ui/Section";
import { siteConfig } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services de dépannage informatique — Yerres",
  description:
    "Prestations Restor-PC à Yerres (91) : dépannage, réparation, virus, réinstallation, récupération de données, montage PC et assistance.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <div className="soft-grid-bg">
      <Section className="pb-8 pt-20 md:pt-28">
        <Breadcrumbs items={[{ label: "Services" }]} />
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge variant="info">Atelier · {siteConfig.city}</Badge>
          <Badge variant="outline">Domicile · Essonne</Badge>
          <Badge variant="success">Devis avant intervention</Badge>
        </div>
        <SectionHeader
          eyebrow="Services"
          title="Des interventions claires pour chaque situation"
          description="Filtrez, cherchez, ou décrivez simplement votre problème — on vous oriente vers la bonne solution."
        />
      </Section>

      <Section className="pt-0">
        <ServicesExplorer />
      </Section>

      <TechMarquee />

      <CtaBand title="Vous ne savez pas quel service choisir ?" />
    </div>
  );
}
