import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/ui/Section";
import { siteConfig } from "@/lib/site";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité Restor-PC : données personnelles, cookies, espace client, boutique en ligne et droits RGPD.",
  path: "/politique-confidentialite",
});

export default function PrivacyPage() {
  return (
    <Section className="pt-20 md:pt-28">
      <div className="max-w-3xl">
        <Breadcrumbs items={[{ label: "Confidentialité" }]} />
        <h1 className="text-3xl md:text-4xl">Politique de confidentialité</h1>
        <p className="mt-4 text-ink-muted leading-relaxed">
          Cette page décrit la manière dont {siteConfig.name} collecte et traite
          vos données personnelles sur le site, l’espace client et la boutique
          d’outils logiciels. Dernière mise à jour : juillet 2026.
        </p>

        <h2 className="mt-10 text-xl">Responsable de traitement</h2>
        <p className="mt-3 text-ink-muted leading-relaxed">
          {siteConfig.legalName}
          <br />
          {siteConfig.address}
          <br />
          SIRET : {siteConfig.legal.siret}
          <br />
          {siteConfig.email} — {siteConfig.phone}
        </p>

        <h2 className="mt-10 text-xl">Formulaire de contact</h2>
        <p className="mt-3 text-ink-muted leading-relaxed">
          Données collectées : nom, email, téléphone, commune, contenu du message,
          type de demande, service concerné, mode d’intervention, niveau d’urgence,
          et le cas échéant le résumé d’une configuration PC. Les champs honeypot
          anti-spam ne sont pas exploités commercialement.
        </p>
        <p className="mt-2 text-ink-muted leading-relaxed">
          <strong className="text-ink">Finalités :</strong> répondre à vos
          demandes, assurer le suivi commercial et technique, respecter nos
          obligations légales.
          <br />
          <strong className="text-ink">Base légale :</strong> mesures
          précontractuelles / contractuelles, intérêt légitime, consentement
          (case à cocher du formulaire).
        </p>

        <h2 className="mt-10 text-xl">Espace client et compte</h2>
        <p className="mt-3 text-ink-muted leading-relaxed">
          Pour créer un compte et acheter sur la boutique, nous collectons votre
          email et, selon la méthode choisie :
        </p>
        <ul className="mt-2 list-disc pl-5 text-ink-muted space-y-1">
          <li>
            <strong className="text-ink">Email / mot de passe</strong> — email et
            mot de passe (hashé, jamais stocké en clair) ;
          </li>
          <li>
            <strong className="text-ink">Google ou GitHub</strong> — identifiant
            OAuth, email, nom / prénom si fournis par le fournisseur ;
          </li>
          <li>
            <strong className="text-ink">Prénom affiché</strong> — optionnel, dans
            les métadonnées du compte pour personnaliser le menu du site.
          </li>
        </ul>
        <p className="mt-3 text-ink-muted leading-relaxed">
          <strong className="text-ink">Finalités :</strong> authentification,
          gestion du compte, liaison des commandes et licences à votre email,
          historique d’achats dans « Mon compte ».
          <br />
          <strong className="text-ink">Base légale :</strong> exécution du
          contrat (achat boutique), consentement pour la connexion OAuth.
        </p>

        <h2 className="mt-10 text-xl">Boutique et paiements</h2>
        <p className="mt-3 text-ink-muted leading-relaxed">
          Lors d’un achat, nous enregistrons : identifiant de commande, outil
          acheté, email client, clé de licence, statut de paiement, dates,
          statut d’envoi des emails, et métadonnées techniques de livraison (lien
          de téléchargement temporaire). Le paiement est traité par{" "}
          <strong className="text-ink">Stripe</strong> : nous ne stockons pas vos
          données de carte bancaire ; Stripe agit en tant que sous-traitant
          conforme PCI-DSS.
        </p>
        <p className="mt-2 text-ink-muted leading-relaxed">
          <strong className="text-ink">Finalités :</strong> traitement de la
          commande, délivrance de la licence, envoi du lien de téléchargement,
          support client, facturation si applicable.
          <br />
          <strong className="text-ink">Base légale :</strong> exécution du
          contrat.
        </p>

        <h2 className="mt-10 text-xl">Licences logicielles</h2>
        <p className="mt-3 text-ink-muted leading-relaxed">
          Lors de l’activation d’un outil sur un ordinateur, nous recevons un
          identifiant matériel (empreinte machine), le nom du PC et le numéro de
          série BIOS si disponible, pour lier la licence à la machine autorisée et
          prévenir l’usage frauduleux. Ces données sont associées à votre clé de
          licence et visible dans notre interface d’administration atelier.
        </p>
        <p className="mt-3 text-ink-muted leading-relaxed">
          L’usage des outils sur votre machine relève de votre responsabilité.
          Consultez les{" "}
          <a href="/conditions-vente" className="text-teal underline">
            conditions générales de vente
          </a>
          .
        </p>

        <h2 className="mt-10 text-xl">Sous-traitants techniques</h2>
        <ul className="mt-3 list-disc pl-5 text-ink-muted space-y-1">
          <li>
            <strong className="text-ink">Vercel</strong> — hébergement du site ;
          </li>
          <li>
            <strong className="text-ink">Supabase</strong> — authentification
            compte client, base de données commandes et licences ;
          </li>
          <li>
            <strong className="text-ink">Stripe</strong> — paiement en ligne ;
          </li>
          <li>
            <strong className="text-ink">Resend</strong> — envoi d’emails
            (contact, confirmations d’achat) ;
          </li>
          <li>
            <strong className="text-ink">Synology (NAS)</strong> — stockage et
            liens de téléchargement des fichiers logiciels ;
          </li>
          <li>
            <strong className="text-ink">Google / GitHub</strong> — uniquement si
            vous choisissez la connexion OAuth correspondante.
          </li>
        </ul>
        <p className="mt-3 text-ink-muted leading-relaxed">
          Ces prestataires traitent les données uniquement pour nos besoins
          techniques, sous obligation de confidentialité et conformité RGPD.
        </p>

        <h2 className="mt-10 text-xl">Durée de conservation</h2>
        <ul className="mt-3 list-disc pl-5 text-ink-muted space-y-1">
          <li>Demandes de contact : durée du traitement, puis archivage limité ;</li>
          <li>
            Compte client et commandes : durée de la relation commerciale et
            obligations légales (généralement 3 ans pour la prospection, davantage
            pour la facturation) ;
          </li>
          <li>
            Licences et empreintes machine : durée de validité de la licence et
            obligations légales associées.
          </li>
        </ul>

        <h2 className="mt-10 text-xl">Vos droits</h2>
        <p className="mt-3 text-ink-muted leading-relaxed">
          Conformément au RGPD, vous disposez d’un droit d’accès, de
          rectification, d’effacement, de limitation, d’opposition et de
          portabilité. Contact : {siteConfig.email}. Vous pouvez également
          saisir la CNIL (
          <a
            href="https://www.cnil.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal underline"
          >
            www.cnil.fr
          </a>
          ).
        </p>

        <h2 id="cookies" className="mt-10 text-xl scroll-mt-24">
          Cookies et stockage local
        </h2>
        <p className="mt-3 text-ink-muted leading-relaxed">
          Le site utilise des cookies et stockage local techniques nécessaires au
          fonctionnement : session d’authentification (Supabase), préférence de
          thème, mémorisation temporaire d’une configuration PC, fermeture du
          bandeau d’annonce, et mémorisation de votre choix de mesure d’audience.
        </p>
        <p className="mt-3 text-ink-muted leading-relaxed">
          Avec votre consentement explicite, nous activons{" "}
          <strong className="text-ink">Google Analytics 4</strong> (mesure
          d’audience uniquement) pour comprendre les visites et les conversions
          utiles : clic téléphone, clic e-mail, envoi du formulaire de contact,
          demande de devis ou de rendez-vous, et paiement boutique réussi. IP
          anonymisée. Aucune publicité ciblée, aucun cookie publicitaire sans
          consentement. Vous pouvez accepter ou refuser via le bandeau, ou
          modifier votre choix via le lien « Cookies » du pied de page.
        </p>
        <p className="mt-3 text-ink-muted leading-relaxed">
          Base légale : consentement (art. 6.1.a RGPD) pour la mesure d’audience
          non essentielle. Sans consentement, GA4 n’est pas chargé.
        </p>

        <h2 className="mt-10 text-xl">Liens utiles</h2>
        <ul className="mt-3 list-disc pl-5 text-ink-muted space-y-1">
          <li>
            <a href="/mentions-legales" className="text-teal underline">
              Mentions légales
            </a>
          </li>
          <li>
            <a href="/conditions-vente" className="text-teal underline">
              Conditions générales de vente
            </a>
          </li>
        </ul>
      </div>
    </Section>
  );
}
