import dynamic from "next/dynamic";

/**
 * Server Component wrapper — isole le client Timeline (motion) via dynamic import.
 * SSR conservé pour le SEO et le contenu accessible.
 */
const InterventionTimelineClient = dynamic(
  () =>
    import("@/components/home/InterventionTimelineClient").then(
      (m) => m.InterventionTimelineClient,
    ),
  {
    loading: () => (
      <section className="border-y border-line bg-paper py-16 md:py-20">
        <div className="container-site">
          <p className="text-sm text-ink-muted">Parcours d’intervention…</p>
        </div>
      </section>
    ),
  },
);

export function InterventionTimeline() {
  return <InterventionTimelineClient />;
}
