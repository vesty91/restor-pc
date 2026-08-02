# Rapport d’intégration multi-bibliothèques UI — Restor-PC

Date : 2026-07-28  
Branche : `feature/aceternity-home-sections`

Complète et remplace partiellement les conclusions de `ACETERNITY_INTEGRATION_REPORT.md` pour le périmètre multi-sources.

---

## Tableau de décision (Phase préalable)

| Besoin                     | Composant existant        | Source retenue                                   | Justification                             | Dépendances             | Impact bundle   |
| -------------------------- | ------------------------- | ------------------------------------------------ | ----------------------------------------- | ----------------------- | --------------- |
| Boutons / CTA              | `ui/Button.tsx`           | Restor-PC (gardé)                                | Un seul système Button                    | aucune                  | nul             |
| Badge générique            | —                         | Shadcn `badge`                                   | Base design system                        | `radix-ui` (Slot)       | faible          |
| Statuts commande / licence | spans ad hoc              | `restor-pc/status-badge`                         | Mapping FR centralisé                     | Badge                   | faible          |
| Services home              | grille custom → Bento     | Aceternity Bento                                 | Déjà intégré                              | motion (léger)          | faible          |
| Avant/après                | texte                     | Aceternity Compare                               | Déjà intégré                              | motion                  | moyen (dynamic) |
| Timeline intervention      | —                         | Aceternity Timeline                              | Déjà intégré                              | motion                  | moyen (dynamic) |
| Stats animées              | `AnimatedStat`            | **Refusé** Magic Number Ticker                   | Doublon                                   | —                       | —               |
| Reveal sections            | `Reveal`                  | **Refusé** Magic Blur Fade                       | Doublon                                   | —                       | —               |
| Bandeau expertises         | —                         | Magic Marquee                                    | Contenu réel, léger                       | CSS keyframes           | faible          |
| Accent CTA unique          | blurs CSS                 | Magic Border Beam                                | Un seul CTA                               | motion                  | faible          |
| Hero mobile/fallback       | `HeroDiagnosticCard`      | Cult Color Panels **CSS**                        | Pas de second WebGL                       | aucune                  | très faible     |
| Hero desktop               | Three.js                  | Conservé                                         | Identité Restor-PC                        | R3F                     | déjà présent    |
| NAS illustration           | —                         | Animata Storage Status                           | MIT, pédagogique                          | aucune                  | négligeable     |
| Skeleton commandes         | —                         | Animata Receipt + `ui/skeleton`                  | Un seul skeleton                          | aucune                  | négligeable     |
| Tableaux admin             | listes custom             | **HeroUI refusé**                                | Remplacé par TanStack DataTable Restor-PC | —                       | —               |
| Modales / Tabs / Toast     | absents ou custom         | **Radix via Shadcn seulement si besoin**         | Pas d’installation globale                | —                       | —               |
| Tables data display        | principes                 | **Ant Design refusé (package)**                  | Référence design uniquement               | —                       | —               |
| Tableaux admin             | listes custom → DataTable | **TanStack Table + Shadcn Table**                | Voir `FUNCTIONAL_TOOLS_REPORT.md`         | `@tanstack/react-table` | moyen (admin)   |
| Toast                      | —                         | **Sonner**                                       | Unique système                            | `sonner`                | faible          |
| Command palette            | —                         | **Refusé (cmdk)**                                | Admin trop petit                          | —                       | —               |
| Carousel                   | —                         | **Refusé (Embla)**                               | Pas de besoin                             | —                       | —               |
| Storybook / E2E            | —                         | Playwright+axe **oui** ; Storybook **plus tard** | Voir rapport outils                       | devDeps                 | nul prod        |

---

## Bibliothèques analysées

### Shadcn UI / Base UI

- **Usage** : design system principal (`badge`, `skeleton`, `Button` Restor-PC conservé)
- **Retenus** : Badge, Skeleton
- **Refusés** : remplacement de Button, thème générique shadcn
- **Licence** : MIT
- **Dépendances** : `radix-ui`, `class-variance-authority`

### Radix UI

- **Version** : via paquet unifié `radix-ui@^1.6.7` (Slot pour Badge)
- **Usage** : primitive Slot uniquement
- **Refusé** : installation de toutes les primitives
- **Justification** : pas de Dialog/Tooltip concurrents à créer maintenant

