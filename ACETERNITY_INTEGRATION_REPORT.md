# Rapport d’intégration Aceternity UI — Restor-PC

Date : 2026-07-28  
Branche : `feature/aceternity-home-sections`

## 1. Composants installés

| Composant registre | Fichier | Usage home |
|---|---|---|
| `@aceternity/bento-grid` | `src/components/ui/bento-grid.tsx` | Section services (`HomeServices`) |
| `@aceternity/compare` | `src/components/ui/compare.tsx` | Démo avant/après interactive |
| `@aceternity/sparkles` | `src/components/ui/sparkles.tsx` | API conservée ; implémentation CSS légère |
| `@aceternity/timeline` | `src/components/ui/timeline.tsx` | Parcours d’intervention |

Aucun Background Beams / effet lourd derrière le Hero Three.js.

## 2. Dépendances ajoutées

Conservées :

- `motion`
- `tailwind-merge`
- `class-variance-authority`
- `@tabler/icons-react`

Retirées après incompatibilité build :

- `@tsparticles/engine`
- `@tsparticles/react`
- `@tsparticles/slim`

Motif : tsparticles v4 n’exporte plus `initParticlesEngine` ; le composant Aceternity d’origine cassait `tsc` et `next build`. Remplacé par un `SparklesCore` CSS équivalent (même props publiques), non monté sur la home (`showSparkles={false}`).

## 3. Fichiers créés

- `components.json` (Shadcn + registre `@aceternity`)
- `src/components/ui/bento-grid.tsx`
- `src/components/ui/compare.tsx` (adapté Restor-PC)
- `src/components/ui/sparkles.tsx` (version légère)
- `src/components/ui/timeline.tsx` (adapté Restor-PC)
- `src/components/home/InterventionTimeline.tsx`
- `src/components/home/InterventionTimelineClient.tsx`
- `public/images/examples/before-clean.svg`
- `public/images/examples/after-clean.svg`
- `.cursor/mcp.json` (local, gitignoré) — serveur MCP `shadcn`
- `ACETERNITY_INTEGRATION_REPORT.md` (ce fichier)

## 4. Fichiers modifiés

- `package.json` / `package-lock.json`
- `src/app/page.tsx` — ajout `InterventionTimeline`
- `src/components/home/HomeServices.tsx` — Bento Grid 8 cartes
- `src/components/home/BeforeAfter.tsx` — Compare + fallbacks honnêtes
- `src/lib/utils.ts` — `cn()` via `tailwind-merge`

**Non modifié (volontairement)** : `src/app/globals.css`, identité visuelle, Hero Three.js, secrets / `.env*`.

## 5. Sections remplacées / adaptées

| Section | Action |
|---|---|
| Services (home) | Remplacée par Bento Grid (pas de double section) |
| Avant / après | Enrichie : Compare interactif + 3 cartes pédagogiques |
| Timeline | Nouvelle section « Comment se déroule une intervention » (8 étapes) |
| Hero / CTA | Inchangés côté Aceternity lourd |

## 6. Adaptations visuelles Restor-PC

- Tokens existants : `border-line`, `bg-paper` / `bg-surface`, `text-ink*`, `text-teal`, `--shadow-*`
- Accents teal `#4ba3ff` / `#0060cb` (pas de violet démo Aceternity)
- Arrondis ~20–22px cohérents avec le design system
- Hover / focus ring teal + `ring-offset-surface`
- Timeline : ligne de progression teal + `useReducedMotion`

## 7. Optimisations de performance

- Compare : autoplay via `requestAnimationFrame` + écriture DOM (pas de `setState` à 60 fps) ; autoplay désactivé sur la home
- Sparkles : CSS only ; désactivé sur la home
- Timeline / Compare : `dynamic()` pour isoler le JS client
- Pas d’effet Aceternity derrière la scène Three.js
- Pas de Background Beams (CTA conserve ses blurs CSS existants)
- Bento Grid : Server Component (liens Next.js)

## 8. Contrôles d’accessibilité

- Cartes services = un seul `<Link>` focusable (pas de bouton imbriqué)
- Compare : `role="slider"`, flèches / Home / End, `aria-valuenow`, focus visible
- Timeline : liste `<ol>` / `<li>` + titres par étape
- Mentions « exemple illustratif » pour les visuels non réels
- `prefers-reduced-motion` : timeline (barre statique), sparkles (pas d’animation), Compare autoplay off

## 9. Commandes exécutées

```bash
# Analyse / Git
git status -sb

# Config
# components.json créé manuellement (Tailwind v4 déjà en place)
npx shadcn@latest add "@aceternity/bento-grid" "@aceternity/compare" "@aceternity/sparkles" "@aceternity/timeline"
npx shadcn@latest search "@aceternity"
npx shadcn@latest mcp init --client cursor

# Dépendances
npm uninstall @tsparticles/engine @tsparticles/react @tsparticles/slim

# Validation
npm run typecheck
npx eslint <fichiers intégration>
npm run test:unit
npm run build
git diff --check
```

## 10. Typecheck

**OK** — `tsc --noEmit` sans erreur.

## 11. ESLint

- Fichiers de l’intégration Aceternity : **OK** (exit 0).
- `npm run lint` global : **échoue encore** sur des fichiers préexistants hors scope (`AnimatedStat`, `AnnouncementBar`, `CtaBand`, scripts, etc. — règles `react-hooks/set-state-in-effect`, etc.). Non introduits par cette intégration.

## 12. Build Next.js

**OK** — `next build` (Turbopack) réussi, 67 pages générées.

## 13. Images / contenus restant à fournir

- Photos réelles atelier (nettoyage, cable management, restauration) avec autorisation client
- Remplacer `public/images/examples/*.svg` et retirer le bandeau « exemple illustratif » le cas échéant
- TODO clairement marqué dans `BeforeAfter.tsx`

## 14. Actions manuelles restantes

### MCP Shadcn (Cursor)

Configurée dans `.cursor/mcp.json` (dossier gitignoré) :

```json
"shadcn": {
  "command": "npx",
  "args": ["shadcn@latest", "mcp"]
}
```

Procédure :

1. Relancer Cursor (ou recharger la fenêtre) pour activer le serveur MCP.
2. Vérifier dans **Cursor Settings → MCP** que `shadcn` est actif (vert).
3. Depuis l’Agent : demander de rechercher / installer un composant, ex. « cherche @aceternity/spotlight ».
4. Ou en CLI : `npx shadcn@latest add "@aceternity/<nom>"` (guillemets obligatoires sous PowerShell à cause de `@`).

### Git

- Modifications présentes sur `feature/aceternity-home-sections` (non commitées au moment du rapport).
- Commit / PR à faire sur demande.

### Optionnel

- Activer `showSparkles` uniquement sur une page secondaire si besoin (déjà supporté).
- Ajouter un arrière-plan Aceternity léger sur boutique / contact après mesure Lighthouse mobile.

## 15. Problèmes non vérifiés / limites

- Pas de mesure Lighthouse / Web Vitals terrain (mobile réel) dans cette session.
- MCP Shadcn non testé en conversation Agent après redémarrage Cursor (config écrite seulement).
- `git diff --check` : avertissements CRLF/LF Windows (pas d’espaces en fin de ligne bloquants détectés).
- ESLint global du repo déjà en dette technique (hors scope Aceternity).
- Tests E2E Playwright absents du projet — non exécutables.
- Vérification visuelle manuelle dans le navigateur recommandée (`npm run dev` déjà potentiellement actif).

## État Git au démarrage / fin

Branche feature créée depuis un `master` propre. Working tree modifié uniquement par cette intégration (pas de suppression de travail existant).
