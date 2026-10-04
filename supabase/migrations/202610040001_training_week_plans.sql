-- A private weekly template per user and weekday. Plans are keyed by Monday,
-- so a new Monday starts a fresh training week while previous plans stay saved.
create table if not exists public.training_week_plans (
  user_id uuid not null references auth.users (id) on delete cascade,
  week_start date not null,
  weekday smallint not null check (weekday between 0 and 6),
  muscle_groups text[] not null default '{}',
  updated_at timestamptz not null default now(),
  primary key (user_id, week_start, weekday),
  check (cardinality(muscle_groups) <= 3)
);

alter table public.training_week_plans enable row level security;
grant select, insert, update, delete on table public.training_week_plans to authenticated;

drop policy if exists training_week_plans_select_own on public.training_week_plans;
drop policy if exists training_week_plans_insert_own on public.training_week_plans;
drop policy if exists training_week_plans_update_own on public.training_week_plans;
drop policy if exists training_week_plans_delete_own on public.training_week_plans;

create policy training_week_plans_select_own
  on public.training_week_plans for select to authenticated
  using ((select auth.uid()) = user_id);
create policy training_week_plans_insert_own
  on public.training_week_plans for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy training_week_plans_update_own
  on public.training_week_plans for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy training_week_plans_delete_own
  on public.training_week_plans for delete to authenticated
  using ((select auth.uid()) = user_id);
