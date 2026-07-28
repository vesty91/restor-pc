import { Marquee } from "@/components/magicui/marquee";
import { Badge } from "@/components/ui/badge";

/** Expertises réelles Restor-PC — pas de faux partenaires. */
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
    <div className="border-y border-line bg-paper py-6 md:py-8">
      <p className="mb-3 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-teal">
        Domaines d’intervention
      </p>
      <div className="relative">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-paper to-transparent sm:w-20"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-paper to-transparent sm:w-20"
          aria-hidden
        />
        <Marquee
          pauseOnHover
          className="[--duration:35s]"
          aria-label="Domaines d’intervention"
        >
          {ITEMS.map((item) => (
            <Badge
              key={item}
              variant="outline"
              className="mx-1 rounded-full border-line bg-surface px-4 py-1.5 text-sm font-medium text-ink-soft"
            >
              {item}
            </Badge>
          ))}
        </Marquee>
      </div>
    </div>
  );
}
