import { createRequestId, jsonError, publicErrorResponse } from "@/lib/errors";
import { getSupabaseAdmin } from "@/lib/fulfillment/supabase";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Liste les commandes du client connecté.
 * Autorisation uniquement par user_id (jamais par email seul).
 */
export async function GET() {
  const requestId = createRequestId();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return jsonError("AUTH_REQUIRED", "Non authentifie.", 401, requestId);
  }

  const sb = getSupabaseAdmin();

  const { data: orders, error } = await sb
    .from("tool_orders")
    .select(
      "id, order_ref, source, email, user_id, tool_slug, tool_title, script_id, license_key, status, created_at, share_url, share_password, expire_times, email_sent_at, email_error, terms_version, withdrawal_consent_at"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return publicErrorResponse(error, "ORDERS_FETCH_FAILED", requestId);
  }

  const keys = [
    ...new Set((orders ?? []).map((o) => o.license_key).filter(Boolean)),
  ];
  let licenses: Array<{
    license_key: string;
    script_id: string;
    status: string;
    machine_id: string | null;
    machine_name: string | null;
    bios_serial: string | null;
    machine_bound_at: string | null;
    max_machines: number | null;
  }> = [];

  if (keys.length > 0) {
    const { data: licRows } = await sb
      .from("script_licenses")
      .select(
        "license_key, script_id, status, machine_id, machine_name, bios_serial, machine_bound_at, max_machines"
      )
      .in("license_key", keys);
    licenses = licRows ?? [];
  }

  return NextResponse.json({
    email: user.email ?? null,
    userId: user.id,
    orders: orders ?? [],
    licenses,
    requestId,
  });
}
