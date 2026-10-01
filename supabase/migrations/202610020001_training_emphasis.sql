-- Allow each account to choose a training distribution; automatic uses the optional
-- physiological profile only as an editable starting point.
alter table public.profiles
  add column if not exists training_emphasis text not null default 'automatic'
  check (training_emphasis in ('automatic', 'balanced', 'lower_body', 'upper_body'));
