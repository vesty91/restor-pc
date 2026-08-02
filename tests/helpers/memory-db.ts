/**
 * Store Supabase en mémoire pour tests d’intégration fulfillment / webhook.
 * Reproduit claim_stripe_event, claim_tool_order et les chaînes from().select/update/insert.
 * Aucun appel réseau.
 */

export type MemoryRow = Record<string, unknown>;

type Filter =
  | { kind: "eq"; col: string; val: unknown }
  | { kind: "in"; col: string; val: unknown[] }
  | { kind: "is"; col: string; val: null }
  | { kind: "neq"; col: string; val: unknown };

function applyFilters(rows: MemoryRow[], filters: Filter[]): MemoryRow[] {
  return rows.filter((row) =>
    filters.every((f) => {
      if (f.kind === "eq") return row[f.col] === f.val;
      if (f.kind === "in") return f.val.includes(row[f.col]);
      if (f.kind === "is") return row[f.col] == null;
      if (f.kind === "neq") return row[f.col] !== f.val;
      return true;
    }),
  );
}

function pick(row: MemoryRow, columns: string | null): MemoryRow {
  if (!columns || columns === "*") return { ...row };
  const out: MemoryRow = {};
  for (const col of columns.split(",").map((c) => c.trim())) {
    out[col] = row[col];
  }
  return out;
}

export type MemoryDb = {
  tables: {
    stripe_events: MemoryRow[];
    tool_orders: MemoryRow[];
    script_licenses: MemoryRow[];
    stripe_payment_revocations: MemoryRow[];
  };
  client: ReturnType<typeof buildClient>;
  reset: () => void;
};

