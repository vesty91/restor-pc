"use client";

import { BorderBeam } from "@/components/magicui/border-beam";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Check } from "lucide-react";

export function MaintenanceSpotlight() {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-line bg-panel p-6 text-panel-fg md:p-10">
      <BorderBeam size={110} duration={9} borderWidth={1.5} />
      <div
        className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-teal/25 blur-3xl"
        aria-hidden
      />
      <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="info"
              className="border-transparent bg-[#4ba3ff]/20 text-[#9ec9f5]"
            >
              Abonnement
            </Badge>
            <Badge
              variant="outline"
              className="border-white/20 bg-white/5 text-white/80"
            >
              Indépendants & TPE
            </Badge>
          </div>
          <h2 className="mt-4 text-balance text-3xl leading-tight text-white md:text-4xl">
            Contrat maintenance — sérénité mensuelle
          </h2>
          <p className="mt-4 max-w-lg leading-relaxed text-white/65">
            Check-up trimestriel, assistance prioritaire, mises à jour critiques
            et suivi santé disque. Idéal si une panne n’est pas une option.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-white/80">
            {[
              "1 check-up atelier / trimestre inclus",
              "File prioritaire sous 1 h en journée",
              "Rapport santé machine + alertes",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[22px] border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <Badge variant="muted" className="mb-2 bg-white/10 text-white/70">
            À partir de
          </Badge>
          <p className="font-display text-5xl tracking-tight">
            29 €
            <span className="text-lg text-white/45"> / mois</span>
          </p>
          <p className="mt-2 text-sm text-white/55">
            Engagement 3 mois · résiliable ensuite
          </p>
          <Button href="/contact?type=maintenance" className="mt-6 w-full" size="lg">
            Demander une offre
          </Button>
        </div>
      </div>
    </div>
  );
}
