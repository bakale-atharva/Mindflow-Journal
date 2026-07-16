-- Migration: Phase 4 Day 5 (Perspective Note Experience)
-- Description: Adds validation for Day 5 structured JSON payload and backfills generic entries.

-- 1. Backfill Day 5 Generic Entries
-- Converts legacy generic text Day 5 entries into the new structured JSON format
update public.journal_entries
set response_data = jsonb_build_object(
  'version', 1,
  'note_to_friend', content,
  'line_to_keep', ''
)
where program_day = 5 and response_data is null;

-- 2. Add Day 5 Validation
alter table public.journal_entries
  drop constraint if exists journal_entries_day_5_shape;

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

alter table public.journal_entries validate constraint journal_entries_day_5_shape;
