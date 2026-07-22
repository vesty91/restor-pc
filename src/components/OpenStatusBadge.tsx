"use client";

import { getOpenStatus } from "@/lib/hours";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function OpenStatusBadge({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  const [status, setStatus] = useState(() => getOpenStatus());

  useEffect(() => {
    setStatus(getOpenStatus());
    const id = window.setInterval(() => setStatus(getOpenStatus()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm",
        tone === "dark"
          ? "bg-white/5 text-white/80"
          : "bg-surface text-ink-soft border border-line",
        className
      )}
    >
      <span
        className={cn(
          "relative h-2 w-2 rounded-full",
          status.open ? "bg-teal" : "bg-ink-muted"
        )}
        aria-hidden
      >
        {status.open ? (
          <span className="pulse-dot absolute inset-0 rounded-full" />
        ) : null}
      </span>
      <span>
        <span className="font-semibold">{status.label}</span>
        <span className={tone === "dark" ? "text-white/45" : "text-ink-muted"}>
          {" "}
          · {status.detail}
        </span>
      </span>
    </div>
  );
}
