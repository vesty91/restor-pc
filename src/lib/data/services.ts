import { ASSEMBLY_FEE } from "@/lib/data/pricing";

export type Service = {
  slug: string;
  title: string;
  shortTitle: string;
  excerpt: string;
  description: string;
  icon: string;
  priceFrom: number;
  duration: string;
  features: string[];
  process: { title: string; text: string }[];
  faqs: { q: string; a: string }[];
  seoTitle: string;
  seoDescription: string;
};

export const services: Service[] = [
  {
    slug: "depannage-informatique",
    title: "Dépannage informatique",
    shortTitle: "Dépannage",
    excerpt:
      "PC lent, écrans bleus, pannes soudaines : diagnostic clair et intervention ciblée.",
    description:
      "Votre ordinateur refuse de démarrer, plante sans raison ou devient inutilisable ? Restor-PC réalise un diagnostic méthodique pour identifier la cause réelle — matérielle ou logicielle — puis applique la solution la plus fiable, sans surfacturation ni jargon inutile.",
    icon: "Wrench",
    priceFrom: 75,
    duration: "30 min – 2 h",
    features: [
      "Diagnostic complet matériel & logiciel",
      "Identification de la panne avant réparation",
      "Devis transparent avant intervention",
      "Intervention à domicile ou en atelier Yerres",
      "Compte-rendu clair de l’intervention",
    ],
    process: [
      {
        title: "Écoute & diagnostic",
        text: "Nous analysons les symptômes et testons les composants critiques.",
      },
      {
        title: "Proposition claire",
        text: "Vous recevez un devis précis avec les options possibles.",
      },
      {
        title: "Réparation",
        text: "Intervention soignée, tests de validation, restitution.",
      },
    ],
    faqs: [
      {
        q: "Intervenez-vous le jour même ?",
        a: "Oui, selon disponibilité. Les urgences sont prioritaires en journée.",
      },
      {
        q: "Le diagnostic est-il payant ?",
        a: "Le diagnostic atelier est à 30 € s’il est réalisé seul. Il est déduit si vous validez la réparation.",
      },
    ],
    seoTitle: "Dépannage informatique Yerres (91) | Restor-PC",
    seoDescription:
      "Dépannage PC rapide et professionnel à Yerres, Essonne et Île-de-France. Diagnostic précis, devis transparent, intervention à domicile ou en atelier.",
  },
  {
    slug: "reparation-pc",
    title: "Réparation PC",
    shortTitle: "Réparation",
    excerpt:
      "Remplacement de composants, réparation hardware, restauration de performance.",
    description:
      "Disque HS, alimentation défaillante, surchauffe, écran défectueux : nous réparons ou remplaçons les pièces défaillantes avec des composants de qualité, en respectant la compatibilité et la durée de vie de votre machine.",
    icon: "Cpu",
    priceFrom: 75,
    duration: "2 h – 48 h",
    features: [
      "Réparation hardware (SSD, RAM, PSU, GPU…)",
      "Remplacement pièces compatibles & fiables",
      "Nettoyage thermique & pâte thermique",
      "Tests de stabilité post-réparation",
      "Garantie pièces & main d’œuvre",
    ],
    process: [
      {
        title: "Contrôle technique",
        text: "Tests stress, températures, santé disque et alimentation.",
      },
      {
        title: "Réparation / remplacement",
        text: "Intervention atelier pour un travail précis et propre.",
      },
      {
        title: "Validation",
        text: "Benchmarks et contrôle qualité avant restitution.",
      },
    ],
    faqs: [
      {
        q: "Fournissez-vous les pièces ?",
        a: "Oui. Nous sélectionnons des composants fiables et adaptés à votre usage.",
      },
      {
        q: "Combien de temps pour une réparation ?",
        a: "Souvent sous 24–48 h selon disponibilité des pièces.",
      },
    ],
    seoTitle: "Réparation PC & hardware | Restor-PC",
    seoDescription:
      "Réparation ordinateur portable et fixe : SSD, RAM, alimentation, surchauffe. Atelier professionnel Restor-PC.",
  },
  {
    slug: "virus-optimisation",
    title: "Suppression de virus & optimisation",
    shortTitle: "Virus & perf.",
    excerpt:
      "Nettoyage malware, accélération système et regain de fluidité au quotidien.",
    description:
      "Adware, ransomware, navigateurs saturés, démarrage interminable : nous nettoyons en profondeur, sécurisons le système et optimisons Windows pour retrouver un PC fluide et stable.",
    icon: "ShieldCheck",
    priceFrom: 75,
    duration: "1 – 3 h",
    features: [
      "Analyse antivirus multi-moteurs",
      "Suppression malware / adware / PUPs",
      "Optimisation démarrage & services",
      "Nettoyage logiciels inutiles",
      "Conseils de bonnes pratiques",
    ],
    process: [
      {
        title: "Scan approfondi",
        text: "Détection des menaces et des goulots d’étranglement.",
      },
      {
        title: "Nettoyage & durcissement",
        text: "Suppression des menaces, sécurisation navigateur et système.",
      },
      {
        title: "Optimisation",
        text: "Réglages performance adaptés à votre usage réel.",
      },
    ],
    faqs: [
      {
        q: "Mes fichiers sont-ils en danger ?",
        a: "Nous travaillons avec des copies de sécurité dès que possible. Vos données restent prioritaires.",
      },
    ],
    seoTitle: "Suppression virus & optimisation PC | Restor-PC",
    seoDescription:
      "Nettoyage virus, malware et optimisation Windows. Retrouvez un PC rapide et sécurisé avec Restor-PC.",
  },
  {
    slug: "reinstallation-windows",
    title: "Réinstallation Windows",
    shortTitle: "Réinstallation",
    excerpt:
      "Windows propre, drivers à jour, transfert de données et configuration soignée.",
    description:
      "Quand le système est trop corrompu ou trop lent, une réinstallation propre est souvent la solution la plus durable. Nous sauvegardons vos données, réinstallons Windows, installons les drivers et reconfigurons l’essentiel.",
    icon: "RefreshCw",
    priceFrom: 90,
    duration: "2 – 4 h",
    features: [
      "Sauvegarde préalable des données",
      "Installation Windows 10 / 11 propre",
      "Drivers & mises à jour",
      "Réinstallation logiciels essentiels",
      "Optimisation post-install",
    ],
    process: [
      {
        title: "Sauvegarde",
        text: "Récupération de vos documents, photos et préférences.",
      },
      {
        title: "Installation propre",
        text: "Windows neuf, partitions saines, drivers officiels.",
      },
      {
        title: "Remise en main",
        text: "Vos données restaurées, machine prête à l’emploi.",
      },
    ],
    faqs: [
      {
        q: "Dois-je fournir une licence Windows ?",
        a: "Dans la plupart des cas, la licence OEM est réactivée automatiquement. Sinon, nous vous guidons.",
      },
    ],
    seoTitle: "Réinstallation Windows 10/11 | Restor-PC",
    seoDescription:
      "Réinstallation Windows propre avec sauvegarde de données, drivers et optimisation. Service Restor-PC.",
  },
  {
    slug: "recuperation-donnees",
    title: "Récupération de données",
    shortTitle: "Récupération",
    excerpt:
      "Disque inaccessible, suppression accidentelle, crash : on tente de sauver l’essentiel.",
    description:
      "Fichiers disparus, partition perdue, disque qui clique : Restor-PC évalue la situation, tente une récupération logicielle ou matérielle selon le cas, et vous restitue un rapport transparent sur ce qui a pu être sauvé.",
    icon: "HardDrive",
    priceFrom: 90,
    duration: "24 – 72 h",
    features: [
      "Évaluation gratuite de faisabilité (indicatif)",
      "Récupération logicielle avancée",
      "Traitement SSD / HDD / clés USB",
      "Confidentialité totale des données",
      "Rapport de récupération détaillé",
    ],
    process: [
      {
        title: "Diagnostic média",
        text: "État du support, estimation des chances de succès.",
      },
      {
        title: "Extraction",
        text: "Récupération non destructive dès que possible.",
      },
      {
        title: "Restitution sécurisée",
        text: "Fichiers remis sur support sain, destruction des copies temporaires sur demande.",
      },
    ],
    faqs: [
      {
        q: "Garantie de récupération ?",
        a: "Aucune récupération n’est jamais garantie à 100 %. Nous sommes transparents dès le diagnostic.",
      },
    ],
    seoTitle: "Récupération de données PC | Restor-PC",
    seoDescription:
      "Récupération de fichiers sur disque dur, SSD ou clé USB. Diagnostic transparent et confidentialité totale.",
  },
  {
    slug: "sauvegarde-securite",
    title: "Sauvegarde & sécurité",
    shortTitle: "Sauvegarde",
    excerpt:
      "Stratégie de backup, antivirus pro et protection réelle de vos données.",
    description:
      "La meilleure réparation, c’est celle qu’on n’a pas à faire. Nous mettons en place une stratégie de sauvegarde adaptée (local + cloud), renforçons la sécurité et vous formons aux bons réflexes.",
    icon: "Lock",
    priceFrom: 75,
    duration: "1 – 2 h",
    features: [
      "Audit de vos risques actuels",
      "Mise en place sauvegarde 3-2-1",
      "Configuration antivirus / pare-feu",
      "Mises à jour & bonnes pratiques",
      "Documentation simple pour vous",
    ],
    process: [
      {
        title: "Audit",
        text: "Quelles données, quels risques, quelle fréquence.",
      },
      {
        title: "Mise en place",
        text: "Outils adaptés, automatisation, tests de restauration.",
      },
      {
        title: "Formation",
        text: "Vous savez vérifier que vos backups fonctionnent.",
      },
    ],
    faqs: [
      {
        q: "Cloud ou disque externe ?",
        a: "Idéalement les deux. Nous construisons une solution réaliste selon votre budget.",
      },
    ],
    seoTitle: "Sauvegarde & sécurité informatique | Restor-PC",
    seoDescription:
      "Mise en place de sauvegardes fiables et sécurisation PC. Protégez vos données avec Restor-PC.",
  },
  {
    slug: "montage-pc",
    title: "Montage PC sur mesure",
    shortTitle: "Montage PC",
    excerpt:
      "Configuration équilibrée, assemblage pro, tests de stabilité et cable management.",
    description:
      "Gaming, création, bureautique ou station pro : nous concevons et assemblons un PC adapté à votre usage et votre budget. Compatibilité vérifiée, montage propre, BIOS réglé, benchmarks inclus.",
    icon: "Monitor",
    priceFrom: ASSEMBLY_FEE,
    duration: "3 – 7 jours",
    features: [
      "Conseil d’architecture selon usage",
      "Sélection composants optimisée",
      "Assemblage + cable management",
      "Installation OS & drivers",
      "Tests stabilité & thermiques",
    ],
    process: [
      {
        title: "Brief & budget",
        text: "Usage, contraintes, priorités de performance.",
      },
      {
        title: "Config & validation",
        text: "Proposition détaillée, ajustements, commande pièces.",
      },
      {
        title: "Montage & livraison",
        text: "Assemblage, tests, remise avec documentation.",
      },
    ],
    faqs: [
      {
        q: "Puis-je choisir mes composants ?",
        a: "Oui. Utilisez notre configurateur ou venez avec votre liste : nous validons la compatibilité.",
      },
    ],
    seoTitle: "Montage PC sur mesure | Restor-PC",
    seoDescription:
      "PC gaming, création ou pro assemblé sur mesure. Config équilibrée, montage soigné, tests inclus.",
  },
  {
    slug: "maintenance",
    title: "Entretien & maintenance",
    shortTitle: "Maintenance",
    excerpt:
      "Nettoyage, mises à jour, check-up périodique pour éviter les pannes.",
    description:
      "Un entretien régulier prolonge la durée de vie de votre matériel. Contrôle santé disque, nettoyage poussière, mises à jour, vérification backups : un check-up simple qui évite les mauvaises surprises.",
    icon: "Sparkles",
    priceFrom: 60,
    duration: "45 – 90 min",
    features: [
      "Check-up complet système",
      "Nettoyage interne (si atelier)",
      "Mises à jour critiques",
      "Contrôle santé SSD/HDD",
      "Rapport d’état machine",
    ],
    process: [
      {
        title: "Inspection",
        text: "Santé disque, températures, erreurs système.",
      },
      {
        title: "Entretien",
        text: "Nettoyage, mises à jour, corrections mineures.",
      },
      {
        title: "Recommandations",
        text: "Ce qu’il faut anticiper dans les mois à venir.",
      },
    ],
    faqs: [
      {
        q: "À quelle fréquence ?",
        a: "Une à deux fois par an pour un usage domestique, plus souvent en usage intensif.",
      },
    ],
    seoTitle: "Maintenance informatique préventive | Restor-PC",
    seoDescription:
      "Entretien PC préventif : nettoyage, check-up, mises à jour. Prolongez la vie de votre ordinateur.",
  },
];

export function getService(slug: string) {
  return services.find((s) => s.slug === slug);
}
