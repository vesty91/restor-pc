"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Bounds, Center } from "@react-three/drei";
import { DiagnosticRig, type SceneQuality } from "./DiagnosticRig";
import { Particles } from "./Particles";
import { SceneLights } from "./SceneLights";
import { SceneFallback } from "./SceneFallback";
import { useHeroMotion } from "./useHeroMotion";

const STATUS_ROWS = [
  { key: "CPU", values: ["OK", "OK", "STABLE"] },
  { key: "RAM", values: ["OK", "OK", "2×16Go"] },
  { key: "SSD", values: ["ANALYSE", "OK", "NVMe"] },
  { key: "TEMP", values: ["42°C", "41°C", "43°C"] },
] as const;

function boundsMargin(quality: SceneQuality): number {
  if (quality === "low") return 1.45;
  if (quality === "medium") return 1.32;
  return 1.22;
}

function DiagnosticHud({ compact }: { compact?: boolean }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 2200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <div className="absolute left-4 top-3 flex items-center gap-2">
        <span className="font-mono text-[10px] tracking-wider text-white/45 uppercase">
          Diagnostic 3D
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-[#4ba3ff]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[#4ba3ff]">
          <span className="h-1 w-1 animate-pulse rounded-full bg-[#4ba3ff]" />
          Live
        </span>
      </div>

      {!compact && (
        <ul className="absolute bottom-3 left-4 space-y-1 font-mono text-[10px] tracking-wide text-white/40">
          {STATUS_ROWS.map((row, i) => {
            const value = row.values[tick % row.values.length];
            const busy = value === "ANALYSE";
            return (
              <li key={row.key} className="flex items-center gap-2">
                <span className="w-8 text-white/35">{row.key}</span>
                <span className={busy ? "text-[#4ba3ff]" : "text-white/55"}>{value}</span>
                <span
                  className={`h-1 w-1 rounded-full ${
                    busy ? "bg-[#4ba3ff] animate-pulse" : "bg-emerald-400/70"
                  }`}
                  style={{ animationDelay: `${i * 120}ms` }}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function useSceneQuality(): SceneQuality {
  const [quality, setQuality] = useState<SceneQuality>("high");

  useEffect(() => {
    const sync = () => {
      const w = window.innerWidth;
      // Save-Data / cœurs faibles → qualité basse même en desktop
      const cores = navigator.hardwareConcurrency || 4;
      const saveData =
        "connection" in navigator &&
        Boolean(
          (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData,
        );
      if (saveData || cores <= 4 || w < 768) setQuality("low");
      else if (w < 1024) setQuality("medium");
      else setQuality("high");
    };
    const id = window.setTimeout(sync, 0);
    window.addEventListener("resize", sync, { passive: true });
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("resize", sync);
    };
  }, []);

  return quality;
}

function SceneContent({
  motion,
  quality,
}: {
  motion: ReturnType<typeof useHeroMotion>;
  quality: SceneQuality;
}) {
  const margin = boundsMargin(quality);
  const particleCount = quality === "high" ? 24 : quality === "medium" ? 14 : 6;

  return (
    <>
      <SceneLights quality={quality} />
      <Bounds fit clip observe margin={margin} maxDuration={0.35}>
        <Center>
          {/* Léger décalage à droite pour laisser place au HUD gauche */}
          <group position={[0.18, 0, 0]}>
            <DiagnosticRig motion={motion} quality={quality} />
          </group>
        </Center>
      </Bounds>
      <Particles count={particleCount} active={motion.visible && !motion.reducedMotion} />
    </>
  );
}

/**
 * Scène 3D Hero — chargée via dynamic(ssr:false).
 * Canvas en absolute inset-0 ; overlays HTML superposés.
 * Fallback immédiat si WebGL / reduced-motion.
 */
export default function HeroScene() {
  const [rootEl, setRootEl] = useState<HTMLElement | null>(null);

  const [webglOk] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      return Boolean(gl);
    } catch {
      return false;
    }
  });

  const motion = useHeroMotion(true, rootEl);
  const quality = useSceneQuality();

  if (!webglOk || motion.reducedMotion) {
    return <SceneFallback label="Vue 3D indisponible" />;
  }

  return (
    <div
      ref={setRootEl}
      data-hero-webgl
      className="relative h-[340px] w-full overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(165deg,rgba(8,18,36,0.95)_0%,rgba(6,24,52,0.9)_55%,rgba(5,32,72,0.82)_100%)] shadow-[0_30px_80px_rgb(0_0_0/35%)] sm:h-[380px] md:h-[420px] lg:h-[480px]"
    >
      <DiagnosticHud compact={quality === "low"} />

      <div className="absolute inset-0">
        <Suspense
          fallback={
            <div className="absolute inset-0">
              <SceneFallback />
            </div>
          }
        >
          <Canvas
            className="absolute inset-0 h-full w-full touch-none"
            dpr={quality === "low" ? [1, 1.15] : [1, 1.5]}
            camera={{
              position: [4, 5, 8],
              fov: 38,
              near: 0.05,
              far: 100,
            }}
            gl={{
              antialias: quality !== "low",
              alpha: true,
              powerPreference: quality === "low" ? "low-power" : "high-performance",
            }}
            frameloop={motion.visible ? "always" : "never"}
            onCreated={({ gl }) => {
              gl.setClearColor(0x000000, 0);
            }}
          >
            <SceneContent motion={motion} quality={quality} />
          </Canvas>
        </Suspense>
      </div>
    </div>
  );
}
