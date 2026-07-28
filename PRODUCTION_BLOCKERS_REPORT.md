# Rapport — Production blockers

Date : 2026-07-29  
Branche : `security/production-blockers`  
Base : `master` (PR #19 incluse)

## Résumé

### État initial
- Sonner / Zod / DataTable / Playwright présents (PR #19) mais toasts peu testés.
- CI mono-job sans E2E séparé.
- Axe désactivait globalement `color-contrast`.
- Stripe : `stripe_events` + claim existaient, mais pas de reclaim sur `failed` et claim commande non atomique (`processing` re-entrant).
- `user_id` présent mais fallback **email** encore autorisant l’accès.
- Cookie atelier déjà HMAC (secret **pas** dans le cookie) ; routes encore `isAtelierAuthed` direct ; fallback signature = `ATELIER_SECRET` en prod.

### État final
- Toasts : `formatPublicApiError` + tests unit/E2E mock contact.
- CI : jobs `quality`, `unit-tests`, `integration-tests`, `build`, `e2e`.
- Contraste : règle réactivée ; exclusion ciblée canvas / `[data-hero-webgl]` ; `--ink-muted` assombri.
- Stripe : migration wave3 (`claim_stripe_event` reclaim, `claim_tool_order`, unique session) ; webhook exige `user_id` UUID.
- Compte : filtre **strict** `user_id` ; script backfill dry-run.
- Admin : APIs atelier via `requireTechnician` ; `ATELIER_SESSION_SECRET` obligatoire en production.

### Bloqueurs corrigés
1. Tests notifications Sonner  
2. GitHub Actions complet  
3. Contraste Axe  
4. Idempotence / claim atomique fulfillment  
5. Autorisation commandes par `user_id`  
6. Auth atelier sans secret brut en cookie + rôles côté serveur  

### Risques restants
- Migrations à appliquer manuellement sur Supabase.
- Backfill `user_id` obligatoire pour l’historique.
- Transition HMAC atelier encore active (documentée, à retirer après création d’admins Supabase).
- Lint global ESLint encore bruyant (hors chemins critiques CI).
- E2E licences admin non automatisés (auth réelle).

---

## Fichiers modifiés (extrait)

| Fichier | Modification | Justification |
|---|---|---|
| `src/lib/toast.ts` | `formatPublicApiError`, `notify.apiError` | Toasts sûrs + réf. support |
| `src/lib/fulfillment/*` | claim atomique, `ORDER_STATUSES` | Idempotence / concurrence |
| `src/app/api/stripe/webhook/route.ts` | `user_id` obligatoire | Propriétaire commande |
| `src/app/api/compte/orders/route.ts` | plus de fallback email | Authz stricte |
| `src/app/api/atelier/*` | `requireTechnician` | Rôles serveur |
| `src/lib/atelier-auth.ts` | session secret prod | Plus de fallback secret MDP |
| `.github/workflows/ci.yml` | 5 jobs | CI obligatoire |
| `supabase/migrations/20260729120000_*.sql` | wave3 | DB idempotence + RLS |
| `tests/e2e/*` | toasts + a11y | Validation PR #19 |
| `docs/*` | procédures | Ops / prod |

---

## Migrations

- `stripe_events` : reclaim failed, `retry_count`, `processing_status`
- `tool_orders` : `stripe_checkout_session_id` unique, timestamps processing/fulfilled/failed, email_status
- RPC `claim_tool_order`
- RLS : lecture orders/licenses **uniquement** `user_id = auth.uid()`

## Stripe

- Events : completed / async success-fail / refund / dispute
- Idempotence : claim event + unique order_ref + claim_tool_order
- Email fail ≠ recreate licence
- Retry webhook si result=failed

## Authentification

- Ancien : HMAC cookie (conservé en transition)
- Nouveau chemin : Supabase `user_roles` via `requireTechnician`
- Routes `/api/atelier/*` protégées
- Cookie : jamais le secret MDP

## Tests

| Commande | Résultat | Nb | Remarque |
|---|---|---|---|
| `npm run typecheck` | OK | — | |
| `npm run test:unit` | OK | 27 | + toast / orders |
| `npm run test:integration` | OK | 13 | mocks sécurité |
| `npm run test:e2e` (BASE_URL sain) | OK | contact/toasts/menu | Validé sur serveur 3011 |
| `npm run test:e2e:ci` | Amélioré | — | Attend `/contact` avec formulaire avant Playwright |

## GitHub Actions

Jobs : quality, unit-tests, integration-tests, build, e2e  
Triggers : PR/push `master`, `workflow_dispatch`  
Voir `docs/GITHUB_BRANCH_PROTECTION.md`

## Configuration manuelle restante

1. Appliquer migration wave3 sur Supabase.
2. Créer rôles admin/technician.
3. Définir `ATELIER_SESSION_SECRET`.
4. Backfill `user_id` (`docs/ORDER_USER_MIGRATION.md`).
5. Mettre à jour webhook Stripe si besoin.
6. Activer branch protection.
7. Vérifier toasts manuellement contact + licences.
8. Stripe CLI : double event + refund.
9. **Ne pas** activer Stripe Live.

## Checklist

Voir `docs/PRODUCTION_CHECKLIST.md`.
