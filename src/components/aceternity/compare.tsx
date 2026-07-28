"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type KeyboardEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { IconDotsVertical } from "@tabler/icons-react";
import { SparklesCore } from "@/components/aceternity/sparkles";

interface CompareProps {
  firstImage?: string;
  secondImage?: string;
  className?: string;
  firstImageClassName?: string;
  secondImageClassname?: string;
  initialSliderPercentage?: number;
  slideMode?: "hover" | "drag";
  showHandlebar?: boolean;
  autoplay?: boolean;
  autoplayDuration?: number;
  /** Désactivé par défaut : tsparticles est trop lourd pour la home Restor-PC. */
  showSparkles?: boolean;
  firstAlt?: string;
  secondAlt?: string;
}

/**
 * Comparateur avant/après (Aceternity), adapté Restor-PC.
 * Pas de setState à 60 fps : l’autoplay écrit directement le style DOM.
 */
export function Compare({
  firstImage = "",
  secondImage = "",
  className,
  firstImageClassName,
  secondImageClassname,
  initialSliderPercentage = 50,
  slideMode = "drag",
  showHandlebar = true,
  autoplay = false,
  autoplayDuration = 5000,
  showSparkles = false,
  firstAlt = "Avant",
  secondAlt = "Après",
}: CompareProps) {
  const [sliderXPercent, setSliderXPercent] = useState(initialSliderPercentage);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const sliderLineRef = useRef<HTMLDivElement>(null);
  const firstClipRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef(initialSliderPercentage);
  const reduceMotion = useReducedMotion();
  const rafRef = useRef<number | null>(null);

  const applyPercent = useCallback((percent: number) => {
    const clamped = Math.max(0, Math.min(100, percent));
    percentRef.current = clamped;
    if (sliderLineRef.current) {
      sliderLineRef.current.style.left = `${clamped}%`;
    }
    if (firstClipRef.current) {
      firstClipRef.current.style.clipPath = `inset(0 ${100 - clamped}% 0 0)`;
    }
  }, []);

  const commitPercent = useCallback(
    (percent: number) => {
      applyPercent(percent);
      setSliderXPercent(percentRef.current);
    },
    [applyPercent]
  );

  useEffect(() => {
    if (!autoplay || reduceMotion) return;

    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = (elapsed % (autoplayDuration * 2)) / autoplayDuration;
      const percentage = progress <= 1 ? progress * 100 : (2 - progress) * 100;
      applyPercent(percentage);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [autoplay, autoplayDuration, applyPercent, reduceMotion]);

  const handleStart = useCallback(
    (clientX: number) => {
      void clientX;
      if (slideMode === "drag") setIsDragging(true);
    },
    [slideMode]
  );

  const handleEnd = useCallback(() => {
    if (slideMode === "drag") setIsDragging(false);
    setSliderXPercent(percentRef.current);
  }, [slideMode]);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!sliderRef.current) return;
      if (slideMode === "hover" || (slideMode === "drag" && isDragging)) {
        const rect = sliderRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        applyPercent((x / rect.width) * 100);
      }
    },
    [slideMode, isDragging, applyPercent]
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const step = e.shiftKey ? 10 : 5;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        commitPercent(percentRef.current - step);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        commitPercent(percentRef.current + step);
      } else if (e.key === "Home") {
        e.preventDefault();
        commitPercent(0);
      } else if (e.key === "End") {
        e.preventDefault();
        commitPercent(100);
      }
    },
    [commitPercent]
  );

  return (
    <div
      ref={sliderRef}
      role="slider"
      tabIndex={0}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(sliderXPercent)}
      aria-label="Comparaison avant / après"
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border border-line outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        className
      )}
      style={{
        cursor: slideMode === "drag" ? "grab" : "col-resize",
      }}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseLeave={() => {
        if (slideMode === "hover") commitPercent(initialSliderPercentage);
        handleEnd();
      }}
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseUp={handleEnd}
      onTouchStart={(e) => {
        if (!autoplay) handleStart(e.touches[0].clientX);
      }}
      onTouchEnd={() => {
        if (!autoplay) handleEnd();
      }}
      onTouchMove={(e) => {
        if (!autoplay) handleMove(e.touches[0].clientX);
      }}
      onKeyDown={onKeyDown}
    >
      <AnimatePresence initial={false}>
        <motion.div
          ref={sliderLineRef}
          className="absolute top-0 z-30 m-auto h-full w-px bg-gradient-to-b from-transparent from-[5%] via-teal to-transparent to-[95%]"
          style={{
            left: `${sliderXPercent}%`,
            zIndex: 40,
          }}
          transition={{ duration: 0 }}
        >
          <div className="absolute top-1/2 left-0 z-20 h-full w-28 -translate-y-1/2 bg-gradient-to-r from-teal/40 via-transparent to-transparent opacity-50 [mask-image:radial-gradient(100px_at_left,white,transparent)]" />
          {showSparkles && !reduceMotion ? (
            <div className="absolute top-1/2 -right-10 h-3/4 w-10 -translate-y-1/2 [mask-image:radial-gradient(100px_at_left,white,transparent)]">
              <SparklesCore
                background="transparent"
                minSize={0.4}
                maxSize={1}
                particleDensity={40}
                className="h-full w-full"
                particleColor="#4ba3ff"
              />
            </div>
          ) : null}
          {showHandlebar ? (
            <div className="absolute top-1/2 -right-2.5 z-30 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-md bg-white shadow-sm">
              <IconDotsVertical className="h-4 w-4 text-ink" aria-hidden />
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>

      <div className="pointer-events-none relative z-20 h-full w-full overflow-hidden">
        {firstImage ? (
          <div
            ref={firstClipRef}
            className={cn(
              "absolute inset-0 z-20 h-full w-full shrink-0 overflow-hidden rounded-2xl select-none",
              firstImageClassName
            )}
            style={{ clipPath: `inset(0 ${100 - sliderXPercent}% 0 0)` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- assets SVG locaux illustratifs */}
            <img
              alt={firstAlt}
              src={firstImage}
              className={cn(
                "absolute inset-0 z-20 h-full w-full shrink-0 rounded-2xl object-cover select-none",
                firstImageClassName
              )}
              draggable={false}
            />
          </div>
        ) : null}
      </div>

      {secondImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- assets SVG locaux illustratifs
        <img
          className={cn(
            "absolute top-0 left-0 z-[19] h-full w-full rounded-2xl object-cover select-none",
            secondImageClassname
          )}
          alt={secondAlt}
          src={secondImage}
          draggable={false}
        />
      ) : null}
    </div>
  );
}
