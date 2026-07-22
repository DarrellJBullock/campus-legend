-- ============================================================================
-- Campus Legend — schema & Row Level Security
-- Run against your Supabase project (SQL editor or `pnpm db:migrate`).
-- Every table is owned by auth.users; RLS guarantees a user only ever reads or
-- writes their own rows.
-- ============================================================================

-- Profiles: one row per auth user, created on signup via trigger.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Recruit',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Careers: the full save blob lives in `state` (jsonb). Normalized columns are
-- duplicated for cheap listing/sorting without deserializing the whole blob.
create table if not exists public.careers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  slug text not null,                    -- client-generated career id
  name text not null,
  school_id text not null,
  position text not null,
  season int not null default 1,
  schema_version int not null default 1,
  is_demo boolean not null default false,
  state jsonb not null,                  -- validated CareerState
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, slug)
);

create index if not exists careers_user_id_idx on public.careers (user_id);
create index if not exists careers_updated_at_idx on public.careers (updated_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.careers enable row level security;

-- Profiles: a user can see and edit only their own profile.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_upsert_own" on public.profiles;
create policy "profiles_upsert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Careers: full CRUD scoped to the owning user.
drop policy if exists "careers_select_own" on public.careers;
create policy "careers_select_own" on public.careers
  for select using (auth.uid() = user_id);

drop policy if exists "careers_insert_own" on public.careers;
create policy "careers_insert_own" on public.careers
  for insert with check (auth.uid() = user_id);

drop policy if exists "careers_update_own" on public.careers;
create policy "careers_update_own" on public.careers
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "careers_delete_own" on public.careers;
create policy "careers_delete_own" on public.careers
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Triggers: auto-create a profile, and keep updated_at fresh.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', 'Recruit'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists careers_touch_updated_at on public.careers;
create trigger careers_touch_updated_at
  before update on public.careers
  for each row execute function public.touch_updated_at();

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();
