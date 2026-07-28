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
        "mx-auto grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
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
      <div className="flex items-start justify-between gap-3">
        {icon}
        {header}
      </div>
      <div className="mt-4 flex min-h-0 flex-1 flex-col">
        <div className="text-[1.05rem] font-semibold leading-snug tracking-tight text-ink">
          {title}
        </div>
        <div className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-muted">
          {description}
        </div>
        {meta ? (
          <div className="mt-5 border-t border-line pt-4 text-sm font-semibold text-ink">
            {meta}
          </div>
        ) : null}
      </div>
    </>
  );

  const classes = cn(
    "tile-wow group/bento flex h-full flex-col rounded-2xl p-5",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
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
