"use client";

import { Timeline } from "@/components/aceternity/timeline";
import { Section } from "@/components/ui/Section";

const STEPS = [
  {
    title: "1. Prise de contact",
    content:
      "Appel, WhatsApp ou formulaire : vous décrivez le problème, on clarifie l’urgence et le mode (domicile ou atelier).",
  },
  {
    title: "2. Analyse de la demande",
    content:
      "On précise le contexte (symptômes, âge de la machine, sauvegardes) pour préparer le bon diagnostic.",
  },
  {
    title: "3. Diagnostic",
    content:
      "Tests matériels et logiciels méthodiques pour identifier la cause réelle — pas de réparation à l’aveugle.",
  },
  {
    title: "4. Devis & validation",
    content: "Proposition claire avec options. Aucune intervention facturée sans votre accord.",
  },
  {
    title: "5. Intervention",
    content:
      "Réparation, nettoyage, remplacement ou configuration — réalisée avec soin en atelier ou à domicile.",
  },
  {
    title: "6. Tests & contrôles",
    content:
      "Vérifications de stabilité, démarrage, températures et fonctions critiques avant restitution.",
  },
  {
    title: "7. Restitution & conseils",
    content:
      "Explications simples, bonnes pratiques, et conseils pour éviter que le problème ne revienne.",
  },
  {
    title: "8. Suivi si besoin",
    content:
      "Questions après intervention : on reste joignable. La garantie d’intervention s’applique selon les conditions communiquées.",
  },
] as const;

export function InterventionTimelineClient() {
  return (
    <Section className="bg-paper border-y border-line">
      <Timeline
        data={STEPS.map((s) => ({
          title: s.title,
          content: <p>{s.content}</p>,
        }))}
        eyebrow="Méthode"
        title="Comment se déroule une intervention"
        description="Un cadre simple et transparent — du premier message jusqu’au suivi, sans jargon inutile."
      />
    </Section>
  );
}
