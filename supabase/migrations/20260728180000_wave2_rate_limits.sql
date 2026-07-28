-- Vague 2: rate limiting persistant (Supabase)

create table if not exists public.rate_limit_buckets (
  bucket_key text primary key,
  hit_count integer not null default 0,
  reset_at timestamptz not null,
  updated_at timestamptz not null default now()
);

alter table public.rate_limit_buckets enable row level security;

create or replace function public.consume_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_row public.rate_limit_buckets%rowtype;
  v_allowed boolean;
  v_remaining integer;
begin
  if p_limit < 1 or p_window_seconds < 1 then
    return jsonb_build_object('allowed', false, 'remaining', 0, 'reset_at', v_now);
  end if;

  select * into v_row
  from public.rate_limit_buckets
  where bucket_key = p_key
  for update;

  if not found or v_row.reset_at <= v_now then
    insert into public.rate_limit_buckets (bucket_key, hit_count, reset_at, updated_at)
    values (p_key, 1, v_now + make_interval(secs => p_window_seconds), v_now)
    on conflict (bucket_key) do update
      set hit_count = 1,
          reset_at = excluded.reset_at,
          updated_at = excluded.updated_at
    returning * into v_row;

    return jsonb_build_object(
      'allowed', true,
      'remaining', greatest(p_limit - 1, 0),
      'reset_at', v_row.reset_at
    );
  end if;

  if v_row.hit_count >= p_limit then
    return jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'reset_at', v_row.reset_at
    );
  end if;

  update public.rate_limit_buckets
  set hit_count = hit_count + 1,
      updated_at = v_now
  where bucket_key = p_key
  returning * into v_row;

  v_allowed := true;
  v_remaining := greatest(p_limit - v_row.hit_count, 0);

  return jsonb_build_object(
    'allowed', v_allowed,
    'remaining', v_remaining,
    'reset_at', v_row.reset_at
  );
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer) from public;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;
