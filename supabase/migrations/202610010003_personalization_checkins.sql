-- Personal preferences and attendance records are private to the owning user.
alter table public.profiles
  add column if not exists water_goal_ml integer check (water_goal_ml is null or water_goal_ml between 500 and 6000),
  add column if not exists training_weekdays text[] not null default '{}',
  add column if not exists activity_level text check (activity_level is null or activity_level in ('low', 'light', 'moderate', 'high')),
  add column if not exists energy_equation_profile text check (energy_equation_profile is null or energy_equation_profile in ('female', 'male'));

create table if not exists public.workout_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  checkin_date date not null default current_date,
  workout_title text not null default 'Treino concluído',
  completed_at timestamptz not null default now(),
  unique (user_id, checkin_date)
);

create index if not exists workout_checkins_user_date_idx
  on public.workout_checkins (user_id, checkin_date desc);

alter table public.workout_checkins enable row level security;
grant select, insert, update, delete on table public.workout_checkins to authenticated;
drop policy if exists workout_checkins_select_own on public.workout_checkins;
drop policy if exists workout_checkins_insert_own on public.workout_checkins;
drop policy if exists workout_checkins_update_own on public.workout_checkins;
drop policy if exists workout_checkins_delete_own on public.workout_checkins;
create policy workout_checkins_select_own on public.workout_checkins for select to authenticated using ((select auth.uid()) = user_id);
create policy workout_checkins_insert_own on public.workout_checkins for insert to authenticated with check ((select auth.uid()) = user_id);
create policy workout_checkins_update_own on public.workout_checkins for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy workout_checkins_delete_own on public.workout_checkins for delete to authenticated using ((select auth.uid()) = user_id);