function buildClient(tables: MemoryDb["tables"]) {
  const rpc = async (
    name: string,
    args: Record<string, unknown>,
  ): Promise<{ data: unknown; error: { message: string; code?: string } | null }> => {
    if (name === "claim_stripe_event") {
      const id = String(args.p_id);
      const type = String(args.p_type);
      const existing = tables.stripe_events.find((e) => e.id === id);
      if (!existing) {
        tables.stripe_events.push({
          id,
          type,
          processing_status: "processing",
          result: null,
          error_code: null,
          processed_at: null,
          retry_count: 0,
          received_at: new Date().toISOString(),
        });
        return { data: true, error: null };
      }
      if (existing.result === "failed" || existing.processing_status === "failed") {
        existing.processing_status = "processing";
        existing.result = null;
        existing.processed_at = null;
        existing.error_code = null;
        existing.type = type;
        existing.retry_count = Number(existing.retry_count ?? 0) + 1;
        return { data: true, error: null };
      }
      return { data: false, error: null };
    }

    if (name === "claim_tool_order") {
      const orderId = String(args.p_order_id);
      const order = tables.tool_orders.find((o) => o.id === orderId);
      if (order && (order.status === "pending" || order.status === "failed")) {
        order.status = "processing";
        order.processing_started_at = new Date().toISOString();
        order.error_code = null;
        return { data: true, error: null };
      }
      return { data: false, error: null };
    }

    if (name === "claim_order_revocation") {
      const pi = String(args.p_payment_intent_id);
      let reason = String(args.p_reason) as "refunded" | "disputed";
      const eventId = args.p_stripe_event_id ? String(args.p_stripe_event_id) : null;
      const existing = tables.stripe_payment_revocations.find((r) => r.payment_intent_id === pi);
      if (existing) {
        if (existing.reason === "refunded" || reason === "refunded") {
          reason = "refunded";
        }
        existing.reason = reason;
        existing.stripe_event_id = eventId ?? existing.stripe_event_id;
        existing.updated_at = new Date().toISOString();
      } else {
        tables.stripe_payment_revocations.push({
          payment_intent_id: pi,
          reason,
          stripe_event_id: eventId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      const orders = tables.tool_orders.filter((o) => o.stripe_payment_intent_id === pi);
      const out = [];
      for (const o of orders) {
        const nextStatus =
          o.status === "refunded" ? "refunded" : reason === "refunded" ? "refunded" : reason;
        o.status = nextStatus;
        o.error_code = o.error_code ?? "STRIPE_REVOKED";
        if (o.license_key) {
          const lic = tables.script_licenses.find((l) => l.license_key === o.license_key);
          if (lic) lic.status = "revoked";
        }
        out.push({
          order_id: o.id,
          license_key: o.license_key ?? null,
          share_id: o.share_id ?? null,
          already_revoked: o.assets_revoked_at != null,
        });
      }
      return {
        data: {
          reason,
          payment_intent_id: pi,
          orders: out,
        },
        error: null,
      };
    }

    if (name === "mark_order_assets_revoked") {
      const orderId = String(args.p_order_id);
      const order = tables.tool_orders.find((o) => o.id === orderId);
      if (!order) return { data: false, error: null };
      order.assets_revoked_at = order.assets_revoked_at ?? new Date().toISOString();
      order.revoke_error = args.p_revoke_error ?? null;
      order.share_url = null;
      order.share_password = null;
      return { data: true, error: null };
    }

    if (name === "finalize_tool_order_fulfillment") {
      const orderId = String(args.p_order_id);
      const order = tables.tool_orders.find((o) => o.id === orderId);
      if (!order || order.status !== "processing") {
        return { data: false, error: null };
      }
      order.license_key = args.p_license_key;
      order.share_id = args.p_share_id;
      order.share_url = args.p_share_url;
      order.share_password = args.p_share_password;
      order.expire_times = args.p_expire_times;
      order.status = "fulfilled";
      order.fulfilled_at = new Date().toISOString();
      order.error_code = null;
      order.email_status = "pending";
      if (args.p_user_id) order.user_id = args.p_user_id;
      return { data: true, error: null };
    }

    return { data: null, error: { message: `rpc_unknown:${name}` } };
  };

  const from = (table: keyof MemoryDb["tables"] | string) => {
    const key = table as keyof MemoryDb["tables"];
    if (!(key in tables)) {
      throw new Error(`unknown table ${table}`);
    }

    const state: {
      filters: Filter[];
      columns: string | null;
      orderCol: string | null;
      ascending: boolean;
      limitN: number | null;
      mutate: MemoryRow | null;
      mode: "select" | "insert" | "update";
      insertRows: MemoryRow[];
    } = {
      filters: [],
      columns: null,
      orderCol: null,
      ascending: true,
      limitN: null,
      mutate: null,
      mode: "select",
      insertRows: [],
    };

    const api: Record<string, unknown> = {};

    const runSelect = () => {
      let rows = applyFilters(tables[key], state.filters).map((r) => pick(r, state.columns));
      if (state.orderCol) {
        const col = state.orderCol;
        rows = [...rows].sort((a, b) => {
          const av = String(a[col] ?? "");
          const bv = String(b[col] ?? "");
          return state.ascending ? av.localeCompare(bv) : bv.localeCompare(av);
        });
      }
      if (state.limitN != null) rows = rows.slice(0, state.limitN);
      return rows;
    };

    const finish = async () => {
      if (state.mode === "insert") {
        for (const row of state.insertRows) {
          if (key === "tool_orders") {
            if (tables.tool_orders.some((o) => o.order_ref === row.order_ref)) {
              return {
                data: null,
                error: { message: "duplicate order_ref", code: "23505" },
              };
            }
            if (!row.id) row.id = crypto.randomUUID();
          }
          if (key === "stripe_events") {
            if (tables.stripe_events.some((e) => e.id === row.id)) {
              return {
                data: null,
                error: { message: "duplicate event", code: "23505" },
              };
            }
          }
          if (key === "script_licenses") {
            if (tables.script_licenses.some((l) => l.license_key === row.license_key)) {
              return {
                data: null,
                error: { message: "duplicate license", code: "23505" },
              };
            }
            if (!row.id) row.id = crypto.randomUUID();
          }
          tables[key].push(row);
        }
        const selected = state.insertRows.map((r) => pick(r, state.columns));
        return { data: selected.length === 1 ? selected[0] : selected, error: null };
      }

      if (state.mode === "update") {
        const targets = applyFilters(tables[key], state.filters);
        for (const row of targets) {
          Object.assign(row, state.mutate);
        }
        const selected = targets.map((r) => pick(r, state.columns ?? "*"));
        return { data: selected.length === 1 ? selected[0] : selected, error: null };
      }

      const rows = runSelect();
      return { data: rows, error: null };
    };

    const thenable = {
      then(onfulfilled?: (v: unknown) => unknown, onrejected?: (e: unknown) => unknown) {
        return finish().then(onfulfilled, onrejected);
      },
      maybeSingle: async () => {
        const { data, error } = await finish();
        if (error) return { data: null, error };
        const rows = Array.isArray(data) ? data : data ? [data] : [];
        return { data: rows[0] ?? null, error: null };
      },
      single: async () => {
        const { data, error } = await finish();
        if (error) return { data: null, error };
        const rows = Array.isArray(data) ? data : data ? [data] : [];
        if (!rows[0]) {
          return {
            data: null,
            error: { message: "no rows", code: "PGRST116" },
          };
        }
        return { data: rows[0], error: null };
      },
    };

    const chain = (): typeof api => api;

    api.select = (columns?: string) => {
      if (state.mode === "insert" || state.mode === "update") {
        state.columns = columns ?? "*";
        return Object.assign(chain(), thenable);
      }
      state.mode = "select";
      state.columns = columns ?? "*";
      return Object.assign(chain(), thenable);
    };
    api.insert = (row: MemoryRow | MemoryRow[]) => {
      state.mode = "insert";
      state.insertRows = Array.isArray(row) ? row.map((r) => ({ ...r })) : [{ ...row }];
      return Object.assign(chain(), thenable);
    };
    api.update = (patch: MemoryRow) => {
      state.mode = "update";
      state.mutate = { ...patch };
      return Object.assign(chain(), thenable);
    };
    api.eq = (col: string, val: unknown) => {
      state.filters.push({ kind: "eq", col, val });
      return Object.assign(chain(), thenable);
    };
    api.neq = (col: string, val: unknown) => {
      state.filters.push({ kind: "neq", col, val });
      return Object.assign(chain(), thenable);
    };
    api.in = (col: string, val: unknown[]) => {
      state.filters.push({ kind: "in", col, val });
      return Object.assign(chain(), thenable);
    };
    api.is = (col: string, val: null) => {
      state.filters.push({ kind: "is", col, val });
      return Object.assign(chain(), thenable);
    };
    api.upsert = (row: MemoryRow | MemoryRow[], _opts?: { onConflict?: string }) => {
      const rows = Array.isArray(row) ? row : [row];
      for (const r of rows) {
        if (key === "stripe_payment_revocations") {
          const existing = tables.stripe_payment_revocations.find(
            (x) => x.payment_intent_id === r.payment_intent_id,
          );
          if (existing) {
            Object.assign(existing, r);
          } else {
            tables.stripe_payment_revocations.push({ ...r });
          }
        } else {
          tables[key].push({ ...r });
        }
      }
      return Object.assign(chain(), thenable);
    };
    api.order = (col: string, opts?: { ascending?: boolean }) => {
      state.orderCol = col;
      state.ascending = opts?.ascending !== false;
      return Object.assign(chain(), thenable);
    };
    api.limit = (n: number) => {
      state.limitN = n;
      return Object.assign(chain(), thenable);
    };

    return Object.assign(chain(), thenable);
  };

  return { from, rpc };
}

export function createMemoryDb(): MemoryDb {
  const tables: MemoryDb["tables"] = {
    stripe_events: [],
    tool_orders: [],
    script_licenses: [],
    stripe_payment_revocations: [],
  };

  return {
    tables,
    client: buildClient(tables),
    reset() {
      tables.stripe_events.length = 0;
      tables.tool_orders.length = 0;
      tables.script_licenses.length = 0;
      tables.stripe_payment_revocations.length = 0;
    },
  };
}
