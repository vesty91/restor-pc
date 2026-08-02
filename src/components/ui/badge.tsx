import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * Badge Shadcn adapté aux tokens Restor-PC (pas de --primary générique).
 */
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap transition-[color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-transparent bg-teal text-white",
        secondary: "border-line bg-surface-2 text-ink-soft",
        outline: "border-line bg-transparent text-ink",
        success:
          "border-transparent bg-[color-mix(in_oklab,var(--success)_16%,white)] text-[#0b4d28] dark:bg-[color-mix(in_oklab,var(--success)_22%,transparent)] dark:text-[#86efac]",
        warning: "border-transparent bg-amber-soft text-[#92400e] dark:text-[#fcd34d]",
        danger:
          "border-transparent bg-[color-mix(in_oklab,var(--danger)_14%,white)] text-[#991b1b] dark:bg-[color-mix(in_oklab,var(--danger)_22%,transparent)] dark:text-[#fca5a5]",
        muted: "border-transparent bg-surface text-ink-muted",
        info: "border-transparent bg-teal-soft text-teal",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
