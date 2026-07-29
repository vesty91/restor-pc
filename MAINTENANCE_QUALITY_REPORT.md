# Rapport maintenance — qualité, performance, stabilité

Branche : `maintenance/code-quality-performance`  
SHA de départ (`master`) : `0605ec9` (merge PR #23)  
HEAD actuel : `0605ec9` — **aucun commit** sur la branche ; tous les changements sont en working tree (modifiés + non trackés).  
Date : 2026-07-29  
Périmètre : phases **A + B + E + F** appliquées ; phases **C + D** documentées uniquement.

---

## Revue pré-PR — Git

| Commande | Résultat |
|---|---|
| `git status` | 32 fichiers modifiés, 5 non trackés (rapport, docs, tests) |
| `git diff --check` | OK — aucun conflit de marqueurs ; warnings CRLF Windows sur fichiers texte |
| `git diff --stat master...HEAD` | Vide (`HEAD == master`, pas de commit) |
| `git diff --stat` (working tree) | 32 fichiers, +401 / −199 lignes |

**Fichiers non trackés à inclure dans le commit :**

- `MAINTENANCE_QUALITY_REPORT.md`
- `docs/ADMIN_AUTH_MIGRATION_PLAN.md`
- `docs/WAVE3_PRODUCTION_RUNBOOK.md`
- `tests/e2e/admin.spec.ts`
- `tests/unit/hero-variant.test.ts`

**Absents du diff (OK) :**

- Pas de `playwright-report/`, `test-results/`, `coverage/` (gitignored)
- Pas de captures Playwright accidentelles
- `.env.local` gitignored (secrets locaux — **non** dans le diff)
- Aucun fichier généré volumineux ou temporaire à committer

**Modifications hors périmètre :** aucune détectée — alignées avec A/B/E/F et docs C/D.

---

## Revue pré-PR — Secrets

Recherche globale sur les fichiers modifiés et nouveaux : URL Supabase réelle, IP NAS, clés Stripe/Supabase, secret HMAC, tokens, SID Synology, DSN Sentry, adresses internes, `.env` réel.

| Résultat | Détail |
|---|---|
| Fichiers modifiés / nouveaux | Placeholders uniquement (`example.com`, `your-project.supabase.co`, `ci-atelier-secret-not-for-production`, clés JWT factices CI) |
| `.env.example` | Neutre — aucune valeur de prod |
| Tests E2E admin | Secrets CI dummy explicites |
| CI workflow | Variables dummy pour jobs |
| `.env.local` | **Non versionné** — contient des secrets réels en local ; ne pas committer |

**Aucun secret réel** dans le périmètre de la PR. Rotation manuelle non requise pour ce diff.

---

## 1. État initial

- Next.js 16.2.11 / React 19.2.4 / Tailwind 4 / Zod 4 / Supabase / Stripe / Resend.
- PR #23 déjà fusionnée (fulfillment, CI, Sonner, auth atelier HMAC, etc.).
- Lint global : **15 erreurs** (hooks / prefer-const / scripts CJS).
- `.env.example` exposait URL Supabase réelle, hôte NAS et IP locale.
- Dépendance `gsap` inutilisée.
- Middleware Supabase sur **toutes** les routes non-statiques.
- Hero Three.js déjà en `dynamic(ssr:false)` mais motion via `setState` chaque frame.
- CI : lint limité aux chemins « sécurité ».
- Pas de suite E2E admin mockée.

## 2. État final

- Lint : **0 erreur, 0 warning**.
- Typecheck / unit / integration / build : OK (voir §13).
- `.env.example` : placeholders neutres ; toutes les clés de `src/lib/env.ts` documentées.
- `gsap` désinstallé.
- ThemeProvider via `useSyncExternalStore` (pas de flash / pas de setState-in-effect).
- DataTable : `aria-sort` sur `<th>` ; warning TanStack documenté ligne par ligne.
- Hero : IO hors écran, reduced-motion, qualité basse (save-data / CPU), pas de setState/frame.
- Middleware : matcher restreint (`/compte`, `/boutique`, `/admin`, `/atelier`, `/auth`).
- CI quality : `npm run lint` global.
- E2E admin mockés (HMAC local + routes licences stubées).
- Docs C/D : `docs/ADMIN_AUTH_MIGRATION_PLAN.md`, `docs/WAVE3_PRODUCTION_RUNBOOK.md`.
- **Aucune** migration Supabase distante, **aucun** backfill `--apply`, **aucun** déploiement NAS.
- HMAC atelier **conservé**.
- Sentry **non** installé.

## 3. Fichiers modifiés (principaux)

| Zone | Fichiers |
|---|---|
| Env | `.env.example` |
| Deps | `package.json`, `package-lock.json` (gsap retiré) |
| Lint | `eslint.config.mjs`, nombreux composants hooks |
| Thème | `src/components/theme/ThemeProvider.tsx` |
| Table | `src/components/restor-pc/data-table/data-table.tsx` |
| Hero | `useHeroMotion.ts`, `HeroScene.tsx`, `hero-variant.ts` |
| Middleware | `src/middleware.ts` |
| CI | `.github/workflows/ci.yml` |
| E2E | `tests/e2e/admin.spec.ts`, `playwright.config.ts`, `scripts/e2e-ci.mjs` |
| A11y / UI | `Footer.tsx`, `badge.tsx`, `AnnouncementBar.tsx`, `Section.tsx`, `AddressMap.tsx`, `storage-status.tsx`, `Button.tsx`, `globals.css` |
| Docs | `docs/ADMIN_AUTH_MIGRATION_PLAN.md`, `docs/WAVE3_PRODUCTION_RUNBOOK.md`, ce rapport |
| Tests | `tests/unit/hero-variant.test.ts` |

## 4. Valeurs d’infrastructure retirées de `.env.example`

| Type (avant — valeur réelle retirée) | Remplacé par |
|---|---|
| URL projet Supabase | `https://your-project.supabase.co` |
| URL publique du site | `https://example.com` |
| URL publique NAS / DSM | `https://nas.example.com` |
| Comptes SSH/API NAS | `nas-api-user` / `nas-ssh-user` |
| IP LAN NAS | `192.168.x.x` |
| Emails contact | `@example.com` |

Noms de variables et booléens sûrs (`ALLOW_STRIPE_LIVE=false`, etc.) conservés.

## 5. Statut de gsap

Recherche globale : **aucun** import / require / usage dynamique.  
Action : `npm uninstall gsap`.  
`npm ls gsap` → absente (hors arbre).

## 6. Erreurs lint corrigées

- `prefer-const` (`configurator.ts`)
- `set-state-in-effect` : ThemeProvider, AnimatedStat, AnnouncementBar, Header, MobileCtaBar, OpenStatusBadge, Reveal, LicensesPanel, CompteDashboard, ContactForm
- `@typescript-eslint/no-require-imports` : ignore `scripts/generate-outils-details.js`
- `jsx-a11y/role-supports-aria-props` : `aria-sort` déplacé sur `<th>`
- `@next/next/no-img-element` : exception documentée (Satori / `opengraph-image.tsx`)

## 7. Warnings restants

| Warning | Justification |
|---|---|
| `react-hooks/incompatible-library` sur `useReactTable` | Incompatibilité connue TanStack Table ↔ React Compiler ; `eslint-disable-next-line` **local** + commentaire technique |

Aucun autre warning ESLint au moment du rapport.

## 8. Changements ThemeProvider

- Source de vérité : `localStorage` + `prefers-color-scheme` via `useSyncExternalStore`.
- Script inline du layout inchangé (anti-FOUC).
- `useLayoutEffect` applique uniquement la classe DOM (pas de setState).
- Événement custom `restor-pc-theme` pour synchro same-tab.
- Pas de `next-themes`.

## 9. Changements DataTable

- `aria-sort` sur `TableHead` (`<th>`), plus sur le bouton.
- Tri clavier / focus / pagination serveur / cartes mobile préservés.
- Exception ESLint minimale pour `useReactTable`.

## 10. Optimisations Hero

- `dynamic(..., { ssr: false, loading: SceneFallback })` conservé.
- `prefers-reduced-motion` → static / SceneFallback (pas de WebGL).
- IntersectionObserver + `document.hidden` → `frameloop="never"` hors écran.
- Coords souris/scroll en refs (pas de setState/frame).
- Qualité `low` si `saveData` ou ≤4 cœurs.
- Variantes Zod : `three` \| `color-panels` \| `static` (doc dans `hero-variant.ts` + `.env.example`).
- Retour arrière : variables `NEXT_PUBLIC_HERO_VARIANT` / `NEXT_PUBLIC_HERO_MOBILE_VARIANT`.

## 11. Modification du matcher middleware

Avant : catch-all (hors assets).  
Après :

```ts
"/compte/:path*",
"/boutique/:path*",
"/admin/:path*",
"/atelier/:path*",
"/auth/:path*",
```

Pas de migration vers `proxy.ts` (convention encore supportée ; Next 16 affiche un avis — hors scope).

## 12. Tests admin ajoutés

Fichier `tests/e2e/admin.spec.ts` :

1. `/admin` sans session → login  
2. `/admin/licences` → redirect login  
3. Mot de passe incorrect → refus  
4. Session HMAC locale (`ATELIER_SECRET` CI)  
5–7. Tableau licences mocké + filtre + pagination  
8–9. Toasts erreur / succès mockés  
10. API atelier sans cookie → 401/403  

Aucun contact Supabase/Stripe/Resend/NAS de production (mocks `page.route`).

## 13. Résultat des commandes (validation finale pré-PR)

Ordre exécuté : `npm ci` → typecheck → lint → unit → integration → build → `test:e2e:ci` → audit → `git diff --check` → `git status`.

| Commande | Résultat |
|---|---|
| `npm ci` | OK |
| `npm run typecheck` | OK |
| `npm run lint` | OK (0 erreur / 0 warning) |
| `npm run test:unit` | OK (30 tests) |
| `npm run test:integration` | OK (13 tests) |
| `npm run build` | OK |
| `npm run test:e2e:ci` | OK — **23 passed** (~6,4 s) ; serveur via `scripts/e2e-ci.mjs` (standalone + `next start`, jamais `next dev`) |
| `npm audit` | **12 high** (dev + prod) |
| `npm audit --omit=dev` | **3 high** (PostCSS + sharp via `next`) |
| `npm ls` | Arbre cohérent ; `gsap` absent |
| `git diff --check` | OK (warnings CRLF Windows uniquement) |
| `git status` | Branche `maintenance/code-quality-performance`, changements non commités |

> `npm audit fix --force` **non exécuté** (proposerait `next@9.3.3`, régression majeure).

---

## Audit npm (`npm audit`)

| Périmètre | High | Origine |
|---|---|---|
| Toutes dépendances | 12 | `sharp@0.34.5` + `postcss` embarqué dans `next@16.2.11` |
| Production (`--omit=dev`) | 3 | Idem — transitif via `next` |

**PostCSS** (3 advisories GHSA sur chaîne `next → postcss`) : XSS stringify, lecture fichier via `sourceMappingURL`, path traversal sur `.map`. Exposition principalement **build / pipeline CSS** ; pas de correctif sans montée de version Next (correctif audit suggère `next@9.3.3` — invalide).

**Action :** surveiller releases Next 16.x / 16.3 stable ; ne pas forcer `audit fix`.

---

## Audit sharp

Chaîne : `restor-pc` → `next@16.2.11` → `sharp@0.34.5` (optional `^0.34.5`).

| Alerte | Dépendance source | Production ou dev | Version corrigée | Action |
|---|---|---|---|---|
| GHSA-f88m-g3jw-g9cj (libvips CVE-2026-33327, 33328, 35590, 35591) | `next` → `sharp` | **Production** (optimisation images `next/image` en runtime Docker) | `sharp >= 0.35.0` (ex. `0.35.3`) | **Non appliqué** dans cette branche — override `npm` `"sharp": "^0.35.3"` recommandé en PR dédiée ou au prochain bump Next ; valider build + E2E après override |
| PostCSS XSS (GHSA-qx2v-qp2m-jg93) | `next` → `postcss` | Build (devDeps indirect) | Correctif upstream Next | Documenter ; pas de fix local sûr |
| PostCSS source map read (GHSA-6g55-p6wh-862q) | `next` → `postcss` | Build | Correctif upstream Next | Idem |
| PostCSS path traversal `.map` (GHSA-r28c-9q8g-f849) | `next` → `postcss` | Build | Correctif upstream Next | Idem |

**Risque de régression** si override `sharp` : faible (semver mineur, API stable) ; **risque majeur** si `npm audit fix --force` (Next 9).

**Exposition production sharp :** conteneur Synology exécute `node server.js` avec optimiseur d’images Next — sharp actif si routes/images l’utilisent.

---

## Vérification Docker Synology (statique)

| Point | Statut | Référence |
|---|---|---|
| `output: "standalone"` | OK | `next.config.ts` |
| Copie `.next/standalone` | OK | `Dockerfile` ligne 28 |
| Copie `.next/static` | OK | `Dockerfile` ligne 29 |
| Copie `public` | OK | `Dockerfile` ligne 27 |
| Utilisateur non-root | OK | `USER nextjs` (uid 1001) |
| Endpoint `/api/health` | OK | `src/app/api/health/route.ts` — JSON minimal sans secrets |
| HEALTHCHECK | OK | `wget` → `http://127.0.0.1:3000/api/health` |
| Port exposé | OK | `EXPOSE 3000`, `PORT=3000` |
| Variables runtime | OK | `docker-compose.yml` : `env_file: .env` + `NODE_ENV`, `PORT`, `HOSTNAME` (pas dans l’image) |
| Secrets dans l’image | OK | Aucun `.env` copié au build ; secrets injectés au runtime |
| Arrêt propre | OK | `CMD ["node", "server.js"]` — signal Node standard ; `restart: unless-stopped` |

Aucun contact NAS / déploiement effectué.

---

## Migration middleware → proxy (reportée)

**Tâche pour PR séparée :** migrer `src/middleware.ts` vers la convention Next.js 16 `proxy.ts` (avis de dépréciation au build).

**Tests obligatoires après migration :**

1. Supabase login / logout  
2. Callback OAuth  
3. Routes `/compte` (session, redirect)  
4. Routes `/boutique` (session)  
5. Routes `/admin` (HMAC / redirect)  
6. Routes publiques (pas de régression auth)  
7. Accès direct URL protégée sans cookie  
8. Refresh navigateur sur routes protégées  
9. Assets statiques / `_next/static` non interceptés  

**Non migré** dans cette branche (demande explicite).

---

## Absence d’action distante

| Opération | Statut |
|---|---|
| Migration Supabase distante | **Non** |
| `backfill --apply` | **Non** |
| Déploiement NAS / Docker push | **Non** |
| Contact Synology / SSH NAS | **Non** |
| Stripe live / webhook prod | **Non** |
| Sentry / DSN | **Non** |

### Opérations Supabase encore interdites sans runbook

- Appliquer `wave3` ou migrations non validées en staging  
- `backfill:order-users --apply` sans sauvegarde  
- Création `user_roles` admin en prod sans phase C  
- Rotation clés service role sans coordination NAS  

Voir `docs/WAVE3_PRODUCTION_RUNBOOK.md` et `docs/ADMIN_AUTH_MIGRATION_PLAN.md`.

---

## Checklist revue de PR

- [ ] Commit créé sur `maintenance/code-quality-performance` (actuellement **0 commit** vs `master`)
- [ ] Aucun secret / `.env.local` dans le diff
- [ ] `.env.example` neutre
- [ ] Lint 0/0, typecheck, 30 unit, 13 integration, build, 23 E2E
- [ ] CI workflow : lint global + E2E admin
- [ ] HMAC atelier conservé
- [ ] Matcher middleware réduit documenté
- [ ] Docs C/D présentes mais sans exécution distante
- [ ] Vulnérabilités npm documentées (sharp/postcss) — pas de `audit fix --force`
- [ ] Docker standalone inchangé et conforme
- [ ] Migration proxy reportée explicitement
- [ ] Pas de Sentry

## 14. Plan migration auth admin

Voir [`docs/ADMIN_AUTH_MIGRATION_PLAN.md`](docs/ADMIN_AUTH_MIGRATION_PLAN.md).  
HMAC **non** retiré dans cette branche.

## 15. Runbook Wave3 / backfill

Voir [`docs/WAVE3_PRODUCTION_RUNBOOK.md`](docs/WAVE3_PRODUCTION_RUNBOOK.md).  
Dry-run : `npm run backfill:order-users`  
Apply : **uniquement** après sauvegarde + validation humaine.

## 16. Actions manuelles restantes

1. Valider / merger cette PR.  
2. Appliquer migration Wave3 sur staging puis prod (runbook).  
3. Dry-run puis `--apply` backfill `user_id`.  
4. Créer compte admin Supabase + `user_roles` (phase C).  
5. Positionner `ATELIER_SESSION_SECRET` sur le NAS.  
6. (Optionnel) Phase G Sentry — **hors branche**.  
7. Suivre l’avis Next 16 `middleware` → `proxy` dans une PR dédiée.

## 17. Risques restants

- Transition HMAC / Supabase encore duale.  
- `text-white` / tokens Tailwind : correctifs ciblés + `--color-white/black` ; surveiller d’autres CTA.  
- `next start` vs standalone : `e2e-ci` prépare les assets standalone ou bascule ; Docker NAS reste la référence prod.  
- **sharp 0.34.5** et **postcss** embarqué Next : 3 high en prod (`audit --omit=dev`) — override sharp ou bump Next à planifier.  
- Avis Next 16 `middleware` → `proxy` : dette technique, PR séparée.  
- Observabilité erreurs prod absente (Sentry non installé).  
- Changements non commités : risque de perte locale tant que le commit n’est pas créé.

---

## Sentry (phase G — non installé)

Points d’intégration futurs recommandés :

- webhook Stripe  
- checkout boutique  
- contact / Resend  
- fulfillment NAS  
- actions atelier  
- erreurs React critiques (boundary client)

Aucun SDK / DSN ajouté dans cette branche.
