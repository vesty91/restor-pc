import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Animata-inspired Receipt Skeleton — état de chargement commande.
 * Inspiration: Animata skeleton patterns (MIT) — implémentation Restor-PC via Skeleton unique.
 * Pas de second système de skeleton : délègue à `@/components/ui/skeleton`.
 */
export function ReceiptSkeleton({
  className,
  rows = 3,
}: {
  className?: string;
  rows?: number;
}) {
  return (
    <div
      className={cn("space-y-4", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Chargement des commandes…</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="rounded-[16px] border border-line bg-surface/50 p-4 md:p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-8 w-20" />
          </div>
          <Skeleton className="mt-3 h-20 w-full rounded-[12px]" />
        </div>
      ))}
    </div>
  );
}
