# Migration commandes → user_id

## Contexte

Depuis la vague 3, l’espace client filtre **uniquement** par `tool_orders.user_id`.  
L’email ne donne plus accès aux commandes / licences.

## Procédure

1. Appliquer la migration `20260729120000_wave3_fulfillment_idempotency.sql`.
2. Dry-run :

```bash
npx tsx scripts/backfill-order-user-ids.ts
```

3. Vérifier le rapport JSON (`matched`, `ambiguous`, `missing`).
4. Appliquer :

```bash
npx tsx scripts/backfill-order-user-ids.ts --apply
```

## Règles

- Dry-run par défaut.
- Ambiguïté (plusieurs users même email) → **aucune** association automatique.
- Aucun secret affiché dans les logs.

## Après migration

Les commandes sans `user_id` restent invisibles côté client jusqu’à association manuelle atelier.
