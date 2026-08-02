"use client";

import { SparklesCore } from "@/components/aceternity/sparkles";
import { Badge } from "@/components/ui/badge";
import { DOMICILE_MIN, URGENCY_RATES } from "@/lib/data/pricing";
import { siteConfig } from "@/lib/site";
import { formatPrice } from "@/lib/utils";
import { useReducedMotion } from "motion/react";

export function PricingHero() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-panel px-6 py-10 text-panel-fg md:px-10 md:py-14">
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,#05080f_0%,#0a2748_48%,#003a7a_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-teal/30 blur-3xl motion-safe:animate-pulse"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-[#4ba3ff]/20 blur-3xl"
        aria-hidden
      />
      {!reduceMotion ? (
        <div className="pointer-events-none absolute inset-0 opacity-50" aria-hidden>
          <SparklesCore
            background="transparent"
            particleColor="#4ba3ff"
            particleDensity={60}
            minSize={0.5}
            maxSize={1.2}
            className="h-full w-full"
          />
        </div>
      ) : null}

      <div className="relative">
        <div className="flex flex-wrap gap-2">
          <Badge variant="info" className="border-transparent bg-[#4ba3ff]/20 text-[#9ec9f5]">
            Tarifs · {siteConfig.city}
          </Badge>
          <Badge variant="outline" className="border-white/20 bg-white/5 text-white/80">
            Devis avant travaux
          </Badge>
          <Badge variant="outline" className="border-white/20 bg-white/5 text-white/80">
            Sans surprise
          </Badge>
        </div>

        <h1 className="mt-5 max-w-3xl text-balance text-3xl leading-tight md:text-5xl md:leading-[1.15]">
          Des prix lisibles.
          <span className="block text-[#4ba3ff]">Des devis sans surprise.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
          Domicile dès {formatPrice(DOMICILE_MIN)} la première heure · urgence dès{" "}
          {formatPrice(URGENCY_RATES.standard)} · atelier au forfait. Pas d’intervention à distance
          — vous venez, ou je me déplace.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <StatChip label="Domicile dès" value={formatPrice(DOMICILE_MIN)} hint="/ 1ʳᵉ h" />
          <StatChip
            label="Urgence dès"
            value={formatPrice(URGENCY_RATES.standard)}
            hint="/ 1ʳᵉ h"
          />
          <StatChip label="Diagnostic atelier" value={formatPrice(30)} hint="forfait" />
        </div>
      </div>
    </div>
  );
}

function StatChip({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">{label}</p>
      <p className="mt-1 font-display text-2xl tracking-tight text-white">
        {value}
        <span className="ml-1 text-sm font-sans font-medium text-white/45">{hint}</span>
      </p>
    </div>
  );
}
