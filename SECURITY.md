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
