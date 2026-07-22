"use client";

import { siteConfig } from "@/lib/site";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyPhoneButton({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(siteConfig.phoneRaw);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={
        className ??
        "inline-flex items-center gap-1.5 text-xs font-semibold text-white/55 hover:text-white"
      }
      aria-label="Copier le numéro de téléphone"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-teal" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copié" : "Copier"}
    </button>
  );
}
