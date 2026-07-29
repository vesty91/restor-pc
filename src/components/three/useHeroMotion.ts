"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type HeroMotionState = {
  readonly mouseX: number;
  readonly mouseY: number;
  readonly scrollY: number;
  reducedMotion: boolean;
  /** Onglet visible ET scène dans le viewport. */
  visible: boolean;
};

function readReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Parallax souris + scroll + reduced-motion + visibilité (onglet + IntersectionObserver).
 * Coords souris/scroll : refs mutées hors rendu (lues dans useFrame R3F).
 */
export function useHeroMotion(
  enabled: boolean,
  root: HTMLElement | null
): HeroMotionState {
  const coords = useRef({ mouseX: 0, mouseY: 0, scrollY: 0 });
  const [reducedMotion] = useState(readReducedMotion);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || reducedMotion) return;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;

    const onMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth) * 2 - 1;
      targetY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const onScroll = () => {
      coords.current.scrollY = window.scrollY;
    };

    const tick = () => {
      const c = coords.current;
      c.mouseX += (targetX - c.mouseX) * 0.06;
      c.mouseY += (targetY - c.mouseY) * 0.06;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [enabled, reducedMotion]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const syncVisibility = (inView: boolean) => {
      setVisible(inView && !document.hidden);
    };

    const onDocVisibility = () => {
      if (!root) {
        setVisible(!document.hidden);
        return;
      }
      const rect = root.getBoundingClientRect();
      const inView = rect.bottom > 0 && rect.top < window.innerHeight;
      syncVisibility(inView);
    };

    document.addEventListener("visibilitychange", onDocVisibility);

    if (!root) {
      onDocVisibility();
      return () => document.removeEventListener("visibilitychange", onDocVisibility);
    }

    const obs = new IntersectionObserver(
      ([entry]) => syncVisibility(entry.isIntersecting),
      { root: null, threshold: 0.05 }
    );
    obs.observe(root);
    onDocVisibility();

    return () => {
      document.removeEventListener("visibilitychange", onDocVisibility);
      obs.disconnect();
    };
  }, [enabled, root]);

  return useMemo(
    () => ({
      get mouseX() {
        return coords.current.mouseX;
      },
      get mouseY() {
        return coords.current.mouseY;
      },
      get scrollY() {
        return coords.current.scrollY;
      },
      reducedMotion,
      visible,
    }),
    [reducedMotion, visible]
  );
}
