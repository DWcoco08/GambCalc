-- =============================================
-- GambCalc - Supabase Database Schema
-- Chạy file này trong Supabase SQL Editor
-- DROP + CREATE lại toàn bộ
-- =============================================

-- 0. Drop everything (order matters: child tables first)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

drop policy if exists "Users can read own match logs" on public.match_logs;
drop policy if exists "Users can insert own match logs" on public.match_logs;
drop policy if exists "Users can delete own match logs" on public.match_logs;

drop policy if exists "Users can read own match players" on public.match_players;
drop policy if exists "Users can insert own match players" on public.match_players;
drop policy if exists "Users can delete own match players" on public.match_players;

drop policy if exists "Users can read own matches" on public.matches;
drop policy if exists "Users can insert own matches" on public.matches;
drop policy if exists "Users can update own matches" on public.matches;
drop policy if exists "Users can delete own matches" on public.matches;

drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

drop table if exists public.match_logs cascade;
drop table if exists public.match_players cascade;
drop table if exists public.matches cascade;
drop table if exists public.profiles cascade;

-- 1. Profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz default now()
);

-- 2. Matches table
create table public.matches (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id text not null,
  game_name text not null,
  base_bet integer not null,
  total_rounds integer not null default 0,
  started_at timestamptz not null,
  ended_at timestamptz,
  deleted boolean default false,
  deleted_at timestamptz,
  created_at timestamptz default now()
);

-- 3. Match Players table
create table public.match_players (
  id bigint generated always as identity primary key,
  match_id text not null references public.matches(id) on delete cascade,
  player_id integer not null,
  player_name text not null,
  final_money integer not null default 0,
  rank integer,
  game_state jsonb,
  created_at timestamptz default now()
);

-- 4. Match Logs table
create table public.match_logs (
  id bigint generated always as identity primary key,
  match_id text not null references public.matches(id) on delete cascade,
  round integer not null,
  winner_id integer,
  winner_name text,
  action text,
  streak integer,
  multiplier integer,
  amount integer,
  base_bet integer,
  changes jsonb,
  logged_at timestamptz not null,
  created_at timestamptz default now()
);

-- 5. Indexes
create index idx_matches_user_id on public.matches(user_id);
create index idx_match_players_match_id on public.match_players(match_id);
create index idx_match_logs_match_id on public.match_logs(match_id);

-- 6. Enable RLS
alter table public.profiles enable row level security;
alter table public.matches enable row level security;
alter table public.match_players enable row level security;
alter table public.match_logs enable row level security;

-- 7. RLS Policies - Profiles
create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- 8. RLS Policies - Matches
create policy "Users can read own matches" on public.matches
  for select using (auth.uid() = user_id);
create policy "Users can insert own matches" on public.matches
  for insert with check (auth.uid() = user_id);
create policy "Users can update own matches" on public.matches
  for update using (auth.uid() = user_id);
create policy "Users can delete own matches" on public.matches
  for delete using (auth.uid() = user_id);

-- 9. RLS Policies - Match Players
create policy "Users can read own match players" on public.match_players
  for select using (
    exists (select 1 from public.matches where matches.id = match_players.match_id and matches.user_id = auth.uid())
  );
create policy "Users can insert own match players" on public.match_players
  for insert with check (
    exists (select 1 from public.matches where matches.id = match_players.match_id and matches.user_id = auth.uid())
  );
create policy "Users can delete own match players" on public.match_players
  for delete using (
    exists (select 1 from public.matches where matches.id = match_players.match_id and matches.user_id = auth.uid())
  );

-- 10. RLS Policies - Match Logs
create policy "Users can read own match logs" on public.match_logs
  for select using (
    exists (select 1 from public.matches where matches.id = match_logs.match_id and matches.user_id = auth.uid())
  );
create policy "Users can insert own match logs" on public.match_logs
  for insert with check (
    exists (select 1 from public.matches where matches.id = match_logs.match_id and matches.user_id = auth.uid())
  );
create policy "Users can delete own match logs" on public.match_logs
  for delete using (
    exists (select 1 from public.matches where matches.id = match_logs.match_id and matches.user_id = auth.uid())
  );

-- 11. Auto-create profile when admin creates a user
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
