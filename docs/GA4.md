# GA4 — Restor-PC (conversions)

## Prérequis

1. Créer une propriété GA4 pour `https://www.restor-pc.fr`
2. Copier l’ID de mesure (`G-XXXXXXXX`)
3. Ajouter dans `.env` / `.env.local` **avant** le build Docker :

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXX
```

4. Rebuild / redéployer le conteneur (les `NEXT_PUBLIC_*` sont figés au build)

## Consentement

- Bandeau Accepter / Refuser
- GA4 chargé **uniquement** après acceptation
- Consent Mode v2 : `analytics_storage` ; pubs refusées (`ad_*` = denied)
- Lien « Cookies » dans le footer pour modifier le choix

## Événements à marquer comme clés (conversions)

Dans GA4 → Admin → Événements → Marquer comme événement clé :

| Event | Déclencheur |
|---|---|
| `click_phone` | Clic `tel:` |
| `click_email` | Clic `mailto:` |
| `contact_submit` | Formulaire contact envoyé (API OK) |
| `request_appointment` | Contact type `urgence` |
| `create_quote` | Contact type `devis` / `config` / `serenite` / `maintenance` |
| `purchase` | Page `/boutique/succes` avec `session_id` |

Événements utiles (optionnels, non clés) :

| Event | Déclencheur |
|---|---|
| `begin_quote` | CTA configurateur → contact |
| `begin_checkout` | Redirect Stripe Checkout |
| `click_whatsapp` | Clic WhatsApp |

## CSP

`next.config.ts` autorise déjà :

- `script-src` : `https://www.googletagmanager.com`
- `connect-src` : `*.google-analytics.com`, `*.analytics.google.com`, `*.googletagmanager.com`

## Vérification

1. Ouvrir le site en navigation privée
2. Accepter les cookies
3. Extension / DebugView GA4 : page_view + events
4. Cliquer téléphone, envoyer un contact test, etc.
