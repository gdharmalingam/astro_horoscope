-- Vedic Horoscope — schema + RLS for a fresh Supabase project.
-- Run this in the Supabase SQL Editor (project ezrhtkqpqjtbyrmztnhi).
-- Matches Alembic migrations 0001–0004. The FastAPI backend connects as the
-- `postgres` role (table owner) and BYPASSES RLS; enabling RLS with no policies
-- blocks direct PostgREST access via the anon/authenticated keys.

-- ============================ TABLES ============================
create table if not exists public.users (
  id uuid primary key,
  firebase_uid varchar(128),
  email varchar(320) not null,
  display_name varchar(255),
  photo_url varchar(1024),
  is_active boolean not null default true,
  is_admin boolean not null default false,
  supabase_user_id varchar(128),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create unique index if not exists ix_users_email on public.users(email);
create unique index if not exists ix_users_firebase_uid on public.users(firebase_uid);
create unique index if not exists ix_users_supabase_user_id on public.users(supabase_user_id);

create table if not exists public.birth_profiles (
  id uuid primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  name varchar(255) not null,
  sex varchar(16),
  birth_datetime_local varchar(32) not null,
  timezone varchar(64) not null,
  latitude double precision not null,
  longitude double precision not null,
  place_name varchar(255),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists ix_birth_profiles_user_id on public.birth_profiles(user_id);

create table if not exists public.horoscopes (
  id uuid primary key,
  profile_id uuid not null references public.birth_profiles(id) on delete cascade,
  ayanamsa varchar(32) not null default 'lahiri',
  house_system varchar(32) not null default 'whole_sign',
  chart jsonb not null,
  created_at timestamptz default now()
);
create index if not exists ix_horoscopes_profile_id on public.horoscopes(profile_id);

create table if not exists public.api_keys (
  id uuid primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  name varchar(255) not null,
  prefix varchar(16) not null,
  hashed_key varchar(128) not null,
  revoked_at timestamptz,
  last_used_at timestamptz,
  created_at timestamptz default now()
);
create index if not exists ix_api_keys_user_id on public.api_keys(user_id);
create unique index if not exists ix_api_keys_prefix on public.api_keys(prefix);

create table if not exists public.api_usage (
  id uuid primary key,
  api_key_id uuid not null references public.api_keys(id) on delete cascade,
  endpoint varchar(128) not null,
  status_code integer not null,
  created_at timestamptz default now()
);
create index if not exists ix_api_usage_api_key_id on public.api_usage(api_key_id);
create index if not exists ix_api_usage_created_at on public.api_usage(created_at);

-- Record Alembic state so a future `alembic upgrade head` stays consistent.
create table if not exists public.alembic_version (
  version_num varchar(32) not null primary key
);
insert into public.alembic_version (version_num) values ('0004')
  on conflict (version_num) do nothing;

-- ============================ ROW LEVEL SECURITY ============================
alter table public.users          enable row level security;
alter table public.birth_profiles enable row level security;
alter table public.horoscopes     enable row level security;
alter table public.api_keys       enable row level security;
alter table public.api_usage      enable row level security;

revoke all on public.users, public.birth_profiles, public.horoscopes,
             public.api_keys, public.api_usage
  from anon, authenticated;
