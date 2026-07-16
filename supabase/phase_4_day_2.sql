-- Day 2: Structured Urgency Experience
-- Additive migration for Supabase Postgres

begin;

-- 1. Add nullable `response_data jsonb`
alter table public.journal_entries
add column if not exists response_data jsonb;

-- 2. General JSON-object constraint when present
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.journal_entries'::regclass
      and conname = 'journal_entries_response_data_object'
  ) then
    alter table public.journal_entries
      add constraint journal_entries_response_data_object
      check (response_data is null or jsonb_typeof(response_data) = 'object') not valid;
  end if;
end
$$;

-- 3. Backfill existing Day 2 test entries
update public.journal_entries
set response_data = jsonb_build_object(
  'version', 1,
  'urgent', coalesce(content, ''),
  'can_wait', ''
)
where program_day = 2 and response_data is null;

-- 4. Day 2-specific shape validation
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.journal_entries'::regclass
      and conname = 'journal_entries_day_2_shape'
  ) then
    alter table public.journal_entries
      add constraint journal_entries_day_2_shape
      check (
        program_day <> 2 or response_data is null or (
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
end
$$;

commit;
