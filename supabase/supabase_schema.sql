-- MindFlow Journal founding-beta database
-- Canonical, migration-aware SQL for Supabase Postgres.
-- Run this entire file in the Supabase SQL editor.
-- It does not delete legacy prototype journal rows. Legacy rows remain inaccessible
-- after RLS is enabled and should be reviewed before validating the NOT VALID FK.

begin;

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Access and user profile
-- -----------------------------------------------------------------------------

create table if not exists public.beta_access (
  email text primary key,
  status text not null default 'active'
    check (status in ('active', 'revoked', 'refunded')),
  razorpay_payment_reference text,
  granted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint beta_access_email_normalized check (email = lower(btrim(email)))
);

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  onboarding_completed_at timestamptz,
  program_started_at timestamptz,
  is_18_or_older boolean not null default false,
  ai_processing_consent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_normalized check (email = lower(btrim(email)))
);

-- -----------------------------------------------------------------------------
-- Journal entries (upgrades the existing prototype table in place)
-- -----------------------------------------------------------------------------

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  program_day smallint,
  prompt_id text,
  content text not null,
  response_data jsonb,
  mood smallint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint journal_entries_program_day_check
    check (program_day is null or program_day between 1 and 7),
  constraint journal_entries_mood_check
    check (mood is null or mood between 1 and 5),
  constraint journal_entries_content_check
    check (char_length(btrim(content)) between 1 and 10000),
  constraint journal_entries_response_data_object
    check (response_data is null or jsonb_typeof(response_data) = 'object'),
  constraint journal_entries_day_2_shape
    check (
      program_day <> 2 or (
        response_data is not null and
        (response_data->>'version') = '1' and
        jsonb_typeof(response_data->'urgent') = 'string' and
        jsonb_typeof(response_data->'can_wait') = 'string' and
        (
          char_length(btrim(response_data->>'urgent')) > 0 or
          char_length(btrim(response_data->>'can_wait')) > 0
        )
      )
    ),
  constraint journal_entries_day_3_shape
    check (
      program_day <> 3 or (
        response_data is not null and
        (response_data->>'version') = '1' and
        jsonb_typeof(response_data->'within_control') = 'string' and
        jsonb_typeof(response_data->'outside_control') = 'string' and
        (
          char_length(btrim(response_data->>'within_control')) > 0 or
          char_length(btrim(response_data->>'outside_control')) > 0
        )
      )
    ),
  constraint journal_entries_day_4_shape
    check (
      program_day <> 4 or (
        response_data is not null and
        (response_data->>'version') = '1' and
        jsonb_typeof(response_data->'recurring_thought') = 'string' and
        jsonb_typeof(response_data->'usual_moment') = 'string' and
        char_length(btrim(response_data->>'recurring_thought')) > 0
      )
    ),
  constraint journal_entries_day_5_shape
    check (
      program_day <> 5 or (
        response_data is not null and
        (response_data->>'version') = '1' and
        jsonb_typeof(response_data->'note_to_friend') = 'string' and
        jsonb_typeof(response_data->'line_to_keep') = 'string' and
        char_length(btrim(response_data->>'note_to_friend')) > 0
      )
    ),
  constraint journal_entries_day_6_shape
    check (
      program_day <> 6 or (
        response_data is not null and
        (response_data->>'version') = '1' and
        jsonb_typeof(response_data->'small_action') = 'string' and
        jsonb_typeof(response_data->'first_moment') = 'string' and
        char_length(btrim(response_data->>'small_action')) > 0
      )
    ),
  constraint journal_entries_day_7_shape
    check (
      program_day <> 7 or (
        response_data is not null and
        (response_data->>'version') = '1' and
        jsonb_typeof(response_data->'became_clearer') = 'string' and
        jsonb_typeof(response_data->'carry_forward') = 'string' and
        char_length(btrim(response_data->>'became_clearer')) > 0
      )
    )
);

alter table public.journal_entries
  add column if not exists program_day smallint,
  add column if not exists prompt_id text,
  add column if not exists updated_at timestamptz not null default now();

-- Convert the prototype emoji/text mood column without discarding its source.
do $$
declare
  current_mood_type text;
