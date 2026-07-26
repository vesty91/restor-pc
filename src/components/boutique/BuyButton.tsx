"use client";

import { Button } from "@/components/ui/Button";
import { useState } from "react";

export function BuyButton({
  slug,
  label = "Acheter",
}: {
  slug: string;
  label?: string;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onBuy() {
    setError(null);
    if (!email.includes("@")) {
      setError("Indiquez un email valide pour recevoir la licence.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/boutique/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, email }),
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

  return (
    <div className="space-y-3">
      <label className="block text-sm text-ink-muted">
        Email de livraison (licence + lien)
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@email.fr"
          className="mt-1.5 w-full rounded-[12px] border border-line bg-paper px-3 py-2.5 text-ink outline-none focus:border-teal"
          autoComplete="email"
        />
      </label>
      <Button type="button" size="lg" className="w-full sm:w-auto" disabled={loading} onClick={onBuy}>
        {loading ? "Redirection…" : label}
      </Button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
