"use client";

export function SceneLights({ quality = "high" }: { quality?: "high" | "medium" | "low" }) {
  const soft = quality === "low";
  return (
    <>
      <ambientLight intensity={soft ? 0.55 : 0.48} color="#c5d8ee" />
      <directionalLight
        position={[3.2, 5.5, 2.8]}
        intensity={soft ? 0.9 : 1.15}
        color="#f2f7ff"
      />
      <directionalLight
        position={[-2.5, 2.5, -1.5]}
        intensity={0.35}
        color="#8eb8e8"
      />
      <pointLight
        position={[0.3, 2.2, 0.8]}
        intensity={soft ? 0.7 : 1.1}
        color="#4ba3ff"
        distance={10}
        decay={2}
      />
      {!soft && (
        <pointLight
          position={[-2, 1.2, 1.5]}
          intensity={0.45}
          color="#2b8af0"
          distance={9}
          decay={2}
        />
      )}
    </>
  );
}
