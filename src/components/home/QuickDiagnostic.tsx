"use client";

import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Section";
import { getService } from "@/lib/data/services";
import { cn } from "@/lib/utils";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type Symptom = {
  id: string;
  label: string;
  service: string;
  tip: string;
};

const symptoms: Symptom[] = [
  {
    id: "slow",
    label: "PC très lent / freeze",
    service: "virus-optimisation",
    tip: "Souvent lié au disque, à la RAM ou à des logiciels parasites.",
  },
  {
    id: "boot",
    label: "Ne démarre plus",
    service: "depannage-informatique",
    tip: "Diagnostic matériel prioritaire avant toute réinstallation.",
  },
  {
    id: "virus",
    label: "Virus / pubs / ransomware",
    service: "virus-optimisation",
    tip: "Nettoyage multi-moteurs + sécurisation navigateur.",
  },
  {
    id: "windows",
    label: "Windows corrompu",
    service: "reinstallation-windows",
    tip: "Réinstallation propre avec sauvegarde de vos données.",
  },
  {
    id: "data",
    label: "Fichiers / disque inaccessible",
    service: "recuperation-donnees",
    tip: "Ne réécrivez plus rien sur le disque — on évalue d’abord.",
  },
  {
    id: "build",
    label: "Je veux un PC sur mesure",
    service: "montage-pc",
    tip: "Passez par le configurateur, puis on valide et on monte.",
  },
];

export function QuickDiagnostic() {
  const [selected, setSelected] = useState<string[]>([]);

  const recommendation = useMemo(() => {
    if (selected.length === 0) return null;
    const picked = symptoms.filter((s) => selected.includes(s.id));
    const primary = picked[0];
    const service = getService(primary.service);
    const isBuild = selected.includes("build") && picked.length === 1;
    const summary = encodeURIComponent(
      `Diagnostic express : ${picked.map((p) => p.label).join(", ")}`,
    );
    const type = isBuild ? "config" : "urgence";
    const urgency = isBuild ? "normal" : "asap";
    return {
      primary,
      serviceTitle: service?.shortTitle ?? service?.title ?? primary.label,
      tips: picked.map((p) => p.tip),
      href: `/contact?service=${primary.service}&type=${type}&urgency=${urgency}&summary=${summary}`,
      serviceHref: `/services/${primary.service}`,
      ctaLabel: isBuild ? "Demander un devis" : "Besoin d’aide maintenant",
    };
  }, [selected]);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id].slice(0, 3),
    );
  }

  return (
    <Section>
      <SectionHeader
        eyebrow="Diagnostic express"
        title="Quel est le problème ?"
        description="Cochez jusqu’à 3 symptômes. On vous oriente vers le bon service — sans jargon."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="group" aria-label="Symptômes">
        {symptoms.map((s, i) => {
          const active = selected.includes(s.id);
          return (
            <Reveal key={s.id} delay={i * 40}>
              <button
                type="button"
                onClick={() => toggle(s.id)}
                aria-pressed={active}
                className={cn(
                  "flex w-full items-start gap-3 rounded-[18px] border p-4 text-left transition-all",
                  active
                    ? "border-teal bg-teal-soft/60 shadow-[var(--shadow-soft)]"
                    : "border-line bg-paper hover:border-line-strong",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border",
                    active ? "border-teal bg-teal text-white" : "border-line",
                  )}
                >
                  {active ? <Check className="h-3 w-3" /> : null}
                </span>
                <span className="font-semibold leading-snug">{s.label}</span>
              </button>
            </Reveal>
          );
        })}
      </div>

      {recommendation ? (
        <div
          className="mt-8 rounded-[22px] border border-teal/30 bg-teal-soft/40 p-5 md:p-6"
          role="status"
          aria-live="polite"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">
            Orientation conseillée
          </p>
          <h3 className="mt-2 text-xl">
            Commencer par :{" "}
            <Link
              href={recommendation.serviceHref}
              className="text-teal hover:text-teal-deep underline-offset-2 hover:underline"
            >
              {recommendation.serviceTitle}
            </Link>
          </h3>
          <ul className="mt-3 space-y-1.5">
            {recommendation.tips.map((tip) => (
              <li key={tip} className="text-sm text-ink-muted leading-relaxed">
                • {tip}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button href={recommendation.href}>
              {recommendation.ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href={recommendation.serviceHref} variant="secondary">
              Voir le service
            </Button>
            {selected.includes("build") ? (
              <Button href="/configurateur" variant="secondary">
                Configurateur PC
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </Section>
  );
}
