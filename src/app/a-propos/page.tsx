import { CtaBand } from "@/components/CtaBand";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AboutHero } from "@/components/a-propos/AboutHero";
import { AnimatedStat } from "@/components/AnimatedStat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { processSteps } from "@/lib/data/faq";
import { commitments, trustStats } from "@/lib/data/testimonials";
import { siteConfig } from "@/lib/site";
import {
  FileCheck2,
  LockKeyhole,
  MapPin,
  MessageCircle,
  Shield,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import Link from "next/link";

export const metadata: Metadata = buildPageMetadata({
  title: "À propos — Atelier Yerres",
  description:
    "Restor-PC, atelier de dépannage informatique à Yerres (91) : méthode, transparence et exigence technique au 3 rue Auber.",
  path: "/a-propos",
});

const commitmentIcons = [FileCheck2, LockKeyhole, Shield, MessageCircle];

const audience = [
  "Particuliers & familles",
  "Indépendants & créatifs",
  "Gamers & passionnés",
  "TPE / petites équipes",
];

export default function AboutPage() {
  return (
    <>
      <Section className="noise-bg pb-8 pt-20 md:pt-28">
        <Breadcrumbs items={[{ label: "À propos" }]} />
        <div className="mt-6">
          <AboutHero />
        </div>
      </Section>

      <Section className="border-y border-line bg-paper py-10 md:py-12">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-4">
          {trustStats.map((stat) => (
            <div key={stat.label} className="text-center md:text-left">
              <p className="font-display text-3xl tracking-tight text-ink md:text-4xl">
                <AnimatedStat value={stat.value} />
              </p>
              <p className="mt-1 text-sm text-ink-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="mb-6 flex flex-wrap gap-2">
          <Badge variant="info">Identité</Badge>
          <Badge variant="outline">Atelier local</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-[24px] border border-line bg-paper p-6 md:p-8">
            <Badge variant="success" className="mb-3">
              Notre promesse
            </Badge>
            <h2 className="text-xl md:text-2xl">Comprendre avant de réparer</h2>
            <p className="mt-3 leading-relaxed text-ink-muted">
              Vous comprendrez toujours ce qui ne va pas, ce que nous proposons,
              et pourquoi. Pas de pièces inutiles. Pas de pression commerciale.
              Juste la solution la plus juste pour votre usage et votre budget.
            </p>
          </article>
          <article className="rounded-[24px] border border-line bg-paper p-6 md:p-8">
            <Badge variant="info" className="mb-3">
              Ancré à Yerres
            </Badge>
            <h2 className="text-xl md:text-2xl">Pourquoi ici ?</h2>
            <p className="mt-3 leading-relaxed text-ink-muted">
              Un atelier de proximité, accessible en RER D et en voiture, pour
              intervenir vite sur Yerres et les communes voisines — sans plateforme
              anonyme. Vous parlez à la personne qui mettra les mains dans la
              machine.
            </p>
          </article>
        </div>

        <article className="mt-4 rounded-[24px] border border-line bg-surface p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="muted">
              <Users className="mr-1 size-3" aria-hidden />
              Pour qui ?
            </Badge>
          </div>
          <h2 className="mt-3 text-xl md:text-2xl">Un interlocuteur unique</h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-ink-muted">
            Particuliers, indépendants, créatifs, gamers et petites structures qui
            veulent quelqu’un capable de dépanner demain et de monter une config
            sérieuse la semaine suivante.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {audience.map((item) => (
              <li key={item}>
                <Badge variant="outline" className="rounded-lg px-3 py-1.5">
                  {item}
                </Badge>
              </li>
            ))}
          </ul>
        </article>
      </Section>

      <Section className="border-y border-line bg-paper">
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge variant="info">Méthode</Badge>
          <Badge variant="outline">4 étapes claires</Badge>
        </div>
        <h2 className="text-2xl md:text-3xl">Comment on travaille</h2>
        <p className="mt-2 max-w-xl text-ink-muted">
          Un cadre simple — du premier message jusqu’à la restitution.
        </p>
        <ol className="mt-8 grid list-none gap-4 p-0 md:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((s) => (
            <li
              key={s.step}
              className="rounded-[20px] border border-line bg-surface p-5"
            >
              <Badge variant="outline" className="font-mono">
                {s.step}
              </Badge>
              <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{s.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-ink-muted">
          Le détail du parcours d’intervention est aussi sur la{" "}
          <Link href="/" className="font-semibold text-teal hover:text-teal-deep">
            page d’accueil
          </Link>
          .
        </p>
      </Section>

      <Section>
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge variant="success">Engagements</Badge>
        </div>
        <h2 className="text-2xl md:text-3xl">Ce à quoi nous nous engageons</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {commitments.map((c, i) => {
            const Icon = commitmentIcons[i] ?? Shield;
            return (
              <article
                key={c.title}
                className="flex gap-4 rounded-[20px] border border-line bg-paper p-5 md:p-6"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal-soft text-teal">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h3 className="text-lg font-semibold leading-snug">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{c.text}</p>
                </div>
              </article>
            );
          })}
        </div>
      </Section>

      <Section className="border-y border-line bg-paper">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <Badge variant="info" className="mb-3">
              Atelier
            </Badge>
            <h2 className="text-2xl md:text-3xl">Venez nous voir</h2>
            <p className="mt-3 max-w-lg leading-relaxed text-ink-muted">
              Dépôt et retrait sur rendez-vous. Ou intervention à domicile sur
              Yerres et les communes voisines.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-ink-soft">
              <li className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
                {siteConfig.address}
              </li>
              <li>{siteConfig.hours}</li>
              <li>{siteConfig.phone}</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href={siteConfig.mapsDirectionsUrl}>Itinéraire</Button>
              <Button href="/zone-intervention" variant="secondary">
                Zone d’intervention
              </Button>
            </div>
          </div>
          <div className="overflow-hidden rounded-[24px] border border-line bg-surface shadow-[var(--shadow-soft)]">
            <iframe
              title={`Carte — atelier Restor-PC ${siteConfig.city}`}
              src={siteConfig.mapsEmbedUrl}
              className="h-64 w-full border-0 md:h-80"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </Section>

      <CtaBand title="Envie de travailler avec un vrai atelier ?" />
    </>
  );
}
