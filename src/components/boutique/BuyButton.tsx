"use client";

import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useEffect, useState } from "react";

export function BuyButton({
  slug,
  label = "Acheter",
}: {
  slug: string;
  label?: string;
}) {
  const [email, setEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextPath = `/boutique/${slug}`;
  const signupHref = `/compte?mode=signup&next=${encodeURIComponent(nextPath)}`;
  const loginHref = `/compte?mode=login&next=${encodeURIComponent(nextPath)}`;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        if (!cancelled) setEmail(data.user?.email ?? null);
      } catch {
        if (!cancelled) setEmail(null);
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onBuy() {
    setError(null);
    if (!email) {
      setError("Créez un compte pour acheter.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/boutique/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error || "Paiement indisponible pour le moment.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return <p className="text-sm text-ink-muted">Vérification du compte…</p>;
  }

  if (!email) {
    return (
      <div className="space-y-3">
        <p className="text-sm leading-relaxed text-ink-muted">
          Un <strong className="text-ink">compte Restor-PC</strong> est obligatoire pour
          acheter (licence, téléchargement et historique dans votre espace).
        </p>
        <Button href={signupHref} size="lg" className="w-full sm:w-auto">
          Créer un compte pour acheter
        </Button>
        <p className="text-xs text-ink-muted">
          Déjà inscrit ?{" "}
          <Link href={loginHref} className="font-semibold text-teal underline underline-offset-2">
            Se connecter
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-muted">
        Connecté en tant que{" "}
        <strong className="text-ink">{email}</strong>
        {" — "}licence et lien envoyés à cet email.
      </p>
      <Button type="button" size="lg" className="w-full sm:w-auto" disabled={loading} onClick={onBuy}>
        {loading ? "Redirection…" : label}
      </Button>
      <p className="text-xs text-ink-muted leading-relaxed">
        En payant, vous acceptez les{" "}
        <Link href="/conditions-vente" className="text-teal underline underline-offset-2">
          CGV
        </Link>
        . L’utilisation des outils est sous votre responsabilité exclusive ;
        {siteConfig.name} n’est responsable d’aucun dommage lié à leur exécution.
      </p>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
