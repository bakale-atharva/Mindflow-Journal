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
  mood smallint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint journal_entries_program_day_check
    check (program_day is null or program_day between 1 and 7),
  constraint journal_entries_mood_check
    check (mood is null or mood between 1 and 5),
  constraint journal_entries_content_check
    check (char_length(btrim(content)) between 1 and 10000)
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
  entry_id uuid primary key references public.journal_entries(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reflection text,
  question text,
  status text not null default 'pending'
    check (status in ('pending', 'complete', 'failed', 'safety_redirect')),
  model text,
  attempt_count smallint not null default 0 check (attempt_count between 0 and 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_reflections_user_id_idx
  on public.ai_reflections (user_id);

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
with check ((select auth.uid()) = user_id and public.has_active_beta_access());

create policy "journal_entries_update_own"
on public.journal_entries for update to authenticated
using ((select auth.uid()) = user_id and public.has_active_beta_access())
with check ((select auth.uid()) = user_id and public.has_active_beta_access());

create policy "journal_entries_delete_own"
on public.journal_entries for delete to authenticated
using ((select auth.uid()) = user_id and public.has_active_beta_access());

create policy "ai_reflections_select_own"
on public.ai_reflections for select to authenticated
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
