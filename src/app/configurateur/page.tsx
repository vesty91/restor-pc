import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ConfiguratorApp } from "@/components/configurator/ConfiguratorApp";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/Section";
import { siteConfig } from "@/lib/site";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Configurateur PC — Yerres",
  description:
    "Configurateur PC Restor-PC : estimation indicative selon usage et budget. Devis atelier à confirmer à Yerres.",
  path: "/configurateur",
});

export default function ConfigurateurPage() {
  return (
    <div className="soft-grid-bg">
      <Section className="pb-8 pt-20 md:pt-28">
        <Breadcrumbs items={[{ label: "Configurateur PC" }]} />
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge variant="info">Configurateur</Badge>
          <Badge variant="outline">Estimation indicative</Badge>
          <Badge variant="success">Atelier · {siteConfig.city}</Badge>
        </div>
        <h1 className="mt-1 max-w-3xl text-balance text-3xl leading-tight md:text-5xl">
          Construisez une config intelligente, pas juste une liste de pièces
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-muted">
          Usage, budget, préférences : une base claire pour démarrer.
          Compatibilité et prix pièces sont validés en atelier avant devis
          définitif.
        </p>
        <p className="mt-4 max-w-2xl rounded-2xl border border-line bg-paper px-4 py-3 text-sm leading-relaxed text-ink-muted">
          <Badge variant="warning" className="mb-2 mr-2">
            Bêta
          </Badge>
          Les configurations proposées sont des bases de travail. Stock,
          compatibilité fine et total final sont confirmés avant commande.
        </p>
      </Section>
      <Section className="pb-20 pt-0">
        <ConfiguratorApp />
      </Section>
    </div>
  );
}
