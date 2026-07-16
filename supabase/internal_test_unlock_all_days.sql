-- Internal testing fixture to safely unlock all 7 days for a disposable test account.
-- DO NOT RUN ON A PRODUCTION ACCOUNT.

do $$
declare
  -- !!! OPERATOR: REPLACE THIS EMAIL BEFORE RUNNING !!!
  target_email text := 'founder+mf-test-example@mindflow.test';
  
  v_user_id uuid;
  v_program_started_at timestamptz;
begin
  -- 1. Must be a test email
  if target_email not like '%+mf-test-%' then
    raise exception 'Target email % does not appear to be a test email (+mf-test-). Aborting.', target_email;
  end if;

  -- 2. Auth user must exist
  select id into v_user_id
  from auth.users
  where email = target_email;

  if not found then
    raise exception 'Auth user not found for email %', target_email;
  end if;

  -- 3. Profile must exist and must NOT have started the program
  select program_started_at into v_program_started_at
  from public.profiles
  where user_id = v_user_id;

  if not found then
    raise exception 'Profile not found for user %', v_user_id;
  end if;

  if v_program_started_at is not null then
    raise exception 'Program already started at %. Aborting to prevent destructive changes.', v_program_started_at;
  end if;

  -- 4. Apply the internal unlock fixture
  update public.profiles
  set 
    is_18_or_older = true,
    onboarding_completed_at = now(),
    program_started_at = now() - interval '6 days'
  where user_id = v_user_id;

  raise notice 'SUCCESS: Unlocked all 7 days for %', target_email;
end $$;
