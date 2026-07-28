import dynamic from "next/dynamic";
import { Reveal } from "@/components/Reveal";
import { Section, SectionHeader } from "@/components/ui/Section";
import { ArrowRight } from "lucide-react";

const Compare = dynamic(
  () => import("@/components/aceternity/compare").then((m) => m.Compare),
  {
    loading: () => (
      <div
        className="h-48 w-full animate-pulse rounded-2xl border border-line bg-surface"
        aria-hidden
      />
    ),
  }
);

const cases = [
  {
    title: "PC bureautique devenu inutilisable",
    place: "Exemple type · atelier",
    before: "Démarrage très long, freeze fréquents, navigateur saturé d’extensions douteuses.",
    after: "Système nettoyé, démarrage rapide, antivirus sain, sauvegarde mise en place.",
    metric: "Fluidité retrouvée",
    kind: "optimisation" as const,
  },
  {
    title: "Station en surchauffe",
    place: "Exemple type · thermique",
    before: "Températures élevées, ralentissements, poussière et pâte thermique fatiguée.",
    after: "Nettoyage intérieur, pâte neuve, courbes ventilateurs, températures stabilisées.",
    metric: "Thermique maîtrisé",
    kind: "thermique" as const,
  },
  {
    title: "Câblage intérieur confus",
    place: "Exemple type · montage",
    before: "Câbles en vrac, flux d’air gêné, maintenance difficile.",
    after: "Cable management soigné, circulation d’air améliorée, accès plus simple.",
    metric: "Montage propre",
    kind: "cable" as const,
  },
];

/** Visuel neutre (pas une photo d’intervention réelle). */
function ExampleCompareVisual({ kind }: { kind: (typeof cases)[number]["kind"] }) {
  const beforeTone =
    kind === "thermique"
      ? "from-[#3a1a1a] to-[#1a1010]"
      : kind === "cable"
        ? "from-[#1a2230] to-[#0f1520]"
        : "from-[#243044] to-[#141e2e]";
  const afterTone =
    kind === "thermique"
      ? "from-[#0a2748] to-[#122036]"
      : kind === "cable"
        ? "from-[#0f2a40] to-[#16324c]"
        : "from-[#0a2748] to-[#163a58]";

  return (
    <div
      className="relative mb-5 h-28 overflow-hidden rounded-xl border border-line"
      aria-hidden
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${beforeTone}`} />
      <div className={`absolute inset-y-0 right-0 w-1/2 bg-gradient-to-br ${afterTone}`} />
      <div className="absolute inset-y-0 left-1/2 w-px bg-teal/70" />
      <span className="absolute left-3 top-3 rounded-md bg-black/35 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white/80">
        Avant
      </span>
      <span className="absolute right-3 top-3 rounded-md bg-teal/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[#4ba3ff]">
        Après
      </span>
    </div>
  );
}

export function BeforeAfter() {
  return (
    <Section className="bg-paper border-y border-line">
      <SectionHeader
        eyebrow="Résultats"
        title="Avant / après : ce que change une vraie intervention"
        description="Illustrations pédagogiques du type d’améliorations visées — pas des photos d’interventions clients."
      />
      <p className="mb-6 rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-muted">
        {/* TODO: remplacer les SVG neutres par des photos réelles d’atelier (nettoyage, cable management, restauration) avec autorisation client. */}
        Exemples illustratifs Restor-PC. Aucune photo d’intervention réelle n’est affichée ici pour
        le moment.
      </p>

      <Reveal>
        <div className="mb-8 overflow-hidden rounded-[22px] border border-line bg-surface p-4 md:p-6">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-teal">
            Démo interactive · exemple illustratif
          </p>
          <Compare
            firstImage="/images/examples/before-clean.svg"
            secondImage="/images/examples/after-clean.svg"
            firstAlt="Exemple illustratif avant nettoyage (visuel neutre)"
            secondAlt="Exemple illustratif après nettoyage (visuel neutre)"
            className="h-52 w-full md:h-72"
            slideMode="drag"
            showSparkles={false}
            autoplay={false}
          />
          <p className="mt-3 text-xs text-ink-muted">
            Glissez le curseur (souris, tactile ou flèches clavier). Visuels SVG locaux — pas une
            intervention réelle.
          </p>
        </div>
      </Reveal>

      <div className="grid gap-4 lg:grid-cols-3">
        {cases.map((item, i) => (
          <Reveal key={item.title} delay={i * 70}>
            <article className="card-lift flex h-full flex-col rounded-[22px] border border-line bg-surface p-5 md:p-6">
              <ExampleCompareVisual kind={item.kind} />
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-teal">
                  Exemple {String(i + 1).padStart(2, "0")}
                </p>
                <p className="text-[11px] text-ink-muted">{item.place}</p>
              </div>
              <h3 className="mt-3 text-lg leading-snug">{item.title}</h3>
              <div className="mt-5 flex-1 space-y-3">
                <div className="rounded-xl border border-line bg-paper px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                    Avant
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">{item.before}</p>
                </div>
                <div className="flex justify-center text-teal" aria-hidden>
                  <ArrowRight className="h-4 w-4 rotate-90" />
                </div>
                <div className="rounded-xl border border-teal/25 bg-teal-soft/40 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-teal">
                    Après
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">{item.after}</p>
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
