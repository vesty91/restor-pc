"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type ParticlesProps = {
  count?: number;
  active?: boolean;
};

function hash01(n: number): number {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/** Particules discrètes, volume resserré autour de la composition. */
export function Particles({ count = 28, active = true }: ParticlesProps) {
  const ref = useRef<THREE.Points>(null);

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (hash01(i * 3.1) - 0.5) * 4.2;
      positions[i * 3 + 1] = (hash01(i * 5.7) - 0.5) * 2.8;
      positions[i * 3 + 2] = (hash01(i * 7.3) - 0.5) * 3.2;
      speeds[i] = 0.12 + hash01(i * 9.1) * 0.28;
    }
    return { positions, speeds };
  }, [count]);

  useFrame((state) => {
    if (!active || !ref.current) return;
    const t = state.clock.elapsedTime;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += Math.sin(t * speeds[i] + i) * 0.0009;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.rotation.y = t * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial
        size={0.028}
        color="#4ba3ff"
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
