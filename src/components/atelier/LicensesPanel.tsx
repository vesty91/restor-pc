"use client";

import { DataTable } from "@/components/restor-pc/data-table";
import { StatusBadge } from "@/components/restor-pc/status-badge";
import { Button } from "@/components/ui/Button";
import { getAllProducts } from "@/lib/data/outils";
import { notify } from "@/lib/toast";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

export type LicenseRow = {
  id: string;
  license_key: string;
  script_id: string;
  status: string;
  note: string | null;
  created_at: string;
  expires_at: string | null;
  machine_id: string | null;
  machine_name: string | null;
  bios_serial: string | null;
  machine_bound_at: string | null;
  max_machines: number | null;
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function MachineCell({
  machineId,
  machineName,
  biosSerial,
  boundAt,
}: {
  machineId: string | null;
  machineName: string | null;
  biosSerial: string | null;
  boundAt: string | null;
}) {
  const [copied, setCopied] = useState(false);

  if (!machineId) {
    return <span className="text-ink-muted">non lié</span>;
  }

  const boundId = machineId;

  async function copyId() {
    try {
      await navigator.clipboard.writeText(boundId);
      setCopied(true);
      notify.success("Empreinte copiée.");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      notify.error("Impossible de copier.");
    }
  }

  return (
    <div className="min-w-[160px] space-y-1 whitespace-normal text-xs">
      <p className="text-ink">
        <span className="text-ink-muted">Nom :</span>{" "}
        <span className="font-medium">{machineName || "—"}</span>
      </p>
      <p className="text-ink">
        <span className="text-ink-muted">SN BIOS :</span>{" "}
        <span className="font-medium">{biosSerial || "—"}</span>
      </p>
      <div className="flex flex-wrap items-center gap-2 pt-0.5">
        <button
          type="button"
          onClick={() => void copyId()}
          title={boundId}
          className="text-[11px] font-semibold text-teal underline underline-offset-2"
        >
          {copied ? "ID copié" : "Copier l’empreinte"}
        </button>
        <span className="text-[11px] text-ink-muted">{formatDate(boundAt)}</span>
      </div>
    </div>
  );
}

export function LicensesPanel({ authed }: { authed: boolean }) {
  const products = useMemo(() => getAllProducts(), []);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [rows, setRows] = useState<LicenseRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });

  const [scriptId, setScriptId] = useState(products[0]?.scriptId ?? "change-dns");
  const [note, setNote] = useState("");
  const [maxMachines, setMaxMachines] = useState(1);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (statusFilter) params.set("status", statusFilter);
      params.set("page", String(pagination.pageIndex + 1));
      params.set("pageSize", String(pagination.pageSize));
      const res = await fetch(`/api/atelier/licenses?${params}`);
      const data = (await res.json()) as {
        licenses?: LicenseRow[];
        total?: number;
        pageCount?: number;
        error?: string;
        requestId?: string;
      };
      if (!res.ok) {
        const msg = data.error || "Chargement impossible";
        setError(msg);
        notify.apiError({ error: msg, requestId: data.requestId });
        return;
      }
      setRows(data.licenses || []);
      setTotal(data.total ?? data.licenses?.length ?? 0);
      setPageCount(data.pageCount ?? 1);
    } catch {
      setError("Erreur réseau");
      notify.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }, [q, statusFilter, pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    if (!authed) return;
    const id = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(id);
  }, [authed, load]);

  async function patch(id: string, body: Record<string, unknown>) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch("/api/atelier/licenses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...body }),
      });
      const data = (await res.json()) as {
        license?: LicenseRow;
        error?: string;
        requestId?: string;
      };
      if (!res.ok) {
        const msg = data.error || "Modification échouée";
        setError(msg);
        notify.apiError({ error: msg, requestId: data.requestId });
        return;
      }
      if (data.license) {
        setRows((prev) => prev.map((r) => (r.id === id ? data.license! : r)));
        notify.success("Licence mise à jour.");
      }
    } catch {
      setError("Erreur réseau");
      notify.error("Erreur réseau");
    } finally {
      setBusyId(null);
    }
  }

  async function removeRevoked(id: string, key: string) {
    if (!window.confirm(`Supprimer définitivement la licence révoquée\n${key} ?`)) {
      return;
    }
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch("/api/atelier/licenses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = (await res.json()) as { error?: string; requestId?: string };
      if (!res.ok) {
        const msg = data.error || "Suppression échouée";
        setError(msg);
        notify.apiError({ error: msg, requestId: data.requestId });
        return;
      }
      setRows((prev) => prev.filter((r) => r.id !== id));
      setTotal((t) => Math.max(0, t - 1));
      notify.success("Licence supprimée.");
    } catch {
      setError("Erreur réseau");
      notify.error("Erreur réseau");
    } finally {
      setBusyId(null);
    }
  }

  async function createLicense() {
    setCreating(true);
    setError(null);
    try {
      await notify.promise(
        (async () => {
          const res = await fetch("/api/atelier/licenses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              script_id: scriptId,
              note,
              max_machines: maxMachines,
            }),
          });
          const data = (await res.json()) as { license?: LicenseRow; error?: string };
          if (!res.ok) {
            throw new Error(data.error || "Création échouée");
          }
          if (data.license) {
            setPagination((p) => ({ ...p, pageIndex: 0 }));
            setNote("");
            setRows((prev) => [data.license!, ...prev].slice(0, pagination.pageSize));
            setTotal((t) => t + 1);
          }
          return data.license;
        })(),
        {
          loading: "Création de la licence…",
          success: "Licence créée.",
          error: (err) => (err instanceof Error ? err.message : "Création échouée"),
        },
      );
    } catch {
      /* toast déjà affiché */
    } finally {
      setCreating(false);
    }
  }

  const columns = useMemo<ColumnDef<LicenseRow>[]>(
    () => [
      {
        accessorKey: "license_key",
        header: "Clé",
        cell: ({ row }) => (
          <div className="whitespace-normal">
            <code className="text-xs font-semibold text-ink">{row.original.license_key}</code>
            <p className="mt-1 text-[11px] text-ink-muted">{formatDate(row.original.created_at)}</p>
          </div>
        ),
      },
      {
        accessorKey: "script_id",
        header: "Script",
        cell: ({ row }) => (
          <div className="whitespace-normal">
            <code className="text-xs">{row.original.script_id}</code>
            <p className="mt-1 text-[11px] text-ink-muted">
              max {row.original.max_machines === 0 ? "∞" : (row.original.max_machines ?? 1)}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Statut",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "machine",
        header: "PC",
        enableSorting: false,
        cell: ({ row }) => (
          <MachineCell
            machineId={row.original.machine_id}
            machineName={row.original.machine_name}
            biosSerial={row.original.bios_serial}
            boundAt={row.original.machine_bound_at}
          />
        ),
      },
      {
        accessorKey: "note",
        header: "Note",
        cell: ({ row }) => (
          <span className="line-clamp-3 max-w-[180px] whitespace-normal text-xs text-ink-muted">
            {row.original.note || "—"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex flex-wrap items-center gap-1.5 whitespace-normal">
              {r.status === "active" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={busyId === r.id}
                  onClick={() => void patch(r.id, { status: "revoked" })}
                >
                  Révoquer
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={busyId === r.id}
                  onClick={() => void patch(r.id, { status: "active" })}
                >
                  Réactiver
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={busyId === r.id || !r.machine_id}
                onClick={() => void patch(r.id, { resetMachine: true })}
              >
                Reset PC
              </Button>
              {r.status === "revoked" ? (
                <button
                  type="button"
                  title="Supprimer définitivement"
                  aria-label={`Supprimer ${r.license_key}`}
                  disabled={busyId === r.id}
                  onClick={() => void removeRevoked(r.id, r.license_key)}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950/40"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              ) : null}
            </div>
          );
        },
      },
    ],
    [busyId],
  );

  if (!authed) {
    return (
      <div className="mt-8 rounded-[24px] border border-line bg-paper p-6 text-center">
        <p className="text-ink-muted">
          Connectez-vous d’abord sur{" "}
          <Link href="/admin" className="text-teal underline">
            /admin
          </Link>{" "}
          avec le secret atelier.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-8">
      <div className="flex flex-wrap gap-3">
        <Button href="/admin" variant="ghost" size="sm">
          ← Admin
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => void load()}
          disabled={loading}
        >
          {loading ? "Chargement…" : "Actualiser"}
        </Button>
      </div>

      <div className="rounded-[24px] border border-line bg-paper p-5 md:p-6">
        <h2 className="font-display text-xl tracking-tight">Nouvelle licence</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-sm text-ink-muted sm:col-span-2">
            Outil / script_id
            <select
              value={scriptId}
              onChange={(e) => setScriptId(e.target.value)}
              className="mt-1.5 w-full rounded-[12px] border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-teal"
            >
              <option value="*">* — tous les outils (pack / atelier)</option>
              {products
                .filter((p) => p.scriptId !== "*")
                .map((p) => (
                  <option key={p.slug} value={p.scriptId}>
                    {p.title} ({p.scriptId})
                  </option>
                ))}
            </select>
          </label>
          <label className="block text-sm text-ink-muted">
            Machines
            <select
              value={maxMachines}
              onChange={(e) => setMaxMachines(Number(e.target.value))}
              className="mt-1.5 w-full rounded-[12px] border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-teal"
            >
              <option value={1}>1 PC (client)</option>
              <option value={0}>Illimité (atelier)</option>
            </select>
          </label>
          <label className="block text-sm text-ink-muted sm:col-span-2 lg:col-span-4">
            Note
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="client@email.fr — devis #…"
              className="mt-1.5 w-full rounded-[12px] border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-teal"
            />
          </label>
        </div>
        <Button
          type="button"
          className="mt-4"
          disabled={creating}
          onClick={() => void createLicense()}
        >
          {creating ? "Création…" : "Créer une clé"}
        </Button>
      </div>

      <div className="rounded-[24px] border border-line bg-paper p-5 md:p-6">
        <DataTable
          columns={columns}
          data={rows}
          getRowId={(r) => r.id}
          loading={loading}
          error={error}
          emptyTitle="Aucune licence trouvée"
          emptyDescription="Créez une clé ou élargissez les filtres."
          manualPagination
          pageCount={pageCount}
          pagination={pagination}
          onPaginationChange={setPagination}
          manualSorting
          toolbar={
            <>
              <label className="block flex-1 text-sm text-ink-muted min-w-[12rem]">
                Recherche
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setPagination((p) => ({ ...p, pageIndex: 0 }));
                      void load();
                    }
                  }}
                  placeholder="clé, note, script_id…"
                  className="mt-1.5 w-full rounded-[12px] border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-teal"
                />
              </label>
              <label className="block text-sm text-ink-muted sm:w-44">
                Statut
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPagination((p) => ({ ...p, pageIndex: 0 }));
                  }}
                  className="mt-1.5 w-full rounded-[12px] border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-teal"
                >
                  <option value="">Tous</option>
                  <option value="active">active</option>
                  <option value="revoked">revoked</option>
                  <option value="expired">expired</option>
                </select>
              </label>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setPagination((p) => ({ ...p, pageIndex: 0 }));
                  void load();
                }}
              >
                Filtrer
              </Button>
            </>
          }
          footer={
            <p className="text-xs text-ink-muted">
              {total} licence(s) au total · pagination serveur
            </p>
          }
        />
      </div>
    </div>
  );
}
