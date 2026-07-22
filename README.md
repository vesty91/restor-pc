# Restor-PC — Site vitrine premium

Site web professionnel pour Restor-PC, atelier de dépannage informatique.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS 4**
- **lucide-react** (icônes)
- Moteur de **configurateur PC** maison (usage, budget, préférences, compatibilité, scores)

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — développement
- `npm run build` — build production
- `npm run start` — serveur production
- `npm run lint` — ESLint

## Structure

```
src/
  app/                  # Pages (accueil, services, configurateur, tarifs, contact…)
  components/           # UI, layout, home, configurateur, contact
  lib/
    data/               # Services, tarifs, FAQ, moteur configurateur
    site.ts             # Coordonnées & navigation (à personnaliser)
```

## Personnalisation rapide

Éditez `src/lib/site.ts` : téléphone, email, zone, horaires, URL.

Les pages légales contiennent des placeholders `[à compléter]` pour SIRET, adresse, hébergeur.

Le formulaire de contact est prêt côté UI (validation + préremplissage depuis le configurateur). Branchez ensuite une API (Resend, Formspree, route `/api/contact`, etc.).

## Design system

- Encre `#0A1628` · Surface froide `#F3F5F8` · Accent teal `#0C9A88`
- Display **Syne** · Corps **DM Sans** · Mono **JetBrains Mono**
