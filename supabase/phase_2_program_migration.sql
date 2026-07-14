-- MindFlow Journal Phase 2 program invariants
-- Run after supabase_schema.sql in the connected Supabase SQL editor.

begin;

do $$
begin
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

drop policy if exists "journal_entries_insert_own" on public.journal_entries;
create policy "journal_entries_insert_own"
on public.journal_entries for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and public.has_active_beta_access()
  and public.can_write_program_day(user_id, program_day)
);

drop policy if exists "journal_entries_update_own" on public.journal_entries;
create policy "journal_entries_update_own"
on public.journal_entries for update to authenticated
using ((select auth.uid()) = user_id and public.has_active_beta_access())
with check (
  (select auth.uid()) = user_id
  and public.has_active_beta_access()
  and public.can_write_program_day(user_id, program_day)
);

commit;
