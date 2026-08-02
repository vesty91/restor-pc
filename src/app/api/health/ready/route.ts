import { createRequestId, jsonError } from "@/lib/errors";
import { getSupabaseAdmin } from "@/lib/fulfillment/supabase";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Readiness check (limité).
 * Protégé par header x-health-token === HEALTH_READY_TOKEN si défini,
 * sinon accessible uniquement hors production.
 */
export async function GET(request: Request) {
  const requestId = createRequestId();
  const token = process.env.HEALTH_READY_TOKEN?.trim();
  const provided = request.headers.get("x-health-token");

  if (token) {
    if (!provided || provided !== token) {
      return jsonError("FORBIDDEN", "Acces refuse.", 403, requestId);
    }
  } else if (process.env.NODE_ENV === "production") {
    return jsonError("NOT_CONFIGURED", "Endpoint ready non configure.", 503, requestId);
  }

  let db = "unknown";
  try {
    const sb = getSupabaseAdmin();
    const { error } = await sb.from("tool_orders").select("id").limit(1);
    db = error ? "error" : "ok";
  } catch {
    db = "error";
  }

  const ready = db === "ok";
  return NextResponse.json(
    {
      status: ready ? "ready" : "degraded",
      checks: { app: "ok", database: db },
      timestamp: new Date().toISOString(),
      requestId,
    },
    { status: ready ? 200 : 503 },
  );
}
