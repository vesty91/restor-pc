import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

export function Section({
  children,
  className,
  id,
  wide,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  wide?: boolean;
}) {
  return (
    <section id={id} className={cn("py-16 md:py-24", className)}>
      <div className={wide ? "container-wide" : "container-site"}>{children}</div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "light",
  as = "h2",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  /** Utiliser `h1` uniquement pour le titre principal de page. */
  as?: "h1" | "h2";
}) {
  const Heading = as;
  return (
    <div
      className={cn(
        "mb-10 md:mb-14 max-w-2xl",
        align === "center" && "mx-auto text-center"
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "mb-3 text-xs font-semibold uppercase tracking-[0.18em]",
            tone === "dark" ? "text-[#7eb8ff]" : "text-teal"
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <Heading
        className={cn(
          "text-3xl md:text-4xl lg:text-[2.75rem] leading-[1.3] text-balance",
          tone === "dark" && "text-panel-fg"
        )}
      >
        {title}
      </Heading>
      {description ? (
        <p
          className={cn(
            "mt-4 text-base md:text-lg leading-relaxed text-balance",
            tone === "dark" ? "text-white/65" : "text-ink-muted"
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
