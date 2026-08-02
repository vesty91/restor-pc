import { CtaBand } from "@/components/CtaBand";
import { AddressMap } from "@/components/AddressMap";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Section";
import { siteConfig } from "@/lib/site";
import { Home, MapPin, Train, Warehouse } from "lucide-react";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import Link from "next/link";

export const metadata: Metadata = buildPageMetadata({
  title: "Zone d’intervention — Yerres et Essonne",
  description:
    "Restor-PC intervient à Yerres (atelier 3 rue Auber) et communes voisines : Brunoy, Crosne, Montgeron, Draveil, Vigneux-sur-Seine.",
  path: "/zone-intervention",
  openGraphTitle: "Zone d’intervention — Yerres et Essonne | Restor-PC",
});

const modes = [
  {
    icon: Home,
    title: "À domicile",
    text: "Je me déplace : Yerres et communes voisines en priorité (environ 15 km), puis Essonne / proche Île-de-France selon planning.",
  },
  {
    icon: Warehouse,
    title: "En atelier",
    text: `Vous venez déposer / récupérer la machine : ${siteConfig.addressShort}. Idéal hardware, récupération de données et montage PC.`,
  },
];

const communeDetails: { name: string; text: string }[] = [
  {
    name: "Yerres",
    text: "Zone principale. Atelier sur place pour dépôt machine, dépannage domicile rapide, montage PC et rendez-vous sans long trajet.",
  },
  {
    name: "Brunoy",
    text: "Intervention domicile fréquente : optimisation, virus, réinstallation Windows et dépannages sur place.",
  },
  {
    name: "Crosne",
    text: "Dépannage à domicile ou dépôt atelier Yerres selon la panne. Réponse rapide en journée.",
  },
  {
    name: "Montgeron",
    text: "Atelier à quelques minutes. Adapté à la récupération de données, au hardware et aux configs gaming.",
  },
  {
    name: "Draveil",
    text: "Assistance particulière et TPE : sauvegarde, sécurité, maintenance et dépannage sur rendez-vous.",
  },
  {
    name: "Vigneux-sur-Seine",
    text: "Intervention planifiée à domicile, ou dépôt / retrait à l’atelier Yerres selon le diagnostic.",
  },
  {
    name: "Épinay-sous-Sénart",
    text: "Dépannage PC et portables sur rendez-vous, avec possibilité de dépôt atelier pour les réparations plus longues.",
  },
  {
    name: "Boussy-Saint-Antoine",
    text: "Assistance à domicile pour virus, lenteurs et réinstallation, ou atelier Yerres pour le matériel.",
  },
  {
    name: "Quincy-sous-Sénart",
    text: "Prise en charge domicile pour les pannes courantes ; atelier pour SSD, récupération et montage.",
  },
  {
    name: "Villeneuve-Saint-Georges",
    text: "Intervention planifiée à domicile, ou dépôt / retrait à l’atelier Yerres selon le diagnostic.",
  },
  {
    name: "Mandres-les-Roses",
    text: "Déplacement sur rendez-vous dans le rayon d’intervention ; dépôt atelier recommandé pour le hardware.",
  },
  {
    name: "Marolles-en-Brie",
    text: "Assistance informatique à domicile selon créneaux, avec alternative dépôt atelier à Yerres.",
  },
];

export default function ZonePage() {
  return (
    <>
      <Section className="noise-bg pt-20 md:pt-28">
        <Breadcrumbs items={[{ label: "Zone d’intervention", href: "/zone-intervention" }]} />
        <SectionHeader
          as="h1"
          eyebrow="Zone d’intervention"
          title="Dépannage informatique à Yerres et alentours"
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
          <h2 className="text-2xl md:text-3xl">Communes desservies</h2>
          <p className="mt-3 max-w-2xl text-ink-muted leading-relaxed">
            Yerres est la zone principale. Les communes ci-dessous sont couvertes pour l’assistance
            à domicile ou le dépôt en atelier. Votre commune n’apparaît pas ? Contactez-nous pour
            confirmer disponibilité, délai et mode d’intervention.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {communeDetails.map((c) => (
              <article key={c.name} className="rounded-[20px] border border-line bg-paper p-5">
                <h3 className="text-lg">{c.name}</h3>
                <p className="mt-2 text-sm text-ink-muted leading-relaxed">{c.text}</p>
                <Link
                  href={`/contact?mode=domicile&type=devis&city=${encodeURIComponent(c.name)}`}
                  className="mt-4 inline-block text-sm font-semibold text-teal hover:text-teal-deep"
                >
                  Demander une intervention à {c.name}
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
          <Button href="/services/depannage-informatique" variant="secondary" size="lg">
            Voir le dépannage informatique
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
