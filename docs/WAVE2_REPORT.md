# Rapport Vague 2 — Ops / CI / Rate-limit / Tests

Branche : `security/wave2-ops-ci-tests`  
Base : Vague 1 (`security/wave1-production-hardening`)

## Contenu

| Reco | Livrable |
|------|----------|
| 11 | `src/lib/security/rate-limit.ts` + RPC Supabase + contact/auth/checkout/resend |
| 15 | Vitest + tests unitaires (`tests/unit/*`) |
| 16 | `.github/workflows/ci.yml` + Dependabot |
| 17 | `docs/BACKUP_RESTORE.md` + scripts backup/restore exemple |
| 18 | `src/lib/logging/alerts.ts` (`ALERT_WEBHOOK_URL`) |
| 20 | déjà Vague 1 — inchangé |

## Migration

`20260728180000_wave2_rate_limits.sql` appliquée sur `rjymdpstakbrbqtfpomj`.

## Tests

```bash
npm run test:unit
npm run typecheck
npm run build
```

## Hors scope Vague 2

- Playwright E2E
- Configurateur hardware
- middleware → proxy
- Three.js perf
- Compte client RGPD complet
