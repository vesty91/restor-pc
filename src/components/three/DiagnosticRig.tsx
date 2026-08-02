"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import type { HeroMotionState } from "./useHeroMotion";

export type SceneQuality = "high" | "medium" | "low";

type DiagnosticRigProps = {
  motion: HeroMotionState;
  quality?: SceneQuality;
};

type Vec3 = [number, number, number];

const PCB = "#1a3a52";
const PCB_TOP = "#214864";
const METAL = "#8fa3b8";
const METAL_DARK = "#4a5f75";
const CHIP = "#2a455c";
const ACCENT = "#4ba3ff";
const ACCENT_DEEP = "#2b8af0";

function TracePath({
  points,
  color = ACCENT,
  opacity = 0.7,
}: {
  points: Vec3[];
  color?: string;
  opacity?: number;
}) {
  const vectors = useMemo(() => points.map((p) => new THREE.Vector3(...p)), [points]);
  return <Line points={vectors} color={color} lineWidth={1.8} transparent opacity={opacity} />;
}

function FanBlades({ spinning }: { spinning: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current && spinning) ref.current.rotation.y += delta * 3.2;
  });
  return (
    <group ref={ref}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} rotation={[0, (i * Math.PI) / 3, 0]} position={[0, 0, 0]}>
          <boxGeometry args={[0.42, 0.02, 0.1]} />
          <meshStandardMaterial color="#6a849c" metalness={0.55} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}

