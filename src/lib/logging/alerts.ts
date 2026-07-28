import { logEvent } from "@/lib/logging/logger";

type AlertPayload = {
  event: string;
  level?: "info" | "warn" | "error";
  message: string;
  fields?: Record<string, unknown>;
};

/**
 * Alerte optionnelle (webhook interne).
 * Configurer ALERT_WEBHOOK_URL — sinon no-op.
 */
export async function sendAlert(payload: AlertPayload): Promise<void> {
  const url = process.env.ALERT_WEBHOOK_URL?.trim();
  logEvent(payload.level ?? "warn", payload.event, {
    message: payload.message,
    ...payload.fields,
  });
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "restor-pc",
        timestamp: new Date().toISOString(),
        ...payload,
      }),
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    logEvent("error", "alert.delivery_failed", { event: payload.event });
  }
}
