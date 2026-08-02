"use client";

export function SceneFallback({ label = "Chargement du diagnostic 3D…" }: { label?: string }) {
  return (
    <div
      className="flex h-full min-h-[320px] w-full items-center justify-center rounded-[28px] border border-white/10 bg-black/25 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="text-center px-6">
        <span className="mx-auto mb-3 block h-8 w-8 rounded-full border-2 border-[#4ba3ff]/35 border-t-[#4ba3ff] animate-spin" />
        <p className="font-mono text-[11px] tracking-wider text-white/45 uppercase">{label}</p>
      </div>
    </div>
  );
}

/** Fallback 2D (mobile / reduced-motion / no WebGL) — panneau diagnostic. */
export function HeroDiagnosticCard() {
  return (
    <div className="relative h-full rounded-[28px] border border-white/10 bg-black/20 backdrop-blur-sm shadow-[0_30px_80px_rgb(0_0_0/35%)]">
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="ml-3 font-mono text-[11px] tracking-wider text-white/40">
          DIAGNOSTIC · TEMPS RÉEL
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-teal/20 px-2 py-0.5 text-[11px] font-semibold text-[#4ba3ff]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#4ba3ff]" />
          Prêt
        </span>
      </div>

      <div className="p-5 md:p-6 text-white">
        <p className="text-2xl md:text-[1.75rem] font-semibold leading-[1.55] tracking-tight text-balance">
          Précision technique,
          <br />
          langage clair.
        </p>
        <p className="mt-2 text-sm text-white/50">
          Lecture machine en temps réel — ce que voit le technicien.
        </p>

        <div className="mt-6 space-y-3">
          {[
            { label: "Santé SSD", value: 92, color: "#4ba3ff" },
            { label: "Température CPU", value: 68, color: "#5ec8ff" },
            { label: "Charge mémoire", value: 41, color: "#a8b4c4" },
            { label: "Score sécurité", value: 96, color: "#4ba3ff" },
          ].map((row, i) => (
            <div key={row.label}>
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="text-white/55">{row.label}</span>
                <span className="font-mono text-white/80">{row.value}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="hero-meter h-full rounded-full"
                  style={{
                    width: `${row.value}%`,
                    background: row.color,
                    animationDelay: `${180 + i * 140}ms`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2 border-t border-white/10 pt-5">
          {[
            ["PANNE", "Identifiée"],
            ["DEVIS", "Validé"],
            ["DÉLAI", "J+0"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-white/5 px-3 py-2.5 text-center">
              <p className="font-mono text-[10px] tracking-wider text-white/40">{k}</p>
              <p className="mt-0.5 text-sm font-semibold text-white/90">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
