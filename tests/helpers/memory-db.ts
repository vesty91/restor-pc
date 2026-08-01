/**
 * Store Supabase en mémoire pour tests d’intégration fulfillment / webhook.
 * Reproduit claim_stripe_event, claim_tool_order et les chaînes from().select/update/insert.
 * Aucun appel réseau.
 */

export type MemoryRow = Record<string, unknown>;

type Filter =
  | { kind: "eq"; col: string; val: unknown }
  | { kind: "in"; col: string; val: unknown[] }
  | { kind: "is"; col: string; val: null };

function applyFilters(rows: MemoryRow[], filters: Filter[]): MemoryRow[] {
  return rows.filter((row) =>
    filters.every((f) => {
      if (f.kind === "eq") return row[f.col] === f.val;
      if (f.kind === "in") return f.val.includes(row[f.col]);
      if (f.kind === "is") return row[f.col] == null;
      return true;
    })
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
  };
  client: ReturnType<typeof buildClient>;
  reset: () => void;
};

function buildClient(tables: MemoryDb["tables"]) {
  const rpc = async (
    name: string,
    args: Record<string, unknown>
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
      let rows = applyFilters(tables[key], state.filters).map((r) =>
        pick(r, state.columns)
      );
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
            if (
              tables.script_licenses.some((l) => l.license_key === row.license_key)
            ) {
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
      then(
        onfulfilled?: (v: unknown) => unknown,
        onrejected?: (e: unknown) => unknown
      ) {
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
      state.insertRows = Array.isArray(row)
        ? row.map((r) => ({ ...r }))
        : [{ ...row }];
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
    api.in = (col: string, val: unknown[]) => {
      state.filters.push({ kind: "in", col, val });
      return Object.assign(chain(), thenable);
    };
    api.is = (col: string, val: null) => {
      state.filters.push({ kind: "is", col, val });
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
  };

  return {
    tables,
    client: buildClient(tables),
    reset() {
      tables.stripe_events.length = 0;
      tables.tool_orders.length = 0;
      tables.script_licenses.length = 0;
    },
  };
}
