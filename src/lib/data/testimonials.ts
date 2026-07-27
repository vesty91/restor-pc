export const commitments = [
  {
    title: "Devis avant intervention",
    text: "Aucun travail engagé sans votre accord clair sur le prix et le périmètre.",
  },
  {
    title: "Confidentialité des données",
    text: "Vos fichiers restent privés. Accès strictement limité à l’intervention. Destruction des copies temporaires sur demande.",
  },
  {
    title: "Garantie 90 jours",
    text: "Les réparations réalisées sont garanties 90 jours. Les pièces suivent la garantie constructeur.",
  },
  {
    title: "Explications sans jargon",
    text: "Vous comprenez ce qui a été fait, pourquoi, et comment l’éviter à l’avenir.",
  },
];

export const guarantees = [
  {
    title: "90 jours de garantie",
    text: "Sur la main d’œuvre. Un souci lié à l’intervention ? On reprend sans frais.",
  },
  {
    title: "Devis transparent",
    text: "Prix et périmètre validés avant toute intervention.",
  },
  {
    title: "Réponse < 2 h",
    text: "En journée ouvrée, un technicien vous rappelle rapidement.",
  },
  {
    title: "Données protégées",
    text: "Confidentialité atelier. Pas de revente, pas de curiosité.",
  },
];

/** Synthèse fiche Google Restor-Pc · Yerres. */
export const googleReviewsMeta = {
  rating: 4.6,
  count: 22,
  label: "4,6 / 5",
};

/**
 * Avis Google publics (captures fiche Restor-Pc).
 * Textes et noms tels qu’affichés sur Google.
 */
export const testimonials = [
  {
    name: "aini Eske",
    role: "Avis Google · janv. 2025",
    text: "J’ai ramené la tour de mon fils pour la faire réparer, il me l’a réparé, a su me conseiller et m’a trouvé une solution, car elle ne marchait plus. Je le recommande, il est très gentil et fait très bien son boulot. Top",
    rating: 5,
    source: "google" as const,
  },
  {
    name: "Romain Lavagno",
    role: "Avis Google · Local Guide",
    text: "S’est rendu disponible dans la journée. Grand merci beaucoup pour avoir dépanné mon PC fraîchement monté en un max 1 h ! Très gentil, et prix plus que correct.",
    rating: 5,
    source: "google" as const,
  },
  {
    name: "jpouille91",
    role: "Avis Google · nov. 2023",
    text: "J’ai vraiment apprécié le professionnalisme de M. Martins et sa réactivité lors de mes appels après ses interventions. Montage matériel impeccable et gros problème de maj BIOS résolu après avoir bien galéré. Heureux de pouvoir geek à nouveau.",
    rating: 5,
    source: "google" as const,
  },
  {
    name: "Dan Aubry",
    role: "Avis Google · août 2022",
    text: "Très efficace et très rapide, je recommande grandement.",
    rating: 5,
    source: "google" as const,
  },
  {
    name: "Jacques Morell",
    role: "Avis Google · juin 2021",
    text: "Excellent réparateur PC, très professionnel, de bon conseil, très à l’écoute et clair dans ses explications. Intervention très rapide. Il prend le temps de vérifier et de rétablir le bon fonctionnement du matériel après réparation. Très sympathique également !",
    rating: 5,
    source: "google" as const,
  },
  {
    name: "Pierre Froideval",
    role: "Avis Google · juil. 2021",
    text: "Dispo, réactif, m’a sauvé mon ordi en plein rush pro, au top !",
    rating: 5,
    source: "google" as const,
  },
  {
    name: "Stef Janin",
    role: "Avis Google · Local Guide",
    text: "Très efficace et très sympa, m’a sauvé la vie.",
    rating: 5,
    source: "google" as const,
  },
  {
    name: "pascal bailleul",
    role: "Avis Google",
    text: "Efficace et super rapide : qu’espérer de mieux ? J’y retournerai les yeux fermés.",
    rating: 5,
    source: "google" as const,
  },
  {
    name: "jmg Jmg",
    role: "Avis Google · Local Guide",
    text: "PC réparé rapidement avec des performances très nettement améliorées, je recommande vivement Monsieur Martins qui est très pro et à l’écoute de son client.",
    rating: 5,
    source: "google" as const,
  },
  {
    name: "Michèle Guttin",
    role: "Avis Google · Yerres",
    text: "J’ai vraiment apprécié le professionnalisme de M. Martins et sa réactivité lors de mes appels après ses interventions. Je ne peux que recommander cette personne que nous avons la chance de trouver près de chez nous à Yerres. Personne sûre, professionnelle et très disponible.",
    rating: 5,
    source: "google" as const,
  },
  {
    name: "Daniel Fusil",
    role: "Avis Google",
    text: "Compétence, fiabilité, et sérieux !! Je vous recommande ce professionnel de la micro-informatique.",
    rating: 5,
    source: "google" as const,
  },
  {
    name: "tarin jacques",
    role: "Avis Google",
    text: "Lorsque compétence et gentillesse sont au rendez-vous… l’on ne peut que conseiller Restor’PC ! Merci Mr Martins… et surtout ne changez rien ;)",
    rating: 5,
    source: "google" as const,
  },
  {
    name: "Pierre Michaux",
    role: "Avis Google",
    text: "Prestations de qualité. Bons conseils.",
    rating: 5,
    source: "google" as const,
  },
];

/** Avis mis en avant sur l’accueil (les plus récents / détaillés). */
export const featuredTestimonials = testimonials.slice(0, 6);

export const trustStats = [
  { value: "4,6/5", label: "Note Google · 22 avis" },
  { value: "Atelier", label: "Basé à Yerres (91)" },
  { value: "2 modes", label: "Domicile · Atelier" },
  { value: "90 j", label: "Garantie intervention" },
];
