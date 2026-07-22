/** Forfait montage PC (main d’œuvre, hors composants). */
export const ASSEMBLY_FEE = 120;

/** Minimum facturé à domicile — première heure d’intervention. */
export const DOMICILE_MIN = 75;

/** Créneaux urgents — montant de la première heure. */
export const URGENCY_RATES = {
  standard: 90, // jour même, horaires d’ouverture
  evening: 110, // après 19 h
  sundayHoliday: 130, // dimanche & jours fériés
} as const;

export type PricingTier = {
  id: string;
  name: string;
  priceFrom: number;
  /** Affiché après le prix, ex. « la première heure », « forfait » */
  unitLabel: string;
  description: string;
  includes: string[];
  highlight?: boolean;
  cta: string;
  href: string;
};

export const pricingTiers: PricingTier[] = [
  {
    id: "atelier",
    name: "Atelier Yerres",
    priceFrom: 30,
    unitLabel: "forfait",
    description:
      "Vous déposez votre machine au 3 rue Auber. Prestations au forfait, annoncées avant travaux — pas de compteur horaire.",
    includes: [
      "Dépôt / retrait sur rendez-vous",
      "Devis forfaitaire avant réparation",
      "Diagnostic atelier (déduit si suite)",
      "Idéal hardware & récupération",
      "Garantie intervention 90 jours",
    ],
    cta: "Prendre rendez-vous",
    href: "/contact?type=devis&mode=atelier",
  },
  {
    id: "standard",
    name: "Déplacement / domicile",
    priceFrom: DOMICILE_MIN,
    unitLabel: "la première heure",
    description:
      "Je me déplace chez vous. Le montant affiché est le minimum d’intervention — clair dès le premier échange.",
    includes: [
      "Déplacement Yerres & communes voisines",
      "Diagnostic sur place",
      "Devis avant réparation",
      "Compte-rendu clair",
      "Garantie intervention 90 jours",
    ],
    highlight: true,
    cta: "Obtenir un devis",
    href: "/contact?type=devis&mode=domicile",
  },
  {
    id: "urgence",
    name: "Urgence",
    priceFrom: URGENCY_RATES.standard,
    unitLabel: "la première heure",
    description:
      "Créneau prioritaire le jour même (selon dispo). Vous savez tout de suite le coût minimal de l’intervention.",
    includes: [
      `${URGENCY_RATES.standard} € la première heure`,
      "Rappel prioritaire",
      "Intervention accélérée si possible",
      "Devis oral avant démarrage",
      "Idéal panne bloquante pro / perso",
    ],
    cta: "Demander une urgence",
    href: "/contact?type=urgence&urgency=asap",
  },
];

export const priceList = [
  {
    service: "Intervention à domicile",
    from: DOMICILE_MIN,
    note: "la première heure · minimum",
  },
  {
    service: "Urgence — jour même",
    from: URGENCY_RATES.standard,
    note: "la première heure",
  },
  {
    service: "Soirée (après 19 h)",
    from: URGENCY_RATES.evening,
    note: "la première heure",
  },
  {
    service: "Dimanche & jours fériés",
    from: URGENCY_RATES.sundayHoliday,
    note: "la première heure",
  },
  {
    service: "Diagnostic atelier",
    from: 30,
    note: "forfait · déduit si réparation",
  },
  {
    service: "Suppression virus & optimisation",
    from: 75,
    note: "forfait atelier",
  },
  {
    service: "Réinstallation Windows",
    from: 90,
    note: "forfait · + sauvegarde si besoin",
  },
  {
    service: "Récupération de données",
    from: 90,
    note: "forfait indicatif · devis après diag",
  },
  {
    service: "Maintenance / check-up",
    from: 60,
    note: "forfait atelier",
  },
  {
    service: "Montage PC (main d’œuvre)",
    from: ASSEMBLY_FEE,
    note: "forfait · hors composants",
  },
  {
    service: "Conseil configuration PC",
    from: 0,
    note: "offert via configurateur",
  },
];

export const urgencyRates = [
  {
    label: "Urgence — jour même (horaires d’ouverture)",
    rate: URGENCY_RATES.standard,
    detail: "Créneau prioritaire en journée",
  },
  {
    label: "Soirée (après 19 h)",
    rate: URGENCY_RATES.evening,
    detail: "Intervention hors horaires classiques",
  },
  {
    label: "Dimanche & jours fériés",
    rate: URGENCY_RATES.sundayHoliday,
    detail: "Créneau exceptionnel",
  },
];

export const pricingNotes = [
  `À domicile : ${DOMICILE_MIN} € la première heure (minimum d’intervention).`,
  "En atelier : prestations au forfait, validées avant travaux.",
  "Pas d’intervention à distance : vous venez déposer la machine, ou je me déplace.",
  "Les pièces détachées et cas complexes font l’objet d’un devis séparé.",
  "L’urgence dépend de la disponibilité ; on confirme le créneau avant intervention.",
];