export function DiagnosticRig({ motion, quality = "high" }: DiagnosticRigProps) {
  const root = useRef<THREE.Group>(null);
  const cpu = useRef<THREE.Group>(null);
  const cooler = useRef<THREE.Group>(null);
  const ramA = useRef<THREE.Group>(null);
  const ramB = useRef<THREE.Group>(null);
  const gpu = useRef<THREE.Group>(null);
  const ssd = useRef<THREE.Group>(null);
  const scan = useRef<THREE.Mesh>(null);
  const cpuDieMat = useRef<THREE.MeshStandardMaterial>(null);
  const gpuLedMat = useRef<THREE.MeshStandardMaterial>(null);
  const entry = useRef(0);

  const traces = useMemo(
    () =>
      [
        [
          [-1.35, 0.06, -0.85],
          [-0.5, 0.06, -0.85],
          [-0.5, 0.06, -0.4],
        ],
        [
          [1.4, 0.06, 0.8],
          [0.55, 0.06, 0.8],
          [0.55, 0.06, 0.4],
        ],
        [
          [-1.4, 0.06, 0.9],
          [-0.45, 0.06, 0.9],
          [-0.45, 0.06, 0.42],
        ],
        [
          [1.35, 0.06, -0.95],
          [0.5, 0.06, -0.95],
          [0.5, 0.06, -0.42],
        ],
        [
          [-1.45, 0.06, 0],
          [-0.48, 0.06, 0],
        ],
        [
          [1.45, 0.06, 0.05],
          [0.48, 0.06, 0.05],
        ],
        [
          [0.15, 0.06, -1.15],
          [0.15, 0.06, -0.48],
        ],
        [
          [-0.2, 0.06, 1.15],
          [-0.2, 0.06, 0.48],
        ],
      ] as Vec3[][],
    [],
  );

  const detail = quality !== "low";
  const explodeAmp = quality === "high" ? 0.1 : quality === "medium" ? 0.07 : 0.03;
  const baseTilt = quality === "low" ? 0.22 : 0.3;

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.1);

    if (!motion.reducedMotion) {
      entry.current = Math.min(1, entry.current + delta * 0.75);
    } else {
      entry.current = 1;
    }
    const ease = 1 - Math.pow(1 - entry.current, 3);

    const explode = motion.reducedMotion ? 0.15 : (Math.sin(t * 0.45) * 0.5 + 0.5) * explodeAmp;

    if (root.current) {
      const scrollFactor = Math.min(1, motion.scrollY / 800);
      const parallax = quality === "low" ? 0 : quality === "medium" ? 0.5 : 1;
      root.current.rotation.y = t * 0.035 + motion.mouseX * 0.04 * parallax;
      root.current.rotation.x = baseTilt + motion.mouseY * -0.03 * parallax + scrollFactor * 0.02;
      root.current.position.y = Math.sin(t * 0.6) * 0.025;
      root.current.visible = ease > 0.02;
    }

    if (cpu.current) cpu.current.position.y = 0.08 + explode * 0.14;
    if (cooler.current) cooler.current.position.y = 0.42 + explode * 0.22;
    if (ramA.current) {
      ramA.current.position.y = 0.12 + explode * 0.18;
      ramA.current.position.x = 1.05 + explode * 0.06;
    }
    if (ramB.current) {
      ramB.current.position.y = 0.12 + explode * 0.14;
      ramB.current.position.x = 1.28 + explode * 0.08;
    }
    if (gpu.current) {
      gpu.current.position.y = -0.05 - explode * 0.12;
      gpu.current.position.z = 0.15 + explode * 0.08;
    }
    if (ssd.current) {
      ssd.current.position.y = 0.1 + explode * 0.12;
      ssd.current.position.x = -1.05 - explode * 0.08;
    }
    if (cpuDieMat.current) {
      cpuDieMat.current.emissiveIntensity = 0.35 + pulse * 0.3;
    }
    if (gpuLedMat.current) {
      gpuLedMat.current.emissiveIntensity = 0.45 + pulse * 0.35;
    }
    if (scan.current) {
      scan.current.position.y = -0.15 + ((t * 0.22) % 0.55);
      const mat = scan.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.12 + 0.08 * Math.sin(t * 3);
    }
  });

  return (
    <group ref={root}>
      {/* ——— Motherboard ——— */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3.2, 0.09, 2.5]} />
        <meshStandardMaterial
          color={PCB}
          metalness={0.35}
          roughness={0.55}
          emissive="#0a2035"
          emissiveIntensity={0.4}
        />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[3.14, 0.02, 2.44]} />
        <meshStandardMaterial
          color={PCB_TOP}
          metalness={0.4}
          roughness={0.45}
          emissive="#123a58"
          emissiveIntensity={0.35}
        />
      </mesh>
      {/* PCB edge lip */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[3.24, 0.04, 2.54]} />
        <meshStandardMaterial
          color="#2b5a78"
          metalness={0.5}
          roughness={0.4}
          emissive={ACCENT_DEEP}
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* I/O shield bar */}
      <mesh position={[0, 0.12, -1.18]}>
        <boxGeometry args={[2.4, 0.18, 0.08]} />
        <meshStandardMaterial color={METAL} metalness={0.75} roughness={0.25} />
      </mesh>

      {/* Chipset / VRMs */}
      <mesh position={[-0.95, 0.1, 0.85]}>
        <boxGeometry args={[0.55, 0.1, 0.4]} />
        <meshStandardMaterial
          color={CHIP}
          metalness={0.45}
          roughness={0.4}
          emissive={ACCENT_DEEP}
          emissiveIntensity={0.2}
        />
      </mesh>
      <mesh position={[0.9, 0.1, 0.9]}>
        <boxGeometry args={[0.45, 0.09, 0.35]} />
        <meshStandardMaterial color={CHIP} metalness={0.4} roughness={0.42} />
      </mesh>
      {detail &&
        (
          [
            [-1.2, 0.12, -0.55],
            [-0.95, 0.12, -0.55],
            [-0.7, 0.12, -0.55],
            [0.75, 0.12, -0.7],
            [1.0, 0.12, -0.7],
          ] as Vec3[]
        ).map((p, i) => (
          <mesh key={i} position={p}>
            <cylinderGeometry args={[0.07, 0.07, 0.12, 10]} />
            <meshStandardMaterial color="#3d5a72" metalness={0.6} roughness={0.3} />
          </mesh>
        ))}

      {/* Circuit traces */}
      {traces.map((pts, i) => (
        <TracePath
          key={i}
          points={pts}
          color={i % 2 ? ACCENT : ACCENT_DEEP}
          opacity={0.55 + (i % 3) * 0.1}
        />
      ))}

      {/* ——— CPU ——— */}
      <group ref={cpu} position={[0, 0.08, 0]}>
        <mesh>
          <boxGeometry args={[0.85, 0.08, 0.85]} />
          <meshStandardMaterial color="#2c445c" metalness={0.55} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[0.58, 0.06, 0.58]} />
          <meshStandardMaterial
            ref={cpuDieMat}
            color="#5a7a98"
            metalness={0.7}
            roughness={0.22}
            emissive={ACCENT}
            emissiveIntensity={0.45}
          />
        </mesh>
        {(
          [
            [-0.35, -0.02, -0.35],
            [0.35, -0.02, -0.35],
            [-0.35, -0.02, 0.35],
            [0.35, -0.02, 0.35],
          ] as Vec3[]
        ).map((p, i) => (
          <mesh key={i} position={p}>
            <boxGeometry args={[0.05, 0.04, 0.05]} />
            <meshStandardMaterial color={METAL} metalness={0.85} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* ——— Cooler / fan ——— */}
      <group ref={cooler} position={[0, 0.42, 0]}>
        <mesh position={[0, -0.08, 0]}>
          <cylinderGeometry args={[0.38, 0.42, 0.18, 20]} />
          <meshStandardMaterial color={METAL_DARK} metalness={0.65} roughness={0.3} />
        </mesh>
        <mesh>
          <torusGeometry args={[0.36, 0.04, 10, 28]} />
          <meshStandardMaterial
            color="#6d879e"
            metalness={0.7}
            roughness={0.28}
            emissive={ACCENT}
            emissiveIntensity={0.15}
          />
        </mesh>
        <FanBlades spinning={!motion.reducedMotion && quality !== "low"} />
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.06, 12]} />
          <meshStandardMaterial color={METAL} metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* ——— RAM sticks ——— */}
      <group ref={ramA} position={[1.05, 0.12, -0.35]} rotation={[0, 0.08, 0.05]}>
        <mesh>
          <boxGeometry args={[0.14, 0.72, 0.08]} />
          <meshStandardMaterial
            color="#1e4a6a"
            metalness={0.45}
            roughness={0.35}
            emissive="#0060cb"
            emissiveIntensity={0.35}
          />
        </mesh>
        <mesh position={[0.02, 0.2, 0.03]}>
          <boxGeometry args={[0.04, 0.12, 0.02]} />
          <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.7} />
        </mesh>
        <mesh position={[0, -0.32, 0]}>
          <boxGeometry args={[0.14, 0.06, 0.05]} />
          <meshStandardMaterial color={METAL} metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
      <group ref={ramB} position={[1.28, 0.12, 0.05]} rotation={[0, -0.05, 0.04]}>
        <mesh>
          <boxGeometry args={[0.14, 0.72, 0.08]} />
          <meshStandardMaterial
            color="#1a4060"
            metalness={0.45}
            roughness={0.35}
            emissive="#0060cb"
            emissiveIntensity={0.28}
          />
        </mesh>
        <mesh position={[0.02, 0.15, 0.03]}>
          <boxGeometry args={[0.04, 0.1, 0.02]} />
          <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.55} />
        </mesh>
        <mesh position={[0, -0.32, 0]}>
          <boxGeometry args={[0.14, 0.06, 0.05]} />
          <meshStandardMaterial color={METAL} metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* ——— GPU ——— */}
      <group ref={gpu} position={[0.15, -0.05, 0.15]} rotation={[0.02, 0.12, 0]}>
        <mesh>
          <boxGeometry args={[2.1, 0.22, 0.55]} />
          <meshStandardMaterial
            color="#243848"
            metalness={0.55}
            roughness={0.35}
            emissive="#0a2748"
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* shroud / fins hint */}
        <mesh position={[0, 0.14, 0]}>
          <boxGeometry args={[1.9, 0.06, 0.48]} />
          <meshStandardMaterial color="#3a556c" metalness={0.6} roughness={0.32} />
        </mesh>
        <mesh position={[-0.55, 0.18, 0]}>
          <cylinderGeometry args={[0.14, 0.14, 0.05, 14]} />
          <meshStandardMaterial
            color="#5a738a"
            metalness={0.65}
            roughness={0.3}
            emissive={ACCENT}
            emissiveIntensity={0.2}
          />
        </mesh>
        <mesh position={[0.35, 0.18, 0]}>
          <cylinderGeometry args={[0.14, 0.14, 0.05, 14]} />
          <meshStandardMaterial color="#5a738a" metalness={0.65} roughness={0.3} />
        </mesh>
        {/* PCIe gold contacts */}
        <mesh position={[0, -0.08, -0.22]}>
          <boxGeometry args={[1.6, 0.04, 0.08]} />
          <meshStandardMaterial color="#c4a35a" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0.85, 0.02, 0.28]}>
          <boxGeometry args={[0.35, 0.08, 0.04]} />
          <meshStandardMaterial
            ref={gpuLedMat}
            color={ACCENT}
            emissive={ACCENT}
            emissiveIntensity={0.55}
          />
        </mesh>
      </group>

      {/* ——— NVMe SSD ——— */}
      <group ref={ssd} position={[-1.05, 0.1, 0.35]} rotation={[0, 0.25, 0]}>
        <mesh>
          <boxGeometry args={[0.85, 0.05, 0.28]} />
          <meshStandardMaterial
            color="#2a3f55"
            metalness={0.5}
            roughness={0.35}
            emissive="#123a58"
            emissiveIntensity={0.25}
          />
        </mesh>
        <mesh position={[-0.15, 0.04, 0]}>
          <boxGeometry args={[0.35, 0.03, 0.18]} />
          <meshStandardMaterial
            color={CHIP}
            metalness={0.45}
            roughness={0.4}
            emissive={ACCENT_DEEP}
            emissiveIntensity={0.35}
          />
        </mesh>
        <mesh position={[0.32, 0, 0]}>
          <boxGeometry args={[0.12, 0.035, 0.22]} />
          <meshStandardMaterial color={METAL} metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Diagnostic scan plane */}
      {quality !== "low" && (
        <mesh ref={scan} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
          <planeGeometry args={[2.8, 2.2]} />
          <meshBasicMaterial
            color={ACCENT}
            transparent
            opacity={0.2}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}
