/**
 * Backfill non destructif : associe tool_orders.user_id via email.
 * Mode dry-run par défaut. --apply pour écrire.
 *
 * Usage:
 *   npx tsx scripts/backfill-order-user-ids.ts
 *   npx tsx scripts/backfill-order-user-ids.ts --apply
 */
import { createClient } from "@supabase/supabase-js";

type Row = { id: string; email: string | null; user_id: string | null };

function env(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`Variable manquante: ${name}`);
  return v;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const url = env("SUPABASE_URL");
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  const sb = createClient(url, key, { auth: { persistSession: false } });

  const { data: orders, error } = await sb
    .from("tool_orders")
    .select("id, email, user_id")
    .is("user_id", null)
    .not("email", "is", null)
    .limit(2000);

  if (error) throw error;

  const report = {
    scanned: orders?.length ?? 0,
    matched: 0,
    ambiguous: 0,
    missing: 0,
    updated: 0,
    apply,
  };

  const byEmail = new Map<string, Row[]>();
  for (const o of (orders ?? []) as Row[]) {
    const email = (o.email || "").trim().toLowerCase();
    if (!email) continue;
    const list = byEmail.get(email) ?? [];
    list.push(o);
    byEmail.set(email, list);
  }

  for (const [email, rows] of byEmail) {
    const { data: users, error: uErr } = await sb.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (uErr) throw uErr;
    const matches = (users.users ?? []).filter((u) => (u.email || "").toLowerCase() === email);

    if (matches.length === 0) {
      report.missing += rows.length;
      continue;
    }
    if (matches.length > 1) {
      report.ambiguous += rows.length;
      console.info(JSON.stringify({ event: "ambiguous_email", emailHash: email.length }));
      continue;
    }

    const userId = matches[0].id;
    report.matched += rows.length;

    if (!apply) continue;

    for (const row of rows) {
      const { error: updErr } = await sb
        .from("tool_orders")
        .update({ user_id: userId })
        .eq("id", row.id)
        .is("user_id", null);
      if (updErr) throw updErr;
      report.updated += 1;
    }
  }

  console.info(JSON.stringify({ event: "backfill.report", ...report }, null, 2));
  if (!apply) {
    console.info("Dry-run only. Relancer avec --apply pour écrire.");
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : "backfill failed");
  process.exit(1);
});
