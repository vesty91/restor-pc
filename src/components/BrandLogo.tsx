import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

type Props = {
  className?: string;
  /** Compact for header; full lockup for footer / hero. */
  variant?: "mark" | "full";
  priority?: boolean;
};

const LOGO_W = 401;
const LOGO_H = 119;
const LOGO_SRC = "/brand/restor-pc-logo.png";

export function BrandLogo({
  className,
  variant = "mark",
  priority = false,
}: Props) {
  if (variant === "full") {
    return (
      <Link
        href="/"
        className={cn("inline-flex items-center bg-transparent", className)}
        aria-label={`${siteConfig.name} — accueil`}
      >
        <Image
          src={LOGO_SRC}
          alt={`${siteConfig.name} — Dépannage informatique`}
          width={LOGO_W}
          height={LOGO_H}
          unoptimized
          className="h-auto w-[min(320px,92vw)] bg-transparent drop-shadow-[0_12px_40px_rgb(0_0_0/35%)]"
          priority={priority}
          fetchPriority={priority ? "high" : "auto"}
        />
      </Link>
    );
  }

  return (
    <Link
      href="/"
      className={cn(
        "inline-flex h-[48px] items-center shrink-0 bg-transparent sm:h-[54px] md:h-[60px]",
        className
      )}
      aria-label={`${siteConfig.name} — accueil`}
    >
      <Image
        src={LOGO_SRC}
        alt=""
        width={LOGO_W}
        height={LOGO_H}
        unoptimized
        className="h-full w-auto max-w-[min(90vw,180px)] bg-transparent object-contain object-left drop-shadow-sm sm:max-w-[220px] md:max-w-[260px]"
        priority={priority}
        fetchPriority={priority ? "high" : "auto"}
      />
      <span className="sr-only">{siteConfig.name}</span>
    </Link>
  );
}
