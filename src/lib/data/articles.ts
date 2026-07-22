export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  seoDescription: string;
  relatedServices: string[];
  relatedConfigurator?: boolean;
  content: { heading?: string; paragraphs: string[] }[];
};

export const articles: Article[] = [
  {
    slug: "pc-lent-causes-solutions",
    title: "PC lent : les 7 causes les plus fréquentes (et comment les traiter)",
    excerpt:
      "Avant de tout réinstaller, identifiez la vraie cause : disque, RAM, malwares, démarrage ou surchauffe.",
    category: "Diagnostic",
    readTime: "6 min",
    date: "2026-06-12",
    seoDescription:
      "PC trop lent ? Découvrez les causes fréquentes et les solutions concrètes recommandées par Restor-PC à Yerres.",
    relatedServices: ["virus-optimisation", "depannage-informatique", "reinstallation-windows"],
    content: [
      {
        paragraphs: [
          "Un ordinateur lent n’est presque jamais “juste vieux”. Derrière la frustration, il y a presque toujours une cause mesurable : stockage saturé ou fatigué, mémoire insuffisante, logiciels parasites, démarrage surchargé ou températures trop élevées.",
          "Voici les pistes que nous vérifions systématiquement en atelier — dans un ordre qui évite les dépenses inutiles.",
        ],
      },
      {
        heading: "1. Un SSD (ou HDD) en fin de course",
        paragraphs: [
          "Un disque mécanique saturé ou un SSD usé peut transformer chaque ouverture de fichier en attente. Le test SMART et le temps d’accès donnent souvent le verdict en quelques minutes.",
          "Solution typique : migration vers un SSD NVMe + réinstallation propre si le système est trop dégradé.",
        ],
      },
      {
        heading: "2. Mémoire vive insuffisante",
        paragraphs: [
          "Chrome + Teams + fichiers lourds : 8 Go deviennent vite justes en 2026. Le système swappe sur le disque, et tout paraît “lagué”.",
          "Passer à 16 Go (ou 32 Go en création) change souvent la perception du PC du jour au lendemain.",
        ],
      },
      {
        heading: "3. Malwares et logiciels indésirables",
        paragraphs: [
          "Barres d’outils, “optimiseurs”, adware : ils consomment CPU, bande passante et patience. Un nettoyage multi-moteurs + durcissement navigateur règle une grande partie des cas “soudainement lent”.",
        ],
      },
      {
        heading: "Quand appeler un pro ?",
        paragraphs: [
          "Si le PC plante, chauffe anormalement, ou si vos données sont critiques, un diagnostic structuré évite d’aggraver la panne. Restor-PC intervient à domicile ou en atelier Yerres selon le cas.",
        ],
      },
    ],
  },
  {
    slug: "sauvegarde-3-2-1-expliquee",
    title: "La règle 3-2-1 : la seule stratégie de sauvegarde qui tient vraiment",
    excerpt:
      "3 copies, 2 supports, 1 hors site. Simple à comprendre, puissante à appliquer — même pour un particulier.",
    category: "Sécurité",
    readTime: "5 min",
    date: "2026-05-28",
    seoDescription:
      "Comprendre et appliquer la règle de sauvegarde 3-2-1 pour protéger photos, documents et fichiers pro.",
    relatedServices: ["sauvegarde-securite", "recuperation-donnees"],
    content: [
      {
        paragraphs: [
          "La récupération de données existe parce que trop de gens n’ont qu’une seule copie de leurs fichiers — sur le même disque que Windows. La règle 3-2-1 reste le standard le plus robuste, sans être réservée aux entreprises.",
        ],
      },
      {
        heading: "Les 3 piliers",
        paragraphs: [
          "3 copies des données importantes (originale + 2 sauvegardes).",
          "2 types de supports différents (ex. SSD interne + disque externe, ou NAS + cloud).",
          "1 copie hors site (cloud chiffré, ou disque chez un proche / coffre).",
        ],
      },
      {
        heading: "Le point que tout le monde oublie",
        paragraphs: [
          "Une sauvegarde non testée n’est pas une sauvegarde. Une fois par trimestre, restaurez un dossier au hasard. Chez Restor-PC, on configure la stratégie et on valide le test de restauration avec vous.",
        ],
      },
    ],
  },
  {
    slug: "choisir-config-pc-gaming-2026",
    title: "Config PC gaming 2026 : où mettre le budget (et où ne pas le gaspiller)",
    excerpt:
      "GPU d’abord, CPU adapté, RAM 32 Go, alimentation sérieuse. Les erreurs classiques qui coûtent cher.",
    category: "Montage PC",
    readTime: "7 min",
    date: "2026-04-15",
    seoDescription:
      "Guide pour équilibrer une config PC gaming en 2026 : GPU, CPU, RAM, PSU. Conseils Restor-PC et configurateur.",
    relatedServices: ["montage-pc"],
    relatedConfigurator: true,
    content: [
      {
        paragraphs: [
          "Le piège classique : un CPU ultra haut de gamme branché sur un GPU milieu de gamme… ou l’inverse. Une bonne config gaming est d’abord une question d’équilibre et de résolution cible (1080p, 1440p, 4K).",
        ],
      },
      {
        heading: "Priorités réalistes",
        paragraphs: [
          "1) Carte graphique selon la résolution et le framerate visés.",
          "2) CPU qui ne bride pas le GPU (sans surpayer 2 générations trop tôt).",
          "3) 32 Go de RAM pour le multitâche (Discord, Chrome, overlays).",
          "4) Alimentation Gold avec marge 30–40 %.",
          "5) Boîtier à bon airflow avant le RGB.",
        ],
      },
      {
        heading: "Passez à la pratique",
        paragraphs: [
          "Utilisez notre configurateur pour générer une base équilibrée, puis demandez un devis : on valide stock, compatibilité et montage atelier.",
        ],
      },
    ],
  },
  {
    slug: "depannage-informatique-domicile-yerres",
    title: "Dépannage informatique à domicile à Yerres & Essonne",
    excerpt:
      "Domicile ou atelier Yerres ? Le bon mode d’intervention selon la panne — et comment préparer la visite.",
    category: "Local",
    readTime: "4 min",
    date: "2026-03-20",
    seoDescription:
      "Dépannage PC à domicile Yerres, Brunoy, Montgeron et Essonne. Atelier Restor-PC au 3 rue Auber, 91330 Yerres.",
    relatedServices: ["depannage-informatique", "reparation-pc"],
    content: [
      {
        paragraphs: [
          "Basés au 3 rue Auber à Yerres, nous intervenons à domicile autour de l’atelier (Brunoy, Crosne, Montgeron, Draveil…) et plus largement en Essonne / Île-de-France selon planning. Pas de dépannage à distance : soit vous déposez la machine, soit je me déplace. L’intervention à domicile est idéale quand la machine est lourde, que plusieurs postes sont concernés, ou que vous avez besoin d’une prise en main sur place.",
        ],
      },
      {
        heading: "Domicile ou atelier ?",
        paragraphs: [
          "À domicile : diagnostic, réglages réseau, formation, machines fixes encombrantes.",
          "Atelier Yerres : hardware, récupération de données, nettoyage profond, montage PC — dépôt / retrait sur rendez-vous.",
        ],
      },
      {
        heading: "Préparer l’intervention",
        paragraphs: [
          "Notez les messages d’erreur, le moment où la panne est apparue, et si possible vos identifiants Microsoft/Apple à portée (pas par email). Un accès prise + multiprise suffit souvent.",
        ],
      },
    ],
  },
];

export function getArticle(slug: string) {
  return articles.find((a) => a.slug === slug);
}
