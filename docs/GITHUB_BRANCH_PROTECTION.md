# Protection de branche GitHub — Restor-PC

## Objectif

Rendre obligatoires les checks CI avant fusion dans `master`.

## Jobs à exiger

Dans Settings → Branches → Branch protection rule pour `master` :

1. Require a pull request before merging
2. Require status checks to pass before merging
3. Require branches to be up to date before merging (recommandé)
4. Status checks requis :
   - `quality`
   - `unit-tests`
   - `integration-tests`
   - `build`
   - `e2e`

Les noms doivent correspondre exactement aux `name:` des jobs dans `.github/workflows/ci.yml`.

## Secrets GitHub

Aucun secret réel n’est requis pour la CI actuelle (variables factices dans le workflow).

Pour des tests d’intégration futurs contre un projet Supabase de staging, créer des secrets dédiés `*_STAGING` — jamais de clés Live Stripe.

## Notes

- `concurrency` annule les runs obsolètes sur la même branche.
- L’artefact Playwright n’est uploadé qu’en cas d’échec E2E.
- Stripe Live reste bloqué par `ALLOW_STRIPE_LIVE=false`.
