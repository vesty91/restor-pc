import { toast } from "sonner";

const MAX_LEN = 180;

/**
 * Nettoie un message toast : jamais de secrets ni détails techniques.
 */
export function sanitizeToastMessage(message: string, fallback = "Une erreur est survenue."): string {
  const raw = (message || "").trim();
  if (!raw) return fallback;

  const redacted = raw
    .replace(/\b(sk_(live|test)_[A-Za-z0-9]+)\b/gi, "[masqué]")
    .replace(/\b(Bearer\s+[A-Za-z0-9._-]+)\b/gi, "[masqué]")
    .replace(/\b(ATELIER_SECRET|SUPABASE_SERVICE_ROLE_KEY|STRIPE_SECRET_KEY)\b/gi, "[masqué]")
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, "[id]")
    .replace(/at\s+\S+\s+\(\S+:\d+:\d+\)/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!redacted || redacted.length < 2) return fallback;
  return redacted.slice(0, MAX_LEN);
}

type AsyncMessages<T> = {
  loading: string;
  success: string | ((data: T) => string);
  error?: string | ((err: unknown) => string);
};

export const notify = {
  success(message: string) {
    return toast.success(sanitizeToastMessage(message, "Opération réussie."));
  },
  info(message: string) {
    return toast.info(sanitizeToastMessage(message, "Information."));
  },
  warning(message: string) {
    return toast.warning(sanitizeToastMessage(message, "Attention."));
  },
  error(message: string) {
    return toast.error(sanitizeToastMessage(message));
  },
  /**
   * Opération asynchrone avec états loading / success / error.
   * Les messages d’erreur utilisateurs restent génériques.
   */
  async promise<T>(promise: Promise<T>, messages: AsyncMessages<T>) {
    return toast.promise(promise, {
      loading: sanitizeToastMessage(messages.loading, "Chargement…"),
      success: (data) =>
        sanitizeToastMessage(
          typeof messages.success === "function"
            ? messages.success(data)
            : messages.success,
          "Terminé."
        ),
      error: (err) => {
        if (typeof messages.error === "function") {
          return sanitizeToastMessage(messages.error(err));
        }
        if (typeof messages.error === "string") {
          return sanitizeToastMessage(messages.error);
        }
        return "L’opération a échoué. Réessayez.";
      },
    });
  },
};
