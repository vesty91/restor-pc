"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({
  className,
  lightOnDark,
}: {
  className?: string;
  /** Style clair pour header transparent sur hero sombre */
  lightOnDark?: boolean;
}) {
  const { theme, toggleTheme, ready } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      title={isDark ? "Mode clair" : "Mode sombre"}
      className={cn(
        "grid h-10 w-10 place-items-center rounded-xl border transition-colors",
        lightOnDark
          ? "border-white/20 bg-white/10 text-white hover:bg-white/15"
          : "border-line bg-paper text-ink hover:bg-surface-2",
        !ready && "opacity-0",
        className
      )}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
