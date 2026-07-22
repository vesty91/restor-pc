import { Section } from "@/components/ui/Section";
import { siteConfig } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  alternates: { canonical: "/politique-confidentialite" },
};

export default function PrivacyPage() {
  return (
    <Section className="pt-20 md:pt-28">
      <div className="max-w-3xl">
        <h1 className="text-3xl md:text-4xl">Politique de confidentialité</h1>
        <p className="mt-4 text-ink-muted leading-relaxed">
          Cette page décrit la manière dont {siteConfig.name} collecte et traite
          vos données personnelles dans le cadre du site et des demandes de
          contact.
        </p>

        <h2 className="mt-10 text-xl">Responsable de traitement</h2>
        <p className="mt-3 text-ink-muted leading-relaxed">
          {siteConfig.legalName}
          <br />
          {siteConfig.address}
          <br />
          {siteConfig.email} — {siteConfig.phone}
        </p>

        <h2 className="mt-10 text-xl">Données collectées</h2>
        <p className="mt-3 text-ink-muted leading-relaxed">
          Via le formulaire de contact : nom, email, téléphone, commune, contenu
          du message, type de demande, service concerné, mode d’intervention,
          niveau d’urgence, et le cas échéant le résumé d’une configuration PC.
          Les champs honeypot anti-spam ne sont pas exploités commercialement.
        </p>

        <h2 className="mt-10 text-xl">Finalités</h2>
        <ul className="mt-3 list-disc pl-5 text-ink-muted space-y-1">
          <li>Répondre à vos demandes de devis et d’assistance</li>
          <li>Assurer le suivi commercial et technique de l’intervention</li>
          <li>Respecter nos obligations légales et comptables</li>
        </ul>

        <h2 className="mt-10 text-xl">Base légale</h2>
        <p className="mt-3 text-ink-muted leading-relaxed">
          Exécution de mesures précontractuelles / contractuelles, intérêt
          légitime (réponse aux demandes), et consentement lorsque requis
          (case à cocher du formulaire).
        </p>

        <h2 className="mt-10 text-xl">Destinataires</h2>
        <p className="mt-3 text-ink-muted leading-relaxed">
          Les données sont destinées à {siteConfig.name}. Elles peuvent
          transiter par des prestataires techniques (hébergement, envoi d’emails
          transactionnels) strictement nécessaires au traitement, sous
          obligation de confidentialité.
        </p>

        <h2 className="mt-10 text-xl">Durée de conservation</h2>
        <p className="mt-3 text-ink-muted leading-relaxed">
          Données de contact : durée nécessaire au traitement de la demande,
          puis archivage limité selon obligations légales (généralement jusqu’à
          3 ans pour la prospection, davantage pour la facturation).
        </p>

        <h2 className="mt-10 text-xl">Vos droits</h2>
        <p className="mt-3 text-ink-muted leading-relaxed">
          Conformément au RGPD, vous disposez d’un droit d’accès, de
          rectification, d’effacement, de limitation, d’opposition et de
          portabilité. Contact : {siteConfig.email}. Vous pouvez également
          saisir la CNIL (www.cnil.fr).
        </p>

        <h2 className="mt-10 text-xl">Cookies</h2>
        <p className="mt-3 text-ink-muted leading-relaxed">
          Le site utilise des cookies / stockage local techniques nécessaires au
          fonctionnement (préférence de thème, mémorisation temporaire d’une
          configuration PC, fermeture du bandeau d’annonce). Aucun cookie
          publicitaire n’est déposé sans consentement préalable.
        </p>
      </div>
    </Section>
  );
}