begin
  select data_type
    into current_mood_type
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'journal_entries'
    and column_name = 'mood';

  if current_mood_type is not null and current_mood_type <> 'smallint' then
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'journal_entries'
        and column_name = 'mood_legacy'
    ) then
      alter table public.journal_entries rename column mood to mood_legacy;
    else
      alter table public.journal_entries drop column mood;
    end if;

    alter table public.journal_entries add column mood smallint;

    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'journal_entries'
        and column_name = 'mood_legacy'
    ) then
      update public.journal_entries
      set mood = case mood_legacy
        when '😔' then 1
        when '😰' then 1
        when 'Sad' then 1
        when 'Anxious' then 1
        when '😌' then 3
        when 'Neutral' then 3
        when '😊' then 4
        when 'Happy' then 4
        when '🧘' then 4
        when 'Calm' then 4
        when '🤩' then 5
        when '✨' then 5
        when 'Energetic' then 5
        when 'Inspired' then 5
        else null
      end;
    end if;
  elsif current_mood_type is null then
    alter table public.journal_entries add column mood smallint;
  end if;
end
$$;

alter table public.journal_entries alter column user_id drop default;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.journal_entries'::regclass
      and conname = 'journal_entries_user_id_auth_fkey'
  ) then
    alter table public.journal_entries
      add constraint journal_entries_user_id_auth_fkey
      foreign key (user_id) references auth.users(id) on delete cascade not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.journal_entries'::regclass
      and conname = 'journal_entries_program_day_check'
  ) then
    alter table public.journal_entries
      add constraint journal_entries_program_day_check
      check (program_day is null or program_day between 1 and 7) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.journal_entries'::regclass
      and conname = 'journal_entries_mood_check'
  ) then
    alter table public.journal_entries
      add constraint journal_entries_mood_check
      check (mood is null or mood between 1 and 5) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.journal_entries'::regclass
      and conname = 'journal_entries_content_check'
  ) then
    alter table public.journal_entries
      add constraint journal_entries_content_check
      check (char_length(btrim(content)) between 1 and 10000) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.journal_entries'::regclass
      and conname = 'journal_entries_response_data_object'
  ) then
    alter table public.journal_entries
      add constraint journal_entries_response_data_object
      check (response_data is null or jsonb_typeof(response_data) = 'object') not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.journal_entries'::regclass
      and conname = 'journal_entries_day_2_shape'
  ) then
    alter table public.journal_entries
      add constraint journal_entries_day_2_shape
      check (
        program_day <> 2 or (
          response_data is not null and
          (response_data->>'version') = '1' and
          jsonb_typeof(response_data->'urgent') = 'string' and
          jsonb_typeof(response_data->'can_wait') = 'string' and
          (
            char_length(btrim(response_data->>'urgent')) > 0 or
            char_length(btrim(response_data->>'can_wait')) > 0
          )
        )
      ) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.journal_entries'::regclass
      and conname = 'journal_entries_day_3_shape'
  ) then
    alter table public.journal_entries
      add constraint journal_entries_day_3_shape
      check (
        program_day <> 3 or (
          response_data is not null and
          (response_data->>'version') = '1' and
          jsonb_typeof(response_data->'within_control') = 'string' and
          jsonb_typeof(response_data->'outside_control') = 'string' and
          (
            char_length(btrim(response_data->>'within_control')) > 0 or
            char_length(btrim(response_data->>'outside_control')) > 0
          )
        )
      ) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.journal_entries'::regclass
      and conname = 'journal_entries_day_4_shape'
  ) then
    alter table public.journal_entries
      add constraint journal_entries_day_4_shape
      check (
        program_day <> 4 or (
          response_data is not null and
          (response_data->>'version') = '1' and
          jsonb_typeof(response_data->'recurring_thought') = 'string' and
          jsonb_typeof(response_data->'usual_moment') = 'string' and
          char_length(btrim(response_data->>'recurring_thought')) > 0
        )
      ) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.journal_entries'::regclass
      and conname = 'journal_entries_day_5_shape'
  ) then
    alter table public.journal_entries
      add constraint journal_entries_day_5_shape
      check (
        program_day <> 5 or (
          response_data is not null and
          (response_data->>'version') = '1' and
          jsonb_typeof(response_data->'note_to_friend') = 'string' and
          jsonb_typeof(response_data->'line_to_keep') = 'string' and
          char_length(btrim(response_data->>'note_to_friend')) > 0
        )
      ) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.journal_entries'::regclass
      and conname = 'journal_entries_day_6_shape'
  ) then
    alter table public.journal_entries
      add constraint journal_entries_day_6_shape
      check (
        program_day <> 6 or (
          response_data is not null and
          (response_data->>'version') = '1' and
          jsonb_typeof(response_data->'small_action') = 'string' and
          jsonb_typeof(response_data->'first_moment') = 'string' and
          char_length(btrim(response_data->>'small_action')) > 0
        )
      ) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.journal_entries'::regclass
      and conname = 'journal_entries_day_7_shape'
  ) then
    alter table public.journal_entries
      add constraint journal_entries_day_7_shape
      check (
        program_day <> 7 or (
          response_data is not null and
          (response_data->>'version') = '1' and
          jsonb_typeof(response_data->'became_clearer') = 'string' and
          jsonb_typeof(response_data->'carry_forward') = 'string' and
          char_length(btrim(response_data->>'became_clearer')) > 0
        )
      ) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.journal_entries'::regclass
      and conname = 'journal_entries_prompt_identity_check'
  ) then
    alter table public.journal_entries
      add constraint journal_entries_prompt_identity_check
      check (
        (program_day is null and prompt_id is null)
        or (program_day = 1 and prompt_id = 'day-1-mental-load')
        or (program_day = 2 and prompt_id = 'day-2-urgency')
        or (program_day = 3 and prompt_id = 'day-3-control')
        or (program_day = 4 and prompt_id = 'day-4-recurrence')
        or (program_day = 5 and prompt_id = 'day-5-perspective')
        or (program_day = 6 and prompt_id = 'day-6-movement')
        or (program_day = 7 and prompt_id = 'day-7-review')
      ) not valid;
  end if;
