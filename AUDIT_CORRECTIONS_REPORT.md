# Corrections audit / PR #19 follow-up

Complète `PRODUCTION_BLOCKERS_REPORT.md` et `FUNCTIONAL_TOOLS_REPORT.md`.

## Sonner

- Helpers `formatPublicApiError` / `notify.apiError`
- Tests unit sanitization + E2E mock contact
- Licences admin : toasts d’erreur avec réf. support

## CI

- Jobs séparés quality / unit / integration / build / e2e
- `scripts/e2e-ci.mjs` + health check
- Docs branch protection

## A11y

- color-contrast réactivé
- Exclusion canvas / `[data-hero-webgl]` uniquement
- `--ink-muted` ajusté AA

## Stripe / commandes / admin

- Migration wave3
- claim reclaim + claim_tool_order
- user_id strict
- requireTechnician sur APIs atelier
- ATELIER_SESSION_SECRET obligatoire en prod
