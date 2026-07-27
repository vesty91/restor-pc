import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ConfiguratorApp } from "@/components/configurator/ConfiguratorApp";
import { Section } from "@/components/ui/Section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configurateur PC — Yerres",
  description:
    "Configurateur PC Restor-PC : estimation indicative selon usage et budget. Devis atelier à confirmer à Yerres.",
  alternates: { canonical: "/configurateur" },
};

export default function ConfigurateurPage() {
  return (
    <div className="soft-grid-bg">
      <Section className="pt-20 md:pt-28 pb-8">
        <Breadcrumbs items={[{ label: "Configurateur PC" }]} />
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">
          Configurateur PC
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl md:text-5xl leading-tight text-balance">
          Construisez une config intelligente, pas juste une liste de pièces
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-muted leading-relaxed">
          Usage, budget, préférences : estimation indicative pour démarrer.
          Compatibilité et prix pièces sont validés en atelier avant devis
          définitif.
        </p>
        <p className="mt-4 max-w-2xl rounded-[16px] border border-line bg-paper px-4 py-3 text-sm text-ink-muted leading-relaxed">
          Les configurations proposées sont des bases de travail. Stock,
          compatibilité fine et total final sont confirmés avant commande.
        </p>
      </Section>
      <Section className="pt-0 pb-20">
        <ConfiguratorApp />
      </Section>
    </div>
  );
}
