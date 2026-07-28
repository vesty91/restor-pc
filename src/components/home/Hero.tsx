"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site";
import { HeroDiagnosticCard, SceneFallback } from "@/components/three/SceneFallback";
import { ArrowRight, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), {
  ssr: false,
  loading: () => <SceneFallback />,
});

export function Hero() {
  const [show3d, setShow3d] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () => {
      setShow3d(!reduced.matches);
    };

    sync();
    reduced.addEventListener("change", sync);
    return () => {
      reduced.removeEventListener("change", sync);
    };
  }, []);

  return (
    <section className="relative isolate min-h-[calc(100svh-74px)] md:min-h-[calc(100svh-90px)] flex items-stretch">
      <div
        className="absolute inset-0 bg-[linear-gradient(160deg,#05080f_0%,#0a1628_42%,#003a7a_100%)]"
        aria-hidden
      />
      <div className="hero-orb hero-orb-a" aria-hidden />
      <div className="hero-orb hero-orb-b" aria-hidden />
      <div className="hero-scanline" aria-hidden />
      <div
        className="absolute inset-0 opacity-[0.35] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(255 255 255 / 4%) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 4%) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "linear-gradient(90deg, black 0%, transparent 70%)",
        }}
        aria-hidden
      />

      <div className="container-wide relative z-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-10 items-center py-16 md:py-22 lg:py-14">
        <div className="max-w-xl text-white">
          <h1 className="text-2xl sm:text-3xl md:text-[2.05rem] font-sans font-semibold leading-[1.5] tracking-tight text-white/85 text-balance">
            {siteConfig.tagline}
          </h1>
          <p className="mt-5 text-base md:text-lg text-white/60 leading-relaxed max-w-md">
            Atelier à Yerres (91) pour dépanner, sécuriser et assembler votre
            ordinateur — avec clarté, méthode et résultats durables.
          </p>
          <p className="mt-3 inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/45">
            <MapPin className="h-3.5 w-3.5 text-[#4ba3ff] shrink-0" aria-hidden />
            <span>{siteConfig.addressShort}</span>
            <span className="text-white/25">·</span>
            <span>{siteConfig.intervention}</span>
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button href="/contact" size="lg">
              Demander un devis
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              href={siteConfig.phoneHref}
              variant="secondary"
              size="lg"
              className="border-white/20 bg-white/10 text-white hover:bg-white/15 hover:border-white/30"
            >
              <Phone className="h-4 w-4" />
              {siteConfig.phone}
            </Button>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/55">
            <span className="relative inline-flex items-center gap-2">
              <span className="pulse-dot relative inline-block h-2 w-2 rounded-full bg-[#4ba3ff]" />
              {siteConfig.responseTime}
            </span>
            <span className="hidden sm:inline text-white/25">|</span>
            <a
              href={siteConfig.googleBusinessUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <span className="text-[#4ba3ff] font-semibold">
                {siteConfig.googleRating.toFixed(1).replace(".", ",")}
              </span>
              <span>/5 Google · {siteConfig.googleReviewCount} avis</span>
            </a>
            <span className="hidden sm:inline text-white/25">|</span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#4ba3ff]" aria-hidden />
              {siteConfig.guarantee}
            </span>
          </div>
          <p className="mt-3 font-mono text-xs text-white/40">
            Appel direct · {siteConfig.phone}
          </p>
          <a
            href={siteConfig.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#4ba3ff] hover:text-white transition-colors"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            Ou écrivez-nous sur WhatsApp
          </a>
        </div>

        <div
          className="relative w-full"
          aria-hidden={!show3d}
        >
          {show3d ? <HeroScene /> : <HeroDiagnosticCard />}
        </div>
      </div>
    </section>
  );
}
