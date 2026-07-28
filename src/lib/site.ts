export const siteConfig = {
  name: "Restor-PC",
  legalName: "Restor-PC",
  tagline: "Diagnostic précis. Réparation soignée. Performance retrouvée.",
  description:
    "Restor-PC, atelier de dépannage informatique à Yerres (91). Diagnostic, réparation, optimisation, récupération de données et montage PC — à domicile ou en atelier.",
  url: "https://www.restor-pc.fr",
  phone: "07 67 28 23 65",
  phoneHref: "tel:+33767282365",
  phoneRaw: "0767282365",
  whatsapp: "33767282365",
  whatsappHref:
    "https://wa.me/33767282365?text=Bonjour%20Restor-PC%2C%20j%27ai%20besoin%20d%27aide%20pour%20mon%20PC.",
  email: "contact@restor-pc.fr",
  emailHref: "mailto:contact@restor-pc.fr",
  hours: "Lun – Sam · 9h – 19h",
  openDays: [1, 2, 3, 4, 5, 6] as number[],
  openHour: 9,
  closeHour: 19,
  responseTime: "Réponse sous 2h en journée",
  intervention: "Domicile · Atelier Yerres",
  zone: "Yerres, Essonne & Île-de-France",
  zoneDetail:
    "Atelier à Yerres (91). Vous venez déposer votre machine, ou j’interviens à domicile sur Yerres, les communes voisines, l’Essonne et la proche Île-de-France.",
  street: "3 rue Auber",
  postalCode: "91330",
  city: "Yerres",
  department: "Essonne",
  region: "Île-de-France",
  country: "France",
  countryCode: "FR",
  address: "3 rue Auber, 91330 Yerres",
  addressShort: "3 rue Auber · 91330 Yerres",
  addressLines: ["3 rue Auber", "91330 Yerres"],
  geo: {
    lat: 48.7172,
    lng: 2.4881,
  },
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=3+Rue+Auber%2C+91330+Yerres",
  mapsEmbedUrl:
    "https://maps.google.com/maps?q=3%20Rue%20Auber%2C%2091330%20Yerres&z=16&output=embed",
  mapsDirectionsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=3+Rue+Auber%2C+91330+Yerres",
  nearbyCities: [
    "Yerres",
    "Brunoy",
    "Crosne",
    "Montgeron",
    "Draveil",
    "Villeneuve-Saint-Georges",
    "Épinay-sous-Sénart",
    "Quincy-sous-Sénart",
    "Boussy-Saint-Antoine",
    "Limeil-Brévannes",
  ],
  transport: "Proche gare RER D Yerres · Accès voiture facile",
  guarantee: "Garantie intervention 90 jours",
  dataPolicy: "Confidentialité totale des données",
  /** Identité légale */
  legal: {
    legalForm: "Entrepreneur individuel",
    capital: null as string | null,
    siret: "88848057100015",
    rcs: null as string | null,
    vat: null as string | null,
    publicationDirector: "M. Martins",
    /** Renseigner via NEXT_PUBLIC_CONSUMER_MEDIATOR_* (ne pas inventer) */
    mediator: (() => {
      const name =
        process.env.NEXT_PUBLIC_CONSUMER_MEDIATOR_NAME?.trim() || null;
      const url =
        process.env.NEXT_PUBLIC_CONSUMER_MEDIATOR_WEBSITE?.trim() || null;
      const address =
        process.env.NEXT_PUBLIC_CONSUMER_MEDIATOR_ADDRESS?.trim() || undefined;
      if (!name && !url) return null;
      return { name: name ?? "Médiateur (à confirmer)", url: url ?? "#", address };
    })() as null | {
      name: string;
      url: string;
      address?: string;
    },
    host: {
      name: "Vercel Inc.",
      address: "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
      url: "https://vercel.com",
    },
  },
  /** Note Google (fiche publique). */
  googleRating: 4.6,
  googleReviewCount: 22,
  /** Fiche Google (voir avis / infos) — sans /review */
  googleBusinessUrl: "https://g.page/r/CT-0ji7AyhIMEBE",
  /** Lien pour laisser un avis Google */
  googleReviewUrl: "https://g.page/r/CT-0ji7AyhIMEBE/review",
  social: {
    facebook: null as string | null,
    instagram: null as string | null,
    linkedin: null as string | null,
  },
} as const;

export const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/services", label: "Services" },
  { href: "/boutique", label: "Boutique" },
  { href: "/configurateur", label: "Configurateur" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
] as const;

export const CONFIG_STORAGE_KEY = "restor-pc-config-quote";
export const THEME_STORAGE_KEY = "restor-pc-theme";
