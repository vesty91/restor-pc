import { isAtelierAuthed } from "@/lib/atelier-auth";
import { generateLicenseKey } from "@/lib/fulfillment/keys";
import { getSupabaseAdmin } from "@/lib/fulfillment/supabase";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!(await isAtelierAuthed())) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ licenses: data ?? [] });
}

export async function POST(request: Request) {
  if (!(await isAtelierAuthed())) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
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
      return NextResponse.json({ error: "script_id requis" }, { status: 400 });
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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ license: data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "erreur";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAtelierAuthed())) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
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
      return NextResponse.json({ error: "id requis" }, { status: 400 });
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
      return NextResponse.json({ error: "rien a modifier" }, { status: 400 });
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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ license: data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "erreur";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAtelierAuthed())) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { id?: string };
    if (!body.id) {
      return NextResponse.json({ error: "id requis" }, { status: 400 });
    }

    const sb = getSupabaseAdmin();
    const { data: existing, error: getErr } = await sb
      .from("script_licenses")
      .select("id, status")
      .eq("id", body.id)
      .maybeSingle();

    if (getErr) {
      return NextResponse.json({ error: getErr.message }, { status: 500 });
    }
    if (!existing) {
      return NextResponse.json({ error: "Licence introuvable" }, { status: 404 });
    }
    if (existing.status !== "revoked") {
      return NextResponse.json(
        { error: "Seules les licences revoked peuvent etre supprimees" },
        { status: 400 }
      );
    }

    const { error } = await sb.from("script_licenses").delete().eq("id", body.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, id: body.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "erreur";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
