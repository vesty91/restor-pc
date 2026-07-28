-- Vague 1 security hardening: orders user_id, statuses, stripe events, roles, consents

-- ---------------------------------------------------------------------------
-- tool_orders extensions
-- ---------------------------------------------------------------------------
alter table public.tool_orders
  add column if not exists user_id uuid references auth.users (id) on delete set null,
  add column if not exists stripe_event_id text,
  add column if not exists stripe_payment_intent_id text,
  add column if not exists stripe_price_id text,
  add column if not exists amount_total integer,
  add column if not exists currency text,
  add column if not exists error_code text,
  add column if not exists email_retry_needed boolean not null default false,
  add column if not exists terms_version text,
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists withdrawal_consent_at timestamptz,
  add column if not exists digital_delivery_requested_at timestamptz;

-- Expand status values (text check if present)
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'tool_orders_status_check'
  ) then
    alter table public.tool_orders drop constraint tool_orders_status_check;
  end if;
exception when undefined_object then
  null;
end $$;

alter table public.tool_orders
  drop constraint if exists tool_orders_status_check;

alter table public.tool_orders
  add constraint tool_orders_status_check
  check (status in (
    'pending', 'processing', 'fulfilled', 'failed',
    'refunded', 'disputed', 'cancelled'
  ));

create index if not exists tool_orders_user_id_idx on public.tool_orders (user_id);
create index if not exists tool_orders_status_idx on public.tool_orders (status);
create unique index if not exists tool_orders_stripe_event_id_uidx
  on public.tool_orders (stripe_event_id)
  where stripe_event_id is not null;

-- ---------------------------------------------------------------------------
-- Stripe events (idempotency)
-- ---------------------------------------------------------------------------
create table if not exists public.stripe_events (
  id text primary key,
  type text not null,
  payload jsonb,
  processed_at timestamptz,
  result text,
  error_code text,
  created_at timestamptz not null default now()
);

alter table public.stripe_events enable row level security;

-- ---------------------------------------------------------------------------
-- Admin / technician roles
-- ---------------------------------------------------------------------------
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('customer', 'technician', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;

-- ---------------------------------------------------------------------------
-- Admin audit log
-- ---------------------------------------------------------------------------
create table if not exists public.admin_audit_logs (
  id bigserial primary key,
  actor_user_id uuid references auth.users (id) on delete set null,
  action text not null,
  meta jsonb,
  created_at timestamptz not null default now()
);

alter table public.admin_audit_logs enable row level security;

-- ---------------------------------------------------------------------------
-- Fulfillment logs
-- ---------------------------------------------------------------------------
create table if not exists public.fulfillment_logs (
  id bigserial primary key,
  order_id uuid references public.tool_orders (id) on delete cascade,
  event text not null,
  meta jsonb,
  created_at timestamptz not null default now()
);

alter table public.fulfillment_logs enable row level security;

-- ---------------------------------------------------------------------------
-- RLS: customers read own orders by user_id (email fallback for legacy)
-- ---------------------------------------------------------------------------
alter table public.tool_orders enable row level security;
alter table public.script_licenses enable row level security;

drop policy if exists "customers_read_own_orders" on public.tool_orders;
create policy "customers_read_own_orders"
  on public.tool_orders
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or (
      user_id is null
      and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

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
        and (
          o.user_id = auth.uid()
          or (
            o.user_id is null
            and lower(o.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
          )
        )
    )
  );

-- No insert/update/delete for authenticated on licenses/orders (service role only)
drop policy if exists "users_read_own_role" on public.user_roles;
create policy "users_read_own_role"
  on public.user_roles
  for select
  to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Atomic claim of stripe event
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
begin
  insert into public.stripe_events (id, type)
  values (p_id, p_type)
  on conflict (id) do nothing;

  if found then
    return true;
  end if;

  -- already exists
  return false;
end;
$$;

revoke all on function public.claim_stripe_event(text, text) from public;
grant execute on function public.claim_stripe_event(text, text) to service_role;
