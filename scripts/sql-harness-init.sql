-- Harness SQL local (Postgres Docker isolé) — schéma de base avant migrations wave*
-- Ne pas appliquer en production Supabase (tables déjà présentes).

create extension if not exists "pgcrypto";

create schema if not exists auth;

create table if not exists auth.users (
  id uuid primary key default gen_random_uuid()
);

create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

create or replace function auth.jwt()
returns jsonb
language sql
stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb,
    '{}'::jsonb
  );
$$;

create table if not exists public.tool_orders (
  id uuid primary key default gen_random_uuid(),
  order_ref text not null,
  source text not null default 'stripe',
  email text not null,
  user_id uuid references auth.users (id) on delete set null,
  tool_slug text,
  tool_title text,
  script_id text,
  license_key text,
  status text not null default 'pending',
  share_id text,
  share_url text,
  share_password text,
  expire_times integer,
  email_sent_at timestamptz,
  email_id text,
  email_error text,
  created_at timestamptz not null default now()
);

create table if not exists public.script_licenses (
  id uuid primary key default gen_random_uuid(),
  license_key text not null unique,
  script_id text not null,
  status text not null default 'active',
  note text,
  max_machines integer not null default 1,
  machine_id text,
  machine_name text,
  bios_serial text,
  machine_bound_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- Rôle service_role factice pour les GRANT des migrations
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
end $$;
