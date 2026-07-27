import { AnimatedStat } from "@/components/AnimatedStat";
import { Reveal } from "@/components/Reveal";
import { Section, SectionHeader } from "@/components/ui/Section";
import { commitments, trustStats } from "@/lib/data/testimonials";
import { processSteps } from "@/lib/data/faq";
import { Shield, FileCheck2, LockKeyhole, MessageCircle } from "lucide-react";

const icons = [FileCheck2, LockKeyhole, Shield, MessageCircle];

export function TrustSection() {
  return (
    <>
      <Section className="bg-paper border-y border-line">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-4">
          {trustStats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 50}>
              <div className="text-center md:text-left">
                <p className="font-display text-3xl md:text-4xl text-ink tracking-tight">
                  <AnimatedStat value={stat.value} />
                </p>
                <p className="mt-1 text-sm text-ink-muted">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeader
          eyebrow="Méthode"
          title="Un processus simple, sans surprise"
          description="Vous savez toujours où on en est, ce que ça coûte, et ce qui va être fait."
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((step, i) => (
            <Reveal key={step.step} delay={i * 70}>
              <div className="h-full border-l-2 border-teal/40 pl-5 py-1">
                <p className="font-mono text-xs text-teal">{step.step}</p>
                <h3 className="mt-2 text-lg">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <SectionHeader
          eyebrow="Engagements"
          title="La confiance se construit dans les détails"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {commitments.map((item, i) => {
            const Icon = icons[i] ?? Shield;
            return (
              <Reveal key={item.title} delay={i * 60}>
                <div className="flex gap-4 rounded-[20px] border border-line bg-paper p-5 md:p-6">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface text-teal">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg leading-snug">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                      {item.text}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Section>
    </>
  );
}
