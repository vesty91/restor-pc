import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ReactNode } from "react";

export function BentoGrid({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto grid grid-cols-1 gap-4 md:auto-rows-[minmax(11rem,auto)] md:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  );
}

export function BentoGridItem({
  className,
  title,
  description,
  header,
  icon,
  href,
  meta,
}: {
  className?: string;
  title?: string | ReactNode;
  description?: string | ReactNode;
  header?: ReactNode;
  icon?: ReactNode;
  href?: string;
  meta?: ReactNode;
}) {
  const body = (
    <>
      {header}
      <div className="transition duration-200 motion-safe:group-hover/bento:translate-x-1">
        {icon}
        <div className="mt-3 text-lg font-semibold leading-snug text-ink">
          {title}
        </div>
        <div className="mt-2 text-sm font-normal leading-relaxed text-ink-muted">
          {description}
        </div>
        {meta ? <div className="mt-4 text-sm font-semibold text-ink">{meta}</div> : null}
      </div>
    </>
  );

  const classes = cn(
    "group/bento row-span-1 flex h-full flex-col justify-between space-y-4 rounded-[20px] border border-line bg-paper p-5 md:p-6 shadow-[var(--shadow-soft)] transition duration-200",
    "hover:border-teal/35 hover:shadow-[var(--shadow-lift)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {body}
      </Link>
    );
  }

  return <div className={classes}>{body}</div>;
}
