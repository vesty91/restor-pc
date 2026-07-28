# Restor-PC — Site atelier + boutique outils

Site Next.js pour Restor-PC (dépannage Yerres) : vitrine, configurateur PC, boutique outils (Stripe test), espace client, admin licences.

## Stack

- **Next.js** (App Router) + **TypeScript** + **Tailwind CSS**
- **Supabase** — auth client (email, Google, GitHub), commandes, licences
- **Stripe** — checkout boutique (mode test pour l’instant)
- **Resend** — emails contact + achats
- **Synology NAS** — ZIP outils + liens File Station

## Démarrage

```bash
cd restor-pc
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

Variables : copier `.env.example` → `.env.local` (dev) ou `.env` (Docker NAS).

Obligatoires en prod NAS :

```env
NEXT_PUBLIC_SITE_URL=https://www.restor-pc.fr
ALLOW_STRIPE_LIVE=false
```

## Déploiement Synology (Docker)

Le site est prévu pour tourner sur le **NAS** (Container Manager), pas sur Vercel.

```bash
cd restor-pc
# Fichier d'environnement lu par docker-compose
cp .env.example .env
# Éditer .env (Stripe, Supabase, Resend, NAS, ATELIER_SECRET, NEXT_PUBLIC_SITE_URL…)

docker compose build
docker compose up -d
```

- Conteneur : `restor-pc` sur le port **3000**
- Reverse proxy Synology / domaine → `http://NAS_IP:3000`
- Healthcheck : `GET /api/health`
- Webhook Stripe prod : `https://www.restor-pc.fr/api/stripe/webhook`

## Scripts npm

- `npm run dev` — développement
- `npm run build` / `npm run start` — production locale
- `npm run typecheck` / `npm run test:unit` — qualité
- `npm run lint` — ESLint
- `npm run stripe:update-webhook` — events webhook boutique
## Outils / NAS (dossier parent)

```powershell
# Build EXE + pack ZIP + upload Synology
$env:RESTORPC_SUPABASE_ANON_KEY = "eyJ..."
$env:NAS_SSH_PASS = "..."
.\scripte originale\DEPLOY_NAS.ps1

# Ou étapes séparées :
.\scripte originale\BUILD_LIVRAISON_EXE.ps1
.\scripte originale\PACK_NAS_ZIP.ps1
.\scripte originale\UPLOAD_NAS_ZIP.ps1
```

Catalogue boutique = outils dans `mes-script-TEST-OK` (17 outils). **Debloat-Windows / Debloat-Force** : hors catalogue (non vendus).

## Pages utiles

| Route | Rôle |
|--------|------|
| `/boutique` | Catalogue + FAQ boutique |
| `/compte` | Auth + commandes / licences |
| `/contact` | Formulaire → Resend |
| `/conditions-vente` | CGV (responsabilité scripts) |
| `/admin` | Atelier (mot de passe `ATELIER_SECRET`) |

## Docs locales

- `AUTH_OAUTH.txt` — Google / GitHub
- `DNS_EMAIL_DMARC.txt` — emails Outlook / live.fr

## Design

Encre `#0A1628` · Surface `#F3F5F8` · Accent teal · polices Syne / DM Sans / JetBrains Mono
