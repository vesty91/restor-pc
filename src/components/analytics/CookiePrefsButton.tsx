"use client";

import type { ReactNode } from "react";

export function CookiePrefsButton({
  className,
  children = "Cookies",
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        window.dispatchEvent(new Event("restor-pc:open-cookie-prefs"));
      }}
    >
      {children}
    </button>
  );
}
