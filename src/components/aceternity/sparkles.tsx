"use client";

import { cn } from "@/lib/utils";
import { useReducedMotion } from "motion/react";
import { useId, useMemo } from "react";

type ParticlesProps = {
  id?: string;
  className?: string;
  background?: string;
  particleSize?: number;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string;
  particleDensity?: number;
};

/**
 * Sparkles léger (remplace tsparticles Aceternity).
 * Même API publique que @aceternity/sparkles — CSS only, pas de setState/frame.
 * tsparticles v4 n’exporte plus `initParticlesEngine` et alourdissait le bundle.
 */
export function SparklesCore({
  id,
  className,
  background = "transparent",
  particleColor = "#4ba3ff",
  particleDensity = 40,
  minSize = 0.6,
  maxSize = 1.4,
}: ParticlesProps) {
  const reactId = useId();
  const reduceMotion = useReducedMotion();
  const dots = useMemo(() => {
    const count = Math.min(80, Math.max(8, Math.floor(particleDensity / 20)));
    return Array.from({ length: count }, (_, i) => {
      const size = minSize + ((i * 17) % 10) * 0.1 * (maxSize - minSize);
      return {
        key: `${reactId}-${i}`,
        left: `${(i * 37) % 100}%`,
        top: `${(i * 53) % 100}%`,
        size,
        delay: `${(i % 8) * 0.35}s`,
        duration: `${2.4 + (i % 5) * 0.4}s`,
      };
    });
  }, [reactId, particleDensity, minSize, maxSize]);

  return (
    <div
      id={id ?? reactId.replace(/:/g, "")}
      className={cn("pointer-events-none relative h-full w-full overflow-hidden", className)}
      style={{ background }}
      aria-hidden
    >
      {dots.map((d) => (
        <span
          key={d.key}
          className={cn(
            "absolute rounded-full opacity-70",
            !reduceMotion && "motion-safe:animate-pulse",
          )}
          style={{
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
            backgroundColor: particleColor,
            animationDelay: reduceMotion ? undefined : d.delay,
            animationDuration: reduceMotion ? undefined : d.duration,
            boxShadow: `0 0 ${d.size * 2}px ${particleColor}`,
          }}
        />
      ))}
    </div>
  );
}
