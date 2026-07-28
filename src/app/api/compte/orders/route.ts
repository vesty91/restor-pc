import { createRequestId, jsonError, publicErrorResponse } from "@/lib/errors";
import { getSupabaseAdmin } from "@/lib/fulfillment/supabase";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const requestId = createRequestId();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return jsonError("AUTH_REQUIRED", "Non authentifie.", 401, requestId);
  }

  const email = user.email.trim().toLowerCase();
  const sb = getSupabaseAdmin();

  const byUser = await sb
    .from("tool_orders")
    .select(
      "id, order_ref, source, email, user_id, tool_slug, tool_title, script_id, license_key, status, created_at, share_url, share_password, expire_times, email_sent_at, email_error, terms_version, withdrawal_consent_at"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  let orders = byUser.data;
  const error = byUser.error;

  if (error) {
    return publicErrorResponse(error, "ORDERS_FETCH_FAILED", requestId);
  }

  if (!orders?.length) {
    const legacy = await sb
      .from("tool_orders")
      .select(
        "id, order_ref, source, email, user_id, tool_slug, tool_title, script_id, license_key, status, created_at, share_url, share_password, expire_times, email_sent_at, email_error, terms_version, withdrawal_consent_at"
      )
      .is("user_id", null)
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(100);
    if (legacy.error) {
      return publicErrorResponse(legacy.error, "ORDERS_FETCH_FAILED", requestId);
    }
    orders = legacy.data ?? [];
  }

  const keys = [...new Set((orders ?? []).map((o) => o.license_key).filter(Boolean))];
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
    email,
    userId: user.id,
    orders: orders ?? [],
    licenses,
    requestId,
  });
}
