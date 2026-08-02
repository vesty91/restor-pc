"use client";

import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { KeyRound, Package, Shield } from "lucide-react";

export function AdminLogin() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="mx-auto mt-8 max-w-md rounded-[24px] border border-line bg-paper p-6 md:p-7">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-[12px] bg-panel text-panel-fg">
          <Shield className="size-5" aria-hidden />
        </span>
        <div>
          <h2 className="font-display text-xl tracking-tight">Admin Restor-PC</h2>
          <p className="text-sm text-ink-muted">Accès réservé à l’atelier</p>
        </div>
      </div>
      <label className="mt-6 block text-sm text-ink-muted">
        Mot de passe atelier
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void login()}
          className="mt-1.5 w-full rounded-[12px] border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-teal"
          autoComplete="current-password"
        />
      </label>
      <Button type="button" className="mt-4 w-full" disabled={loading} onClick={() => void login()}>
        {loading ? "…" : "Se connecter"}
      </Button>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

export function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/atelier/auth", { method: "DELETE" });
    router.refresh();
  }

  const cards = [
    {
      href: "/admin/livraison",
      title: "Livraison",
      description: "Générer licence + lien NAS 1 DL + email client (hors Stripe).",
      icon: Package,
    },
    {
      href: "/admin/licences",
      title: "Licences",
      description: "Lister, créer, révoquer, détacher un PC lié.",
      icon: KeyRound,
    },
  ];

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">Session active · 12 h max</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={loading}
          onClick={() => void logout()}
        >
          Déconnexion
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-[20px] border border-line bg-paper p-6 transition hover:border-line-strong hover:shadow-[var(--shadow-lift)]"
          >
            <span className="grid size-11 place-items-center rounded-[12px] bg-teal-soft text-teal">
              <card.icon className="size-5" aria-hidden />
            </span>
            <h2 className="mt-4 font-display text-2xl tracking-tight group-hover:text-teal">
              {card.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{card.description}</p>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-ink-muted">
        Boutique publique :{" "}
        <Link href="/boutique" className="text-teal underline">
          /boutique
        </Link>
      </p>
    </div>
  );
}
