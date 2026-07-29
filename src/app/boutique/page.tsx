import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BoutiqueCatalog } from "@/components/boutique/BoutiqueCatalog";
import { BoutiqueFaq } from "@/components/boutique/BoutiqueFaq";
import { BoutiqueGridBg } from "@/components/boutique/BoutiqueGridBg";
import { ToolGuiPreview } from "@/components/boutique/ToolGuiPreview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Section";
import { BorderBeam } from "@/components/magicui/border-beam";
import { getOutilDetails } from "@/lib/data/outils-details";
import {
  formatOutilPrice,
  getAllProducts,
  packComplet,
  outilsCatalog,
} from "@/lib/data/outils";
import { Download, Shield, Wifi } from "lucide-react";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import Link from "next/link";

export const metadata: Metadata = buildPageMetadata({
  title: "Boutique outils atelier",
  description: "Achetez les outils Restor-PC : fiches détaillées, licence 1 PC, téléchargement sécurisé (1 fois), guides inclus.",
  path: "/boutique",
});

export default function BoutiquePage({
  searchParams,
}: {
  searchParams?: Promise<{ canceled?: string }>;
}) {
  return <BoutiqueInner searchParams={searchParams} />;
}

async function BoutiqueInner({
  searchParams,
}: {
  searchParams?: Promise<{ canceled?: string }>;
}) {
  const sp = searchParams ? await searchParams : {};
  const products = getAllProducts();
  const packDetails = getOutilDetails(packComplet.slug);

  return (
    <div className="boutique-grid-scene">
      <BoutiqueGridBg />
      <Section className="pb-16 pt-20 md:pb-20 md:pt-28">
        <Breadcrumbs items={[{ label: "Boutique", href: "/boutique" }]} />
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge variant="info">Outils atelier</Badge>
          <Badge variant="outline">Licence 1 PC</Badge>
          <Badge variant="success">Paiement Stripe</Badge>
        </div>
        <SectionHeader
          as="h1"
          eyebrow="Boutique"
          title="Outils atelier Restor-PC"
          description="Fiches détaillées, licence liée à 1 PC, email avec clé + lien de téléchargement (1 fois)."
        />

        {sp.canceled === "1" ? (
          <p className="mt-4 rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-muted">
            <Badge variant="warning" className="mb-2 mr-2">
              Paiement annulé
            </Badge>
            Vous pouvez réessayer quand vous voulez.
          </p>
        ) : null}

        <ul className="mt-5 flex flex-wrap gap-3 text-sm text-ink-muted">
          <li className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5">
            <Shield className="size-4 text-teal" aria-hidden /> 1 licence = 1 PC
          </li>
          <li className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5">
            <Download className="size-4 text-teal" aria-hidden /> Lien NAS 1 téléchargement
          </li>
          <li className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5">
            <Wifi className="size-4 text-teal" aria-hidden /> Guides HTML/PDF inclus
          </li>
        </ul>

        <article className="relative mt-8 grid gap-6 overflow-hidden rounded-[24px] border border-teal/35 bg-panel p-6 text-panel-fg md:grid-cols-[1.1fr_0.9fr] md:p-8">
          <BorderBeam size={80} duration={9} borderWidth={1.5} />
          <div className="relative">
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="info"
                className="border-transparent bg-[#4ba3ff]/20 text-[#9ec9f5]"
              >
                Pack
              </Badge>
              <Badge
                variant="outline"
                className="border-white/20 bg-white/5 text-white/80"
              >
                Meilleure valeur
              </Badge>
            </div>
            <h2 className="mt-3 font-display text-3xl tracking-tight">
              {packComplet.title}
            </h2>
            <p className="mt-2 max-w-2xl text-white/65">{packComplet.tagline}</p>
            <p className="mt-3 text-sm text-white/55">{packDetails.when}</p>
            <p className="mt-4 font-display text-3xl">
              {formatOutilPrice(packComplet.priceCents)}
            </p>
            <div className="mt-6">
              <Button href={`/boutique/${packComplet.slug}`} size="lg">
                Voir le détail du pack
              </Button>
            </div>
          </div>
          <ToolGuiPreview
            title={packComplet.title}
            kind={packDetails.preview}
            exe={packDetails.exe}
            className="relative border-white/10"
          />
        </article>

        <BoutiqueCatalog tools={outilsCatalog} />

        <p className="mt-8 text-center text-sm text-ink-muted">
          {products.length} produits · paiement sécurisé Stripe ·{" "}
          <Link href="/conditions-vente" className="text-teal underline underline-offset-2">
            CGV
          </Link>
        </p>
      </Section>

      <Section className="pb-16 pt-6 md:pb-20 md:pt-8">
        <Badge variant="muted" className="mb-3">
          FAQ boutique
        </Badge>
        <SectionHeader
          eyebrow="Boutique"
          title="Questions fréquentes"
          description="Licence, téléchargement, compte client et responsabilité d’usage."
        />
        <BoutiqueFaq />
        <p className="mt-6 text-center text-sm text-ink-muted">
          Plus de questions ?{" "}
          <Link href="/faq" className="font-semibold text-teal underline underline-offset-2">
            FAQ complète
          </Link>
          {" · "}
          <Link href="/contact" className="font-semibold text-teal underline underline-offset-2">
            Contact
          </Link>
        </p>
      </Section>
    </div>
  );
}
