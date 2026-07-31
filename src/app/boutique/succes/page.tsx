import { PurchaseSuccessTracker } from "@/components/analytics/PurchaseSuccessTracker";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StatusBadge } from "@/components/restor-pc/status-badge";
import { Badge } from "@/components/ui/badge";
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
    <Section className="noise-bg pb-16 pt-20 md:pt-28">
      <PurchaseSuccessTracker sessionId={sp.session_id} />
      <Breadcrumbs
        items={[
          { label: "Boutique", href: "/boutique" },
          { label: "Succès" },
        ]}
      />
      <div className="mt-6">
        <div className="mb-4 flex flex-wrap gap-2">
          <StatusBadge status="fulfilled" />
          <Badge variant="info">Email en cours d’envoi</Badge>
        </div>
        <SectionHeader
          eyebrow="Commande"
          title="Paiement bien reçu"
          description="Vérifiez votre boîte mail (et les spams). Si rien n’arrive, ouvrez Mon compte : licence + lien + mot de passe y sont déjà."
        />
      </div>
      {sp.session_id ? (
        <p className="mt-4 text-xs text-ink-muted">
          Réf. session : <code className="rounded bg-surface-2 px-1.5 py-0.5">{sp.session_id}</code>
        </p>
      ) : null}
      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/compte" variant="primary">
          Voir mon compte
        </Button>
        <Button href="/boutique" variant="secondary">
          Retour boutique
        </Button>
        <Button href="/contact" variant="secondary">
          Besoin d’aide
        </Button>
      </div>
    </Section>
  );
}
