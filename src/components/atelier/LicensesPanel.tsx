"use client";

import { Button } from "@/components/ui/Button";
import { getAllProducts } from "@/lib/data/outils";
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

  async function copyId() {
    try {
      await navigator.clipboard.writeText(machineId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="min-w-[180px] space-y-1 text-xs">
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
          title={machineId}
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
      const res = await fetch(`/api/atelier/licenses?${params}`);
      const data = (await res.json()) as { licenses?: LicenseRow[]; error?: string };
      if (!res.ok) {
        setError(data.error || "Chargement impossible");
        return;
      }
      setRows(data.licenses || []);
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }, [q, statusFilter]);

  useEffect(() => {
    if (authed) void load();
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
      const data = (await res.json()) as { license?: LicenseRow; error?: string };
      if (!res.ok) {
        setError(data.error || "Modification échouée");
        return;
      }
      if (data.license) {
        setRows((prev) => prev.map((r) => (r.id === id ? data.license! : r)));
      }
    } catch {
      setError("Erreur réseau");
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
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Suppression échouée");
        return;
      }
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Erreur réseau");
    } finally {
      setBusyId(null);
    }
  }

  async function createLicense() {
    setCreating(true);
    setError(null);
    try {
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
        setError(data.error || "Création échouée");
        return;
      }
      if (data.license) {
        setRows((prev) => [data.license!, ...prev]);
        setNote("");
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setCreating(false);
    }
  }

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
          <Button type="button" variant="secondary" size="sm" onClick={() => void load()} disabled={loading}>
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
        <Button type="button" className="mt-4" disabled={creating} onClick={() => void createLicense()}>
          {creating ? "Création…" : "Créer une clé"}
        </Button>
      </div>

      <div className="rounded-[24px] border border-line bg-paper p-5 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block flex-1 text-sm text-ink-muted">
            Recherche
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void load()}
              placeholder="clé, note, script_id…"
              className="mt-1.5 w-full rounded-[12px] border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-teal"
            />
          </label>
          <label className="block text-sm text-ink-muted sm:w-44">
            Statut
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1.5 w-full rounded-[12px] border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-teal"
            >
              <option value="">Tous</option>
              <option value="active">active</option>
              <option value="revoked">revoked</option>
              <option value="expired">expired</option>
            </select>
          </label>
          <Button type="button" variant="secondary" onClick={() => void load()}>
            Filtrer
          </Button>
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-muted">
                <th className="py-2 pr-3 font-semibold">Clé</th>
                <th className="py-2 pr-3 font-semibold">Script</th>
                <th className="py-2 pr-3 font-semibold">Statut</th>
                <th className="py-2 pr-3 font-semibold">PC</th>
                <th className="py-2 pr-3 font-semibold">Note</th>
                <th className="py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-line/70 align-top">
                  <td className="py-3 pr-3">
                    <code className="text-xs font-semibold text-ink">{r.license_key}</code>
                    <p className="mt-1 text-[11px] text-ink-muted">{formatDate(r.created_at)}</p>
                  </td>
                  <td className="py-3 pr-3">
                    <code className="text-xs">{r.script_id}</code>
                    <p className="mt-1 text-[11px] text-ink-muted">
                      max {r.max_machines === 0 ? "∞" : r.max_machines ?? 1}
                    </p>
                  </td>
                  <td className="py-3 pr-3">
                    <span
                      className={
                        r.status === "active"
                          ? "text-emerald-700"
                          : r.status === "revoked"
                            ? "text-red-600"
                            : "text-ink-muted"
                      }
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 pr-3">
                    <MachineCell
                      machineId={r.machine_id}
                      machineName={r.machine_name}
                      biosSerial={r.bios_serial}
                      boundAt={r.machine_bound_at}
                    />
                  </td>
                  <td className="py-3 pr-3 text-xs text-ink-muted max-w-[180px]">
                    <span className="line-clamp-3">{r.note || "—"}</span>
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
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
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-ink-muted">
                    Aucune licence trouvée.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-ink-muted">{rows.length} licence(s) affichée(s) (max 200).</p>
      </div>
    </div>
  );
}
