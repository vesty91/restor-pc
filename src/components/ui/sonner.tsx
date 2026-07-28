"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * Toaster Sonner — unique système de notifications Restor-PC.
 * Thème via ThemeProvider maison (pas de next-themes).
 */
export function Toaster(props: ToasterProps) {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      closeButton
      richColors
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "border border-line bg-paper text-ink shadow-lg font-[family-name:var(--font-body)]",
          title: "text-sm font-semibold",
          description: "text-sm text-ink-muted",
        },
      }}
      {...props}
    />
  );
}
