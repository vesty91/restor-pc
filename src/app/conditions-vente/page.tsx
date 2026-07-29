import { Section } from "@/components/ui/Section";
import { siteConfig } from "@/lib/site";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Conditions générales de vente",
  description:
    "Conditions générales de vente des outils logiciels Restor-PC — boutique en ligne.",
  path: "/conditions-vente",
});

export default function ConditionsVentePage() {
  const { legal } = siteConfig;

  return (
    <Section className="pt-20 md:pt-28 max-w-none">
      <div className="container-site prose-legal max-w-3xl">
        <h1 className="text-3xl md:text-4xl">Conditions générales de vente</h1>
        <p className="mt-4 text-ink-muted">
          Applicables aux achats d’outils logiciels sur la boutique{" "}
          <strong className="text-ink">{siteConfig.url}/boutique</strong>. Dernière
          mise à jour : juillet 2026.
        </p>

        <h2 className="mt-10 text-xl">1. Vendeur</h2>
        <p className="mt-3 text-ink-muted leading-relaxed">
          {siteConfig.legalName} — {legal.legalForm}
          <br />
          {siteConfig.address}
          <br />
          SIRET : {legal.siret}
          <br />
          Email : {siteConfig.email} · Téléphone : {siteConfig.phone}
        </p>

        <h2 className="mt-10 text-xl">2. Produits</h2>
        <p className="mt-3 text-ink-muted leading-relaxed">
          La boutique propose des outils logiciels Windows (scripts / exécutables)
          destinés à l’entretien, le diagnostic et la maintenance informatique.
          Chaque produit est décrit sur sa page boutique (fonctionnalités, prix,
          compatibilité). Les contenus sont fournis en téléchargement numérique ;
          aucun envoi physique.
        </p>

        <h2 className="mt-10 text-xl">3. Prix et paiement</h2>
        <p className="mt-3 text-ink-muted leading-relaxed">
          Les prix sont indiqués en euros (€), toutes taxes comprises pour un
          entrepreneur non assujetti à la TVA (article 293 B du CGI) ou selon la
          situation fiscale affichée au moment de l’achat. Le paiement est exigé
          immédiatement en ligne via Stripe (carte bancaire). La commande n’est
          confirmée qu’après acceptation du paiement par l’établissement
          bancaire.
        </p>

        <h2 className="mt-10 text-xl">4. Compte client</h2>
        <p className="mt-3 text-ink-muted leading-relaxed">
          Un compte client (email, mot de passe, ou connexion Google / GitHub) est
          obligatoire pour acheter. Il permet de retrouver vos licences, liens de
          téléchargement et historique de commandes dans l’espace « Mon compte ».
          Vous êtes responsable de la confidentialité de vos identifiants.
        </p>

        <h2 className="mt-10 text-xl">5. Livraison et accès</h2>
        <p className="mt-3 text-ink-muted leading-relaxed">
          Après paiement validé, vous recevez par email :
        </p>
        <ul className="mt-2 list-disc pl-5 text-ink-muted space-y-1">
          <li>une clé de licence personnelle ;</li>
          <li>
            un lien de téléchargement sécurisé (fichier ZIP), avec mot de passe
            si applicable, et durée de validité limitée ;
          </li>
          <li>
            l’accès aux mêmes informations dans votre espace client.
          </li>
        </ul>
        <p className="mt-3 text-ink-muted leading-relaxed">
          En cas d’échec d’envoi de l’email, la commande reste enregistrée : vous
          pouvez renvoyer l’email depuis « Mon compte » ou nous contacter.
        </p>

        <h2 className="mt-10 text-xl">6. Licence d’utilisation</h2>
        <p className="mt-3 text-ink-muted leading-relaxed">
          Chaque achat confère une licence d’utilisation personnelle ou
          professionnelle interne, non transférable, pour le nombre de machines
          indiqué (généralement une machine). La licence est liée à l’identifiant
          matériel de l’ordinateur lors de la première activation. Toute
          reproduction, redistribution ou revente des fichiers est interdite sans
          autorisation écrite.
        </p>

        <h2 className="mt-10 text-xl">7. Droit de rétractation</h2>
        <p className="mt-3 text-ink-muted leading-relaxed">
          Pour les contenus numériques fournis immédiatement après l’achat, le
          droit de rétractation de 14 jours ne s’applique pas si vous avez
          expressément accepté la fourniture immédiate et reconnu perdre ce droit
          (article L221-28 du Code de la consommation). En cas de dysfonctionnement
          avéré imputable au logiciel, contactez-nous pour une solution amiable
          (nouveau lien, assistance, remplacement de licence).
        </p>

        <h2 className="mt-10 text-xl">8. Responsabilité et usage des outils</h2>
        <p className="mt-3 text-ink-muted leading-relaxed">
          Les outils logiciels (scripts, exécutables, guides) sont fournis « en
          l’état », sans garantie expresse ou implicite de résultat, de
          compatibilité ou d’adéquation à un usage particulier.
        </p>
        <p className="mt-3 text-ink-muted leading-relaxed">
          <strong className="text-ink">
            L’utilisation des scripts et outils téléchargés est effectuée sous la
            responsabilité entière et exclusive de l’acheteur ou de l’utilisateur
            final.
          </strong>{ " "}
          {siteConfig.name} n’assume aucune responsabilité quant aux conséquences
          de leur exécution sur les systèmes, les données, les logiciels, les
          réseaux ou tout équipement concerné.
        </p>
        <ul className="mt-3 list-disc pl-5 text-ink-muted space-y-1">
          <li>
            perte, corruption ou suppression de données, fichiers ou
            configurations ;
          </li>
          <li>
            dysfonctionnements matériels ou logiciels, incompatibilités,
            instabilité du système ;
          </li>
          <li>
            interruption d’activité, perte de chiffre d’affaires ou dommages
            indirects de toute nature ;
          </li>
          <li>
            utilisation non conforme, sans sauvegarde préalable, sans droits
            administrateur requis, ou sur un système non adapté ;
          </li>
          <li>
            usage sur des machines, comptes ou environnements pour lesquels
            l’utilisateur n’a pas l’autorisation appropriée.
          </li>
        </ul>
        <p className="mt-3 text-ink-muted leading-relaxed">
          L’acheteur reconnaît avoir les compétences nécessaires — ou faire
          appel à un professionnel — pour évaluer l’opportunité d’exécuter chaque
          outil. Une sauvegarde complète et un point de restauration sont
          fortement recommandés avant toute opération de maintenance, nettoyage,
          modification système ou réseau.
        </p>
        <p className="mt-3 text-ink-muted leading-relaxed">
          En validant un achat sur la boutique, vous acceptez ces conditions et
          confirmez que {siteConfig.name} ne pourra être tenu responsable des
          effets liés à l’utilisation des scripts, dans les limites permises par
          la loi.
        </p>

        <h2 className="mt-10 text-xl">9. Données personnelles</h2>
        <p className="mt-3 text-ink-muted leading-relaxed">
          Les données liées à la commande et au compte sont traitées conformément à
          notre{" "}
          <a href="/politique-confidentialite" className="text-teal underline">
            politique de confidentialité
          </a>
          .
        </p>

        <h2 className="mt-10 text-xl">10. Médiation et litiges</h2>
        <p className="mt-3 text-ink-muted leading-relaxed">
          En cas de litige, contactez-nous en priorité à {siteConfig.email}.{" "}
          {legal.mediator
            ? `Vous pouvez également recourir au médiateur : ${legal.mediator.name} (${legal.mediator.url}).`
            : "Conformément au Code de la consommation, vous pouvez recourir gratuitement à un médiateur de la consommation (coordonnées publiées sur la page Mentions légales)."}
          À défaut de résolution amiable, les tribunaux français seront seuls
          compétents.
        </p>
      </div>
    </Section>
  );
}
