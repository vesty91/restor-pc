import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Skeleton unique Restor-PC (Ant Design : feedback de chargement clair). */
export function Skeleton({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-md bg-surface-2 motion-reduce:animate-none",
        className
      )}
      aria-hidden
      {...props}
    />
  );
}
