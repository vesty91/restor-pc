# Rapport Vague 1 — Security / Production Hardening

Branche : `security/wave1-production-hardening`  
Date : 2026-07-28

## Résumé

| | |
|--|--|
| **État initial** | Cookie atelier = secret en clair, TLS off dans fulfill-session, erreurs API exposées, fulfillment non atomique, pas de migrations versionnées, pas de headers HTTP, pas de lock Stripe Live |
| **État final Vague 1** | Session HMAC, fulfillment par états + idempotence events, `user_id`, consentement checkout, migration Supabase appliquée, headers, `/api/health`, docs sécurité |
| **Niveau** | Base production **test Stripe** nettement renforcée. Pas encore « go-live Live » (médiateur, CI/tests, CSP sans unsafe-inline, admin 100 % Supabase rôles). |

## Modifications (extrait)

| Fichier | Modification | Justification |
|---------|--------------|---------------|
| `src/lib/env.ts` | Validation Zod + `ALLOW_STRIPE_LIVE` | Reco 1 |
| `src/lib/stripe.ts` | Refuse `sk_live_` sans flag | Reco 1 |
| `scripts/fulfill-session.mjs` | Plus de TLS off ; session obligatoire | Reco 2 |
| `src/lib/fulfillment/index.ts` | États pending→processing→fulfilled ; réserve avant licence | Reco 3 |
| `src/app/api/stripe/webhook/route.ts` | Events + `claim_stripe_event` + refunds/disputes | Reco 3/14 |
| `src/app/api/compte/orders/route.ts` | Filtre `user_id` (+ legacy email) | Reco 4 |
| `src/lib/atelier-auth.ts` | Cookie session HMAC opaque | Reco 5 |
| `src/components/boutique/BuyButton.tsx` | Case consentement obligatoire | Reco 7 |
| `src/app/api/boutique/checkout/route.ts` | Consent serveur + métadonnées | Reco 7 |
| `supabase/migrations/20260728120000_*.sql` | Schéma + RLS + RPC | Reco 9 |
| `src/lib/fulfillment/nas.ts` | POST + SSH off par défaut | Reco 10 |
| `src/lib/errors.ts` | Erreurs publiques génériques | Reco 13 |
| `next.config.ts` | Headers sécurité + CSP | Reco 12 |
| `src/app/api/health/*` | Health / ready | Reco 19 |

## Migrations (appliquées sur `rjymdpstakbrbqtfpomj`)

- Colonnes `tool_orders` : `user_id`, Stripe IDs, consentements, `error_code`, …
- Statuts : pending, processing, fulfilled, failed, refunded, disputed, cancelled
- Tables : `stripe_events`, `user_roles`, `admin_audit_logs`, `fulfillment_logs`
- RLS lecture client sur orders/licenses
- RPC `claim_stripe_event`

## Tests exécutés

| Commande | Résultat | Remarque |
|----------|----------|----------|
| `npm run typecheck` | OK | |
| `npm run build` | OK | Health routes présentes |
| `npm run lint` | Échecs préexistants | Hors Vague 1 (AnimatedStat, Header, …) |
| `npm run test:unit` | N/A | Prévu Vague 2 |

## Configuration manuelle restante

1. Ajouter dans Vercel / `.env.local` : `ALLOW_STRIPE_LIVE=false`, `NEXT_PUBLIC_SITE_URL`, éventuellement `ATELIER_SESSION_SECRET`
2. Mettre à jour le webhook Stripe (events async/refund/dispute)
3. Se reconnecter à `/admin` (ancien cookie secret invalidé)
4. Renseigner le médiateur quand adhésion faite
5. Insérer rôles dans `user_roles` pour futurs admins Supabase
6. Tester un achat `sk_test_` bout en bout

## Risques restants / hors Vague 1

- Auth atelier encore basée sur secret partagé (HMAC) — pas encore MFA / rôles exclusifs Supabase
- Credentials NAS encore envoyés en body POST (mieux que query) mais DSM API limitée
- SSH fallback contient encore `sudo -S` si réactivé manuellement
- CSP conserve `unsafe-inline` (Next.js)
- `middleware.ts` → `proxy.ts` reporté Vague 2/3
- Configurateur, Playwright, rate-limit Redis, Three.js : Vagues suivantes
- `npm audit` : 12 high (dépendances) — à traiter Vague 2

## Mise en production (cases)

Voir `docs/PRODUCTION_CHECKLIST.md`.
