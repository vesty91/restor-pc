# Plan technique — Production blockers

Date : 2026-07-29  
Branche : `security/production-blockers`  
Contexte : PR #19 déjà dans `master` (TanStack, Sonner, Zod, Playwright).

## État constaté

| Zone    | Déjà présent                                    | Gap à combler                                                                           |
| ------- | ----------------------------------------------- | --------------------------------------------------------------------------------------- |
| Sonner  | `notify` + Toaster                              | Tests ; requestId support ; éviter double feedback                                      |
| CI      | `.github/workflows/ci.yml` (mono-job)           | Jobs séparés + integration + e2e + artifacts                                            |
| Axe     | smoke e2e                                       | `color-contrast` désactivé globalement                                                  |
| Stripe  | `stripe_events` + `claim_stripe_event`          | Retry si claim réussi mais traitement failed ; claim commande atomique ; unique session |
| user_id | colonne + metadata checkout                     | Fallback email encore autorisant l’accès ; backfill                                     |
| Admin   | cookie HMAC opaque (secret **pas** dans cookie) | Routes encore `isAtelierAuthed` only ; brancher rôles Supabase ; session secret dédié   |

## Approche

1. **Sonner** — helpers `notify.errorFromApi` (message + requestId) ; tests unit toast + e2e mock contact.
2. **CI** — jobs `quality` / `unit-tests` / `integration-tests` / `build` / `e2e` ; `test:e2e:ci` = build + start + health + playwright.
3. **Contraste** — réactiver color-contrast ; exclusions ciblées Hero WebGL si nécessaire ; ajuster tokens ink-muted.
4. **Stripe** — migration `claim_stripe_event` améliorée + `claim_tool_order` ; unique `stripe_checkout_session_id` ; webhook retry-safe ; events refund/dispute.
5. **Orders** — filtre `user_id` strict (plus de fallback email pour l’auth) ; script dry-run backfill.
6. **Admin** — `requireTechnician` sur APIs atelier ; production exige `ATELIER_SESSION_SECRET` distinct ; docs transition Supabase Auth + roles.
7. **Docs + rapport** — checklist production.

## Risques

- Migrations non destructives (`IF NOT EXISTS`, `ADD COLUMN`).
- Fallback email retiré → commandes legacy sans `user_id` invisibles jusqu’au backfill (documenté).
- Lint global peut rester bruyant → CI lint chemins critiques + typecheck.
