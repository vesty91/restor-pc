# Déploiement Restor-PC sur Synology NAS

L’hébergement cible est le **NAS Synology** (Docker), pas Vercel.

## Prérequis

- Container Manager (Docker) sur le NAS
- Domaine / reverse proxy HTTPS vers le conteneur via **loopback** (`127.0.0.1:3000`)
- Le compose publie `127.0.0.1:3000:3000` (pas `0.0.0.0`) — voir `docs/NAS_SECURITY.md`
- Fichier `.env` avec les secrets (jamais dans Git)

## Variables critiques

Définir dans un fichier `.env` local (non versionné), sans coller de secrets dans Git :

```env
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://VOTRE_DOMAINE_PUBLIC
ALLOW_STRIPE_LIVE=false
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ATELIER_SECRET=
RESEND_API_KEY=
CONTACT_FROM_EMAIL=
CONTACT_TO_EMAIL=
NAS_DSM_URL=
NAS_USER=
NAS_PASS=
NAS_PUBLIC_BASE=
NAS_SSH_FALLBACK_ENABLED=false
```

`NEXT_PUBLIC_SITE_URL` et les autres `NEXT_PUBLIC_*` doivent être définies **avant** le build Docker.

## Build & lancement

Depuis le dossier `restor-pc` (ou via Container Manager « Project ») :

**Important :** `NEXT_PUBLIC_SITE_URL` (et les autres `NEXT_PUBLIC_*`) doivent être
présentes dans `.env` **avant** `docker compose build`. Elles sont injectées
comme `build.args` dans l’image ; une valeur ajoutée seulement au runtime ne
corrige pas les pages déjà générées.

```bash
# 1) Vérifier la variable
grep NEXT_PUBLIC_SITE_URL .env
docker compose config | grep -n "NEXT_PUBLIC_SITE_URL"

# 2) Build + démarrage
docker compose build --no-cache
docker compose up -d
```

Vérifier :

```bash
curl -s http://127.0.0.1:3000/api/health
# {"status":"ok","timestamp":"…"}

# Remplacer VOTRE_DOMAINE_PUBLIC par l’URL HTTPS du site
curl -fsSL "https://VOTRE_DOMAINE_PUBLIC/sitemap.xml" | grep -Ei "localhost|vercel\.app"
# (aucune sortie attendue)
```

## Mise à jour après un push GitHub

1. `git pull` sur le NAS (ou sync du dossier projet)
2. `docker compose build`
3. `docker compose up -d`

## Stripe

- Webhook actif : `https://VOTRE_DOMAINE_PUBLIC/api/stripe/webhook`
- Le reverse proxy NAS doit exposer cette URL en HTTPS public

## Notes

- `output: "standalone"` dans Next.js = image Docker légère
- Healthcheck Docker pointe vers `/api/health`
- Les ZIP outils restent gérés à part (scripts `DEPLOY_NAS.ps1` / File Station)
