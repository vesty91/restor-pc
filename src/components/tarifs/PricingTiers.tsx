"use client";

import { BorderBeam } from "@/components/magicui/border-beam";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { pricingTiers } from "@/lib/data/pricing";
import { cn, formatPrice } from "@/lib/utils";
import { Check, Sparkles } from "lucide-react";

export function PricingTiers() {
  return (
    <div className="grid gap-4 lg:grid-cols-3 lg:items-stretch">
      {pricingTiers.map((tier) => (
        <article
          key={tier.id}
          className={cn(
            "relative flex flex-col overflow-hidden rounded-[24px] p-6 md:p-7",
            tier.highlight
              ? "border border-teal/50 bg-panel text-panel-fg shadow-[var(--shadow-lift)] lg:-translate-y-2 lg:scale-[1.02]"
              : "tile-wow"
          )}
        >
          {tier.highlight ? (
            <BorderBeam size={100} duration={8} borderWidth={1.5} />
          ) : null}

          <div className="relative flex flex-1 flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={tier.highlight ? "info" : "muted"}
                className={
                  tier.highlight
                    ? "border-transparent bg-[#4ba3ff]/20 text-[#9ec9f5]"
                    : undefined
                }
              >
                {tier.name}
              </Badge>
              {tier.highlight ? (
                <Badge
                  variant="outline"
                  className="gap-1 border-white/20 bg-white/5 text-white/85"
                >
                  <Sparkles className="size-3" aria-hidden />
                  Le plus demandé
                </Badge>
              ) : null}
            </div>

            <p
              className={cn(
                "mt-4 text-xs font-medium",
                tier.highlight ? "text-white/45" : "text-ink-muted"
              )}
            >
              {tier.id === "atelier" ? "À partir de" : "Minimum"}
            </p>
            <p className="font-display text-4xl tracking-tight md:text-5xl">
              {formatPrice(tier.priceFrom)}
              <span
                className={cn(
                  "ml-1.5 text-sm font-sans font-medium",
                  tier.highlight ? "text-white/50" : "text-ink-muted"
                )}
              >
                {tier.unitLabel}
              </span>
            </p>
            <p
              className={cn(
                "mt-3 text-sm leading-relaxed",
                tier.highlight ? "text-white/65" : "text-ink-muted"
              )}
            >
              {tier.description}
            </p>

            <ul className="mt-6 flex-1 space-y-2.5">
              {tier.includes.map((item) => (
                <li key={item} className="flex gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
                  <span className={tier.highlight ? "text-white/85" : ""}>{item}</span>
                </li>
              ))}
            </ul>

            <Button
              href={tier.href}
              variant={tier.highlight ? "primary" : "secondary"}
              className="mt-8 w-full"
              size="lg"
            >
              {tier.cta}
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
