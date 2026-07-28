# Rotation des secrets

## Principes

1. Générer le nouveau secret.
2. Le déployer (Vercel / `.env.local`).
3. Vérifier le flux concerné.
4. Invalider l’ancien.
5. Chercher une fuite (GitHub, logs, tickets).

## Stripe

- Nouveau secret API → mettre à jour `STRIPE_SECRET_KEY`.
- Nouveau endpoint webhook → nouveau `STRIPE_WEBHOOK_SECRET`.
- Tester un paiement test + signature webhook.

## Supabase

- Régénérer service role → `SUPABASE_SERVICE_ROLE_KEY`.
- Régénérer anon si compromis → `NEXT_PUBLIC_SUPABASE_ANON_KEY` + rebuild.

## Atelier

- Changer `ATELIER_SECRET` **et** idéalement `ATELIER_SESSION_SECRET`.
- Toutes les sessions atelier sont invalidées (HMAC).

## NAS / Resend

- Changer mot de passe compte API NAS.
- Régénérer clé Resend.

## Urgence compromission

1. Révoquer les clés exposées immédiatement.
2. Forcer rotation Stripe + Supabase + atelier + NAS.
3. Inspecter `tool_orders` / `script_licenses` récents.
4. Révoquer licences suspectes.
5. Notifier si données personnelles concernées (RGPD).
