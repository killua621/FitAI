-- Weight milestones and richer daily workout check-ins. Personal rows remain user-scoped.
alter table public.profiles
  add column if not exists weight_goal_kg numeric(5, 2)
    check (weight_goal_kg is null or weight_goal_kg between 20 and 500),
  add column if not exists weight_goal_start_kg numeric(5, 2)
    check (weight_goal_start_kg is null or weight_goal_start_kg between 20 and 500);

alter table public.workout_checkins
  add column if not exists activity_type text not null default 'Musculação',
  add column if not exists workout_focus text not null default '';

create index if not exists body_metrics_user_measured_idx
  on public.body_metrics (user_id, measured_at desc)
  where weight_kg is not null;

-- Keep the weight log and the profile's current value in one transaction.
create or replace function public.record_weight_weigh_in(p_weight_kg numeric)
returns timestamptz
language plpgsql
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_measured_at timestamptz := now();
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;
  if p_weight_kg < 20 or p_weight_kg > 500 then
    raise exception 'Weight must be between 20 and 500 kg';
  end if;
  insert into public.body_metrics (user_id, weight_kg, measured_at)
    values (v_user_id, p_weight_kg, v_measured_at);
  update public.profiles
    set weight_kg = p_weight_kg, updated_at = v_measured_at
    where id = v_user_id;
  if not found then
    raise exception 'Profile not found';
  end if;
  return v_measured_at;
end;
$$;

revoke all on function public.record_weight_weigh_in(numeric) from public;
grant execute on function public.record_weight_weigh_in(numeric) to authenticated;
