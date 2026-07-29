import { BrandLogo } from "@/components/BrandLogo";
import { siteConfig, navLinks } from "@/lib/site";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";

const legal = [
  { href: "/conseils", label: "Conseils" },
  { href: "/faq", label: "FAQ" },
  { href: "/zone-intervention", label: "Zone d’intervention" },
  { href: "/conditions-vente", label: "CGV boutique" },
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/politique-confidentialite", label: "Confidentialité" },
];

const googleLinks = [
  siteConfig.googleBusinessUrl
    ? { href: siteConfig.googleBusinessUrl, label: "Avis Google", external: true }
    : null,
].filter(Boolean) as { href: string; label: string; external: true }[];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-panel text-panel-fg">
      <div className="footer-accent" aria-hidden />
      <div className="container-wide py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <BrandLogo variant="full" />
            <p className="mt-4 text-sm leading-relaxed text-white/70 max-w-xs">
              Atelier de dépannage informatique à Yerres (91). Diagnostic précis,
              réparation soignée, configurations sur mesure.
            </p>
            <p className="mt-3 text-xs text-white/55">{siteConfig.guarantee}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">
              Navigation
            </p>
            <ul className="mt-4 space-y-2.5">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/80 hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">
              Infos
            </p>
            <ul className="mt-4 space-y-2.5">
              {legal.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/80 hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
              {googleLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/80 hover:text-white"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">
              Contact
            </p>
            <ul className="mt-4 space-y-3 text-sm text-white/80">
              <li>
                <a href={siteConfig.phoneHref} className="inline-flex items-center gap-2 hover:text-white">
                  <Phone className="h-4 w-4 text-teal" />
                  {siteConfig.phone}
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-white"
                >
                  <MessageCircle className="h-4 w-4 text-teal" />
                  WhatsApp
                </a>
              </li>
              <li>
                <a href={siteConfig.emailHref} className="inline-flex items-center gap-2 hover:text-white">
                  <Mail className="h-4 w-4 text-teal" />
                  {siteConfig.email}
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-2 hover:text-white"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
                  <span>
                    {siteConfig.street}
                    <br />
                    {siteConfig.postalCode} {siteConfig.city}
                    <br />
                    <span className="text-white/55">{siteConfig.hours}</span>
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/55 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name} — {siteConfig.city} ({siteConfig.postalCode}).
            Tous droits réservés.
          </p>
          <p>Diagnostic · Réparation · Montage · Assistance</p>
        </div>
      </div>
    </footer>
  );
}