### Aceternity UI

- **Retenus** : Bento Grid, Compare, Timeline, Sparkles (CSS léger)
- **Refusés** : Background Beams, Globe, overlays Hero
- **Emplacement** : `src/components/aceternity/`
- **Licence** : composants copiés (registre)

### Magic UI

- **Registre** : `@magicui` → `https://magicui.design/r/{name}.json`
- **Retenus** : Marquee, Border Beam (2 max)
- **Refusés** : Number Ticker, Blur Fade, Globe, multi Border Beam
- **Emplacement** : `src/components/magicui/`

### Animata

- **Licence** : MIT (`codse/animata`)
- **Retenus** : Storage Status (adapté), Receipt Skeleton (via Skeleton unique)
- **Refusés** : Animated Timeline (doublon Aceternity), second Bento, Security Alert (non prioritaire)
- **Emplacement** : `src/components/animata/`

### Cult UI

- **Registre** : `@cult-ui` → `https://cult-ui.com/r/{name}.json` (configuré)
- **Retenu** : idée Hero Color Panels en **CSS Restor-PC** (`cult/hero-color-panels.tsx`)
- **Refusé** : composant officiel shaders WebGL (trop lourd + conflit Three.js ; registry parfois 429)
- **Variantes** : `NEXT_PUBLIC_HERO_VARIANT` / `NEXT_PUBLIC_HERO_MOBILE_VARIANT`

### HeroUI

- **Statut** : **analysé, non installé**
- **Raison** : second design system / CSS provider risqué ; listes compte/admin déjà suffisantes
- **Dossier** : `src/components/heroui/` (placeholder documentaire)

### Ant Design

- **Statut** : **référence design uniquement** — package `antd` **non installé**
- **Principes appliqués** : statuts une ligne, « — » / badge inconnu, empty state, skeleton, hiérarchie

### Tailwind Plus

- **État** : **non intégré faute de fichiers autorisés**
- Aucun scrape, aucun compte, aucun composant premium

---

## Architecture finale

```
src/components/
├── ui/            # Shadcn + primitives Restor-PC (Button, Badge, Skeleton, Section)
├── aceternity/    # Bento, Compare, Timeline, Sparkles
├── magicui/       # Marquee, Border Beam
├── animata/       # Storage Status, Receipt Skeleton
├── cult/          # Hero Color Panels (CSS léger)
├── heroui/        # non utilisé (placeholder)
└── restor-pc/     # adaptateurs métier (StatusBadge, TechMarquee, Backup…)
```

- **Design system principal** : tokens CSS Restor-PC + Shadcn
- **Primitives** : Radix Slot via Badge
- **Icônes** : Lucide
- **Thème** : `.dark` + variables existantes (`globals.css` non remplacé)
- **Motion** : un seul paquet `motion` (pas de second framer-motion standalone)

---

## Tableau des composants

| Composant         | Source        | Emplacement                    | Usage         | Poids estimé       | Reduced-motion      |
| ----------------- | ------------- | ------------------------------ | ------------- | ------------------ | ------------------- |
| Badge             | Shadcn        | `ui/badge.tsx`                 | base          | ~2 KB + radix Slot | N/A                 |
| StatusBadge       | Restor-PC     | `restor-pc/status-badge.tsx`   | compte        | négligeable        | spin processing off |
| Skeleton          | Restor-PC     | `ui/skeleton.tsx`              | chargement    | négligeable        | pulse off           |
| Bento Grid        | Aceternity    | `aceternity/bento-grid.tsx`    | services      | faible             | hover motion-safe   |
| Compare           | Aceternity    | `aceternity/compare.tsx`       | avant/après   | moyen              | autoplay off        |
| Timeline          | Aceternity    | `aceternity/timeline.tsx`      | parcours      | moyen              | barre statique      |
| Marquee           | Magic UI      | `magicui/marquee.tsx`          | expertises    | faible             | figé                |
| Border Beam       | Magic UI      | `magicui/border-beam.tsx`      | CTA           | faible             | non rendu           |
| Storage Status    | Animata       | `animata/storage-status.tsx`   | NAS           | négligeable        | transitions off     |
| Receipt Skeleton  | Animata/RPC   | `animata/receipt-skeleton.tsx` | compte        | négligeable        | via Skeleton        |
| Hero Color Panels | Cult-inspired | `cult/hero-color-panels.tsx`   | hero fallback | très faible        | pulse off           |
| Button            | Restor-PC     | `ui/Button.tsx`                | global        | déjà là            | N/A                 |

