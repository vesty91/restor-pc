import { CtaBand } from "@/components/CtaBand";
import { AddressMap } from "@/components/AddressMap";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Section";
import { siteConfig } from "@/lib/site";
import { Home, MapPin, Train, Warehouse } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Zone d’intervention — Yerres & Essonne",
  description:
    "Atelier Restor-PC à Yerres (3 rue Auber). Dépôt machine ou intervention à domicile en Essonne & Île-de-France.",
  alternates: { canonical: "/zone-intervention" },
};

const modes = [
  {
    icon: Home,
    title: "À domicile",
    text: "Je me déplace : Yerres et communes voisines en priorité, puis Essonne / proche Île-de-France selon planning.",
  },
  {
    icon: Warehouse,
    title: "En atelier",
    text: `Vous venez déposer / récupérer la machine : ${siteConfig.addressShort}. Idéal hardware, récupération et montage.`,
  },
];

const communeDetails: { name: string; text: string }[] = [
  {
    name: "Yerres",
    text: "Atelier sur place. Dépannage domicile rapide, dépôt machine, montage PC et rendez-vous atelier sans long trajet.",
  },
  {
    name: "Brunoy",
    text: "Intervention domicile fréquente : optimisation, virus, réinstallation et petits dépannages sur place.",
  },
  {
    name: "Montgeron",
    text: "Atelier à quelques minutes. Idéal pour récupération de données, hardware et configs gaming.",
  },
  {
    name: "Crosne",
    text: "Dépannage à domicile ou dépôt atelier Yerres selon la panne. Réponse rapide en journée.",
  },
  {
    name: "Draveil",
    text: "Assistance particulière et TPE : sauvegarde, sécurité, maintenance et dépannage sur rendez-vous.",
  },
  {
    name: "Villeneuve-Saint-Georges",
    text: "Intervention planifiée à domicile, ou dépôt / retrait à l’atelier Yerres selon le diagnostic.",
  },
];

export default function ZonePage() {
  return (
    <>
      <Section className="noise-bg pt-20 md:pt-28">
        <Breadcrumbs items={[{ label: "Zone d’intervention" }]} />
        <SectionHeader
          eyebrow="Zone d’intervention"
          title={siteConfig.zone}
          description={siteConfig.zoneDetail}
        />

        <div className="mb-10 flex flex-wrap items-center gap-3 rounded-[18px] border border-line bg-paper px-4 py-3 text-sm">
          <MapPin className="h-4 w-4 text-teal shrink-0" />
          <span className="font-semibold">{siteConfig.address}</span>
          <span className="text-ink-muted hidden sm:inline">·</span>
          <span className="inline-flex items-center gap-1.5 text-ink-muted">
            <Train className="h-3.5 w-3.5" />
            {siteConfig.transport}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {modes.map((m) => (
            <div key={m.title} className="rounded-[22px] border border-line bg-paper p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-soft text-teal">
                <m.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-xl">{m.title}</h2>
              <p className="mt-2 text-sm text-ink-muted leading-relaxed">{m.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-14">
          <h2 className="text-2xl md:text-3xl">Communes prioritaires</h2>
          <p className="mt-3 max-w-2xl text-ink-muted leading-relaxed">
            Voici comment on intervient le plus souvent autour de l’atelier.
            Votre commune n’est pas listée ? Contactez-nous : on confirme
            disponibilité, délai et mode (domicile ou atelier).
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {communeDetails.map((c) => (
              <article
                key={c.name}
                className="rounded-[20px] border border-line bg-paper p-5"
              >
                <h3 className="text-lg">{c.name}</h3>
                <p className="mt-2 text-sm text-ink-muted leading-relaxed">{c.text}</p>
                <Link
                  href={`/contact?mode=domicile&type=devis&city=${encodeURIComponent(c.name)}`}
                  className="mt-4 inline-block text-sm font-semibold text-teal hover:text-teal-deep"
                >
                  Demander une intervention →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <AddressMap />
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/contact" size="lg">
            Prendre rendez-vous
          </Button>
          <Button href={siteConfig.phoneHref} variant="secondary" size="lg">
            Appeler {siteConfig.phone}
          </Button>
        </div>
      </Section>

      <CtaBand
        title="Besoin d’une intervention ?"
        text="Dépôt atelier ou déplacement à domicile — on trouve le créneau adapté."
      />
    </>
  );
}
