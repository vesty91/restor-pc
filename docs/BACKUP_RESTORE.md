# Sauvegarde et restauration Supabase (Restor-PC)

## Responsabilités

| Élément                              | Responsable                     |
| ------------------------------------ | ------------------------------- |
| Projet Supabase `restor-pc-licences` | Propriétaire Restor-PC          |
| Secrets (service role, etc.)         | Hors Git — Vercel / coffre-fort |
| Migrations SQL                       | Repo `supabase/migrations/`     |

## ⚠️ État réel du plan Supabase (vérifié 2026-08-02)

L’organisation Supabase est actuellement sur le **plan Free** (`get_organization` →
`"plan":"free"`). **Le plan Free ne fournit aucune sauvegarde automatique
gérée par Supabase** (les backups quotidiens + PITR sont réservés au plan
Pro et add-ons). Tant que l’organisation reste en Free, la seule protection
réelle des données est la sauvegarde applicative ci-dessous
(`npm run backup:db`) — elle n’est pas optionnelle, elle est la seule.

Deux options avant Go Live, à choisir explicitement :

1. **Upgrade Supabase → plan Pro** (backups quotidiens gérés, 7 jours de
   rétention + PITR en add-on) — solution la plus simple, coût récurrent.
2. **Rester en Free** + planifier `npm run backup:db` (voir ci-dessous) de
   façon récurrente (Planificateur de tâches Windows ou NAS) — gratuit,
   nécessite une vraie planification et une vérification périodique.

## Sauvegarde automatisée — méthode principale : conteneur sur le NAS

**Statut : opérationnel (2026-08-02), tourne sur le NAS 24/7**

Le NAS Synology héberge déjà l'app (`docker-compose`, conteneur `restor-pc`)
et reste allumé en permanence, contrairement au PC Windows. La sauvegarde a
donc été déplacée sur le NAS : `nas/backup-cron/` contient un petit conteneur
autonome (`restor-pc-backup-cron`, basé sur `postgres:17-alpine`) qui exécute
tous les jours à 3h00 (heure de Paris) un `pg_dump` + rotation + notification
ntfy, indépendamment de l'état du PC.

Fichiers (versionnés dans le repo) :

- `nas/backup-cron/Dockerfile` — image `postgres:17-alpine` + `curl`/`tzdata`
- `nas/backup-cron/entrypoint.sh` — fige les variables d'env du conteneur
  dans `/etc/container.env` (busybox `crond` ne les propage pas nativement
  à ses jobs)
- `nas/backup-cron/backup.sh` — `pg_dump` → gzip → rotation (`BACKUP_KEEP`,
  défaut 30) → notification ntfy (succès **et** échec)
- `nas/backup-cron/crontab` — `0 3 * * * /scripts/backup.sh`
- `nas/backup-cron/docker-compose.yml` — service + volume `./backups`
- `nas/backup-cron/.env.example` — modèle du `.env` réel (jamais commité)

