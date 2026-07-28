# Checklist production Restor-PC

## Avant ouverture boutique publique

- [ ] `ALLOW_STRIPE_LIVE` reste `false` jusqu’à validation explicite
- [ ] Webhook Stripe enregistré (events Vague 1)
- [ ] Migration Vague 1 appliquée sur Supabase
- [ ] `NEXT_PUBLIC_SITE_URL` = URL canonique HTTPS
- [ ] Médiateur consommation renseigné **ou** vente numérique limitée tant qu’absent
- [ ] Case consentement rétractation testée (checkout)
- [ ] Test achat `sk_test_` bout en bout (licence + mail + compte)
- [ ] Rejeu webhook → aucun doublon
- [ ] `/api/health` répond `ok`
- [ ] Cookie atelier : reconnexion après déploiement (session HMAC)
- [ ] NAS HTTPS + compte API OK ; `NAS_SSH_FALLBACK_ENABLED=false` en prod Vercel
- [ ] Secrets uniquement dans Vercel / `.env.local` (jamais Git)

## Après go-live

- [ ] Rotation documentée (`docs/SECRET_ROTATION.md`)
- [ ] Sauvegardes Supabase (`docs/BACKUP_RESTORE.md` — Vague 2)
- [ ] Monitoring erreurs (logs structurés `requestId`)
