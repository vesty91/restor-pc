"use client";

import { Button } from "@/components/ui/Button";
import { getAllProducts } from "@/lib/data/outils";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type FulfillOk = {
  licenseKey: string;
  downloadUrl: string;
  downloadPassword: string;
  toolTitle: string;
  orderId: string;
};

export function AtelierPanel({ authed }: { authed: boolean }) {
  const router = useRouter();
  const products = useMemo(() => getAllProducts(), []);
  const [secret, setSecret] = useState("");
  const [slug, setSlug] = useState(products[0]?.slug ?? "");
  const [email, setEmail] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FulfillOk | null>(null);

  async function login() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/atelier/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Accès refusé");
        return;
      }
      router.refresh();
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/atelier/auth", { method: "DELETE" });
    setResult(null);
    router.refresh();
  }

  async function fulfill() {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/atelier/fulfill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, email, sendEmail }),
      });
      const data = (await res.json()) as FulfillOk & { error?: string };
      if (!res.ok) {
        setError(data.error || "Échec livraison");
        return;
      }
      setResult(data);
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  if (!authed) {
    return (
      <div className="mx-auto mt-8 max-w-md rounded-[24px] border border-line bg-paper p-6">
        <h2 className="font-display text-xl tracking-tight">Accès atelier</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Secret défini dans <code className="text-ink">ATELIER_SECRET</code>.
        </p>
        <label className="mt-4 block text-sm text-ink-muted">
          Mot de passe atelier
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="mt-1.5 w-full rounded-[12px] border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-teal"
            autoComplete="current-password"
          />
        </label>
        <Button type="button" className="mt-4 w-full" disabled={loading} onClick={login}>
          {loading ? "…" : "Entrer"}
        </Button>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
      <div className="rounded-[24px] border border-line bg-paper p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl tracking-tight">Livrer un outil</h2>
          <Button type="button" variant="ghost" size="sm" onClick={logout}>
            Quitter
          </Button>
        </div>
        <p className="mt-2 text-sm text-ink-muted">
          Crée licence (1 PC) + lien NAS 1 téléchargement + email optionnel.
        </p>
        <label className="mt-5 block text-sm text-ink-muted">
          Outil
          <select
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="mt-1.5 w-full rounded-[12px] border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-teal"
          >
            {products.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-4 block text-sm text-ink-muted">
          Email client
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="client@email.fr"
            className="mt-1.5 w-full rounded-[12px] border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-teal"
          />
        </label>
        <label className="mt-4 flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
          />
          Envoyer l’email Resend
        </label>
        <Button type="button" className="mt-5 w-full" disabled={loading} onClick={fulfill}>
          {loading ? "Livraison…" : "Générer & livrer"}
        </Button>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </div>

      <div className="rounded-[24px] border border-line bg-paper p-6">
        <h2 className="font-display text-xl tracking-tight">Résultat</h2>
        {!result ? (
          <p className="mt-3 text-sm text-ink-muted">Aucun envoi pour l’instant.</p>
        ) : (
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-ink-muted">Produit</dt>
              <dd className="font-medium text-ink">{result.toolTitle}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Licence</dt>
              <dd className="break-all font-mono text-ink">{result.licenseKey}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Lien</dt>
              <dd className="break-all">
                <a href={result.downloadUrl} className="text-teal underline" target="_blank" rel="noreferrer">
                  {result.downloadUrl}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-ink-muted">Mot de passe</dt>
              <dd className="font-mono text-ink">{result.downloadPassword}</dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
}
