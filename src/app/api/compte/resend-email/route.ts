import { fulfillToolOrder } from "@/lib/fulfillment";
import { createRequestId, jsonError, publicErrorResponse } from "@/lib/errors";
import { getSupabaseAdmin } from "@/lib/fulfillment/supabase";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { publicZodMessage, resendOrderEmailSchema } from "@/lib/validation";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Renvoie le mail de livraison pour une commande du client connecte. */
export async function POST(request: Request) {
  const requestId = createRequestId();

  const limited = await enforceRateLimit({
    request,
    scope: "resend-email",
    limit: 5,
    windowMs: 30 * 60 * 1000,
  });
  if (!limited.ok) {
    return jsonError("RATE_LIMITED", "Trop de renvois. Reessayez plus tard.", 429, requestId);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return jsonError("AUTH_REQUIRED", "Non authentifie.", 401, requestId);
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return jsonError("INVALID_BODY", "Requete invalide.", 400, requestId);
  }

  const parsed = resendOrderEmailSchema.safeParse(json);
  if (!parsed.success) {
    return jsonError(
      "INVALID_BODY",
      publicZodMessage(parsed.error, "Commande manquante."),
      400,
      requestId,
    );
  }

  const orderId = parsed.data.orderId;
  const email = user.email.trim().toLowerCase();
  const sb = getSupabaseAdmin();
  const { data: order, error } = await sb
    .from("tool_orders")
    .select("id, order_ref, email, user_id, tool_slug, license_key, share_url, share_password")
    .eq("id", orderId)
    .maybeSingle();

  if (error) {
    return publicErrorResponse(error, "ORDER_LOOKUP_FAILED", requestId);
  }

  const owns = order && (order.user_id === user.id || (!order.user_id && order.email === email));

  if (!owns || !order) {
    return jsonError("ORDER_NOT_FOUND", "Commande introuvable.", 404, requestId);
  }
  if (!order.license_key || !order.share_url || !order.share_password) {
    return jsonError("ORDER_INCOMPLETE", "Commande encore en preparation.", 400, requestId);
  }

  try {
    const result = await fulfillToolOrder({
      email,
      toolSlug: order.tool_slug,
      orderRef: order.order_ref,
      source: "stripe",
      sendEmail: true,
      forceEmail: true,
      userId: user.id,
    });
    if (result.emailError) {
      return jsonError(
        "EMAIL_SEND_FAILED",
        "Envoi refuse par le serveur mail. Les acces restent visibles dans votre compte.",
        502,
        requestId,
      );
    }
    return NextResponse.json({ ok: true, emailId: result.emailId, requestId });
  } catch (err) {
    return publicErrorResponse(err, "RESEND_FAILED", requestId);
  }
}
