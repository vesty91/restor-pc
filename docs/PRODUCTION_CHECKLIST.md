# Checklist mise en production — Restor-PC

## Avant Live Stripe

- [x] Stripe **Test** validé (checkout → webhook → email → licence + lien NAS) — testé 2026-08-02
- [ ] `ALLOW_STRIPE_LIVE=false` jusqu’à validation finale
- [x] Migrations Supabase wave1–wave3 appliquées
- [x] Compte `admin` créé dans `user_roles` (restorpc91@gmail.com)
- [x] `ATELIER_SESSION_SECRET` défini (≠ `ATELIER_SECRET`)
- [x] RLS vérifié — `tool_orders`/`script_licenses` : strict `user_id = auth.uid()`, pas de fallback email
- [x] Backfill `user_id` exécuté — 8/8 commandes matchées et mises à jour (2026-08-02)
- [ ] Webhook Stripe pointant vers `/api/stripe/webhook`
- [x] Double webhook testé (idempotent) — couvert par `tests/integration/stripe-webhook.test.ts` (CI verte)
- [x] Remboursement / litige testés (licence `revoked` + lien NAS supprimé) — testé 2026-08-02
- [ ] Refund hors-ordre testé en conditions réelles (refund avant fulfill)
- [x] Migration `20260802120000_stripe_revocation_races.sql` appliquée (Supabase + NAS)
- [x] Migration `20260802130000_lockdown_rpc_execute.sql` — RPC fulfillment réservées à `service_role` (faille anon/authenticated corrigée)
- [x] Harness SQL local OK (`node scripts/sql-harness-validate.mjs`)
- [x] NAS one-time share testé
- [ ] Email Resend testé (échec email ne recrée pas licence)
- [x] CI verte sur `master`
- [ ] Branch protection : quality, unit-tests, integration-tests, build, e2e
- [ ] Mentions légales / CGV / médiateur à jour
- [ ] Sauvegarde base + secrets hors git
- [ ] Toasts Sonner vérifiés manuellement (contact + licences)
- [ ] Contrastes Axe OK (hors canvas WebGL)
- [ ] `npm audit` lu (pas de `--force` aveugle)

## Go Live (plus tard)

- [ ] Validation métier écrite
- [ ] `ALLOW_STRIPE_LIVE=true` uniquement après checklist complète
- [ ] Clés Live + webhook Live + monitoring alertes
