-- Migration: Phase 4 Day 3 (Structured Control-Boundary Experience)
-- Description: Adds validation for Day 3 structured JSON payload and backfills generic entries.

-- 1. Tighten Day 2 Validation
-- We drop and recreate the day 2 constraint so that it strictly requires response_data
-- for all Day 2 entries, not allowing null to bypass the shape check.
alter table public.journal_entries
  drop constraint if exists journal_entries_day_2_shape;

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

alter table public.journal_entries validate constraint journal_entries_day_2_shape;

-- 2. Backfill Day 3 Generic Entries
-- Converts legacy generic text Day 3 entries into the new structured JSON format
update public.journal_entries
set response_data = jsonb_build_object(
  'version', 1,
  'within_control', content,
  'outside_control', ''
)
where program_day = 3 and response_data is null;

-- 3. Add Day 3 Validation
alter table public.journal_entries
  drop constraint if exists journal_entries_day_3_shape;

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

alter table public.journal_entries validate constraint journal_entries_day_3_shape;
