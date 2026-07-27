import { LicensesPanel } from "@/components/atelier/LicensesPanel";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Section";
import { isAtelierAuthed } from "@/lib/atelier-auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin — Licences",
  robots: { index: false, follow: false },
};

export default async function AdminLicencesPage() {
  const authed = await isAtelierAuthed();
  if (!authed) redirect("/admin");

  return (
    <Section className="noise-bg pt-20 md:pt-28 pb-16">
      <Breadcrumbs
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Licences" },
        ]}
      />
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <SectionHeader
          eyebrow="Admin"
          title="Licences"
          description="Créer, chercher, révoquer ou détacher un PC."
        />
        <Button href="/admin" variant="ghost" size="sm">
          ← Tableau de bord
        </Button>
      </div>
      <LicensesPanel authed />
    </Section>
  );
}