Déployé sur le NAS dans `/volume1/vesty/restor-pc-backup-cron/` (le dossier
`/volume1/docker` est en écriture root uniquement pour ce compte SSH — sans
impact fonctionnel, juste l'emplacement choisi). `.env` réel sur le NAS avec
`SUPABASE_DB_URL`, `BACKUP_KEEP`, `NTFY_TOPIC` (mêmes valeurs que
`.env.local`, jamais commitées).

Test réalisé le 2026-08-02 : build + `docker-compose up -d` sur le NAS,
`docker exec restor-pc-backup-cron /scripts/backup.sh` exécuté manuellement
→ dump réel de 52 Ko, notification ntfy reçue (HTTP 200 confirmé), conteneur
stable (`restart: unless-stopped`, pas de boucle de redémarrage).

Pour mettre à jour le conteneur après modification des fichiers dans
`nas/backup-cron/` : re-uploader les fichiers (les fins de ligne **doivent**
rester en LF, pas CRLF — un éditeur Windows peut les convertir) puis, sur le
NAS :

```bash
cd /volume1/vesty/restor-pc-backup-cron
docker-compose build && docker-compose up -d
```

Vérifier l'exécution planifiée :

```bash
docker logs restor-pc-backup-cron          # sortie de crond
docker exec restor-pc-backup-cron cat /var/log/backup.log
ls -la /volume1/vesty/restor-pc-backup-cron/backups
```

### Ancienne méthode (PC Windows) — désactivée, gardée en secours manuel

Script : `scripts/backup-db.mjs` (`npm run backup:db`), tâche planifiée
Windows `Restor-PC - Backup DB` — **désactivée** le 2026-08-02
(`schtasks /Change /TN "Restor-PC - Backup DB" /DISABLE`) au profit du NAS,
qui est disponible en continu. Le script reste utilisable manuellement à
tout moment (sauvegarde ponctuelle avant une opération risquée, par
exemple) :

```bash
# Prérequis .env.local : SUPABASE_DB_URL, BACKUP_KEEP, NTFY_TOPIC
npm run backup:db
```

## Alerte push (ntfy) — pallier « pas d'alerte si le NAS/PC est éteint »

Le script de sauvegarde (NAS ou PC) envoie une notification
[ntfy](https://ntfy.sh) à **chaque** exécution, succès ou échec :

- ✅ Succès → notification normale avec taille du dump
- 🚨 Échec (pg_dump, copie NAS…) → notification priorité `urgent`

Le NAS tournant 24/7, ce n'est plus « pas d'alerte a priori si le PC est
éteint » : le seul scénario résiduel est une coupure du NAS lui-même
(coupure électrique, panne). Dans ce cas, l'absence de notification un jour
donné reste le signal (« heartbeat ») qu'il faut vérifier manuellement.

Configuration (`.env.local`) :

```bash
NTFY_TOPIC=restor-pc-backup-xxxxxxxxxxxx   # généré aléatoirement, déjà en place
# NTFY_SERVER=https://ntfy.sh              # défaut, ou instance self-hostée
# NTFY_TOKEN=                              # si topic protégé
```

Pour recevoir les notifications sur ton téléphone :

1. Installer l'app **ntfy** ([iOS](https://apps.apple.com/app/ntfy/id1625396347) / [Android](https://play.google.com/store/apps/details?id=io.heckel.ntfy))
2. S'abonner au topic exact présent dans `NTFY_TOPIC` (bouton « + » →
   coller le nom du topic)
3. Sans app, on peut aussi juste ouvrir `https://ntfy.sh/<topic>` dans un
   navigateur (affiche l'historique récent, mis en cache ~12h côté serveur)

Le topic ntfy.sh public agit comme un mot de passe implicite (nom
suffisamment aléatoire pour ne pas être deviné) — à garder hors git au
même titre qu'un secret, déjà le cas via `.env.local`.

## Fréquence recommandée

- **Quotidienne** : `npm run backup:db` planifié (voir ci-dessus), tant que
  le plan Supabase reste Free
- **Hebdomadaire** : vérifier qu’un restore a été testé au moins 1× / trimestre
- **Conservation** : 30 jours minimum pour les dumps opérationnels

## Sauvegarde schéma

```bash
# Avec Supabase CLI (projet lié)
npx supabase db dump -f backup-schema.sql --schema public
```

Les migrations versionnées dans Git sont déjà une sauvegarde du schéma.

## Sauvegarde données (non destructif)

```bash
npx supabase db dump -f backup-data.sql --data-only --schema public
```

Tables prioritaires :

- `tool_orders`
- `script_licenses`
- `stripe_events`
- `user_roles`

## Buckets Storage

Si des buckets sont utilisés plus tard : les exporter séparément (Storage UI / CLI).  
Actuellement la livraison fichier passe par le NAS, pas Storage Supabase.

## Secrets hors dépôt

Sauvegarder hors Git (gestionnaire de mots de passe) :

- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_*`
- `ATELIER_SECRET` / `ATELIER_SESSION_SECRET`
- `NAS_*`
- `RESEND_API_KEY`

## Restauration (environnement de test uniquement)

1. Créer un projet Supabase de **staging**
2. Appliquer les migrations : `npx supabase db push`
3. Restaurer les données avec le script d’exemple (confirmation obligatoire)
4. Ne jamais pointer le script de restore vers la production par défaut

Voir `scripts/restore-supabase.example.sh`.

## Test de restauration

Checklist trimestrielle :

- [ ] Dump schéma OK
- [ ] Dump data OK
- [ ] Restore sur staging OK
- [ ] Checkout test + lecture commandes OK
