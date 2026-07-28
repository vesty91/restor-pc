import { Marquee } from "@/components/magicui/marquee";
import { Section } from "@/components/ui/Section";

/** Technologies / expertises réelles Restor-PC — pas de faux partenaires. */
const ITEMS = [
  "Windows",
  "Linux",
  "NAS Synology",
  "Sauvegarde 3-2-1",
  "SSD NVMe",
  "Montage PC",
  "Récupération données",
  "Cybersécurité",
] as const;

export function TechMarquee() {
  return (
    <Section className="!py-8 md:!py-10">
      <p className="mb-4 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-teal">
        Domaines d’intervention
      </p>
      <div className="relative">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-surface to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-surface to-transparent"
          aria-hidden
        />
        <Marquee pauseOnHover className="[--duration:35s]" aria-label="Domaines d’intervention">
          {ITEMS.map((item) => (
            <span
              key={item}
              className="mx-1 rounded-full border border-line bg-paper px-4 py-2 text-sm font-medium text-ink-soft"
            >
              {item}
            </span>
          ))}
        </Marquee>
      </div>
    </Section>
  );
}
