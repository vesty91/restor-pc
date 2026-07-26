import { formatPrice } from "@/lib/utils";

export type OutilTool = {
  slug: string;
  folder: string;
  title: string;
  scriptId: string;
  tagline: string;
  admin: boolean;
  needsInternet: boolean;
  /** Prix TTC indicatif (centimes EUR pour Stripe unit_amount) */
  priceCents: number;
  /** Nom de variable d'env pour le Price Stripe (ex. STRIPE_PRICE_CHANGER_DNS) */
  stripePriceEnv: string;
};

export type OutilProduct = OutilTool | OutilPack;

export type OutilPack = {
  slug: "pack-complet";
  folder: "PACK";
  title: string;
  scriptId: "*";
  tagline: string;
  admin: boolean;
  needsInternet: boolean;
  priceCents: number;
  stripePriceEnv: string;
  isPack: true;
};

/** Catalogue boutique — 17 outils validés LIVRAISON. Prix provisoires éditables. */
export const outilsCatalog: OutilTool[] = [
  {
    slug: "changer-dns",
    folder: "Changer-DNS",
    title: "Changer DNS",
    scriptId: "change-dns",
    tagline: "Applique un DNS fiable (Cloudflare, Google, Quad9…) sur vos cartes réseau.",
    admin: true,
    needsInternet: false,
    priceCents: 1900,
    stripePriceEnv: "STRIPE_PRICE_CHANGER_DNS",
  },
  {
    slug: "controle-integrite",
    folder: "Controle-Integrite",
    title: "Contrôle Intégrité",
    scriptId: "sys-integrity",
    tagline: "Vérifie et répare l’intégrité Windows (DISM / SFC) avec rapport.",
    admin: true,
    needsInternet: false,
    priceCents: 2900,
    stripePriceEnv: "STRIPE_PRICE_CONTROLE_INTEGRITE",
  },
  {
    slug: "createur-iso",
    folder: "Createur-ISO",
    title: "Créateur ISO",
    scriptId: "iso-creator",
    tagline: "Prépare une ISO Windows et/ou une clé USB bootable.",
    admin: true,
    needsInternet: false,
    priceCents: 3900,
    stripePriceEnv: "STRIPE_PRICE_CREATEUR_ISO",
  },
  {
    slug: "desactiver-services",
    folder: "Desactiver-Services",
    title: "Désactiver Services",
    scriptId: "disable-services",
    tagline: "Désactive ou réactive des services Windows non essentiels.",
    admin: true,
    needsInternet: false,
    priceCents: 1900,
    stripePriceEnv: "STRIPE_PRICE_DESACTIVER_SERVICES",
  },
  {
    slug: "export-identifiants",
    folder: "Export-Identifiants",
    title: "Export Identifiants",
    scriptId: "export-creds",
    tagline: "Exporte les identifiants Windows enregistrés (usage pro sensible).",
    admin: true,
    needsInternet: false,
    priceCents: 3900,
    stripePriceEnv: "STRIPE_PRICE_EXPORT_IDENTIFIANTS",
  },
  {
    slug: "installateur-atelier",
    folder: "Installateur-Atelier",
    title: "Installateur Atelier",
    scriptId: "dev-installer",
    tagline: "Télécharge et installe une sélection d’outils atelier.",
    admin: true,
    needsInternet: true,
    priceCents: 2900,
    stripePriceEnv: "STRIPE_PRICE_INSTALLATEUR_ATELIER",
  },
  {
    slug: "mapper-partages-reseau",
    folder: "Mapper-Partages-Reseau",
    title: "Mapper Partages Réseau",
    scriptId: "map-shares",
    tagline: "Connecte les lecteurs réseau (partages SMB) selon votre config.",
    admin: false,
    needsInternet: false,
    priceCents: 1900,
    stripePriceEnv: "STRIPE_PRICE_MAPPER_PARTAGES",
  },
  {
    slug: "nettoyage-windows",
    folder: "Nettoyage-Windows",
    title: "Nettoyage Windows",
    scriptId: "winautocleanup",
    tagline: "Nettoie les temporaires et libère de l’espace disque en sécurité.",
    admin: true,
    needsInternet: false,
    priceCents: 1900,
    stripePriceEnv: "STRIPE_PRICE_NETTOYAGE_WINDOWS",
  },
  {
    slug: "pilotes-hors-ligne",
    folder: "Pilotes-Hors-Ligne",
    title: "Pilotes Hors-Ligne",
    scriptId: "drivers-offline",
    tagline: "Exporte les pilotes pour réinstall sans Internet après formatage.",
    admin: true,
    needsInternet: false,
    priceCents: 2900,
    stripePriceEnv: "STRIPE_PRICE_PILOTES_HORS_LIGNE",
  },
  {
    slug: "rapport-batterie",
    folder: "Rapport-Batterie",
    title: "Rapport Batterie",
    scriptId: "battery-report",
    tagline: "Analyse la santé batterie d’un portable (OK / à surveiller / à changer).",
    admin: false,
    needsInternet: false,
    priceCents: 1500,
    stripePriceEnv: "STRIPE_PRICE_RAPPORT_BATTERIE",
  },
  {
    slug: "rapport-logiciels",
    folder: "Rapport-Logiciels",
    title: "Rapport Logiciels",
    scriptId: "export-licences",
    tagline: "Inventorie les logiciels installés pour migration / inventaire.",
    admin: false,
    needsInternet: false,
    priceCents: 1500,
    stripePriceEnv: "STRIPE_PRICE_RAPPORT_LOGICIELS",
  },
  {
    slug: "reset-reseau-complet",
    folder: "Reset-Reseau-Complet",
    title: "Reset Réseau Complet",
    scriptId: "netreset",
    tagline: "Remet à zéro la pile réseau Windows avec sauvegarde et rapport.",
    admin: true,
    needsInternet: false,
    priceCents: 2900,
    stripePriceEnv: "STRIPE_PRICE_RESET_RESEAU",
  },
  {
    slug: "sauvegarde-profils-navigateur",
    folder: "Sauvegarde-Profils-Navigateur",
    title: "Sauvegarde Profils Navigateur",
    scriptId: "browser-profiles",
    tagline: "Sauvegarde et restaure les profils navigateurs (favoris, sessions…).",
    admin: false,
    needsInternet: false,
    priceCents: 2900,
    stripePriceEnv: "STRIPE_PRICE_SAUVEGARDE_PROFILS",
  },
  {
    slug: "sauvegarde-usb",
    folder: "Sauvegarde-USB",
    title: "Sauvegarde USB",
    scriptId: "backup-usb",
    tagline: "Copie les dossiers importants vers une clé / disque USB.",
    admin: false,
    needsInternet: false,
    priceCents: 1900,
    stripePriceEnv: "STRIPE_PRICE_SAUVEGARDE_USB",
  },
  {
    slug: "sauvegarde-wifi",
    folder: "Sauvegarde-WiFi",
    title: "Sauvegarde Wi-Fi",
    scriptId: "wifi-backup",
    tagline: "Exporte / restaure les profils Wi-Fi (idéal avant réinstall).",
    admin: true,
    needsInternet: false,
    priceCents: 1900,
    stripePriceEnv: "STRIPE_PRICE_SAUVEGARDE_WIFI",
  },
  {
    slug: "telemetrie-windows",
    folder: "Telemetrie-Windows",
    title: "Télémétrie Windows",
    scriptId: "telemetry-toggle",
    tagline: "Désactive ou réactive la télémétrie Windows (sans désinstaller d’apps).",
    admin: true,
    needsInternet: false,
    priceCents: 1900,
    stripePriceEnv: "STRIPE_PRICE_TELEMETRIE",
  },
  {
    slug: "test-reseau-dual-pro",
    folder: "Test-Reseau-Dual-Pro",
    title: "Test Réseau Dual Pro",
    scriptId: "netdualtest-pro",
    tagline: "Benchmark débit IPv4 vs IPv6 via Speedtest Ookla (CSV + HTML).",
    admin: false,
    needsInternet: true,
    priceCents: 2900,
    stripePriceEnv: "STRIPE_PRICE_TEST_RESEAU_DUAL",
  },
];

