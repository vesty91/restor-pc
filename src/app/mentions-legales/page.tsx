import { Section } from "@/components/ui/Section";
import { siteConfig } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
  robots: { index: true, follow: true },
  alternates: { canonical: "/mentions-legales" },
};

function orPending(value: string | null | undefined) {
  return value?.trim() || "À compléter";
}

export default function MentionsLegalesPage() {
  const { legal } = siteConfig;

  return (
    <Section className="pt-20 md:pt-28 max-w-none">
      <div className="container-site prose-legal max-w-3xl">
        <h1 className="text-3xl md:text-4xl">Mentions légales</h1>
        <p className="mt-4 text-ink-muted">
          Conformément aux dispositions des articles 6-III et 19 de la loi n°
          2004-575 du 21 juin 2004 pour la Confiance dans l’économie numérique.
        </p>

        <h2 className="mt-10 text-xl">Éditeur du site</h2>
        <p className="mt-3 text-ink-muted leading-relaxed">
          {siteConfig.legalName}
          <br />
          Forme juridique : {orPending(legal.legalForm)}
          {legal.capital ? (
            <>
              <br />
              Capital social : {legal.capital}
            </>
          ) : null}
          <br />
          Siège social : {siteConfig.address}
          <br />
          SIRET : {orPending(legal.siret)}
          <br />
          RCS : {orPending(legal.rcs)}
          <br />
          TVA intracommunautaire : {orPending(legal.vat)}
          <br />
          Directeur de la publication :{" "}
          {orPending(legal.publicationDirector)}
          <br />
          Contact : {siteConfig.email} · {siteConfig.phone}
        </p>

        <h2 className="mt-10 text-xl">Hébergement</h2>
        <p className="mt-3 text-ink-muted leading-relaxed">
          Hébergeur : {legal.host.name}
          <br />
          Adresse : {legal.host.address}
          <br />
          Site :{" "}
          <a
            href={legal.host.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal underline"
          >
            {legal.host.url}
          </a>
        </p>

        <h2 className="mt-10 text-xl">Propriété intellectuelle</h2>
        <p className="mt-3 text-ink-muted leading-relaxed">
          L’ensemble des contenus présents sur ce site (textes, visuels,
          identité, structure) est protégé. Toute reproduction non autorisée est
          interdite.
        </p>

        <h2 className="mt-10 text-xl">Responsabilité</h2>
        <p className="mt-3 text-ink-muted leading-relaxed">
          Les informations publiées sont indicatives. Restor-PC s’efforce d’en
          assurer l’exactitude mais ne saurait être tenu responsable d’éventuelles
          omissions ou erreurs. Les devis et interventions font l’objet
          d’accords spécifiques.
        </p>
      </div>
    </Section>
  );
}
