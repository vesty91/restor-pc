import { cn } from "@/lib/utils";

/**
 * Animata Storage Status — adapté Restor-PC.
 * Source: https://animata.design/docs/widget/storage-status (MIT, codse/animata)
 * Usage: illustration pédagogique NAS / sauvegarde — jamais présenté comme télémétrie live.
 */

export type StorageSection = {
  label: string;
  value: number;
  color: string;
  stretch?: boolean;
};

function Section({
  label,
  value,
  color,
  total,
  stretch,
}: StorageSection & { total: number }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div
      className={cn(
        "relative w-full rounded-md transition-[height] duration-500 motion-reduce:transition-none",
        color,
        stretch && "flex-1 text-ink-muted"
      )}
      style={{ height: `${Math.max(pct, 8)}%` }}
      title={`${label} : ${value} Go`}
    >
      <div className="flex h-full w-full items-center justify-center px-1 text-center text-xs font-semibold text-white/90">
        {label}
      </div>
    </div>
  );
}

export function StorageStatus({
  totalGb = 512,
  used,
  className,
  caption = "Illustration pédagogique — pas une lecture temps réel",
}: {
  totalGb?: number;
  used: Omit<StorageSection, "stretch">[];
  className?: string;
  caption?: string;
}) {
  const usedSum = used.reduce((acc, item) => acc + item.value, 0);
  const free = Math.max(0, totalGb - usedSum);
  const items: StorageSection[] = [
    {
      stretch: true,
      label: "Libre",
      value: free,
      color: "bg-surface-2 text-ink-muted",
    },
    ...used.map((u) => ({ ...u })),
  ];

  return (
    <figure className={cn("w-full max-w-[9rem]", className)}>
      <div
        className="group/storage flex h-72 w-full flex-col gap-1 rounded-xl border border-line bg-panel p-1 text-panel-fg"
        role="img"
        aria-label={`Répartition illustrative du stockage : ${usedSum} Go utilisés sur ${totalGb} Go`}
      >
        {items.map((item) => (
          <Section key={item.label} {...item} total={totalGb} />
        ))}
      </div>
      <figcaption className="mt-2 text-[11px] leading-snug text-ink-muted">
        {caption}
      </figcaption>
    </figure>
  );
}