export const packComplet: OutilPack = {
  slug: "pack-complet",
  folder: "PACK",
  title: "Pack complet Restor-PC",
  scriptId: "*",
  tagline: "Les 17 outils atelier en une licence (1 PC). Idéal tech / dépannage.",
  admin: true,
  needsInternet: false,
  priceCents: 19900,
  stripePriceEnv: "STRIPE_PRICE_PACK_COMPLET",
  isPack: true,
};

export function getAllProducts(): Array<OutilTool | OutilPack> {
  return [...outilsCatalog, packComplet];
}

export function getProductBySlug(slug: string): OutilTool | OutilPack | undefined {
  if (slug === packComplet.slug) return packComplet;
  return outilsCatalog.find((t) => t.slug === slug);
}

export function getStripePriceId(product: OutilTool | OutilPack): string | null {
  const id = process.env[product.stripePriceEnv]?.trim();
  return id || null;
}

export function formatOutilPrice(cents: number): string {
  return formatPrice(cents / 100);
}

/** Chemin File Station Synology pour le ZIP à partager */
export function getNasFilePath(product: OutilTool | OutilPack): string {
  if ("isPack" in product && product.isPack) {
    return "/vesty/RestorPC/00-PACK-COMPLET/RestorPC-Outils-LIVRAISON.zip";
  }
  return `/vesty/RestorPC/01-PAR-OUTIL/${product.folder}.zip`;
}
