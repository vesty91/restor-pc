"use client";

import { SparklesCore } from "@/components/aceternity/sparkles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site";
import { MapPin, Navigation, Phone } from "lucide-react";
import { useReducedMotion } from "motion/react";

export function AboutHero() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-panel px-6 py-10 text-panel-fg md:px-10 md:py-14">
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,#05080f_0%,#0a2748_50%,#003a7a_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 -top-16 h-72 w-72 rounded-full bg-teal/30 blur-3xl motion-safe:animate-pulse"
        aria-hidden
      />
      {!reduceMotion ? (
        <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden>
          <SparklesCore
            background="transparent"
            particleColor="#4ba3ff"
            particleDensity={50}
            className="h-full w-full"
          />
        </div>
      ) : null}

      <div className="relative">
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="info"
            className="border-transparent bg-[#4ba3ff]/20 text-[#9ec9f5]"
          >
            À propos
          </Badge>
          <Badge
            variant="outline"
            className="border-white/20 bg-white/5 text-white/80"
          >
            Atelier · {siteConfig.city}
          </Badge>
          <Badge
            variant="outline"
            className="border-white/20 bg-white/5 text-white/80"
          >
            {siteConfig.googleRating.toFixed(1).replace(".", ",")}/5 Google
          </Badge>
        </div>

        <h1 className="mt-5 max-w-3xl text-balance text-3xl leading-tight md:text-5xl md:leading-[1.15]">
          Un atelier à Yerres qui traite votre PC comme un outil de travail,
          <span className="text-[#4ba3ff]"> pas comme un ticket anonyme</span>
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
          Basé au {siteConfig.address}. Diagnostic méthodique, explications
          claires, finitions soignées — la rigueur d’un atelier de précision.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button href="/contact" size="lg">
            Prendre contact
          </Button>
          <Button
            href={siteConfig.mapsDirectionsUrl}
            variant="secondary"
            size="lg"
            className="border-white/20 bg-white/10 text-white hover:bg-white/15"
          >
            <Navigation className="h-4 w-4" />
            Itinéraire
          </Button>
          <Button
            href={siteConfig.phoneHref}
            variant="secondary"
            size="lg"
            className="border-white/20 bg-white/10 text-white hover:bg-white/15"
          >
            <Phone className="h-4 w-4" />
            {siteConfig.phone}
          </Button>
        </div>

        <p className="mt-6 inline-flex items-center gap-2 text-sm text-white/50">
          <MapPin className="h-4 w-4 text-[#4ba3ff]" aria-hidden />
          {siteConfig.transport}
        </p>
      </div>
    </div>
  );
}
