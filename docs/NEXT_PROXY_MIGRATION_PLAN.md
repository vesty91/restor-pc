# Plan de migration — middleware.ts → proxy.ts

> **Branche :** `maintenance/next-proxy-migration`  
> **Next.js :** 16.2.11  
> **Prérequis :** PR #24 (`maintenance/code-quality-performance`) — base de branche au moment du travail (PR #24 encore ouverte sur `master`).

## Comportement actuel (`src/middleware.ts`)

- Export `middleware(request)` → délègue à `updateSession()` (`src/lib/supabase/middleware.ts`).
- Crée un client Supabase SSR avec cookies request/response.
- Appelle `supabase.auth.getUser()` pour rafraîchir la session et propager les cookies.
- Ne redirige pas : pas de garde auth dans le proxy (contrôle côté pages/API).
- Si `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` absents → `NextResponse.next()` sans erreur.

### Matcher (PR #24)

```
/compte/:path*
/boutique/:path*
/admin/:path*
/atelier/:path*
/auth/:path*
```

Exclu : assets `_next`, favicon, pages publiques, `/api/health`, webhook Stripe, etc.

### Cookies

- Lecture : tous les cookies request via `request.cookies.getAll()`.
- Écriture : `setAll` sur request (interne) + `supabaseResponse.cookies.set` avec options Supabase.

### Warning build

```
⚠ middleware is deprecated, use proxy instead
```

## Changement requis

| Élément | Avant | Après |
|---|---|---|
| Fichier | `src/middleware.ts` | `src/proxy.ts` |
| Fonction exportée | `middleware` | `proxy` |
| Helper Supabase | `src/lib/supabase/middleware.ts` | inchangé |
| `config.matcher` | identique | identique |
| Logique | `updateSession(request)` | identique |

Documentation Next.js 16.2 : [proxy file convention](https://nextjs.org/docs/app/api-reference/file-conventions/proxy).

## Fichiers concernés

- `src/proxy.ts` (création)
- `src/middleware.ts` (suppression)
- `tests/unit/proxy.test.ts`
- `tests/unit/supabase-update-session.test.ts`
- `tests/integration/auth-callback.test.ts`
- `tests/e2e/proxy-auth.spec.ts`
- `docs/NEXT_PROXY_MIGRATION_PLAN.md`
- `NEXT_PROXY_MIGRATION_REPORT.md`

## Risques

| Risque | Mitigation |
|---|---|
| Cookies non rafraîchis | Tests unitaires `updateSession` + E2E compte/boutique |
| Boucle de redirection | E2E pages publiques + callback |
| Assets 404 | E2E `/_next/static`, favicon, CSS |
| Régression HMAC admin | E2E `admin.spec.ts` inchangé |
| Runtime Node vs Edge | Next 16 proxy = Node par défaut ; `@supabase/ssr` compatible |

## Tests nécessaires

### Unit / intégration

- Matcher restreint (routes couvertes / exclues).
- `updateSession` : env manquant, cookies propagés, `getUser` appelé, pas de fuite d’erreur.
- Callback OAuth : `next` interne accepté, externe refusé.

### E2E (Playwright, `next start` / standalone)

- Pages publiques, assets, pas de boucle.
- `/compte`, `/boutique`, `/admin` sans session.
- Callback auth simulé.
- Admin HMAC (suite existante).

## Stratégie de retour arrière

```bash
git revert <commit-proxy-migration>
# ou
git checkout master -- src/middleware.ts
git rm src/proxy.ts
```

Revenir à `middleware.ts` restaure le warning mais pas la régression fonctionnelle si la logique `updateSession` n’a pas changé.
