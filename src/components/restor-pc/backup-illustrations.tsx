import { StorageStatus } from "@/components/animata/storage-status";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

/**
 * Section NAS / sauvegarde — illustration Animata Storage Status.
 * Données fictives clairement présentées comme exemple pédagogique.
 */
export function BackupIllustrations() {
  return (
    <Section className="bg-paper border-y border-line">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <SectionHeader
            eyebrow="Sauvegarde"
            title="Une stratégie claire plutôt qu’un disque oublié"
            description="On explique la répartition type d’un NAS ou d’un poste de travail — sans afficher de fausse télémétrie en direct."
          />
          <ul className="mt-4 space-y-2 text-sm text-ink-muted">
            <li>· Système et applications séparés des données critiques</li>
            <li>· Copies locales + copie hors site (principe 3-2-1)</li>
            <li>· Tests de restauration ponctuels</li>
          </ul>
          <div className="mt-6">
            <Button href="/services/sauvegarde-securite" variant="secondary">
              Voir la prestation sauvegarde
            </Button>
          </div>
        </div>
        <div className="flex justify-center lg:justify-end">
          <StorageStatus
            totalGb={512}
            used={[
              { label: "Système", value: 48, color: "bg-[#243044]" },
              { label: "Docs", value: 96, color: "bg-teal-deep" },
              { label: "Médias", value: 140, color: "bg-teal" },
            ]}
          />
        </div>
      </div>
    </Section>
  );
}
