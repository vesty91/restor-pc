# Checklist mise en production — Restor-PC

## Avant Live Stripe

- [x] Stripe **Test** validé (checkout → webhook → email → licence + lien NAS) — testé 2026-08-02
- [ ] `ALLOW_STRIPE_LIVE=false` jusqu’à validation finale
- [x] Migrations Supabase wave1–wave3 appliquées
- [x] Compte `admin` créé dans `user_roles` (restorpc91@gmail.com)
- [x] `ATELIER_SESSION_SECRET` défini (≠ `ATELIER_SECRET`)
- [x] RLS vérifié — `tool_orders`/`script_licenses` : strict `user_id = auth.uid()`, pas de fallback email
- [x] Backfill `user_id` exécuté — 8/8 commandes matchées et mises à jour (2026-08-02)
- [x] Webhook Stripe pointant vers `/api/stripe/webhook` — vérifié via API Stripe : `enabled`, 6/6 événements requis
- [x] Double webhook testé (idempotent) — couvert par `tests/integration/stripe-webhook.test.ts` (CI verte)
- [x] Remboursement / litige testés (licence `revoked` + lien NAS supprimé) — testé 2026-08-02
- [ ] Refund hors-ordre testé en conditions réelles (refund avant fulfill) — _reporté sciemment (2026-08-02), couverture logique jugée suffisante via tests + harness SQL_
- [x] Migration `20260802120000_stripe_revocation_races.sql` appliquée (Supabase + NAS)
- [x] Migration `20260802130000_lockdown_rpc_execute.sql` — RPC fulfillment réservées à `service_role` (faille anon/authenticated corrigée)
- [x] Harness SQL local OK (`node scripts/sql-harness-validate.mjs`)
- [x] NAS one-time share testé
- [x] Email Resend testé (échec email ne recrée pas licence) — couvert par test #13 `fulfillment-flow.test.ts` (CI verte)
- [x] CI verte sur `master`
- [x] Branch protection activée — quality, unit-tests, integration-tests, build, e2e requis + branche à jour + force-push/suppression bloqués (2026-08-02)
- [x] Mentions légales / CGV à jour — contenu vérifié 2026-08-02 (éditeur, hébergeur, responsabilité outils, CGV 10 sections)
- [ ] **Médiateur de la consommation non souscrit** — `siteConfig.legal.mediator` est `null` (aucune valeur inventée, cf. `.env.example`). Obligation légale FR pour vente en ligne à des consommateurs : souscrire un médiateur (ex. CM2C, SACM…) puis renseigner `NEXT_PUBLIC_CONSUMER_MEDIATOR_*` dans `.env.local`. **Action métier réelle, ne peut pas être faite par le code.** _Reporté sciemment par le porteur du projet (2026-08-02) — à faire avant Go Live définitif._
- [x] Secrets hors git — vérifié 2026-08-02 : seuls `.env.example`/`.env.docker.example` sont trackés, aucun secret (`sk_live`, `whsec_`) dans l'historique git
- [x] Sauvegarde base — déplacée sur le NAS (toujours allumé, contrairement au PC) : conteneur autonome `restor-pc-backup-cron` (`nas/backup-cron/`), `pg_dump` quotidien 3h00 + rotation + notification ntfy (succès et échec), testé de bout en bout le 2026-08-02 (dump réel 52 Ko, notification ntfy reçue HTTP 200, conteneur stable). Tâche planifiée Windows `Restor-PC - Backup DB` désactivée (redondante), script `npm run backup:db` gardé en secours manuel. Plan Supabase toujours Free (pas de backup géré Supabase) — cette sauvegarde applicative est donc la seule protection ; voir `docs/BACKUP_RESTORE.md`.
- [x] Toasts Sonner vérifiés — couvert par CI e2e (`tests/e2e/smoke.spec.ts` : contact succès/erreur ; `tests/e2e/admin.spec.ts` : licences succès/erreur), CI verte
- [x] Contrastes Axe OK (hors canvas WebGL) — couvert par CI e2e (`tests/e2e/a11y.spec.ts`, exécuté dans `test:e2e:ci`), CI verte
- [x] `npm audit` lu (pas de `--force` aveugle) — 2 high (`sharp`/`postcss` via Next) documentés dans `SECURITY.md`

## Go Live (plus tard)

- [x] Validation métier écrite — `docs/BUSINESS_SIGN_OFF.md` (à dater/signer par le propriétaire avant `ALLOW_STRIPE_LIVE=true`)
- [ ] `ALLOW_STRIPE_LIVE=true` uniquement après checklist complète
- [ ] Clés Live + webhook Live + monitoring alertes
