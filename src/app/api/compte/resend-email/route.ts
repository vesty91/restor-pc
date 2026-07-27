import { fulfillToolOrder } from "@/lib/fulfillment";
import { getSupabaseAdmin } from "@/lib/fulfillment/supabase";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Renvoie le mail de livraison pour une commande du client connecte. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const body = (await request.json()) as { orderId?: string };
  const orderId = body.orderId?.trim();
  if (!orderId) {
    return NextResponse.json({ error: "orderId requis" }, { status: 400 });
  }

  const email = user.email.trim().toLowerCase();
  const sb = getSupabaseAdmin();
  const { data: order, error } = await sb
    .from("tool_orders")
    .select("id, order_ref, email, tool_slug, license_key, share_url, share_password")
    .eq("id", orderId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!order || order.email !== email) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }
  if (!order.license_key || !order.share_url || !order.share_password) {
    return NextResponse.json({ error: "Commande incomplete" }, { status: 400 });
  }

  try {
    const result = await fulfillToolOrder({
      email,
      toolSlug: order.tool_slug,
      orderRef: order.order_ref,
      source: "stripe",
      sendEmail: true,
      forceEmail: true,
    });
    if (result.emailError) {
      return NextResponse.json(
        {
          error:
            "Envoi refuse par le serveur mail (souvent DMARC / Outlook). Verifiez les DNS du domaine. Les acces restent visibles dans votre compte.",
          detail: result.emailError,
        },
        { status: 502 }
      );
    }
    return NextResponse.json({ ok: true, emailId: result.emailId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "erreur";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
