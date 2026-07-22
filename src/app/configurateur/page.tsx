import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ConfiguratorApp } from "@/components/configurator/ConfiguratorApp";
import { Section } from "@/components/ui/Section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configurateur PC sur mesure — Yerres",
  description:
    "Configurez votre PC gaming, création ou pro selon usage et budget. Estimation de prix, score d’équilibre et montage atelier Restor-PC à Yerres.",
  alternates: { canonical: "/configurateur" },
};

export default function ConfigurateurPage() {
  return (
    <>
      <Section className="noise-bg pt-20 md:pt-28 pb-8">
        <Breadcrumbs items={[{ label: "Configurateur PC" }]} />
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">
          Configurateur PC
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl md:text-5xl leading-tight text-balance">
          Construisez une config intelligente, pas juste une liste de pièces
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-muted leading-relaxed">
          Usage, budget, préférences : notre moteur compose une machine
          compatible et équilibrée. Ajustez, comparez, puis demandez un devis
          prêt à monter à Yerres.
        </p>
      </Section>
      <Section className="pt-0 pb-20">
        <ConfiguratorApp />
      </Section>
    </>
  );
}
