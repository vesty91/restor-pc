"use client";

import { useScroll, useTransform, motion, useReducedMotion } from "motion/react";
import React, { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TimelineEntry = {
  title: string;
  content: ReactNode;
};

type TimelineProps = {
  data: TimelineEntry[];
  eyebrow?: string;
  title?: string;
  description?: string;
  className?: string;
};

export function Timeline({
  data,
  eyebrow = "Parcours",
  title = "Déroulement d’une intervention",
  description,
  className,
}: TimelineProps) {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => setHeight(el.getBoundingClientRect().height);
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [data]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 20%", "end 70%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.08], [0, 1]);

  return (
    <div ref={containerRef} className={cn("w-full font-sans", className)}>
      <div className="mx-auto max-w-3xl px-1 pb-6 md:pb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">{eyebrow}</p>
        <h2 className="mt-3 text-3xl md:text-4xl leading-tight text-balance text-ink">{title}</h2>
        {description ? (
          <p className="mt-4 max-w-xl text-ink-muted leading-relaxed">{description}</p>
        ) : null}
      </div>

      <div ref={ref} className="relative mx-auto max-w-4xl pb-8 md:pb-12">
        <ol className="list-none m-0 p-0">
          {data.map((item, index) => (
            <li
              key={`${item.title}-${index}`}
              className="flex justify-start pt-8 md:gap-8 md:pt-12 first:pt-2"
            >
              <div className="sticky top-28 z-10 flex max-w-xs flex-col items-center self-start md:w-full md:max-w-[11rem] md:flex-row lg:max-w-xs">
                <div className="absolute left-3 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-paper md:left-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-teal" aria-hidden />
                </div>
                <h3 className="hidden text-base font-semibold text-ink-muted md:block md:pl-16 md:text-lg">
                  {item.title}
                </h3>
              </div>

              <div className="relative w-full pl-16 pr-1 md:pl-4">
                <h3 className="mb-2 block text-lg font-semibold text-ink md:hidden">
                  {item.title}
                </h3>
                <div className="text-sm leading-relaxed text-ink-muted md:text-[15px]">
                  {item.content}
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div
          style={{ height: `${height}px` }}
          className="absolute left-8 top-0 w-[2px] overflow-hidden bg-[linear-gradient(to_bottom,transparent,var(--line)_10%,var(--line)_90%,transparent)] md:left-8"
          aria-hidden
        >
          {!reduceMotion ? (
            <motion.div
              style={{
                height: heightTransform,
                opacity: opacityTransform,
              }}
              className="absolute inset-x-0 top-0 w-[2px] rounded-full bg-gradient-to-t from-teal via-teal-deep to-transparent"
            />
          ) : (
            <div className="absolute inset-x-0 top-0 h-full w-[2px] bg-teal/40" />
          )}
        </div>
      </div>
    </div>
  );
}
