-- Vague 4 — courses Stripe hors-ordre + révocation idempotente (licences / liens NAS)

-- ---------------------------------------------------------------------------
-- Marqueur de révocation par payment_intent (refund/dispute avant ou pendant fulfill)
-- ---------------------------------------------------------------------------
create table if not exists public.stripe_payment_revocations (
  payment_intent_id text primary key,
  reason text not null check (reason in ('refunded', 'disputed')),
  stripe_event_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.stripe_payment_revocations enable row level security;

create index if not exists stripe_payment_revocations_created_idx
  on public.stripe_payment_revocations (created_at desc);

-- ---------------------------------------------------------------------------
-- Colonnes audit révocation sur tool_orders
-- ---------------------------------------------------------------------------
alter table public.tool_orders
  add column if not exists assets_revoked_at timestamptz,
  add column if not exists revoke_error text;

-- ---------------------------------------------------------------------------
-- claim_order_revocation : marque PI + met à jour commandes/licences, retourne assets NAS
-- Idempotent : peut être rappelé après échec NAS.
-- ---------------------------------------------------------------------------
create or replace function public.claim_order_revocation(
  p_payment_intent_id text,
  p_reason text,
  p_stripe_event_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reason text;
  v_rows jsonb := '[]'::jsonb;
  r record;
begin
  if p_payment_intent_id is null or length(trim(p_payment_intent_id)) = 0 then
    raise exception 'payment_intent_id required';
  end if;

  if p_reason not in ('refunded', 'disputed') then
    raise exception 'invalid reason %', p_reason;
  end if;

  insert into public.stripe_payment_revocations as spr (
    payment_intent_id,
    reason,
    stripe_event_id,
    created_at,
    updated_at
  )
  values (
    p_payment_intent_id,
    p_reason,
    p_stripe_event_id,
    now(),
    now()
  )
  on conflict (payment_intent_id) do update
    set
      -- refunded l’emporte toujours sur disputed
      reason = case
        when spr.reason = 'refunded' or excluded.reason = 'refunded' then 'refunded'
        else excluded.reason
      end,
      stripe_event_id = coalesce(excluded.stripe_event_id, spr.stripe_event_id),
      updated_at = now()
  returning reason into v_reason;

  for r in
    select
      o.id as order_id,
      o.license_key,
      o.share_id,
      (o.assets_revoked_at is not null) as already_revoked
    from public.tool_orders o
    where o.stripe_payment_intent_id = p_payment_intent_id
  loop
    update public.tool_orders
    set
      status = case
        when status = 'refunded' then 'refunded'
        when v_reason = 'refunded' then 'refunded'
        when status = 'disputed' and v_reason = 'disputed' then 'disputed'
        when status in ('pending', 'processing', 'fulfilled', 'failed', 'cancelled', 'disputed')
          then v_reason
        else status
      end,
      error_code = coalesce(error_code, 'STRIPE_REVOKED')
    where id = r.order_id;

    if r.license_key is not null then
      update public.script_licenses
      set status = 'revoked'
      where license_key = r.license_key
        and status is distinct from 'revoked';
    end if;

    v_rows := v_rows || jsonb_build_array(
      jsonb_build_object(
        'order_id', r.order_id,
        'license_key', r.license_key,
        'share_id', r.share_id,
        'already_revoked', r.already_revoked
      )
    );
  end loop;

  return jsonb_build_object(
    'reason', v_reason,
    'payment_intent_id', p_payment_intent_id,
    'orders', v_rows
  );
end;
$$;

revoke all on function public.claim_order_revocation(text, text, text) from public;
grant execute on function public.claim_order_revocation(text, text, text) to service_role;

-- ---------------------------------------------------------------------------
-- mark_order_assets_revoked : après delete Synology (ou no-op si pas de share)
-- ---------------------------------------------------------------------------
create or replace function public.mark_order_assets_revoked(
  p_order_id uuid,
  p_revoke_error text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.tool_orders
  set
    assets_revoked_at = coalesce(assets_revoked_at, now()),
    revoke_error = p_revoke_error,
    share_url = null,
    share_password = null
  where id = p_order_id;

  return found;
end;
$$;

revoke all on function public.mark_order_assets_revoked(uuid, text) from public;
grant execute on function public.mark_order_assets_revoked(uuid, text) to service_role;

-- ---------------------------------------------------------------------------
-- finalize_tool_order_fulfillment : fulfilled uniquement si encore processing
-- Empêche un refund concurrent d’être écrasé par le webhook checkout.
-- ---------------------------------------------------------------------------
create or replace function public.finalize_tool_order_fulfillment(
  p_order_id uuid,
  p_license_key text,
  p_share_id text,
  p_share_url text,
  p_share_password text,
  p_expire_times integer,
  p_user_id uuid default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.tool_orders
  set
    license_key = p_license_key,
    share_id = p_share_id,
    share_url = p_share_url,
    share_password = p_share_password,
    expire_times = p_expire_times,
    status = 'fulfilled',
    fulfilled_at = now(),
    error_code = null,
    email_status = 'pending',
    user_id = coalesce(p_user_id, user_id)
  where id = p_order_id
    and status = 'processing';

  return found;
end;
$$;

revoke all on function public.finalize_tool_order_fulfillment(uuid, text, text, text, text, integer, uuid) from public;
grant execute on function public.finalize_tool_order_fulfillment(uuid, text, text, text, text, integer, uuid) to service_role;
