# Rapport — Outils fonctionnels et gouvernance UI

Date : 2026-07-29  
Branche : `feature/functional-ui-governance`  
Complète `UI_LIBRARIES_INTEGRATION_REPORT.md`.

---

## Tableau de décision

| Outil | Installé ou refusé | Usage | Justification | Impact bundle |
|---|---|---|---|---|
| **@tanstack/react-table** | **Installé** | `src/components/restor-pc/data-table/` + licences admin | Tableaux admin typés (tri, filtre, pagination serveur, empty/loading/erreur, mobile, actions, clavier) | moyen (admin / client only) |
| **Sonner (Shadcn)** | **Installé** | `ui/sonner.tsx` + `lib/toast.ts` (`notify.*`) | Unique système de toast ; messages sanitizés (pas de secrets) | faible |
| **Command / cmdk** | **Refusé** | — | Admin = 3 destinations (`/admin`, livraison, licences) ; Ctrl+K n’améliore pas encore la navigation | — |
| **Zod** | **Déjà présent + centralisé** | `src/lib/validation/*` branché APIs | Schémas partagés ; validation serveur obligatoire | déjà présent |
| **Embla Carousel (Shadcn)** | **Refusé** | — | Aucun besoin carousel métier actuel ; un seul système si besoin futur | — |
| **Motion (`motion`)** | **Conservé (standard)** | Imports `motion/react` uniquement | `framer-motion` n’est que dépendance nested de `motion` — pas de doublon root | déjà présent |
| **Storybook** | **Refusé (évaluation)** | — | Composants encore en stabilisation ; stories après gel UI ; hors bundle prod de toute façon | — (outil dev) |
| **Playwright** | **Installé (dev)** | `tests/e2e/smoke.spec.ts` | Smoke home/contact/boutique/compte/admin, menu mobile, clavier, reduced-motion | nul (dev) |
| **@axe-core/playwright** | **Installé (dev)** | assertions a11y critiques sur l’accueil | Contrôles a11y automatisables (contrast volontairement assoupli) | nul (dev) |
| **React Aria (design system)** | **Refusé** | — | Shadcn/Radix suffisent ; Aria seulement si gap a11y réel | — |
| **React Query** | **Refusé** | — | RSC + fetch Next.js suffisent | — |
| **React Hook Form** | **Refusé** | — | Formulaires simples sans justification RHF | — |
| **next-themes** | **Refusé** | — | `ThemeProvider` maison déjà en place ; Sonner branché dessus | — |

---

## Implémentations livrées

### DataTable
- Emplacement : `src/components/restor-pc/data-table/`
- Capacités : tri, recherche/filtres (toolbar), pagination manuelle serveur, sélection optionnelle, cartes mobile, empty / loading / erreur, colonnes actions, focus clavier
- Premier usage : `LicensesPanel` + API `GET /api/atelier/licenses` avec `page` / `pageSize` / `total` / `pageCount`

### Sonner
- Toaster dans `src/app/layout.tsx`
- Helpers : `notify.success | info | warning | error | promise`
- Sanitization : clés Stripe, Bearer, noms de secrets env, UUID

### Zod (`src/lib/validation/`)
| Module | Couverture |
|---|---|
| `auth` | login atelier |
| `contact` | formulaire contact |
| `checkout` | boutique Stripe |
| `orders` | fulfill + resend email |
| `licenses` | list / create / patch / delete |
| `configurator` | params partage devis |
| `admin` | actions admin |
| `env` | réexport `lib/env` (serveur only) |

Branché sur : contact, atelier auth, licenses, fulfill, checkout, resend-email.

### Motion
- Audit : tous les imports UI passent par `motion/react`
- `framer-motion` apparaît uniquement sous `motion@12` (normal) — **pas** de second package root
- Règle : CSS pour effets simples ; Motion pour interactions complexes ; Three.js pour le 3D

### Tests
```bash
npm run test:unit          # inclut validation + sanitize toast
npm run build && npm run test:e2e   # ou npm run test:e2e:ci
npx playwright install chromium     # une fois
```

Playwright cible `next start` (port 3010) : le mode `next dev` / HMR peut empêcher l’hydratation du Header (clics menu sans effet).

### Storybook
**Non installé.** À réévaluer après gel de Button, Badge, StatusBadge, ServiceCard, DataTable, Dialog/Drawer, empty/loading, Hero variants. Stories uniquement pour composants réutilisables importants ; jamais dans le bundle prod.

---

## Interdictions respectées

- Un seul toast (Sonner)
- Un seul moteur de tableaux (TanStack)
- Pas de second carousel
- Pas de second Motion root
- Pas de React Query / RHF / React Aria DS / Storybook prod
- Pas de dépendance pour une anim CSS-only

---

## Critères d’acceptation

| Critère | Statut |
|---|---|
| DataTable réutilisable typé | OK |
| Pagination / filtre serveur licences | OK |
| Sonner unique + helpers | OK |
| Zod centralisé + APIs | OK |
| Command admin | Refusé (justifié) |
| Carousel | Refusé (pas de besoin) |
| Motion unique | OK |
| Playwright + axe base | OK |
| Storybook | Évalué, reporté |
| typecheck / unit | à valider CI locale |