---

## Doublons évités

- Number Ticker Magic UI (vs AnimatedStat)
- Blur Fade Magic UI (vs Reveal)
- Timeline Animata (vs Aceternity Timeline)
- HeroUI Button / Card / Theme
- antd Table / Badge / Modal
- Background Beams + Three.js
- Cult WebGL + Three.js simultanés
- Second système Toast / Modal / Tabs / Skeleton

---

## Tailwind Plus

**non intégré faute de fichiers autorisés**

---

## Registres & MCP

`components.json` :

```json
"registries": {
  "@aceternity": "https://ui.aceternity.com/registry/{name}.json",
  "@magicui": "https://magicui.design/r/{name}.json",
  "@cult-ui": "https://cult-ui.com/r/{name}.json"
}
```

MCP Shadcn : `.cursor/mcp.json` (gitignoré) — `npx shadcn@latest mcp`  
MCP Magic UI dédié : **non ajouté** (évite la multiplication ; Magic via registre Shadcn suffit)

Désactiver un MCP : Cursor Settings → MCP → désactiver le serveur concerné.

---

## Tests

| Commande                         | Résultat                                   | Notes                          |
| -------------------------------- | ------------------------------------------ | ------------------------------ |
| `npm run typecheck`              | OK                                         | —                              |
| `npx eslint` (fichiers nouveaux) | OK hors dette préexistante CompteDashboard | `CtaBand` corrigé (init state) |
| `npm run test:unit`              | 18/18 OK                                   | —                              |
| `npm run build`                  | OK                                         | —                              |
| `npm dedupe`                     | OK                                         | —                              |
| `npm run lint` global            | Dette préexistante                         | hors scope multi-UI            |

---

## Performances

- Pas de nouveau WebGL
- Hero : Three **ou** Color Panels **ou** static (jamais deux shaders)
- Compare / Timeline / Border Beam : dynamic ou client isolé
- Sparkles : CSS, désactivé sur home Compare
- Marquee : CSS only + reduced-motion
- Budget respecté : pas de second `framer-motion` root, pas d’`antd`, pas d’HeroUI

### Variantes Hero

```env
NEXT_PUBLIC_HERO_VARIANT=three
NEXT_PUBLIC_HERO_MOBILE_VARIANT=color-panels
```

Valeurs : `three` | `color-panels` | `static` (Zod-like validation dans `src/lib/hero-variant.ts`)

---

## Fichiers créés / déplacés (extrait)

Créés : badge, skeleton, status-badge, magicui/_, animata/_, cult/_, restor-pc/_, hero-variant, TechMarquee, BackupIllustrations, rapport  
Déplacés : aceternity/* depuis `ui/`  
Modifiés : `page.tsx`, `Hero.tsx`, `CtaBand.tsx`, `CompteDashboard.tsx`, `components.json`, `globals.css` (keyframes marquee uniquement), `.env.example`

---

## Actions manuelles restantes

1. Relancer Cursor pour vérifier MCP Shadcn.
2. Fournir photos avant/après réelles (TODO existant).
3. Optionnel : licence Tailwind Plus → fournir fichiers locaux manuellement.
4. Optionnel futur : HeroUI DataTable si l’admin devient complexe (mesurer d’abord).
5. Tests visuels manuels 360–1920 px + reduced-motion (recommandés).
6. Commit / PR sur demande.

---

## Critères d’acceptation

| Critère                             | Statut              |
| ----------------------------------- | ------------------- |
| Un seul Button principal            | OK                  |
| Un seul Skeleton                    | OK                  |
| Pas de multi Modal/Toast/Tooltip    | OK (non introduits) |
| StatusBadge centralisé              | OK                  |
| antd non installé                   | OK                  |
| Tailwind Plus sans licence          | non intégré         |
| HeroUI n’écrase pas le thème        | non installé        |
| Pas d’anim lourde sur Three.js      | OK                  |
| Animata audité (MIT, pas de réseau) | OK                  |
| Cult adapté (CSS)                   | OK                  |
| Registres valides                   | OK                  |
| Build OK                            | OK                  |
