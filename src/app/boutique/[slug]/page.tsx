import { BuyButton } from "@/components/boutique/BuyButton";
import { ToolGuiPreview } from "@/components/boutique/ToolGuiPreview";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { getOutilDetails } from "@/lib/data/outils-details";
import {
  formatOutilPrice,
  getAllProducts,
  getProductBySlug,
} from "@/lib/data/outils";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Outil" };
  const details = getOutilDetails(product.slug);
  return {
    title: `${product.title} — Boutique`,
    description: details.when || product.tagline,
    alternates: { canonical: `/boutique/${product.slug}` },
  };
}

export default async function BoutiqueProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const isPack = "isPack" in product && product.isPack;
  const details = getOutilDetails(product.slug);

  return (
    <div className="boutique-grid-scene">
      <div className="boutique-grid-bg" aria-hidden />
      <Section className="pt-20 md:pt-28 pb-16">
      <Breadcrumbs
        items={[
          { label: "Boutique", href: "/boutique" },
          { label: product.title },
        ]}
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">
            {isPack ? "Pack" : "Outil atelier"}
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-tight md:text-5xl">
            {product.title}
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-muted">
            {product.tagline}
          </p>

          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full border border-line bg-paper px-3 py-1 text-ink-muted">
              {product.admin ? "Administrateur requis" : "Utilisateur standard OK"}
            </span>
            <span className="rounded-full border border-line bg-paper px-3 py-1 text-ink-muted">
              {product.needsInternet ? "Internet requis (outil)" : "Usage hors-ligne"}
            </span>
            <span className="rounded-full border border-line bg-paper px-3 py-1 text-ink-muted">
              Licence 1 PC
            </span>
          </div>

          <div className="mt-8 lg:hidden">
            <ToolGuiPreview title={product.title} kind={details.preview} exe={details.exe} />
          </div>

          <div className="mt-8 rounded-[20px] border border-teal/25 bg-teal-soft/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">
              Quand l’utiliser
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink">{details.when}</p>
          </div>

          <div className="mt-8">
            <h2 className="font-display text-2xl tracking-tight">À quoi ça sert</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
              {details.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-teal" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8">
            <h2 className="font-display text-2xl tracking-tight">Mode d’emploi</h2>
            <ol className="mt-4 space-y-3 text-sm text-ink-muted">
              {details.steps.map((s, i) => (
                <li key={s} className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-panel text-xs font-semibold text-panel-fg">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{s}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-8">
            <h2 className="font-display text-2xl tracking-tight">Conseils</h2>
            <ul className="mt-4 space-y-2 text-sm text-ink-muted">
              {details.tips.map((t) => (
                <li key={t}>· {t}</li>
              ))}
            </ul>
          </div>

          <p className="mt-8 text-xs text-ink-muted">
            Fichier : <code className="rounded bg-surface-2 px-1.5 py-0.5 text-ink">{details.exe}</code>
            {" · "}
            Guide HTML / PDF inclus dans le ZIP
          </p>
        </div>

        <div className="space-y-5 lg:sticky lg:top-28">
          <div className="hidden lg:block">
            <ToolGuiPreview title={product.title} kind={details.preview} exe={details.exe} />
          </div>
          <div className="rounded-[24px] border border-line bg-paper p-6 md:p-7">
            <p className="font-display text-3xl tracking-tight">
              {formatOutilPrice(product.priceCents)}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-ink-muted">
              <li>
                <strong className="text-ink">Compte obligatoire</strong> pour acheter et
                retrouver licence + téléchargement.
              </li>
              <li>Licence liée à <strong className="text-ink">1 PC</strong> (1re activation).</li>
              <li>Lien de téléchargement <strong className="text-ink">1 fois</strong> + mot de passe.</li>
              <li>Email immédiat après paiement (clé + lien).</li>
            </ul>
            <div className="mt-5">
              <BuyButton
                slug={product.slug}
                label={`Payer ${formatOutilPrice(product.priceCents)}`}
              />
            </div>
            <p className="mt-3 text-center text-xs text-ink-muted">
              <a href="/conditions-vente" className="text-teal underline underline-offset-2">
                Conditions générales de vente
              </a>
              <span className="mx-1">·</span>
              Usage des scripts sous votre responsabilité exclusive.
            </p>
            <Button href="/boutique" variant="ghost" className="mt-4 w-full" size="sm">
              Retour à la boutique
            </Button>
          </div>
        </div>
      </div>
    </Section>
    </div>
  );
}
