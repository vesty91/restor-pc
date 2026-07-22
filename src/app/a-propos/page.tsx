import { CtaBand } from "@/components/CtaBand";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section, SectionHeader } from "@/components/ui/Section";
import { commitments } from "@/lib/data/testimonials";
import { processSteps } from "@/lib/data/faq";
import { siteConfig } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos — Atelier Yerres",
  description:
    "Restor-PC, atelier de dépannage informatique à Yerres (91). Méthode, transparence et exigence technique au 3 rue Auber.",
  alternates: { canonical: "/a-propos" },
};

export default function AboutPage() {
  return (
    <>
      <Section className="noise-bg pt-20 md:pt-28">
        <Breadcrumbs items={[{ label: "À propos" }]} />
        <SectionHeader
          eyebrow="À propos"
          title="Un atelier à Yerres qui traite votre PC comme un outil de travail, pas comme un ticket anonyme"
          description={`Basé au ${siteConfig.address}, Restor-PC applique la rigueur d’un atelier de précision : diagnostic méthodique, explications claires, finitions soignées.`}
        />
        <div className="mb-8 rounded-[20px] border border-line bg-paper px-5 py-4 text-sm text-ink-muted">
          <span className="font-semibold text-ink">Adresse atelier :</span>{" "}
          {siteConfig.address} · {siteConfig.transport}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[24px] border border-line bg-paper p-6 md:p-8">
            <h2 className="text-xl">Notre promesse</h2>
            <p className="mt-3 text-ink-muted leading-relaxed">
              Vous comprendrez toujours ce qui ne va pas, ce que nous proposons,
              et pourquoi. Pas de pièces inutiles. Pas de pression commerciale.
              Juste la solution la plus juste pour votre usage et votre budget.
            </p>
          </div>
          <div className="rounded-[24px] border border-line bg-paper p-6 md:p-8">
            <h2 className="text-xl">Pourquoi Yerres ?</h2>
            <p className="mt-3 text-ink-muted leading-relaxed">
              Un atelier de proximité, accessible en RER D et en voiture, pour
              intervenir vite sur Yerres et les communes voisines — sans passer
              par une plateforme anonyme. Vous parlez à la personne qui mettra
              les mains dans la machine.
            </p>
          </div>
        </div>
        <div className="mt-6 rounded-[24px] border border-line bg-paper p-6 md:p-8">
          <h2 className="text-xl">Pour qui ?</h2>
          <p className="mt-3 text-ink-muted leading-relaxed max-w-3xl">
            Particuliers, indépendants, créatifs, gamers et petites structures
            qui veulent un interlocuteur unique — capable de dépanner demain
            et de monter une config sérieuse la semaine suivante.
          </p>
        </div>
      </Section>

      <Section>
        <h2 className="text-2xl md:text-3xl">Notre méthode</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((s) => (
            <div key={s.step} className="rounded-[20px] border border-line bg-paper p-5">
              <p className="font-mono text-xs text-teal">{s.step}</p>
              <h3 className="mt-2 text-lg">{s.title}</h3>
              <p className="mt-2 text-sm text-ink-muted">{s.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-paper border-y border-line">
        <h2 className="text-2xl md:text-3xl">Ce à quoi nous nous engageons</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {commitments.map((c) => (
            <div key={c.title} className="rounded-[20px] border border-line p-5">
              <h3 className="text-lg">{c.title}</h3>
              <p className="mt-2 text-sm text-ink-muted leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <CtaBand title="Envie de travailler avec un vrai atelier ?" />
    </>
  );
}
