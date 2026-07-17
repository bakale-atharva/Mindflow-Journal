-- Waitlist schema for MindFlow Journal

begin;

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  email text not null,
  is_18_or_older boolean not null,
  journaling_frequency text not null,
  biggest_difficulty text not null,
  willingness_to_pay text not null default 'not_right_now',
  created_at timestamptz not null default now(),
  constraint waitlist_email_unique unique(email),
  constraint waitlist_email_normalized check (email = lower(btrim(email))),
  constraint waitlist_journaling_frequency_check check (journaling_frequency in ('never_started', 'tried_a_few_times', 'few_times_per_month', 'few_times_per_week', 'most_days')),
  constraint waitlist_biggest_difficulty_check check (biggest_difficulty in ('dont_know_where_to_begin', 'overthink_what_to_write', 'forget_or_lose_consistency', 'too_time_consuming', 'not_found_useful_format', 'other')),
  constraint waitlist_willingness_to_pay_check check (willingness_to_pay in ('yes', 'maybe', 'not_right_now'))
);

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'waitlist_signups'
      and column_name = 'willingness_to_pay' and data_type = 'boolean'
  ) then
    alter table public.waitlist_signups
      alter column willingness_to_pay drop default,
      alter column willingness_to_pay type text using case when willingness_to_pay then 'yes' else 'not_right_now' end,
      alter column willingness_to_pay set default 'not_right_now';
  end if;
end $$;

update public.waitlist_signups
set journaling_frequency = case journaling_frequency
  when 'daily' then 'most_days'
  when 'weekly' then 'few_times_per_week'
  when 'monthly' then 'few_times_per_month'
  when 'rarely' then 'never_started'
  else journaling_frequency
end
where journaling_frequency in ('daily', 'weekly', 'monthly', 'rarely');

update public.waitlist_signups
set journaling_frequency = 'tried_a_few_times'
where journaling_frequency not in ('never_started', 'tried_a_few_times', 'few_times_per_month', 'few_times_per_week', 'most_days');

update public.waitlist_signups
set biggest_difficulty = 'other'
where biggest_difficulty not in ('dont_know_where_to_begin', 'overthink_what_to_write', 'forget_or_lose_consistency', 'too_time_consuming', 'not_found_useful_format', 'other');

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'waitlist_journaling_frequency_check') then
    alter table public.waitlist_signups add constraint waitlist_journaling_frequency_check check (journaling_frequency in ('never_started', 'tried_a_few_times', 'few_times_per_month', 'few_times_per_week', 'most_days'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'waitlist_biggest_difficulty_check') then
    alter table public.waitlist_signups add constraint waitlist_biggest_difficulty_check check (biggest_difficulty in ('dont_know_where_to_begin', 'overthink_what_to_write', 'forget_or_lose_consistency', 'too_time_consuming', 'not_found_useful_format', 'other'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'waitlist_willingness_to_pay_check') then
    alter table public.waitlist_signups add constraint waitlist_willingness_to_pay_check check (willingness_to_pay in ('yes', 'maybe', 'not_right_now'));
  end if;
end $$;

-- Enable RLS
alter table public.waitlist_signups enable row level security;

-- Allow anonymous inserts (so public can submit the form)
drop policy if exists "Allow anonymous inserts to waitlist" on public.waitlist_signups;
create policy "Allow anonymous inserts to waitlist"
on public.waitlist_signups for insert to anon, authenticated
with check (true);

-- Service-role API calls bypass RLS. No public select policy is created.
drop policy if exists "Allow service role to read waitlist" on public.waitlist_signups;

commit;
