# Runbook production — Vague 3 (idempotence Stripe + backfill `user_id`)

> **NE PAS EXÉCUTER** ces commandes contre la base de production sans sauvegarde
> et validation explicite. Ce document est une préparation (branche maintenance).
>
> Aucune commande distante n’a été lancée dans le cadre de la branche
> `maintenance/code-quality-performance`.

Migration source :

`supabase/migrations/20260729120000_wave3_fulfillment_idempotency.sql`

Script backfill :

`scripts/backfill-order-user-ids.ts`  
npm : `npm run backfill:order-users` (dry-run par défaut ; `--apply` pour écrire)

---

## Avant migration

### 1. Sauvegarde Supabase

- Dashboard Supabase → Project Settings → Database → **Backups** (ou dump `pg_dump`).
- Noter l’heure UTC et l’environnement (prod / staging).

### 2. Vérifier l’environnement ciblé

```text
SUPABASE_URL=https://your-project.supabase.co
```

Confirmer que les variables du NAS / `.env` Docker pointent vers le **bon** projet.

### 3. Vérifier le nombre de commandes

```sql
select count(*) as tool_orders_total from public.tool_orders;
select status, count(*) from public.tool_orders group by status order by 1;
```

### 4. Doublons `checkout_session` / `order_ref`

```sql
-- order_ref dupliqués
select order_ref, count(*)
from public.tool_orders
group by order_ref
having count(*) > 1;

-- sessions Stripe déjà présentes (colonne peut manquer avant migration)
select stripe_checkout_session_id, count(*)
from public.tool_orders
where stripe_checkout_session_id is not null
group by 1
having count(*) > 1;
```

Si des doublons existent, **résoudre avant** d’appliquer l’index unique.

### 5. Commandes sans `user_id`

```sql
select count(*) as missing_user_id
from public.tool_orders
where user_id is null;

select id, email, status, created_at
from public.tool_orders
where user_id is null
order by created_at desc
limit 50;
```

### 6. Test sur base locale ou staging

1. Appliquer la migration sur une copie / branche Supabase staging.
2. Exécuter le dry-run backfill.
3. Vérifier les RPC `claim_stripe_event` / `claim_tool_order`.
4. Rejouer un webhook test Stripe (mode test uniquement).

---

## Migration

### Contenu principal

- Colonnes `tool_orders` : `processing_started_at`, `fulfilled_at`, `failed_at`,
  `email_status`, `email_retry_count`, `stripe_checkout_session_id`
- Index unique `tool_orders_order_ref_uidx`
- Index unique partiel `tool_orders_stripe_session_uidx`
- Colonnes `stripe_events` : `processing_status`, `received_at`, `retry_count`
- RPC `claim_stripe_event(p_id, p_type)` — insert ou reclaim si `failed`
- RPC `claim_tool_order(p_order_id)` — `pending|failed` → `processing` atomique
- Ajustements RLS liés à `user_id` (voir fichier SQL)

### Commandes (à exécuter uniquement après validation)

Via CLI Supabase (exemple) :

```bash
# Staging d’abord
supabase db push --db-url "$STAGING_DATABASE_URL"

# Production — UNIQUEMENT après OK explicite
# supabase db push --db-url "$PRODUCTION_DATABASE_URL"
```

Ou coller le SQL dans l’éditeur Supabase (SQL) après relecture.

**Ne pas** lancer ces commandes depuis l’agent Cursor sans accord.

---

## Vérification après migration (lecture seule)

```sql
-- Colonnes tool_orders
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'tool_orders'
  and column_name in (
    'processing_started_at', 'fulfilled_at', 'failed_at',
    'email_status', 'email_retry_count', 'stripe_checkout_session_id', 'user_id'
  )
order by 1;

-- Index
select indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and tablename in ('tool_orders', 'stripe_events')
order by 1;

-- RPC
select proname
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and proname in ('claim_stripe_event', 'claim_tool_order');

-- Événements Stripe
select count(*) as stripe_events_total from public.stripe_events;
select coalesce(processing_status, result::text, 'null') as st, count(*)
from public.stripe_events
group by 1
order by 2 desc;

-- Toujours sans user_id ?
select count(*) from public.tool_orders where user_id is null;

-- Doublons session après index
select stripe_checkout_session_id, count(*)
from public.tool_orders
where stripe_checkout_session_id is not null
group by 1
having count(*) > 1;
```

Vérifier aussi les policies RLS sur `tool_orders` (select propriétaire = `auth.uid()`).

---

## Backfill `user_id`

### Dry-run (comportement par défaut)

```bash
# Charge SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY depuis l’env locale / staging
npm run backfill:order-users
# équivalent :
npx tsx scripts/backfill-order-user-ids.ts
```

Le script :

- liste jusqu’à 2000 commandes avec `user_id is null` et email présent ;
- cherche des utilisateurs Auth par email ;
- **n’écrit rien** sans `--apply` ;
- journalise matched / ambiguous / missing.

### Apply

```bash
# NE PAS EXÉCUTER SANS SAUVEGARDE ET VALIDATION DU RAPPORT DRY-RUN.
npx tsx scripts/backfill-order-user-ids.ts --apply
```

### Cas particuliers

| Cas | Comportement |
|---|---|
| Email sans utilisateur Auth | `missing` — pas d’update |
| Plusieurs utilisateurs pour un email | `ambiguous` — pas d’update |
| Email changé côté Auth | peut rester `missing` — correction manuelle |
| Commande déjà associée | non sélectionnée (`user_id is null`) |
| Utilisateur Auth supprimé | `missing` — conserver l’historique |

Après apply, relancer le dry-run : `scanned` devrait tendre vers 0 (hors cas manuels).

---

## Retour arrière

| Élément | Réversible ? | Notes |
|---|---|---|
| Backfill `user_id` | Partiel | Possible de remettre `null` au cas par cas ; pas de script automatique |
| Nouvelles colonnes | Non trivial | `drop column` = perte de données d’audit |
| Index unique | Oui si aucun conflit | `drop index` possible, risque de réintroduire des doublons |
| RPC `claim_*` | Oui | Recréer l’ancienne fonction depuis une migration antérieure |
| RLS | Attention | Restaurer la policy précédente depuis git / backup |

**Ne pas** prétendre qu’une suppression de colonne ou de contrainte est sans risque.

En cas d’échec de migration :

1. Restaurer le backup Postgres / PITR Supabase.
2. Redeployer l’image Docker **précédente** si le code dépend des nouvelles RPC.
3. Ouvrir un incident interne avant tout nouvel apply.

---

## Checklist ops (humaine)

- [ ] Backup confirmé
- [ ] Staging OK
- [ ] Doublons résolus
- [ ] Migration appliquée
- [ ] Vérifications SQL OK
- [ ] Dry-run backfill relu
- [ ] Apply backfill validé
- [ ] Webhook Stripe test + 1 commande réelle test
- [ ] `ALLOW_STRIPE_LIVE` toujours `false` tant que non validé
