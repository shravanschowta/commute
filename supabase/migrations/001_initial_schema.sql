-- CommuteBLR initial schema
-- Run in Supabase SQL editor or via supabase db push

create extension if not exists "uuid-ossp";

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  home_place jsonb,
  work_place jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Saved / favorite routes
create table public.saved_routes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  origin jsonb not null,
  destination jsonb not null,
  preferred_modes text[] default '{}',
  label text check (label in ('home', 'work', 'college', 'favorite', 'custom')),
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);

create index saved_routes_user_id_idx on public.saved_routes (user_id);

-- Recent searches (anonymous-friendly via nullable user_id)
create table public.recent_searches (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users (id) on delete cascade,
  origin jsonb not null,
  destination jsonb not null,
  preference text,
  searched_at timestamptz not null default now()
);

create index recent_searches_user_id_idx on public.recent_searches (user_id, searched_at desc);

-- Trip history after completed journeys
create table public.trip_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  route_snapshot jsonb not null,
  started_at timestamptz,
  completed_at timestamptz,
  actual_cost_inr numeric(10, 2),
  created_at timestamptz not null default now()
);

-- Favorite places (shortcuts)
create table public.favorite_places (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  place jsonb not null,
  icon text default 'place',
  created_at timestamptz not null default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.saved_routes enable row level security;
alter table public.recent_searches enable row level security;
alter table public.trip_history enable row level security;
alter table public.favorite_places enable row level security;

create policy "Users manage own profile"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users manage own saved routes"
  on public.saved_routes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own recent searches"
  on public.recent_searches for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own trip history"
  on public.trip_history for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own favorite places"
  on public.favorite_places for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
