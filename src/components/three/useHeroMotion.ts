"use client";

import { useEffect, useState } from "react";

export type HeroMotionState = {
  mouseX: number;
  mouseY: number;
  scrollY: number;
  reducedMotion: boolean;
  visible: boolean;
};

function readReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Parallax souris + facteur scroll + reduced-motion + visibilité onglet.
 */
export function useHeroMotion(enabled: boolean): HeroMotionState {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [reducedMotion] = useState(readReducedMotion);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || reducedMotion) return;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;

    const onMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth) * 2 - 1;
      targetY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const onScroll = () => setScrollY(window.scrollY);
    const onVisibility = () => setVisible(!document.hidden);

    const tick = () => {
      curX += (targetX - curX) * 0.06;
      curY += (targetY - curY) * 0.06;
      setMouseX(curX);
      setMouseY(curY);
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    onScroll();
    onVisibility();
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled, reducedMotion]);

  return { mouseX, mouseY, scrollY, reducedMotion, visible };
}
