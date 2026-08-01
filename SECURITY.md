# Sécurité Restor-PC

## Signaler une vulnérabilité

Envoyez un email à **contact@restor-pc.fr** avec :

- description du problème ;
- étapes de reproduction ;
- impact estimé.

Ne publiez pas d’exploit public avant correction.

## Pratiques en vigueur (Vague 1)

- Pas de secrets dans le dépôt Git (`.env*` ignoré).
- Stripe Live bloqué sans `ALLOW_STRIPE_LIVE=true`.
- Cookie atelier = session HMAC opaque (pas le secret en clair).
- Webhooks Stripe idempotents (`stripe_events.id`).
- Commandes liées à `user_id` Supabase.
- Erreurs API génériques côté client (`code` + `requestId`).
- TLS requis pour le NAS ; fallback SSH désactivé par défaut.
- Consentement numérique obligatoire avant checkout.

## Secrets à ne jamais committer

- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ATELIER_SECRET`, `ATELIER_SESSION_SECRET`
- `NAS_PASS`, `NAS_SSH_PASS`
- `RESEND_API_KEY`

Voir aussi : `docs/SECRET_ROTATION.md`, `docs/PRODUCTION_CHECKLIST.md`.

## Dépendances npm (Phase 3 — 2026-08-01)

Politique : pas de `npm audit fix --force`, pas de rétrogradation Next.js.

| Paquet | Statut | Classe | Notes |
|---|---|---|---|
| `brace-expansion` | Corrigé (≥1.1.17) | Dev (eslint) | `npm audit fix` sans `--force` |
| `postcss` | Corrigé (override `8.5.25`) | Build (Next + Tailwind) | Override documenté ; XSS/sourcemap non exploitable en runtime Next (CSS non utilisateur) — [discussion Vercel](https://github.com/vercel/next.js/discussions/93718) |
| `sharp` (`0.34.5` via Next) | **Conservé** | Runtime image (`next/image`) | Override `≥0.35` casse le tracing standalone (`ERR_DLOPEN_FAILED` / `@vercel/nft`). Attendre le pin officiel Next. Ne pas `--force` (propose Next 14). |

Contrôle CI : `npm audit --omit=dev` en **informational** (`continue-on-error`) tant que `sharp` reste signalé.
