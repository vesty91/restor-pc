import { CompteAuthForm } from "@/components/compte/CompteAuthForm";
import { CompteDashboard } from "@/components/compte/CompteDashboard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section, SectionHeader } from "@/components/ui/Section";
import { getCompteUser } from "@/lib/supabase/server";
import { getUserFirstName } from "@/lib/user-display";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Mon compte",
  description: "Espace client Restor-PC à Yerres : suivez vos commandes boutique, téléchargez vos outils logiciels et gérez vos licences.",
  path: "/compte",
  robots: { index: false, follow: false },
});

export default async function ComptePage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; next?: string; error?: string }>;
}) {
  const user = await getCompteUser();
  const params = await searchParams;
  const mode = params.mode === "login" ? "login" : "signup";
  const nextPath = params.next?.startsWith("/") ? params.next : undefined;
  const fromBoutique = Boolean(nextPath?.startsWith("/boutique/"));
  const oauthError = params.error === "oauth";
  const firstName = getUserFirstName(user);

  return (
    <Section className="noise-bg pt-20 md:pt-28 pb-16">
      <Breadcrumbs items={[{ label: firstName || "Compte" }]} />
      <div className="mt-6">
        <SectionHeader
          as="h1"
          eyebrow="Espace client"
          title={
            user
              ? firstName
                ? `Bonjour ${firstName}`
                : "Espace personnel"
              : fromBoutique
                ? "Compte requis"
                : "Mon compte"
          }
          description={
            user
              ? "Vos commandes boutique et clés de licence."
              : fromBoutique
                ? "Créez votre compte (obligatoire) pour payer et retrouver votre licence."
                : "Google, GitHub ou email — un compte est requis pour acheter et gérer vos licences."
          }
        />
      </div>
      {user?.email ? (
        <CompteDashboard email={user.email} firstName={firstName} />
      ) : (
        <CompteAuthForm
          initialMode={mode}
          nextPath={nextPath}
          oauthError={oauthError}
        />
      )}
    </Section>
  );
}
