-- Migration: Phase 4 Day 4 (Structured Recurrence Loop Experience)
-- Description: Adds validation for Day 4 structured JSON payload and backfills generic entries.

-- 1. Backfill Day 4 Generic Entries
-- Converts legacy generic text Day 4 entries into the new structured JSON format
update public.journal_entries
set response_data = jsonb_build_object(
  'version', 1,
  'recurring_thought', content,
  'usual_moment', ''
)
where program_day = 4 and response_data is null;

-- 2. Add Day 4 Validation
alter table public.journal_entries
  drop constraint if exists journal_entries_day_4_shape;

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

alter table public.journal_entries validate constraint journal_entries_day_4_shape;
