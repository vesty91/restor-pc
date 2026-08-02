import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site";
import { Cpu, HelpCircle, Home, MessageSquare, Search, Wrench } from "lucide-react";
import Link from "next/link";

const quickLinks = [
  { href: "/services", label: "Services", icon: Wrench },
  { href: "/configurateur", label: "Configurateur PC", icon: Cpu },
  { href: "/contact", label: "Contact / devis", icon: MessageSquare },
  { href: "/faq", label: "FAQ", icon: HelpCircle },
];

const topServices = [
  { href: "/services/depannage-informatique", label: "Dépannage" },
  { href: "/services/virus-optimisation", label: "Virus & perf." },
  { href: "/services/montage-pc", label: "Montage PC" },
];

export default function NotFound() {
  return (
    <section className="noise-bg flex min-h-[70vh] items-center py-20">
      <div className="container-site max-w-2xl text-center">
        <p className="font-mono text-sm text-teal">Erreur 404</p>
        <h1 className="mt-3 font-display text-4xl md:text-6xl tracking-tight">Page introuvable</h1>
        <p className="mx-auto mt-4 max-w-md text-ink-muted leading-relaxed">
          Cette page n’existe pas (ou plus). Restor-PC reste joignable à {siteConfig.city} —
          choisissez une destination ci-dessous.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button href="/" size="lg">
            <Home className="h-4 w-4" />
            Accueil
          </Button>
          <Button href="/services" variant="secondary" size="lg">
            <Search className="h-4 w-4" />
            Voir les services
          </Button>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 text-left">
          {quickLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-3 rounded-2xl border border-line bg-paper px-4 py-3.5 hover:border-teal/35"
            >
              <l.icon className="h-4 w-4 text-teal shrink-0" />
              <span className="font-semibold text-sm">{l.label}</span>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
          Services fréquents
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {topServices.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="rounded-lg border border-line bg-paper px-3 py-1.5 text-sm font-medium hover:border-teal/40"
            >
              {s.label}
            </Link>
          ))}
        </div>

        <p className="mt-8 text-sm text-ink-muted">
          Urgence ?{" "}
          <a href={siteConfig.phoneHref} className="font-semibold text-teal">
            {siteConfig.phone}
          </a>
        </p>
      </div>
    </section>
  );
}
