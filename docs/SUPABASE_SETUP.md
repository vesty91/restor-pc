# Setup Supabase (Restor-PC)

## Projet

- Projet : `restor-pc-licences`
- Ref : `rjymdpstakbrbqtfpomj`

## Migrations

Les migrations versionnées sont dans :

```text
supabase/migrations/
```

Appliquer (CLI) :

```bash
npx supabase db push
```

Ou via le dashboard SQL / MCP `apply_migration`.

### Vague 1 (`20260728120000_wave1_security_hardening.sql`)

- Colonnes `tool_orders.user_id`, consentements, Stripe IDs, statuts étendus
- Table `stripe_events` (idempotence webhooks)
- Table `user_roles` (`customer` | `technician` | `admin`)
- Tables `admin_audit_logs`, `fulfillment_logs`
- RLS : lecture commandes/licences par `user_id` (fallback email legacy)
- RPC `claim_stripe_event(p_id, p_type)`

## Rôles admin

Insérer un technicien / admin (service role) :

```sql
insert into public.user_roles (user_id, role)
values ('UUID_AUTH_USER', 'admin');
```

L’espace `/admin` utilise encore la session atelier HMAC en transition.
Le passage complet à Supabase Auth + rôles est prévu en Vague 2.

## Variables

Voir `.env.example` :

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
