-- Dietary safety preferences live on the signed-in user's existing profile row.
alter table public.profiles
  add column if not exists food_allergies text[] not null default '{}',
  add column if not exists food_allergy_notes text not null default '';