end
$$;

create unique index if not exists journal_entries_user_program_day_key
  on public.journal_entries (user_id, program_day)
  where program_day is not null;

create index if not exists journal_entries_user_created_at_idx
  on public.journal_entries (user_id, created_at desc);

-- -----------------------------------------------------------------------------
-- Reflection and measurement tables (created now; used in later phases)
-- -----------------------------------------------------------------------------

create table if not exists public.ai_reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  entry_id uuid not null references public.journal_entries(id) on delete cascade,
  status text not null,
  provider text,
  model text,
  safety_flags jsonb,
  reflection text,
  question text,
  attempt_count smallint not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint ai_reflections_status_check check (status in ('pending', 'complete', 'failed', 'safety_redirect'))
);

create unique index if not exists ai_reflections_entry_id_idx on public.ai_reflections(entry_id);

create table if not exists public.ai_program_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  source_hash text not null,
  status text not null,
  provider text,
  model text,
  safety_flags jsonb,
  reflection text,
  practice text,
  practice_kept_at timestamp with time zone,
  attempt_count smallint not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint ai_program_reviews_status_check check (status in ('pending', 'complete', 'failed', 'safety_redirect'))
);

create unique index if not exists ai_program_reviews_user_id_idx on public.ai_program_reviews(user_id);


create table if not exists public.product_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  event_name text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint product_events_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create index if not exists product_events_user_created_at_idx
  on public.product_events (user_id, created_at desc);

-- -----------------------------------------------------------------------------
-- Shared trigger helpers
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists journal_entries_set_updated_at on public.journal_entries;
create trigger journal_entries_set_updated_at
before update on public.journal_entries
for each row execute function public.set_updated_at();

drop trigger if exists ai_reflections_set_updated_at on public.ai_reflections;
create trigger ai_reflections_set_updated_at
before update on public.ai_reflections
for each row execute function public.set_updated_at();

drop trigger if exists ai_program_reviews_set_updated_at on public.ai_program_reviews;
create trigger ai_program_reviews_set_updated_at
before update on public.ai_program_reviews
for each row execute function public.set_updated_at();

create or replace function public.protect_program_start()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if old.program_started_at is not null
    and new.program_started_at is distinct from old.program_started_at then
    raise exception 'program_started_at is immutable after the program begins';
  end if;

  if new.program_started_at is not null
    and (new.onboarding_completed_at is null or new.is_18_or_older is not true) then
    raise exception 'program start requires completed 18+ onboarding';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_protect_program_start on public.profiles;
create trigger profiles_protect_program_start
before update on public.profiles
for each row execute function public.protect_program_start();

create or replace function public.protect_program_entry_identity()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if old.program_day is not null and (
    new.program_day is distinct from old.program_day
    or new.prompt_id is distinct from old.prompt_id
  ) then
    raise exception 'program day and prompt cannot be changed after entry creation';
  end if;

  return new;
end;
$$;

drop trigger if exists journal_entries_protect_program_identity on public.journal_entries;
create trigger journal_entries_protect_program_identity
before update on public.journal_entries
for each row execute function public.protect_program_entry_identity();

-- -----------------------------------------------------------------------------
-- Narrow access-check functions. beta_access itself is never browser-readable.
-- -----------------------------------------------------------------------------

create or replace function public.is_beta_email_allowed(candidate_email text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.beta_access
    where email = lower(btrim(candidate_email))
      and status = 'active'
  );
