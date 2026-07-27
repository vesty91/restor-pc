"use client";

import { Button } from "@/components/ui/Button";
import { createClient, signOutClient } from "@/lib/supabase/client";
import { siteConfig } from "@/lib/site";
import {
  DISPLAY_FIRST_NAME_KEY,
  normalizeFirstNameInput,
} from "@/lib/user-display";
import { useCallback, useEffect, useState } from "react";

type OrderRow = {
  id: string;
  tool_title: string;
  tool_slug: string;
  license_key: string;
  status: string;
  source: string;
  created_at: string;
  share_url: string | null;
  share_password: string | null;
  expire_times: number | null;
  email_sent_at: string | null;
  email_error: string | null;
};

type LicenseRow = {
  license_key: string;
  script_id: string;
  status: string;
  machine_id: string | null;
  machine_name: string | null;
  bios_serial: string | null;
  machine_bound_at: string | null;
  max_machines: number | null;
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function CompteDashboard({
  email,
  firstName,
}: {
  email: string;
  firstName?: string | null;
}) {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [licenses, setLicenses] = useState<LicenseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState(firstName || "");
  const [nameDraft, setNameDraft] = useState(firstName || "");
  const [editingName, setEditingName] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [resendId, setResendId] = useState<string | null>(null);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/compte/orders");
      const data = (await res.json()) as {
        orders?: OrderRow[];
        licenses?: LicenseRow[];
        error?: string;
      };
      if (!res.ok) {
        setError(data.error || "Chargement impossible");
        return;
      }
      setOrders(data.orders || []);
      setLicenses(data.licenses || []);
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setDisplayName(firstName || "");
    setNameDraft(firstName || "");
  }, [firstName]);

  async function logout() {
    await signOutClient();
  }

  async function saveFirstName() {
    setNameError(null);
    const cleaned = normalizeFirstNameInput(nameDraft);
    if (cleaned.length < 2) {
      setNameError("Indiquez un prénom (2 caractères min.).");
      return;
    }
    setSavingName(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.updateUser({
        data: { [DISPLAY_FIRST_NAME_KEY]: cleaned },
      });
      if (err) {
        setNameError(err.message);
        return;
      }
      setDisplayName(cleaned);
      setEditingName(false);
      window.location.assign("/compte");
    } catch {
      setNameError("Enregistrement impossible. Réessayez.");
    } finally {
      setSavingName(false);
    }
  }

  async function copyKey(key: string) {
    try {
      await navigator.clipboard.writeText(key);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* ignore */
    }
  }

  async function resendEmail(orderId: string) {
    setResendId(orderId);
    setResendMsg(null);
    try {
      const res = await fetch("/api/compte/resend-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok) {
        setResendMsg(data.error || "Renvoi impossible");
        return;
      }
      setResendMsg("Email renvoyé. Vérifiez boîte + spams.");
      void load();
    } catch {
      setResendMsg("Erreur réseau");
    } finally {
      setResendId(null);
    }
  }

  const licByKey = new Map(licenses.map((l) => [l.license_key, l]));

  return (
    <div className="mt-8 space-y-6">
      <div className="rounded-[20px] border border-line bg-paper p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">
              {displayName ? `Bonjour ${displayName}` : "Espace personnel"}
            </p>
            <p className="mt-1 font-medium text-ink">{email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button href="/boutique" variant="secondary" size="sm">
              Boutique
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => void logout()}>
              Déconnexion
            </Button>
          </div>
        </div>

        <div className="mt-5 border-t border-line pt-4">
          <p className="text-sm font-semibold text-ink">Prénom affiché</p>
          <p className="mt-1 text-xs text-ink-muted">
            Visible dans le menu du site (à la place de « Mon compte »).
          </p>

          {editingName ? (
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <label className="block min-w-[12rem] flex-1 text-sm text-ink-muted">
                Prénom
                <input
                  type="text"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  maxLength={40}
                  autoComplete="given-name"
                  className="mt-1.5 w-full rounded-[12px] border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-teal"
                />
              </label>
              <Button
                type="button"
                size="sm"
                disabled={savingName}
                onClick={() => void saveFirstName()}
              >
                {savingName ? "…" : "Enregistrer"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={savingName}
                onClick={() => {
                  setEditingName(false);
                  setNameDraft(displayName);
                  setNameError(null);
                }}
              >
                Annuler
              </Button>
            </div>
          ) : (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-[10px] border border-line bg-surface px-3 py-2 text-sm font-medium text-ink">
                {displayName || "Non défini"}
              </span>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => {
                  setEditingName(true);
                  setNameError(null);
                }}
              >
                Modifier
              </Button>
            </div>
          )}

          {nameError ? <p className="mt-2 text-sm text-red-600">{nameError}</p> : null}
        </div>
      </div>

      <div className="rounded-[24px] border border-line bg-paper p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl tracking-tight">Mes commandes</h2>
          <Button type="button" variant="ghost" size="sm" onClick={() => void load()} disabled={loading}>
            {loading ? "…" : "Actualiser"}
          </Button>
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        {resendMsg ? (
          <p className="mt-3 text-sm text-ink-muted">{resendMsg}</p>
        ) : null}

        {!loading && orders.length === 0 ? (
          <p className="mt-6 text-sm text-ink-muted">
            Aucune commande pour cet email. Achats sur la{" "}
            <a href="/boutique" className="text-teal underline">
              boutique
            </a>{" "}
            avec la même adresse.
          </p>
        ) : (
          <ul className="mt-5 space-y-4">
            {orders.map((o) => {
              const lic = licByKey.get(o.license_key);
              return (
                <li
                  key={o.id}
                  className="rounded-[16px] border border-line bg-surface/50 p-4 md:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-lg tracking-tight text-ink">{o.tool_title}</p>
                      <p className="mt-1 text-xs text-ink-muted">
                        {formatDate(o.created_at)} · {o.source} · {o.status}
                      </p>
                    </div>
                    {lic ? (
                      <span
                        className={
                          lic.status === "active"
                            ? "text-xs font-semibold text-emerald-700"
                            : "text-xs font-semibold text-red-600"
                        }
                      >
                        Licence {lic.status}
                        {lic.machine_id
                          ? ` · ${lic.machine_name || "PC lié"}${lic.bios_serial ? ` · SN ${lic.bios_serial}` : ""}`
                          : " · non liée"}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <code className="rounded-[8px] bg-paper px-2.5 py-1.5 text-sm font-semibold text-ink">
                      {o.license_key}
                    </code>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => void copyKey(o.license_key)}
                    >
                      {copied === o.license_key ? "Copié" : "Copier"}
                    </Button>
                  </div>
                  {o.share_url ? (
                    <div className="mt-3 space-y-2 rounded-[12px] border border-line bg-paper p-3 text-sm">
                      <p className="font-semibold text-ink">Téléchargement</p>
                      <p className="break-all">
                        <a
                          href={o.share_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal underline"
                        >
                          {o.share_url}
                        </a>
                      </p>
                      {o.share_password ? (
                        <p className="text-ink-muted">
                          Mot de passe :{" "}
                          <code className="font-semibold text-ink">{o.share_password}</code>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="ml-2"
                            onClick={() => void copyKey(o.share_password!)}
                          >
                            {copied === o.share_password ? "Copié" : "Copier"}
                          </Button>
                        </p>
                      ) : null}
                      <p className="text-xs text-ink-muted">
                        Limite : {o.expire_times ?? 1} téléchargement(s). Si le lien refuse
                        l’accès, contactez-nous pour un nouveau lien.
                      </p>
                      <div className="pt-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          disabled={resendId === o.id}
                          onClick={() => void resendEmail(o.id)}
                        >
                          {resendId === o.id ? "Envoi…" : "Renvoyer l’email"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-xs leading-relaxed text-ink-muted">
                      Lien de téléchargement absent. Contact :{" "}
                      <a href={siteConfig.emailHref} className="text-teal underline">
                        {siteConfig.email}
                      </a>
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="text-center text-xs text-ink-muted">
        Atelier Restor-PC ?{" "}
        <a href="/admin" className="font-semibold text-teal underline underline-offset-2">
          Accéder à l’espace admin
        </a>
      </p>
    </div>
  );
}
