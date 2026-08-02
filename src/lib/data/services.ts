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
    excerpt: "PC lent, écrans bleus, pannes soudaines : diagnostic clair et intervention ciblée.",
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
    seoTitle: "Dépannage informatique à Yerres (91)",
    seoDescription:
      "Dépannage PC rapide et professionnel à Yerres, Essonne et Île-de-France. Diagnostic précis, devis transparent, intervention à domicile ou en atelier.",
  },
  {
    slug: "reparation-pc",
    title: "Réparation PC",
    shortTitle: "Réparation",
    excerpt: "Remplacement de composants, réparation hardware, restauration de performance.",
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
    seoTitle: "Réparation PC et portable à Yerres",
    seoDescription:
      "Réparation d’ordinateur fixe et portable à Yerres (91) : SSD, RAM, alimentation, surchauffe. Atelier Restor-PC, domicile possible.",
  },
  {
    slug: "virus-optimisation",
    title: "Suppression de virus & optimisation",
    shortTitle: "Virus & perf.",
    excerpt: "Nettoyage malware, accélération système et regain de fluidité au quotidien.",
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
    seoTitle: "Suppression de virus à Yerres",
    seoDescription:
      "Nettoyage virus, malware et optimisation PC à Yerres et Essonne : machine rapide, sécurisée et prête à reprendre le travail.",
  },
  {
    slug: "reinstallation-windows",
    title: "Réinstallation Windows",
    shortTitle: "Réinstallation",
    excerpt: "Windows propre, drivers à jour, transfert de données et configuration soignée.",
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
    seoTitle: "Installation Windows à Yerres",
    seoDescription:
      "Réinstallation Windows 10/11 à Yerres avec sauvegarde des données, drivers et configuration — atelier Restor-PC ou domicile.",
  },
  {
    slug: "recuperation-donnees",
    title: "Récupération de données",
    shortTitle: "Récupération",
    excerpt:
      "Disque inaccessible, suppression accidentelle, crash : on tente de sauver l’essentiel.",
    description:
      "Fichiers disparus, partition perdue, disque qui clique : Restor-PC évalue la situation, tente une récupération logicielle ou matérielle selon le cas, et vous restitue un rapport transparent sur ce qui a pu être sauvé. Important : n’utilisez plus un disque défaillant, ne le formatez pas et n’initialisez pas un volume « non initialisé » avant diagnostic — chaque écriture peut réduire les chances de récupération. Aucune récupération n’est garantie avant analyse.",
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
      {
        q: "Que faire si mon disque fait des bruits ou refuse de démarrer ?",
        a: "Éteignez la machine, ne lancez pas de réparation intrusive et contactez-nous pour un diagnostic. Continuer à utiliser le support peut aggraver la perte de données.",
      },
    ],
    seoTitle: "Récupération de données à Yerres",
    seoDescription:
      "Récupération de données à Yerres sur disque dur, SSD ou clé USB : diagnostic transparent avant toute intervention Restor-PC.",
  },
  {
    slug: "sauvegarde-securite",
    title: "Sauvegarde & sécurité",
    shortTitle: "Sauvegarde",
    excerpt: "Stratégie de backup, antivirus pro et protection réelle de vos données.",
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
    seoTitle: "Sauvegarde et sécurité informatique à Yerres",
    seoDescription:
      "Sauvegardes fiables et sécurisation PC à Yerres et environs : protégez vos données personnelles avant la prochaine panne.",
  },
  {
    slug: "montage-pc",
    title: "Montage PC sur mesure",
    shortTitle: "Montage PC",
    excerpt: "Configuration équilibrée, assemblage pro, tests de stabilité et cable management.",
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
    seoTitle: "Montage PC sur mesure à Yerres",
    seoDescription:
      "Montage PC gaming, création ou bureautique à Yerres : configuration équilibrée, assemblage soigné et tests de stabilité.",
  },
  {
    slug: "maintenance",
    title: "Entretien & maintenance",
    shortTitle: "Maintenance",
    excerpt: "Nettoyage, mises à jour, check-up périodique pour éviter les pannes.",
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
    seoTitle: "Maintenance informatique à Yerres",
    seoDescription:
      "Entretien PC préventif à Yerres : nettoyage interne, check-up système et mises à jour pour prolonger la durée de vie PC.",
  },
];

export function getService(slug: string) {
  return services.find((s) => s.slug === slug);
}
