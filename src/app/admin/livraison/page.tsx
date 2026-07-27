import { AtelierPanel } from "@/components/atelier/AtelierPanel";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Section";
import { isAtelierAuthed } from "@/lib/atelier-auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin — Livraison",
  robots: { index: false, follow: false },
};

export default async function AdminLivraisonPage() {
  const authed = await isAtelierAuthed();
  if (!authed) redirect("/admin");

  return (
    <Section className="noise-bg pt-20 md:pt-28 pb-16">
      <Breadcrumbs
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Livraison" },
        ]}
      />
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <SectionHeader
          eyebrow="Admin"
          title="Livraison manuelle"
          description="Licence + lien NAS 1 téléchargement + email (hors Stripe)."
        />
        <Button href="/admin" variant="ghost" size="sm">
          ← Tableau de bord
        </Button>
      </div>
      <AtelierPanel authed />
    </Section>
  );
}
