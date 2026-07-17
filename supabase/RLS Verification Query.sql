-- MindFlow Journal RLS isolation verification
-- Run only after `supabase_schema.sql`, `phase_2_program_migration.sql`, and
-- creating two clean allowlisted Auth users with no journal entries. Replace
-- every placeholder before running. This transaction rolls back its test rows.

begin;

-- Replace these values with two real Supabase Auth test users.
-- USER_A_UUID / user-a@example.com
-- USER_B_UUID / user-b@example.com

insert into public.beta_access (email, status, razorpay_payment_reference)
values
  ('user-a@example.com', 'active', 'rls-test-a'),
  ('user-b@example.com', 'active', 'rls-test-b')
on conflict (email) do update set status = 'active';

set local role authenticated;

-- Simulate User A.
select set_config(
  'request.jwt.claims',
  '{"sub":"USER_A_UUID","role":"authenticated","email":"user-a@example.com"}',
  true
);

insert into public.profiles (
  user_id,
  email,
  onboarding_completed_at,
  program_started_at,
  is_18_or_older
)
values (
  'USER_A_UUID',
  'user-a@example.com',
  now(),
  now(),
  true
)
on conflict (user_id) do update
set onboarding_completed_at = coalesce(public.profiles.onboarding_completed_at, excluded.onboarding_completed_at),
    program_started_at = coalesce(public.profiles.program_started_at, excluded.program_started_at),
    is_18_or_older = true;

insert into public.journal_entries (
  id,
  user_id,
  program_day,
  prompt_id,
  content,
  mood
)
values (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'USER_A_UUID',
  1,
  'day-1-mental-load',
  'RLS verification entry owned by User A',
  3
);

-- Simulate User B.
select set_config(
  'request.jwt.claims',
  '{"sub":"USER_B_UUID","role":"authenticated","email":"user-b@example.com"}',
  true
);

insert into public.profiles (
  user_id,
  email,
  onboarding_completed_at,
  program_started_at,
  is_18_or_older
)
values (
  'USER_B_UUID',
  'user-b@example.com',
  now(),
  now(),
  true
)
on conflict (user_id) do update
set onboarding_completed_at = coalesce(public.profiles.onboarding_completed_at, excluded.onboarding_completed_at),
    program_started_at = coalesce(public.profiles.program_started_at, excluded.program_started_at),
    is_18_or_older = true;

do $$
begin
  if exists (
    select 1
    from public.journal_entries
    where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
  ) then
    raise exception 'RLS FAILURE: User B can read User A entry';
  end if;

  update public.journal_entries
  set content = 'User B changed User A entry'
  where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

  if found then
    raise exception 'RLS FAILURE: User B can update User A entry';
  end if;

  delete from public.journal_entries
  where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

  if found then
    raise exception 'RLS FAILURE: User B can delete User A entry';
  end if;
end
$$;

-- Switch back to User A and prove the row remains visible.
select set_config(
  'request.jwt.claims',
  '{"sub":"USER_A_UUID","role":"authenticated","email":"user-a@example.com"}',
  true
);

do $$
begin
  if not exists (
    select 1
    from public.journal_entries
    where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
      and content = 'RLS verification entry owned by User A'
  ) then
    raise exception 'RLS FAILURE: User A cannot read the unchanged owned entry';
  end if;
end
$$;

rollback;
