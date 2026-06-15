-- Profiles mirror auth.users
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text not null,
  total_points int not null default 0,
  current_streak int not null default 0,
  best_streak int not null default 0
);

create table categories (
  slug text primary key,
  name text not null,
  enabled boolean not null default true
);

create table events (
  id uuid primary key default gen_random_uuid(),
  external_id text not null,
  category text not null references categories(slug),
  title text not null,
  home text not null,
  away text not null,
  start_time timestamptz not null,
  lock_time timestamptz not null,
  status text not null default 'scheduled',
  result text,
  settled_at timestamptz,
  unique (category, external_id)
);

create table predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  choice text not null,
  points_awarded int not null default 0,
  settled boolean not null default false,
  unique (user_id, event_id)
);

create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique not null,
  owner_id uuid not null references profiles(id)
);

create table group_members (
  group_id uuid references groups(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  role text not null default 'member',
  primary key (group_id, user_id)
);

-- Row-Level Security
alter table profiles enable row level security;
alter table predictions enable row level security;
alter table events enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;

create policy "profiles readable" on profiles for select using (true);
create policy "own profile update" on profiles for update using (auth.uid() = id);
create policy "events readable" on events for select using (true);

-- Predictions: a user manages only their own, and ONLY before lock_time.
create policy "own predictions read" on predictions for select using (auth.uid() = user_id);
create policy "insert before lock" on predictions for insert
  with check (
    auth.uid() = user_id
    and (select lock_time from events e where e.id = event_id) > now()
  );
