"use client";

import { type ComponentPropsWithoutRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps extends ComponentPropsWithoutRef<"div"> {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  children: React.ReactNode;
  vertical?: boolean;
  repeat?: number;
}

/**
 * Magic UI Marquee — adapté Restor-PC.
 * Provenance: https://magicui.design (registre shadcn)
 * Respecte prefers-reduced-motion (défilement figé).
 */
export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}: MarqueeProps) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <div
      {...props}
      className={cn(
        "group flex gap-(--gap) overflow-hidden p-2 [--duration:40s] [--gap:1rem]",
        {
          "flex-row": !vertical,
          "flex-col": vertical,
        },
        className
      )}
    >
      {Array(reduceMotion ? 1 : repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={cn("flex shrink-0 justify-around gap-(--gap)", {
              "animate-marquee flex-row": !vertical && !reduceMotion,
              "animate-marquee-vertical flex-col": vertical && !reduceMotion,
              "group-hover:[animation-play-state:paused]": pauseOnHover,
              "[animation-direction:reverse]": reverse,
              "flex-wrap justify-center gap-3": reduceMotion,
            })}
          >
            {children}
          </div>
        ))}
    </div>
  );
}
