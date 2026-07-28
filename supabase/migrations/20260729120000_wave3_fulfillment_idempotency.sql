-- Vague 3 — idempotence Stripe renforcée + claim commande atomique + RLS user_id strict

-- ---------------------------------------------------------------------------
-- Colonnes processing / email sur tool_orders
-- ---------------------------------------------------------------------------
alter table public.tool_orders
  add column if not exists processing_started_at timestamptz,
  add column if not exists fulfilled_at timestamptz,
  add column if not exists failed_at timestamptz,
  add column if not exists email_status text,
  add column if not exists email_retry_count integer not null default 0,
  add column if not exists stripe_checkout_session_id text;

-- Backfill session id depuis order_ref Stripe (cs_...)
update public.tool_orders
set stripe_checkout_session_id = order_ref
where stripe_checkout_session_id is null
  and order_ref like 'cs_%';

create unique index if not exists tool_orders_order_ref_uidx
  on public.tool_orders (order_ref);

create unique index if not exists tool_orders_stripe_session_uidx
  on public.tool_orders (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

-- ---------------------------------------------------------------------------
-- stripe_events : colonnes de reprise
-- ---------------------------------------------------------------------------
alter table public.stripe_events
  add column if not exists processing_status text,
  add column if not exists received_at timestamptz default now(),
  add column if not exists retry_count integer not null default 0;

-- ---------------------------------------------------------------------------
-- claim_stripe_event : insert OU reclaim si result = failed
-- ---------------------------------------------------------------------------
create or replace function public.claim_stripe_event(
  p_id text,
  p_type text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  reclaimed boolean := false;
begin
  insert into public.stripe_events (id, type, processing_status, received_at)
  values (p_id, p_type, 'processing', now())
  on conflict (id) do nothing;

  if found then
    return true;
  end if;

  -- Reprise uniquement si le précédent traitement a échoué
  update public.stripe_events
  set
    processing_status = 'processing',
    result = null,
    processed_at = null,
    error_code = null,
    retry_count = coalesce(retry_count, 0) + 1,
    type = p_type
  where id = p_id
    and (
      result = 'failed'
      or processing_status = 'failed'
    )
  returning true into reclaimed;

  return coalesce(reclaimed, false);
end;
$$;

revoke all on function public.claim_stripe_event(text, text) from public;
grant execute on function public.claim_stripe_event(text, text) to service_role;

-- ---------------------------------------------------------------------------
-- claim_tool_order : passage atomique pending|failed → processing
-- ---------------------------------------------------------------------------
create or replace function public.claim_tool_order(p_order_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.tool_orders
  set
    status = 'processing',
    processing_started_at = now(),
    error_code = null
  where id = p_order_id
    and status in ('pending', 'failed');

  return found;
end;
$$;

revoke all on function public.claim_tool_order(uuid) from public;
grant execute on function public.claim_tool_order(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- RLS : lecture commandes / licences uniquement par user_id (plus d’email)
-- ---------------------------------------------------------------------------
drop policy if exists "customers_read_own_orders" on public.tool_orders;
create policy "customers_read_own_orders"
  on public.tool_orders
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "customers_read_own_licenses" on public.script_licenses;
create policy "customers_read_own_licenses"
  on public.script_licenses
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.tool_orders o
      where o.license_key = script_licenses.license_key
        and o.user_id = auth.uid()
    )
  );

-- user_roles : lecture propre uniquement ; pas de self-update
drop policy if exists "users_read_own_role" on public.user_roles;
create policy "users_read_own_role"
  on public.user_roles
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "users_cannot_write_roles" on public.user_roles;
-- Pas de policy insert/update/delete pour authenticated → service_role only
