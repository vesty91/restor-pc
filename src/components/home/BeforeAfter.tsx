import { Reveal } from "@/components/Reveal";
import { Section, SectionHeader } from "@/components/ui/Section";
import { ArrowRight } from "lucide-react";

const cases = [
  {
    title: "PC bureautique devenu inutilisable",
    place: "Yerres · mars 2026",
    before: "Démarrage 4 min, freeze constants, navigateur saturé d’adware.",
    after: "Windows propre, démarrage < 25 s, antivirus sain, sauvegarde auto.",
    metric: "−88 % temps de boot",
  },
  {
    title: "Station gaming en surchauffe",
    place: "Brunoy · février 2026",
    before: "Thermal throttle à 95 °C, FPS instables, poussière critique.",
    after: "Nettoyage + pâte, courbes ventilateurs, 68 °C en charge, FPS stables.",
    metric: "−27 °C en jeu",
  },
  {
    title: "Disque “mort” avec photos famille",
    place: "Montgeron · janvier 2026",
    before: "HDD inaccessible, partition perdue, panique totale.",
    after: "Récupération de 94 % des fichiers, copie sur SSD neuf + backup cloud.",
    metric: "94 % récupérés",
  },
];

export function BeforeAfter() {
  return (
    <Section className="bg-paper border-y border-line">
      <SectionHeader
        eyebrow="Résultats"
        title="Avant / après : ce que change une vraie intervention"
        description="Exemples d’interventions locales — sans promesse magique, avec le niveau d’exigence Restor-PC."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        {cases.map((item, i) => (
          <Reveal key={item.title} delay={i * 70}>
            <article className="flex h-full flex-col rounded-[22px] border border-line bg-surface p-5 md:p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-teal">
                  Cas {String(i + 1).padStart(2, "0")}
                </p>
                <p className="text-[11px] text-ink-muted">{item.place}</p>
              </div>
              <h3 className="mt-3 text-lg leading-snug">{item.title}</h3>
              <div className="mt-5 space-y-3 flex-1">
                <div className="rounded-xl border border-line bg-paper px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                    Avant
                  </p>
                  <p className="mt-1 text-sm text-ink-soft leading-relaxed">{item.before}</p>
                </div>
                <div className="flex justify-center text-teal" aria-hidden>
                  <ArrowRight className="h-4 w-4 rotate-90" />
                </div>
                <div className="rounded-xl border border-teal/25 bg-teal-soft/40 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-teal">
                    Après
                  </p>
                  <p className="mt-1 text-sm text-ink-soft leading-relaxed">{item.after}</p>
                </div>
              </div>
              <p className="mt-5 font-display text-xl tracking-tight text-ink">
                {item.metric}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
