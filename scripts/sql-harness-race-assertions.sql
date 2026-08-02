-- Scénarios courses Stripe / révocation idempotente (après migrations)
-- Exit non-zéro via RAISE si assertion échoue.

do $$
declare
  v_user uuid := gen_random_uuid();
  v_order uuid;
  v_pi text := 'pi_sql_race_1';
  v_claim jsonb;
  v_claim2 jsonb;
  v_finalized boolean;
  v_status text;
  v_lic_status text;
begin
  insert into auth.users (id) values (v_user);

  -- Commande livrée
  insert into public.tool_orders (
    id, order_ref, email, user_id, tool_slug, license_key, status,
    stripe_payment_intent_id, share_id, share_url, share_password
  ) values (
    gen_random_uuid(), 'cs_sql_race_1', 'buyer@example.com', v_user,
    'changer-dns', 'RPC-SQL-KEY-1', 'fulfilled',
    v_pi, 'share-sql-1', 'https://nas.example/s/1', 'Pw!'
  ) returning id into v_order;

  insert into public.script_licenses (license_key, script_id, status)
  values ('RPC-SQL-KEY-1', 'changer-dns', 'active');

  -- 1) Révocation
  v_claim := public.claim_order_revocation(v_pi, 'refunded', 'evt_sql_1');
  if (v_claim->>'reason') is distinct from 'refunded' then
    raise exception 'expected refunded reason, got %', v_claim;
  end if;
  if jsonb_array_length(v_claim->'orders') <> 1 then
    raise exception 'expected 1 order in claim, got %', v_claim;
  end if;

  select status into v_status from public.tool_orders where id = v_order;
  if v_status is distinct from 'refunded' then
    raise exception 'order status expected refunded, got %', v_status;
  end if;

  select status into v_lic_status from public.script_licenses where license_key = 'RPC-SQL-KEY-1';
  if v_lic_status is distinct from 'revoked' then
    raise exception 'license expected revoked, got %', v_lic_status;
  end if;

  -- 2) Idempotence : second claim ne casse pas
  v_claim2 := public.claim_order_revocation(v_pi, 'disputed', 'evt_sql_2');
  if (v_claim2->>'reason') is distinct from 'refunded' then
    raise exception 'refunded must win over disputed, got %', v_claim2;
  end if;

  perform public.mark_order_assets_revoked(v_order, null);
  if not exists (
    select 1 from public.tool_orders
    where id = v_order and assets_revoked_at is not null and share_url is null
  ) then
    raise exception 'assets_revoked_at / share_url clear failed';
  end if;

  -- 3) Hors-ordre : status passé refunded pendant processing → finalize refuse
  insert into public.tool_orders (
    order_ref, email, user_id, status, stripe_payment_intent_id
  ) values (
    'cs_sql_processing', 'early@example.com', v_user, 'processing', 'pi_sql_early'
  ) returning id into v_order;

  insert into public.stripe_payment_revocations (payment_intent_id, reason)
  values ('pi_sql_early', 'refunded')
  on conflict do nothing;

  update public.tool_orders set status = 'refunded' where id = v_order;

  v_finalized := public.finalize_tool_order_fulfillment(
    v_order,
    'RPC-ORPHAN',
    'share-orphan',
    'https://nas.example/orphan',
    'PwOrphan!',
    1,
    v_user
  );
  if v_finalized is distinct from false then
    raise exception 'finalize must refuse when status is refunded';
  end if;

  select status into v_status from public.tool_orders where id = v_order;
  if v_status is distinct from 'refunded' then
    raise exception 'status must stay refunded after failed finalize, got %', v_status;
  end if;

  if exists (select 1 from public.tool_orders where id = v_order and license_key = 'RPC-ORPHAN') then
    raise exception 'finalize must not write license when refused';
  end if;

  raise notice 'SQL harness race/revoke assertions OK';
end $$;
