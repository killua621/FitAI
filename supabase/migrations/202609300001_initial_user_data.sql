-- FitAI initial schema. All personal rows are owned by the signed-in user.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  goal text not null default 'Ganhar massa muscular',
  experience_level text not null default 'Estou começando',
  training_days smallint not null default 3 check (training_days between 1 and 7),
  age smallint check (age is null or age between 1 and 120),
  height_cm smallint check (height_cm is null or height_cm between 80 and 250),
  weight_kg numeric(5, 2) check (weight_kg is null or weight_kg between 20 and 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
grant select, insert, update, delete on table public.profiles to authenticated;
drop policy if exists profiles_read_own on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
drop policy if exists profiles_delete_own on public.profiles;
create policy profiles_read_own on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy profiles_insert_own on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy profiles_delete_own on public.profiles for delete to authenticated using ((select auth.uid()) = id);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  target_value numeric(10, 2),
  current_value numeric(10, 2) not null default 0,
  unit text,
  due_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  scheduled_for timestamptz,
  duration_minutes smallint check (duration_minutes is null or duration_minutes between 1 and 600),
  status text not null default 'planned' check (status in ('planned', 'completed', 'skipped')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  meal_type text not null,
  description text not null,
  calories numeric(7, 2),
  protein_g numeric(7, 2),
  carbs_g numeric(7, 2),
  fat_g numeric(7, 2),
  logged_at timestamptz not null default now()
);

create table if not exists public.body_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  weight_kg numeric(5, 2),
  measured_at timestamptz not null default now(),
  notes text
);

do $$
declare
  table_name text;
  operation text;
begin
  foreach table_name in array array['goals', 'workout_sessions', 'meal_logs', 'body_metrics'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', table_name);
    foreach operation in array array['select', 'insert', 'update', 'delete'] loop
      execute format('drop policy if exists %I on public.%I', table_name || '_' || operation || '_own', table_name);
      if operation = 'select' or operation = 'delete' then
        execute format('create policy %I on public.%I for %s to authenticated using ((select auth.uid()) = user_id)', table_name || '_' || operation || '_own', table_name, operation);
      elsif operation = 'insert' then
        execute format('create policy %I on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)', table_name || '_' || operation || '_own', table_name);
      else
        execute format('create policy %I on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', table_name || '_' || operation || '_own', table_name);
      end if;
    end loop;
  end loop;
end;
$$;