$$;

create or replace function public.has_active_beta_access()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from auth.users as users
    join public.beta_access as access
      on access.email = lower(btrim(users.email))
    where users.id = (select auth.uid())
      and access.status = 'active'
  );
$$;

revoke all on function public.is_beta_email_allowed(text) from public;
revoke all on function public.has_active_beta_access() from public;
grant execute on function public.is_beta_email_allowed(text) to anon, authenticated;
grant execute on function public.has_active_beta_access() to authenticated;

create or replace function public.can_write_program_day(
  candidate_user_id uuid,
  candidate_day smallint
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    candidate_user_id = (select auth.uid())
    and candidate_day between 1 and 7
    and exists (
      select 1
      from public.profiles as profile
      where profile.user_id = candidate_user_id
        and profile.onboarding_completed_at is not null
        and profile.program_started_at is not null
        and profile.is_18_or_older is true
        and candidate_day <= least(
          7,
          floor(
            greatest(0, extract(epoch from (now() - profile.program_started_at))) / 86400
          )::integer + 1
        )
    );
$$;

revoke all on function public.can_write_program_day(uuid, smallint) from public;
grant execute on function public.can_write_program_day(uuid, smallint) to authenticated;

-- -----------------------------------------------------------------------------
-- Least-privilege grants and row-level security
-- -----------------------------------------------------------------------------

alter table public.beta_access enable row level security;
alter table public.profiles enable row level security;
alter table public.journal_entries enable row level security;
alter table public.ai_reflections enable row level security;
alter table public.product_events enable row level security;

revoke all on table public.beta_access from anon, authenticated;
revoke all on table public.profiles from anon, authenticated;
revoke all on table public.journal_entries from anon, authenticated;
revoke all on table public.ai_reflections from anon, authenticated;
revoke all on table public.product_events from anon, authenticated;

grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.journal_entries to authenticated;
grant select on table public.ai_reflections to authenticated;

-- Remove every pre-beta policy, including the unsafe "Allow all operations" policy.
do $$
declare
  policy_record record;
begin
  for policy_record in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('beta_access', 'profiles', 'journal_entries', 'ai_reflections', 'product_events')
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  end loop;
end
$$;

create policy "profiles_select_own"
on public.profiles for select to authenticated
using ((select auth.uid()) = user_id and public.has_active_beta_access());

create policy "profiles_insert_own"
on public.profiles for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and email = lower(btrim(coalesce((select auth.jwt()->>'email'), '')))
  and public.has_active_beta_access()
);

create policy "profiles_update_own"
on public.profiles for update to authenticated
using ((select auth.uid()) = user_id and public.has_active_beta_access())
with check (
  (select auth.uid()) = user_id
  and email = lower(btrim(coalesce((select auth.jwt()->>'email'), '')))
  and public.has_active_beta_access()
);

create policy "profiles_delete_own"
on public.profiles for delete to authenticated
using ((select auth.uid()) = user_id and public.has_active_beta_access());

create policy "journal_entries_select_own"
on public.journal_entries for select to authenticated
using ((select auth.uid()) = user_id and public.has_active_beta_access());

create policy "journal_entries_insert_own"
on public.journal_entries for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and public.has_active_beta_access()
  and public.can_write_program_day(user_id, program_day)
);

create policy "journal_entries_update_own"
on public.journal_entries for update to authenticated
using ((select auth.uid()) = user_id and public.has_active_beta_access())
with check (
  (select auth.uid()) = user_id
  and public.has_active_beta_access()
  and public.can_write_program_day(user_id, program_day)
);

create policy "journal_entries_delete_own"
on public.journal_entries for delete to authenticated
using ((select auth.uid()) = user_id and public.has_active_beta_access());

create policy "ai_reflections_select_own"
on public.ai_reflections for select to authenticated
using ((select auth.uid()) = user_id and public.has_active_beta_access());

alter table public.ai_program_reviews enable row level security;

create policy "ai_program_reviews_select_own"
on public.ai_program_reviews for select to authenticated
using ((select auth.uid()) = user_id and public.has_active_beta_access());

-- Reflection writes and product-event writes remain server-only in later phases.
-- No browser-role write grants or policies are created for these tables.

commit;

-- Manual founding-user access example (run separately after a captured payment):
-- insert into public.beta_access (email, status, razorpay_payment_reference)
-- values ('customer@example.com', 'active', 'pay_example')
-- on conflict (email) do update
-- set status = 'active',
--     razorpay_payment_reference = excluded.razorpay_payment_reference,
--     granted_at = now();
