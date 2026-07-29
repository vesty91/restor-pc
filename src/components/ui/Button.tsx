import { cn } from "@/lib/utils";
import Link from "next/link";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "dark";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "btn-glow-primary bg-teal !text-white hover:bg-teal-deep shadow-[0_10px_24px_rgb(0_96_203/28%)] dark:!text-white dark:hover:bg-teal dark:shadow-[0_10px_28px_rgb(75_163_255/22%)]",
  secondary:
    "bg-paper text-ink border border-line hover:border-line-strong hover:bg-surface",
  ghost: "bg-transparent text-ink hover:bg-surface-2",
  dark: "bg-panel text-panel-fg hover:opacity-90",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-5 text-[15px]",
  lg: "h-14 px-7 text-base",
};

type Common = {
  children: ReactNode;
  className?: string;
  variant?: Variant;
  size?: Size;
};

type ButtonProps = Common &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type LinkProps = Common & {
  href: string;
  target?: string;
  rel?: string;
};

function isExternalHref(href: string) {
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("sms:")
  );
}

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  href,
  ...props
}: ButtonProps | LinkProps) {
  const classes = cn(
    "btn-press inline-flex items-center justify-center gap-2 rounded-[12px] font-semibold tracking-tight",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal",
    "disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className
  );

  if (href) {
    const linkProps = props as LinkProps;
    const external = isExternalHref(href);
    const target = linkProps.target ?? (external && href.startsWith("http") ? "_blank" : undefined);
    const rel =
      linkProps.rel ??
      (target === "_blank" ? "noopener noreferrer" : undefined);

    if (external) {
      return (
        <a href={href} className={classes} target={target} rel={rel}>
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={classes} target={target} rel={rel}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
