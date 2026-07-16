-- Migration: Phase 4 Day 6 (Small Movement Experience)
-- Description: Adds validation for Day 6 structured JSON payload and backfills generic entries.

-- 1. Backfill Day 6 Generic Entries
-- Converts legacy generic text Day 6 entries into the new structured JSON format
update public.journal_entries
set response_data = jsonb_build_object(
  'version', 1,
  'small_action', content,
  'first_moment', ''
)
where program_day = 6 and response_data is null;

-- 2. Add Day 6 Validation
alter table public.journal_entries
  drop constraint if exists journal_entries_day_6_shape;

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

alter table public.journal_entries validate constraint journal_entries_day_6_shape;
