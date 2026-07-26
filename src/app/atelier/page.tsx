import { AtelierPanel } from "@/components/atelier/AtelierPanel";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section, SectionHeader } from "@/components/ui/Section";
import { isAtelierAuthed } from "@/lib/atelier-auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Espace atelier",
  robots: { index: false, follow: false },
};

export default async function AtelierPage() {
  const authed = await isAtelierAuthed();

  return (
    <Section className="noise-bg pt-20 md:pt-28 pb-16">
      <Breadcrumbs items={[{ label: "Atelier" }]} />
      <div className="mt-6">
        <SectionHeader
          eyebrow="Interne"
          title="Livraison manuelle"
          description="Réservé à l’atelier Restor-PC — hors Stripe, pour un client en magasin ou un re-livraison."
        />
      </div>
      <AtelierPanel authed={authed} />
    </Section>
  );
}
