# Checklist mise en production — Restor-PC

## Avant Live Stripe

- [x] Stripe **Test** validé (checkout → webhook → email → licence + lien NAS) — testé 2026-08-02
- [ ] `ALLOW_STRIPE_LIVE=false` jusqu’à validation finale
- [x] Migrations Supabase wave1–wave3 appliquées
- [ ] Compte `admin` / `technician` créé dans `user_roles`
- [ ] `ATELIER_SESSION_SECRET` défini (≠ `ATELIER_SECRET`)
- [ ] RLS vérifié (client ne lit que ses `user_id`)
- [ ] Backfill `user_id` exécuté (dry-run puis `--apply`)
- [ ] Webhook Stripe pointant vers `/api/stripe/webhook`
- [ ] Double webhook testé (idempotent)
- [x] Remboursement / litige testés (licence `revoked` + lien NAS supprimé) — testé 2026-08-02
- [ ] Refund hors-ordre testé en conditions réelles (refund avant fulfill)
- [x] Migration `20260802120000_stripe_revocation_races.sql` appliquée (Supabase + NAS)
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
