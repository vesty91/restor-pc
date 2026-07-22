import { ExternalLink, Navigation } from "lucide-react";
import { siteConfig } from "@/lib/site";

export function AddressMap({
  className,
  showActions = true,
}: {
  className?: string;
  showActions?: boolean;
}) {
  return (
    <div className={className}>
      <div className="overflow-hidden rounded-[20px] border border-line bg-paper shadow-[var(--shadow-soft)]">
        <iframe
          title={`Carte — ${siteConfig.address}`}
          src={siteConfig.mapsEmbedUrl}
          className="h-56 w-full border-0 md:h-64"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <div className="border-t border-line p-4 md:p-5">
          <p className="font-semibold">{siteConfig.addressShort}</p>
          <p className="mt-1 text-sm text-ink-muted">{siteConfig.transport}</p>
          {showActions ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={siteConfig.mapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-teal px-4 text-sm font-semibold text-white"
              >
                <Navigation className="h-4 w-4" />
                Itinéraire
              </a>
              <a
                href={siteConfig.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-paper px-4 text-sm font-semibold text-ink hover:bg-surface"
              >
                <ExternalLink className="h-4 w-4 text-teal" />
                Voir sur Maps
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
