"use client";

import { cn } from "@/lib/utils";

/**
 * Cult UI — Hero Color Panels (variante légère CSS).
 *
 * Le composant officiel Cult (`hero-color-panel`) s’appuie sur des shaders WebGL :
 * trop lourd / redondant avec Three.js Restor-PC. Cette adaptation reprend
 * l’idée des panneaux colorés (layout + gradients animés discrets) sans shader.
 *
 * Inspiration / registre : https://cult-ui.com/r/hero-color-panel.json
 * Couleurs : tokens Restor-PC uniquement.
 * Ne jamais monter en même temps que HeroScene Three.js.
 */
export function HeroColorPanels({
  className,
  label = "Atelier Restor-PC",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-[28px] border border-white/10",
        className,
      )}
      role="img"
      aria-label={label}
    >
      <div
        className="absolute inset-0 bg-[linear-gradient(145deg,#05080f_0%,#0a2748_45%,#003a7a_100%)]"
        aria-hidden
      />
      <div
        className="absolute -left-10 top-8 h-40 w-40 rounded-3xl bg-teal/35 blur-2xl motion-safe:animate-pulse"
        aria-hidden
      />
      <div
        className="absolute -right-8 bottom-10 h-48 w-48 rounded-3xl bg-[#4ba3ff]/25 blur-3xl motion-safe:animate-pulse"
        style={{ animationDelay: "0.8s" }}
        aria-hidden
      />
      <div className="absolute inset-6 grid grid-cols-2 gap-3">
        <Panel tone="from-[#0a2748] to-[#122036]" title="Diagnostic" />
        <Panel tone="from-[#122036] to-[#0f1a28]" title="Réparation" delay="0.2s" />
        <Panel tone="from-[#16324c] to-[#0a2748]" title="Sauvegarde" delay="0.4s" />
        <Panel tone="from-[#0f2a40] to-[#163a58]" title="Montage" delay="0.6s" />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#4ba3ff]">
          Restor-PC
        </p>
        <p className="mt-1 text-sm font-semibold text-white/90">Variante visuelle légère</p>
      </div>
    </div>
  );
}

function Panel({ tone, title, delay }: { tone: string; title: string; delay?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-gradient-to-br p-3 shadow-[inset_0_1px_0_rgb(255_255_255/8%)]",
        tone,
        "motion-safe:transition-transform motion-safe:duration-500 motion-safe:hover:-translate-y-0.5",
      )}
      style={delay ? { transitionDelay: delay } : undefined}
    >
      <p className="text-xs font-semibold text-white/80">{title}</p>
      <div className="mt-3 h-1.5 w-2/3 rounded-full bg-white/15" aria-hidden />
      <div className="mt-2 h-1.5 w-1/2 rounded-full bg-white/10" aria-hidden />
    </div>
  );
}
