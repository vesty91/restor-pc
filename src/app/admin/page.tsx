import { AdminDashboard, AdminLogin } from "@/components/admin/AdminHome";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section, SectionHeader } from "@/components/ui/Section";
import { isAtelierAuthed } from "@/lib/atelier-auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const authed = await isAtelierAuthed();

  return (
    <Section className="noise-bg pt-20 md:pt-28 pb-16">
      <Breadcrumbs items={[{ label: "Admin" }]} />
      <div className="mt-6">
        <SectionHeader
          eyebrow="Interne"
          title="Administration"
          description="Espace privé Restor-PC — livraison manuelle et gestion des licences."
        />
      </div>
      {authed ? <AdminDashboard /> : <AdminLogin />}
    </Section>
  );
}
