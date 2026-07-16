-- Migration: Phase 4 Day 7 (Closing Review Experience)
-- Description: Adds validation for Day 7 structured JSON payload and backfills generic entries.

-- 1. Backfill Day 7 Generic Entries
-- Converts legacy generic text Day 7 entries into the new structured JSON format
update public.journal_entries
set response_data = jsonb_build_object(
  'version', 1,
  'became_clearer', content,
  'carry_forward', ''
)
where program_day = 7 and response_data is null;

-- 2. Add Day 7 Validation
alter table public.journal_entries
  drop constraint if exists journal_entries_day_7_shape;

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

alter table public.journal_entries validate constraint journal_entries_day_7_shape;
