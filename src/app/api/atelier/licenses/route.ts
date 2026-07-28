import { requireTechnician } from "@/lib/auth/roles";
import { generateLicenseKey } from "@/lib/fulfillment/keys";
import { getSupabaseAdmin } from "@/lib/fulfillment/supabase";
import { AppError, createRequestId, jsonError, publicErrorResponse } from "@/lib/errors";
import {
  createLicenseSchema,
  deleteLicenseSchema,
  licensesListQuerySchema,
  patchLicenseSchema,
  publicZodMessage,
} from "@/lib/validation";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function sanitizeIlike(raw: string): string {
  return raw.replace(/[%_,.()\\]/g, "").slice(0, 64);
}

const LICENSE_SELECT =
  "id, license_key, script_id, status, note, created_at, expires_at, machine_id, machine_name, bios_serial, machine_bound_at, max_machines";

async function assertAtelier(): Promise<NextResponse | null> {
  try {
    await requireTechnician();
    return null;
  } catch (err) {
    if (err instanceof AppError) {
      return jsonError(err.code, err.publicMessage, err.status, createRequestId());
    }
    return jsonError("AUTH_REQUIRED", "Non authentifie.", 401, createRequestId());
  }
}

export async function GET(request: Request) {
  const requestId = createRequestId();
  const denied = await assertAtelier();
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const parsed = licensesListQuerySchema.safeParse({
    q: searchParams.get("q") ?? "",
    status: searchParams.get("status") ?? "",
    page: searchParams.get("page") ?? "1",
    pageSize: searchParams.get("pageSize") ?? "25",
  });
  if (!parsed.success) {
    return jsonError(
      "INVALID_QUERY",
      publicZodMessage(parsed.error, "Parametres invalides."),
      400,
      requestId
    );
  }

  const { q: rawQ, status, page, pageSize } = parsed.data;
  const q = sanitizeIlike(rawQ);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const sb = getSupabaseAdmin();
  let query = sb
    .from("script_licenses")
    .select(LICENSE_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status) query = query.eq("status", status);
  if (q) {
    query = query.or(
      `license_key.ilike.%${q}%,note.ilike.%${q}%,script_id.ilike.%${q}%,machine_name.ilike.%${q}%,bios_serial.ilike.%${q}%`
    );
  }

  const { data, error, count } = await query;
  if (error) {
    return publicErrorResponse(error, "LICENSES_FETCH_FAILED", requestId);
  }

  const total = count ?? 0;
  return NextResponse.json({
    licenses: data ?? [],
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
    requestId,
  });
}

export async function POST(request: Request) {
  const requestId = createRequestId();
  const denied = await assertAtelier();
  if (denied) return denied;

  try {
    const json = await request.json();
    const parsed = createLicenseSchema.safeParse(json);
    if (!parsed.success) {
      return jsonError(
        "INVALID_BODY",
        publicZodMessage(parsed.error, "Donnees invalides."),
        400,
        requestId
      );
    }

    const body = parsed.data;
    const licenseKey = (body.license_key || generateLicenseKey()).trim().toUpperCase();

    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("script_licenses")
      .insert({
        license_key: licenseKey,
        script_id: body.script_id,
        status: body.status,
        note: body.note || null,
        max_machines: body.max_machines,
      })
      .select(LICENSE_SELECT)
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
  const denied = await assertAtelier();
  if (denied) return denied;

  try {
    const json = await request.json();
    const parsed = patchLicenseSchema.safeParse(json);
    if (!parsed.success) {
      return jsonError(
        "INVALID_BODY",
        publicZodMessage(parsed.error, "Donnees invalides."),
        400,
        requestId
      );
    }

    const body = parsed.data;
    const patch: Record<string, unknown> = {};
    if (body.status !== undefined) patch.status = body.status;
    if (body.note !== undefined) patch.note = body.note || null;
    if (body.max_machines !== undefined) patch.max_machines = body.max_machines;
    if (body.script_id !== undefined) patch.script_id = body.script_id;
    if (body.resetMachine) {
      patch.machine_id = null;
      patch.machine_name = null;
      patch.bios_serial = null;
      patch.machine_bound_at = null;
    }

    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("script_licenses")
      .update(patch)
      .eq("id", body.id)
      .select(LICENSE_SELECT)
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
  const denied = await assertAtelier();
  if (denied) return denied;

  try {
    const json = await request.json();
    const parsed = deleteLicenseSchema.safeParse(json);
    if (!parsed.success) {
      return jsonError(
        "INVALID_BODY",
        publicZodMessage(parsed.error, "Donnees invalides."),
        400,
        requestId
      );
    }

    const { id } = parsed.data;
    const sb = getSupabaseAdmin();
    const { data: existing, error: getErr } = await sb
      .from("script_licenses")
      .select("id, status")
      .eq("id", id)
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

    const { error } = await sb.from("script_licenses").delete().eq("id", id);
    if (error) {
      return publicErrorResponse(error, "LICENSE_DELETE_FAILED", requestId);
    }
    return NextResponse.json({ ok: true, id, requestId });
  } catch (err) {
    return publicErrorResponse(err, "LICENSE_DELETE_FAILED", requestId);
  }
}
