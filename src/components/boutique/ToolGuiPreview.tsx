import type { OutilPreviewKind } from "@/lib/data/outils-details";
import { cn } from "@/lib/utils";

const panels: Record<
  OutilPreviewKind,
  { eyebrow: string; rows: Array<{ label: string; value: string }> }
> = {
  dns: {
    eyebrow: "DNS",
    rows: [
      { label: "Fournisseur", value: "Cloudflare 1.1.1.1" },
      { label: "Adaptateurs", value: "Ethernet · Wi‑Fi" },
      { label: "Action", value: "Appliquer DNS" },
    ],
  },
  network: {
    eyebrow: "Réseau",
    rows: [
      { label: "État", value: "Profils / partages" },
      { label: "Sauvegarde", value: "Documents\\Restor-PC" },
      { label: "Action", value: "Exporter · Restaurer" },
    ],
  },
  battery: {
    eyebrow: "Batterie",
    rows: [
      { label: "Conception", value: "53 000 mWh" },
      { label: "Actuelle", value: "38 200 mWh" },
      { label: "Verdict", value: "À surveiller" },
    ],
  },
  storage: {
    eyebrow: "Stockage",
    rows: [
      { label: "Source", value: "ISO / pilotes / dossiers" },
      { label: "Cible", value: "USB · dossier local" },
      { label: "Action", value: "Exporter · Préparer" },
    ],
  },
  system: {
    eyebrow: "Système",
    rows: [
      { label: "Mode", value: "Analyse · Correction" },
      { label: "Rapport", value: "HTML inclus" },
      { label: "Action", value: "Lancer" },
    ],
  },
  data: {
    eyebrow: "Données",
    rows: [
      { label: "Cible", value: "Profils · inventaire" },
      { label: "Sortie", value: "Dossier / USB" },
      { label: "Action", value: "Exporter" },
    ],
  },
  install: {
    eyebrow: "Installateur",
    rows: [
      { label: "Paquets", value: "Sélection atelier" },
      { label: "Réseau", value: "Téléchargement" },
      { label: "Action", value: "Installer" },
    ],
  },
  speed: {
    eyebrow: "Speedtest",
    rows: [
      { label: "IPv4", value: "↓ 412 · ↑ 98 Mbps" },
      { label: "IPv6", value: "↓ 387 · ↑ 91 Mbps" },
      { label: "Export", value: "CSV + HTML" },
    ],
  },
  pack: {
    eyebrow: "Pack × 17",
    rows: [
      { label: "Contenu", value: "Tous les outils LIVRAISON" },
      { label: "Licence", value: "1 PC (pack)" },
      { label: "Guides", value: "HTML + PDF" },
    ],
  },
  generic: {
    eyebrow: "Restor-PC",
    rows: [
      { label: "Interface", value: "GUI Windows" },
      { label: "Licence", value: "1 PC" },
      { label: "Guide", value: "Inclus" },
    ],
  },
};

/** Aperçu type capture d’écran GUI (mock fidèle à l’esprit des outils WPF). */
export function ToolGuiPreview({
  title,
  kind,
  exe,
  className,
}: {
  title: string;
  kind: OutilPreviewKind;
  exe?: string;
  className?: string;
}) {
  const panel = panels[kind] ?? panels.generic;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[18px] border border-line bg-[#0b1220] shadow-[var(--shadow-lift)]",
        className
      )}
      aria-hidden
    >
      <div className="flex items-center gap-2 border-b border-white/10 bg-[#121a28] px-3 py-2.5">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 truncate text-xs text-white/55">{exe || `${title}.exe`}</span>
      </div>
      <div className="relative min-h-[220px] bg-[radial-gradient(900px_280px_at_10%_-20%,rgba(0,96,203,0.35),transparent_55%),linear-gradient(180deg,#0f1a2c,#0a1220)] p-5 md:p-6">
        <div className="rounded-[14px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#4ba3ff]">
                Restor-PC · {panel.eyebrow}
              </p>
              <p className="mt-1 font-display text-lg text-white tracking-tight">{title}</p>
            </div>
            <span className="rounded-md bg-[#0060cb]/20 px-2 py-1 text-[10px] font-semibold text-[#7cc0ff]">
              GUI
            </span>
          </div>
          <dl className="mt-4 space-y-2.5">
            {panel.rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-3 rounded-[10px] border border-white/8 bg-black/20 px-3 py-2"
              >
                <dt className="text-xs text-white/45">{row.label}</dt>
                <dd className="truncate text-right text-sm text-white/90">{row.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex gap-2">
            <span className="inline-flex h-9 flex-1 items-center justify-center rounded-[10px] bg-[#0060cb] text-sm font-semibold text-white">
              {panel.rows[2]?.value?.split("·")[0]?.trim() || "Lancer"}
            </span>
            <span className="inline-flex h-9 items-center justify-center rounded-[10px] border border-white/15 px-3 text-sm text-white/70">
              Journal
            </span>
          </div>
        </div>
        <p className="mt-3 text-center text-[10px] text-white/35">
          Aperçu d’interface · l’EXE réel suit le guide inclus
        </p>
      </div>
    </div>
  );
}
