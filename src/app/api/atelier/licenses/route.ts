import { isAtelierAuthed } from "@/lib/atelier-auth";
import { generateLicenseKey } from "@/lib/fulfillment/keys";
import { getSupabaseAdmin } from "@/lib/fulfillment/supabase";
import { createRequestId, jsonError, publicErrorResponse } from "@/lib/errors";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function sanitizeIlike(raw: string): string {
  return raw.replace(/[%_,.()\\]/g, "").slice(0, 64);
}

export async function GET(request: Request) {
  const requestId = createRequestId();
  if (!(await isAtelierAuthed())) {
    return jsonError("AUTH_REQUIRED", "Non authentifie.", 401, requestId);
  }

  const { searchParams } = new URL(request.url);
  const q = sanitizeIlike(searchParams.get("q")?.trim() || "");
  const status = searchParams.get("status")?.trim() || "";

  const sb = getSupabaseAdmin();
  let query = sb
    .from("script_licenses")
    .select(
      "id, license_key, script_id, status, note, created_at, expires_at, machine_id, machine_name, bios_serial, machine_bound_at, max_machines"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (status) query = query.eq("status", status);
  if (q) {
    query = query.or(
      `license_key.ilike.%${q}%,note.ilike.%${q}%,script_id.ilike.%${q}%,machine_name.ilike.%${q}%,bios_serial.ilike.%${q}%`
    );
  }

  const { data, error } = await query;
  if (error) {
    return publicErrorResponse(error, "LICENSES_FETCH_FAILED", requestId);
  }
  return NextResponse.json({ licenses: data ?? [], requestId });
}

export async function POST(request: Request) {
  const requestId = createRequestId();
  if (!(await isAtelierAuthed())) {
    return jsonError("AUTH_REQUIRED", "Non authentifie.", 401, requestId);
  }

  try {
    const body = (await request.json()) as {
      script_id?: string;
      note?: string;
      max_machines?: number;
      status?: string;
      license_key?: string;
    };

    const scriptId = (body.script_id || "").trim();
    if (!scriptId) {
      return jsonError("MISSING_SCRIPT_ID", "script_id requis.", 400, requestId);
    }

    const licenseKey = (body.license_key || generateLicenseKey()).trim().toUpperCase();
    const maxMachines =
      typeof body.max_machines === "number" ? body.max_machines : 1;
    const status = body.status?.trim() || "active";

    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("script_licenses")
      .insert({
        license_key: licenseKey,
        script_id: scriptId,
        status,
        note: body.note?.trim() || null,
        max_machines: maxMachines,
      })
      .select(
        "id, license_key, script_id, status, note, created_at, expires_at, machine_id, machine_name, bios_serial, machine_bound_at, max_machines"
      )
      .single();

    if (error) {
      return publicErrorResponse(error, "LICENSE_CREATE_FAILED", requestId);
    }
    return NextResponse.json({ license: data, requestId });
  } catch (err) {
    return publicErrorResponse(err, "LICENSE_CREATE_FAILED", requestId);
  }
}

export async function PATCH(request: Request) {
  const requestId = createRequestId();
  if (!(await isAtelierAuthed())) {
    return jsonError("AUTH_REQUIRED", "Non authentifie.", 401, requestId);
  }

  try {
    const body = (await request.json()) as {
      id?: string;
      status?: string;
      note?: string;
      max_machines?: number;
      script_id?: string;
      resetMachine?: boolean;
    };

    if (!body.id) {
      return jsonError("MISSING_ID", "id requis.", 400, requestId);
    }

    const patch: Record<string, unknown> = {};
    if (typeof body.status === "string") patch.status = body.status.trim();
    if (typeof body.note === "string") patch.note = body.note.trim() || null;
    if (typeof body.max_machines === "number") patch.max_machines = body.max_machines;
    if (typeof body.script_id === "string" && body.script_id.trim()) {
      patch.script_id = body.script_id.trim();
    }
    if (body.resetMachine) {
      patch.machine_id = null;
      patch.machine_name = null;
      patch.bios_serial = null;
      patch.machine_bound_at = null;
    }

    if (Object.keys(patch).length === 0) {
      return jsonError("NO_CHANGES", "Rien a modifier.", 400, requestId);
    }

    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("script_licenses")
      .update(patch)
      .eq("id", body.id)
      .select(
        "id, license_key, script_id, status, note, created_at, expires_at, machine_id, machine_name, bios_serial, machine_bound_at, max_machines"
      )
      .single();

    if (error) {
      return publicErrorResponse(error, "LICENSE_UPDATE_FAILED", requestId);
    }
    return NextResponse.json({ license: data, requestId });
  } catch (err) {
    return publicErrorResponse(err, "LICENSE_UPDATE_FAILED", requestId);
  }
}

export async function DELETE(request: Request) {
  const requestId = createRequestId();
  if (!(await isAtelierAuthed())) {
    return jsonError("AUTH_REQUIRED", "Non authentifie.", 401, requestId);
  }

  try {
    const body = (await request.json()) as { id?: string };
    if (!body.id) {
      return jsonError("MISSING_ID", "id requis.", 400, requestId);
    }

    const sb = getSupabaseAdmin();
    const { data: existing, error: getErr } = await sb
      .from("script_licenses")
      .select("id, status")
      .eq("id", body.id)
      .maybeSingle();

    if (getErr) {
      return publicErrorResponse(getErr, "LICENSE_LOOKUP_FAILED", requestId);
    }
    if (!existing) {
      return jsonError("NOT_FOUND", "Licence introuvable.", 404, requestId);
    }
    if (existing.status !== "revoked") {
      return jsonError(
        "NOT_REVOKED",
        "Seules les licences revoked peuvent etre supprimees.",
        400,
        requestId
      );
    }

    const { error } = await sb.from("script_licenses").delete().eq("id", body.id);
    if (error) {
      return publicErrorResponse(error, "LICENSE_DELETE_FAILED", requestId);
    }
    return NextResponse.json({ ok: true, id: body.id, requestId });
  } catch (err) {
    return publicErrorResponse(err, "LICENSE_DELETE_FAILED", requestId);
  }
}
