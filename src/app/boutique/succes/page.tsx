import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paiement confirmé",
  robots: { index: false, follow: false },
};

export default async function BoutiqueSuccesPage({
  searchParams,
}: {
  searchParams?: Promise<{ session_id?: string }>;
}) {
  const sp = searchParams ? await searchParams : {};
  return (
    <Section className="noise-bg pt-20 md:pt-28 pb-16">
      <Breadcrumbs
        items={[
          { label: "Boutique", href: "/boutique" },
          { label: "Succès" },
        ]}
      />
      <div className="mt-6">
        <SectionHeader
          eyebrow="Commande"
          title="Paiement bien reçu"
          description="Vérifiez votre boîte mail (et les spams) : clé de licence + lien de téléchargement (1 fois) + mot de passe."
        />
      </div>
      {sp.session_id ? (
        <p className="mt-4 text-xs text-ink-muted">Réf. session : {sp.session_id}</p>
      ) : null}
      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/boutique" variant="primary">
          Retour boutique
        </Button>
        <Button href="/contact" variant="secondary">
          Besoin d’aide
        </Button>
      </div>
    </Section>
  );
}
