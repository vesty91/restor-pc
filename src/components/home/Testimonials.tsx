import { AnimatedStat } from "@/components/AnimatedStat";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Section";
import { googleReviewsMeta, featuredTestimonials } from "@/lib/data/testimonials";
import { siteConfig } from "@/lib/site";
import { Star } from "lucide-react";

export function Testimonials() {
  return (
    <Section className="bg-panel text-panel-fg">
      <SectionHeader
        tone="dark"
        eyebrow="Avis Google"
        title="Ce que disent les clients"
        description={`Note ${googleReviewsMeta.label} sur Google · ${googleReviewsMeta.count} avis sur la fiche Restor-PC Yerres.`}
      />

      <div className="mb-8 flex flex-wrap items-center gap-4 rounded-[20px] border border-white/10 bg-white/[0.04] px-5 py-4">
        <div className="flex items-center gap-2">
            <p className="font-display text-3xl tracking-tight text-white">
              <AnimatedStat value="4,6/5" />
            </p>
          <div className="flex gap-0.5 text-teal" aria-hidden>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < Math.round(googleReviewsMeta.rating) ? "fill-current" : "opacity-30"}`}
              />
            ))}
          </div>
        </div>
        <p className="text-sm text-white/55">
          <AnimatedStat value={String(googleReviewsMeta.count)} /> avis Google · Atelier{" "}
          {siteConfig.city}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {featuredTestimonials.map((t, i) => (
          <Reveal key={`${t.name}-${i}`} delay={i * 60}>
            <figure className="h-full rounded-[22px] border border-white/10 bg-white/[0.04] p-6 md:p-7">
              <div className="flex items-center justify-between gap-3">
                <div
                  className="flex gap-1 text-teal"
                  role="img"
                  aria-label={`${t.rating} sur 5`}
                >
                  {Array.from({ length: t.rating }).map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <span className="rounded-md border border-white/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white/45">
                  Google
                </span>
              </div>
              <blockquote className="mt-4 text-[15px] leading-relaxed text-white/80">
                “{t.text}”
              </blockquote>
              <figcaption className="mt-5">
                <p className="font-semibold text-white">{t.name}</p>
                <p className="text-sm text-white/45">{t.role}</p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button
          href={siteConfig.googleBusinessUrl}
          variant="secondary"
          className="border-white/20 bg-white/5 text-white hover:bg-white/10"
        >
          Voir tous les avis Google
        </Button>
        <Button
          href={siteConfig.googleReviewUrl}
          variant="secondary"
          className="border-white/20 bg-white/5 text-white hover:bg-white/10"
        >
          Laisser un avis
        </Button>
      </div>
    </Section>
  );
}

export function ConfiguratorTeaser() {
  return (
    <Section>
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">
            Configurateur PC
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl leading-tight text-balance">
            Construisez votre PC idéal en quelques minutes
          </h2>
          <p className="mt-4 text-ink-muted leading-relaxed max-w-md">
            Choisissez un usage, un budget et vos préférences. Notre moteur
            propose une configuration équilibrée, compatible, avec estimation
            de prix — prête à transformer en devis.
          </p>
          <div className="mt-7">
            <Button href="/configurateur" size="lg">
              Lancer le configurateur
            </Button>
          </div>
        </div>
        <Reveal>
          <div className="relative overflow-hidden rounded-[28px] border border-line bg-paper p-6 md:p-8 shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-xs text-ink-muted">APERÇU CONFIG</p>
              <span className="rounded-lg bg-teal-soft px-2.5 py-1 text-xs font-semibold text-teal">
                Score équilibre 91
              </span>
            </div>
            <div className="mt-6 space-y-3">
              {[
                ["Processeur", "Ryzen 7 7700"],
                ["Carte graphique", "RTX 4070 Super"],
                ["Mémoire", "32 Go DDR5"],
                ["Stockage", "SSD 2 To NVMe"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-3"
                >
                  <span className="text-sm text-ink-muted">{label}</span>
                  <span className="text-sm font-semibold">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-end justify-between border-t border-line pt-5">
              <div>
                <p className="text-xs text-ink-muted">Estimation</p>
                <p className="font-display text-3xl tracking-tight">1 649 €</p>
              </div>
              <p className="text-xs text-ink-muted max-w-[14ch] text-right">
                Pièces + montage inclus dans l’estimation
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
