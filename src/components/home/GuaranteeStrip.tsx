import { Reveal } from "@/components/Reveal";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/Section";
import { guarantees } from "@/lib/data/testimonials";
import { BadgeCheck, Clock3, FileCheck2, LockKeyhole } from "lucide-react";

const icons = [BadgeCheck, FileCheck2, Clock3, LockKeyhole];

export function GuaranteeStrip() {
  return (
    <Section className="border-b border-line bg-paper py-10 md:py-12">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge variant="success">Engagements atelier</Badge>
        <Badge variant="muted">Sans surprise</Badge>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {guarantees.map((item, i) => {
          const Icon = icons[i] ?? BadgeCheck;
          return (
            <Reveal key={item.title} delay={i * 40}>
              <div className="flex gap-3">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-teal-soft text-teal">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <p className="text-[15px] font-semibold leading-snug">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{item.text}</p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
