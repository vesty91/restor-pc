import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock3,
  Download,
  KeyRound,
  Loader2,
  RefreshCcw,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusBadgeStatus =
  | "pending"
  | "processing"
  | "fulfilled"
  | "failed"
  | "refunded"
  | "cancelled"
  | "active"
  | "revoked"
  | "expired"
  | "download_ready"
  | "urgent"
  | "admin";

type StatusMeta = {
  label: string;
  variant: "default" | "secondary" | "outline" | "success" | "warning" | "danger" | "muted" | "info";
  icon: LucideIcon;
  description: string;
  className?: string;
};

/**
 * Mapping centralisé des statuts métier Restor-PC.
 * Ne pas dupliquer couleurs / libellés ailleurs.
 */
export const STATUS_BADGE_MAP: Record<StatusBadgeStatus, StatusMeta> = {
  pending: {
    label: "En attente",
    variant: "warning",
    icon: Clock3,
    description: "Paiement ou traitement en attente",
  },
  processing: {
    label: "En cours",
    variant: "info",
    icon: Loader2,
    description: "Traitement en cours",
  },
  fulfilled: {
    label: "Confirmé",
    variant: "success",
    icon: CheckCircle2,
    description: "Commande honorée / paiement confirmé",
  },
  failed: {
    label: "Échec",
    variant: "danger",
    icon: Ban,
    description: "Échec de traitement",
  },
  refunded: {
    label: "Remboursé",
    variant: "secondary",
    icon: RefreshCcw,
    description: "Commande remboursée",
  },
  cancelled: {
    label: "Annulé",
    variant: "muted",
    icon: Ban,
    description: "Commande annulée",
  },
  active: {
    label: "Licence active",
    variant: "success",
    icon: KeyRound,
    description: "Licence active",
  },
  revoked: {
    label: "Révoquée",
    variant: "danger",
    icon: Ban,
    description: "Licence révoquée",
  },
  expired: {
    label: "Licence expirée",
    variant: "danger",
    icon: AlertTriangle,
    description: "Licence expirée",
  },
  download_ready: {
    label: "Téléchargement dispo",
    variant: "info",
    icon: Download,
    description: "Fichier disponible au téléchargement",
  },
  urgent: {
    label: "Urgent",
    variant: "danger",
    icon: ShieldAlert,
    description: "Intervention urgente",
  },
  admin: {
    label: "Admin",
    variant: "outline",
    icon: ShieldAlert,
    description: "Statut administrateur",
  },
};

/** Normalise un statut brut (API / Stripe / licences) vers une clé connue. */
export function resolveStatusBadgeStatus(
  raw: string | null | undefined
): StatusBadgeStatus | null {
  if (!raw) return null;
  const key = raw.trim().toLowerCase().replace(/\s+/g, "_");
  const aliases: Record<string, StatusBadgeStatus> = {
    pending: "pending",
    processing: "processing",
    fulfilled: "fulfilled",
    complete: "fulfilled",
    completed: "fulfilled",
    paid: "fulfilled",
    failed: "failed",
    refunded: "refunded",
    cancelled: "cancelled",
    canceled: "cancelled",
    active: "active",
    revoked: "revoked",
    expired: "expired",
    inactive: "expired",
    download_ready: "download_ready",
    download: "download_ready",
    urgent: "urgent",
    admin: "admin",
  };
  return aliases[key] ?? null;
}

export function StatusBadge({
  status,
  className,
  showIcon = true,
}: {
  status: StatusBadgeStatus | string;
  className?: string;
  showIcon?: boolean;
}) {
  const resolved =
    (status in STATUS_BADGE_MAP
      ? (status as StatusBadgeStatus)
      : resolveStatusBadgeStatus(status)) ?? null;

  if (!resolved) {
    return (
      <Badge variant="muted" className={className} title={String(status)}>
        {status || "—"}
      </Badge>
    );
  }

  const meta = STATUS_BADGE_MAP[resolved];
  const Icon = meta.icon;

  return (
    <Badge
      variant={meta.variant}
      className={cn(meta.className, className)}
      title={meta.description}
      aria-label={meta.description}
    >
      {showIcon ? (
        <Icon
          className={cn(
            "size-3",
            resolved === "processing" && "motion-safe:animate-spin"
          )}
          aria-hidden
        />
      ) : null}
      {meta.label}
    </Badge>
  );
}
