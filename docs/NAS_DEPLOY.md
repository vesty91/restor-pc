# Déploiement Restor-PC sur Synology NAS

L’hébergement cible est le **NAS Synology** (Docker), pas Vercel.

## Prérequis

- Container Manager (Docker) sur le NAS
- Domaine / reverse proxy HTTPS vers le conteneur (ex. `www.restor-pc.fr` → port 3000)
- Fichier `.env` avec les secrets (jamais dans Git)

## Variables critiques

```env
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://www.restor-pc.fr
ALLOW_STRIPE_LIVE=false
STRIPE_SECRET_KEY=sk_test_…
STRIPE_WEBHOOK_SECRET=whsec_…
NEXT_PUBLIC_SUPABASE_URL=…
NEXT_PUBLIC_SUPABASE_ANON_KEY=…
SUPABASE_URL=…
SUPABASE_SERVICE_ROLE_KEY=…
ATELIER_SECRET=…
RESEND_API_KEY=…
CONTACT_FROM_EMAIL=…
CONTACT_TO_EMAIL=…
NAS_DSM_URL=https://nas.restor-pc.fr
NAS_USER=…
NAS_PASS=…
NAS_PUBLIC_BASE=https://nas.restor-pc.fr
NAS_SSH_FALLBACK_ENABLED=false
```

## Build & lancement

Depuis le dossier `restor-pc` (ou via Container Manager « Project ») :

```bash
docker compose build --no-cache
docker compose up -d
```

Vérifier :

```bash
curl -s http://127.0.0.1:3000/api/health
# {"status":"ok","timestamp":"…"}
```

## Mise à jour après un push GitHub

1. `git pull` sur le NAS (ou sync du dossier projet)
2. `docker compose build`
3. `docker compose up -d`

## Stripe

- Webhook actif : `https://www.restor-pc.fr/api/stripe/webhook`
- Le reverse proxy NAS doit exposer cette URL en HTTPS public

## Notes

- `output: "standalone"` dans Next.js = image Docker légère
- Healthcheck Docker pointe vers `/api/health`
- Les ZIP outils restent gérés à part (scripts `DEPLOY_NAS.ps1` / File Station)
