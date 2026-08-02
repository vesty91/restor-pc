"use client";

import { SparklesCore } from "@/components/aceternity/sparkles";
import { OpenStatusBadge } from "@/components/OpenStatusBadge";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/lib/site";
import { useReducedMotion } from "motion/react";

export function ContactHero() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-panel px-6 py-10 text-panel-fg md:px-10 md:py-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,#05080f_0%,#0a2748_48%,#003a7a_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-teal/30 blur-3xl motion-safe:animate-pulse"
        aria-hidden
      />
      {!reduceMotion ? (
        <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden>
          <SparklesCore
            background="transparent"
            particleColor="#4ba3ff"
            particleDensity={45}
            className="h-full w-full"
          />
        </div>
      ) : null}

      <div className="relative">
        <div className="flex flex-wrap gap-2">
          <Badge variant="info" className="border-transparent bg-[#4ba3ff]/20 text-[#9ec9f5]">
            Contact
          </Badge>
          <Badge variant="outline" className="border-white/20 bg-white/5 text-white/80">
            {siteConfig.city}
          </Badge>
          <Badge variant="outline" className="border-white/20 bg-white/5 text-white/80">
            {siteConfig.responseTime}
          </Badge>
        </div>
        <h1 className="mt-5 max-w-3xl text-balance text-3xl leading-tight md:text-5xl md:leading-[1.15]">
          Parlons de votre panne
          <span className="text-[#4ba3ff]"> ou de votre projet</span>
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
          Atelier à Yerres · devis clair · pas de jargon inutile. Formulaire, appel ou WhatsApp — on
          vous répond rapidement.
        </p>
        <div className="mt-6">
          <OpenStatusBadge tone="dark" />
        </div>
      </div>
    </div>
  );
}
