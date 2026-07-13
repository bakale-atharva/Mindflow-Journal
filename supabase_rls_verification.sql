-- MindFlow Journal RLS isolation verification
-- Run only after `supabase_schema.sql` and after creating two allowlisted test
-- Auth users. Replace every placeholder before running. This transaction rolls
-- back all test journal/profile rows when it succeeds.

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

insert into public.profiles (user_id, email)
values ('USER_A_UUID', 'user-a@example.com')
on conflict (user_id) do nothing;

insert into public.journal_entries (id, user_id, content, mood)
values (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'USER_A_UUID',
  'RLS verification entry owned by User A',
  3
);

-- Simulate User B.
select set_config(
  'request.jwt.claims',
  '{"sub":"USER_B_UUID","role":"authenticated","email":"user-b@example.com"}',
  true
);

insert into public.profiles (user_id, email)
values ('USER_B_UUID', 'user-b@example.com')
on conflict (user_id) do nothing;

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

