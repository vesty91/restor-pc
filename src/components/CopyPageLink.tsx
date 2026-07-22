"use client";

import { Check, Link2 } from "lucide-react";
import { useState } from "react";

export function CopyPageLink() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-2 rounded-xl border border-line bg-paper px-3.5 py-2 text-sm font-semibold text-ink-muted transition-colors hover:text-ink"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-teal" />
          Lien copié
        </>
      ) : (
        <>
          <Link2 className="h-4 w-4" />
          Copier le lien
        </>
      )}
    </button>
  );
}
