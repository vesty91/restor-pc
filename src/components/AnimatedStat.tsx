"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Parsed = {
  target: number | null;
  decimals: number;
  suffix: string;
  prefix: string;
  sep: "," | ".";
};

function parseStat(value: string): Parsed {
  const m = value.match(/^([^\d]*)(\d+)([.,](\d+))?(.*)$/);
  if (!m) {
    return { target: null, decimals: 0, suffix: value, prefix: "", sep: "," };
  }
  const whole = m[2];
  const sep = (m[3]?.[0] as "," | ".") || ",";
  const frac = m[4] ?? "";
  const decimals = frac.length;
  const target = Number(`${whole}.${frac || "0"}`);
  return {
    target: Number.isFinite(target) ? target : null,
    decimals,
    prefix: m[1] ?? "",
    suffix: m[5] ?? "",
    sep,
  };
}

function formatCurrent(n: number, parsed: Parsed): string {
  if (parsed.decimals > 0) {
    const raw = n.toFixed(parsed.decimals);
    const shown = parsed.sep === "," ? raw.replace(".", ",") : raw;
    return `${parsed.prefix}${shown}${parsed.suffix}`;
  }
  return `${parsed.prefix}${Math.round(n)}${parsed.suffix}`;
}

export function AnimatedStat({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const parsed = useMemo(() => parseStat(value), [value]);
  const [display, setDisplay] = useState(() => {
    const p = parseStat(value);
    return p.target != null ? formatCurrent(0, p) : value;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || parsed.target == null) {
      setDisplay(value);
      return;
    }

    let raf = 0;
    let started = false;

    const run = () => {
      if (started) return;
      started = true;
      const duration = 1200;
      const t0 = performance.now();

      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / duration);
        const eased = 1 - (1 - t) ** 3;
        setDisplay(formatCurrent(parsed.target! * eased, parsed));
        if (t < 1) raf = requestAnimationFrame(tick);
        else setDisplay(value);
      };

      raf = requestAnimationFrame(tick);
    };

    // Déjà visible au montage (ou parent Reveal qui apparaît)
    const rect = el.getBoundingClientRect();
    const inView =
      rect.top < window.innerHeight * 0.92 && rect.bottom > window.innerHeight * 0.08;

    if (inView) {
      // Laisse le Reveal parent finir son fade (~300ms)
      const delay = window.setTimeout(run, 280);
      return () => {
        window.clearTimeout(delay);
        cancelAnimationFrame(raf);
      };
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          window.setTimeout(run, 120);
          obs.disconnect();
        }
      },
      { threshold: 0.25, rootMargin: "0px 0px -8% 0px" }
    );
    obs.observe(el);

    return () => {
      obs.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [parsed, value]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {display}
    </span>
  );
}
