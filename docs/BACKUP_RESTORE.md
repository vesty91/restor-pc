# Sauvegarde et restauration Supabase (Restor-PC)

## Responsabilités

| Élément | Responsable |
|---------|-------------|
| Projet Supabase `restor-pc-licences` | Propriétaire Restor-PC |
| Secrets (service role, etc.) | Hors Git — Vercel / coffre-fort |
| Migrations SQL | Repo `supabase/migrations/` |

## Fréquence recommandée

- **Quotidienne** : backup automatique Supabase (plan Pro) ou export manuel critique
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
