# Day 5 — Perspective Note Experience

## Summary

Build Day 5 as a private editorial note rather than another analytical map.

Fixed prompt:

> What might you say to a friend carrying the same concern?

The user writes a required note to an imagined friend, then may optionally save one short line they want to keep for themselves. Nothing is shared, sent, or shown to another person.

Day 5 unlocks 96 hours after program start and remains available forever once unlocked.

## Drift Policy & Stop Criteria

**STOP IMMEDIATELY AND REVERT if any of the following occur:**
- You need to introduce a new dependency (e.g. `npm install`).
- You touch more than 3 unexpected files outside of the target scope.
- Unresolvable TypeScript/linting errors arise.
- Existing tests fail and you are tempted to change the tests instead of the implementation.

**Revert Instructions:**
- Use `git reset --hard` and `git clean -fd` to revert to a clean state.
- Document the issue in `docs/drift-incidents/`.

## Task Breakdown

### Task 1: Database Migration & Schema (Size: ~1h)
**Objective:** Add Day 5 structured JSON support to the database and types.
**Style Anchors:**
- [supabase/phase_4_day_3.sql](file:///d:/Coding/JavaScript/Projects/Mindflow%20Journal/mindflow-journal/supabase/phase_4_day_3.sql) (for incremental migration pattern)
- [supabase/supabase_schema.sql](file:///d:/Coding/JavaScript/Projects/Mindflow%20Journal/mindflow-journal/supabase/supabase_schema.sql) (for overall schema)

**Implementation Steps:**
1. Extend `StructuredResponseData` union and create `Day5ResponseData` type in source code.
2. Create `supabase/phase_4_day_5.sql` that:
   - Backfills generic Day 5 entries.
   - Adds JSON validation for Day 5 (`version = 1`, `note_to_friend`, `line_to_keep`).
3. Update `supabase/supabase_schema.sql` with these changes.

**TDD / Validation Checklist:**
- [ ] Run `pnpm typecheck` to ensure union is valid.
- [ ] Ensure migration SQL is additive.

### Task 2: Server Action (Size: ~1.5h)
**Objective:** Create the authenticated save action for Day 5.
**Style Anchors:**
- [src/app/actions.ts:L338](file:///d:/Coding/JavaScript/Projects/Mindflow%20Journal/mindflow-journal/src/app/actions.ts#L338) (`saveDayTwoEntry` template).

**Implementation Steps:**
1. Create `saveDayFiveEntry(previousState, formData)` in `src/app/actions.ts`.
2. Authenticate user, verify beta access, onboarding, and Day 5 unlock time (>= 96 hours).
3. Validate inputs (trim, `note_to_friend` required, `line_to_keep` optional).
4. Construct `Day5ResponseData` and derive combined readable text.
5. Save entry and trigger AI reflection.
6. Revalidate routes.

**TDD / Validation Checklist:**
- [ ] Run `pnpm typecheck`.
- [ ] Verify validation logic passes all edge cases.

### Task 3: Composer UI & Dispatcher (Size: ~1.5h)
**Objective:** Build the Day 5 client interface with the letter-card composition.
**Style Anchors:**
- [src/components/day-2-composer.tsx](file:///d:/Coding/JavaScript/Projects/Mindflow%20Journal/mindflow-journal/src/components/day-2-composer.tsx) (for form state)
- [src/components/day-experience-dispatcher.tsx](file:///d:/Coding/JavaScript/Projects/Mindflow%20Journal/mindflow-journal/src/components/day-experience-dispatcher.tsx) (for routing)

**Implementation Steps:**
1. Create `Day5Composer` component using a warm white main note and an Orchid Mist inset card.
2. Connect to `saveDayFiveEntry` via `useActionState`.
3. Add form validation (10k limit, required note field).
4. Update `DayExperienceDispatcher` to render `Day5Composer` for Day 5.

**TDD / Validation Checklist:**
- [ ] Run `pnpm lint` and `pnpm typecheck`.
- [ ] Visual QA of the letter layout and mobile stacking.

### Task 4: Testing & Verification (Size: ~1h)
**Objective:** Ensure boundaries, unlock timings, and constraints are solid.
**Implementation Steps:**
1. Follow the Test Plan outlined below using the `+mf-test-` disposable account.
2. Confirm unlock behavior (96 hours).
3. Confirm save behaviors (empty vs full optional line).
4. Verify AI privacy and behavior rules.

**TDD / Validation Checklist:**
- [ ] `pnpm test`, `pnpm typecheck`, `pnpm build`.
- [ ] Manual verification as per QA steps.

---

## Experience

### Writing structure

1. **What you would say** — required  
   Helper: “Imagine someone you care about carrying the same concern.”  
   Placeholder: “Write what you would want them to hear…”

2. **A line to keep** — optional  
   Helper: “Is there one sentence you want to remember too?”  
   Placeholder: “Keep one line here, if it feels useful…”

Supporting copy:

> Sometimes a little distance makes the words easier to find.

Rules:

- The main note is required.
- The optional line may remain empty.
- Day 5 is standalone; do not display or reuse entries from Days 1–4.
- There is one optional 1–5 mood check-in.
- There is one optional combined AI reflection.
- Do not call this advice, self-compassion, treatment, or professional guidance.
- Do not imply the optional line is a commitment, affirmation, or task.

### Visual direction

Use a focused letter-card composition:

```text
┌──────────────────────────────────────┐
│ Day 5 · Perspective                  │
│                                      │
│ What you would say                   │
│ ──────────────────────────────────── │
│ [large editorial note canvas]        │
│                                      │
│ A line to keep (optional)            │
│ [small inset note card]              │
│                                      │
│ Mood · count · discard · save        │
└──────────────────────────────────────┘
```

- Main note: warm white or porcelain paper surface with a subtle ink rule.
- Optional line: smaller Orchid Mist inset card.
- Use a small folded-corner or paper-edge detail as the single visual signature.
- Do not use envelope, send, message, share, recipient, or contact metaphors that suggest the note leaves the app.
- Preserve the thought contour, existing typography, focus states, animation restraint, and responsive layout.
- On mobile, stack the note first and optional line second.

Copy:

- Eyebrow: `Day 5 · Perspective`
- Save: `Save Day 5`
- Edit: `Save changes`
- Saved badge: `Day 5 saved`
- Required error: `Write what you would say before saving Day 5.`
- Length error: `Keep your Day 5 entry under 10,000 characters.`
- Discard confirmation: `Discard the changes in this Day 5 exercise?`

## Data and Server Changes

### Structured response shape

Extend the shared response union:

```ts
type Day5ResponseData = {
  version: 1
  note_to_friend: string
  line_to_keep: string
}

type StructuredResponseData =
  | Day2ResponseData
  | Day3ResponseData
  | Day4ResponseData
  | Day5ResponseData
  | null
```

Persist:

```json
{
  "version": 1,
  "note_to_friend": "Required user-authored note",
  "line_to_keep": "Optional user-authored line"
}
```

### Combined readable content

Generate server-side only.

Both fields present:

```text
What I would say:
[user note]

A line to keep:
[user line]
```

Only the required note present:

```text
What I would say:
[user note]
```

Rules:

- Never store placeholder text.
- Normalize line endings.
- Preserve internal user line breaks.
- Limit final serialized content to 10,000 characters.
- Use combined content for history, safety screening, and one Groq reflection.
- Editing loads from `response_data`, never from parsing combined content.

### Migration

Create one additive Day 5 migration through the project’s migration workflow.

It must:

1. Backfill existing generic Day 5 entries:

   ```json
   {
     "version": 1,
     "note_to_friend": "<existing content>",
     "line_to_keep": ""
   }
   ```

2. Enforce Day 5 shape:
   - `response_data` must exist.
   - `version` must equal `1`.
   - `note_to_friend` must be a nonempty trimmed string.
   - `line_to_keep` must be a string and may be empty.
   - No extra JSON keys are permitted.

3. Preserve all prior-day structured data, RLS policies, prompt constraints, unique day-entry constraints, and reflection deletion cascades.

4. Update the full `supabase_schema.sql` and verification SQL.

Give the owner the new incremental migration and updated full schema. Only the incremental migration should be applied to the existing database.

### Save action

Add:

```ts
saveDayFiveEntry(previousState, formData)
```

It accepts:

```text
note_to_friend
line_to_keep
mood
```

Server behavior:

1. Authenticate the user and verify beta access.
2. Verify onboarding and program start.
3. Enforce Day 5’s 96-hour server-time unlock.
4. Require `note_to_friend`.
5. Permit empty `line_to_keep`.
6. Validate mood as absent or integer 1–5.
7. Build `Day5ResponseData`.
8. Serialize combined content on the server.
9. Enforce the 10,000-character limit.
10. Always set:
    - `program_day = 5`
    - `prompt_id = day-5-perspective`
11. Insert or update the sole Day 5 entry.
12. Record `entry_saved` with `{ program_day: 5 }`.
13. Start optional safety/reflection only after save succeeds.
14. Revalidate Today, Journal, and entry detail.

Update `DayExperienceDispatcher`:

- Day 1 → `Day1Composer`
- Day 2 → `Day2Composer`
- Day 3 → `Day3Composer`
- Day 4 → `Day4Composer`
- Day 5 → `Day5Composer`
- Days 6–7 → existing generic composer until their dedicated experiences are built

Use the same dispatcher on entry-detail pages.

## AI, Privacy, and Error Behavior

- No AI consent: save the Day 5 entry and show journal-only state.
- AI consent: safety-screen the combined Day 5 content, then generate one reflection.
- Immediate-danger content in either field skips reflection generation and shows the existing approved notice.
- Day 5’s AI response must reflect only the saved Day 5 content.
- It must not claim the user should follow their own note.
- It must not frame the note as professional, therapeutic, or prescriptive advice.
- Mood-only edits preserve the current reflection.
- Text edits create a new reflection revision.
- Reflection failures preserve the saved note and optional line.
- Never log note text, the optional line, reflection text, or raw JSON.

## Tests

### Progression

- Day 5 is locked one millisecond before 96 hours.
- Day 5 unlocks exactly at 96 hours.
- Day 5 does not require completion of Days 1–4.
- Day 5 remains available after Days 6 and 7 unlock.
- Direct Day 5 saves before 96 hours fail.
- The existing disposable six-days-ago test account can save Day 5 through normal UI and RLS rules.

### Validation and persistence

- Required note only saves.
- Required note plus optional line saves.
- Empty note fails.
- Whitespace-only note fails.
- Empty optional line succeeds.
- Multiline note persists.
- Valid and invalid moods behave correctly.
- Exact 10,000-character serialized content succeeds.
- Over-limit content fails.
- Invalid JSON version, missing fields, extra fields, and non-string values fail.
- Legacy Day 5 rows backfill safely.
- Initial save creates one row; later saves update the same row.
- Concurrent saves cannot create duplicate Day 5 rows.
- Delete removes the reflection and returns Day 5 to available when unlocked.

### AI and privacy

- No consent produces zero Groq calls.
- Safe content produces one combined reflection.
- Immediate-danger content in either field triggers safety redirect.
- Failed reflection preserves both fields.
- Retry uses current structured Day 5 content.
- Day 1–4 content is never included.
- User A cannot read, edit, or delete User B’s Day 5 entry or reflection.
- Product events contain only `{ program_day: 5 }`.

### Manual QA

Verify at 390px, 768px, 1024px, and 1440px:

- Main note remains the visual focus.
- The optional line is clearly optional.
- The folded-paper detail does not interfere with text or focus.
- No control suggests sharing or sending.
- Long content keeps the layout stable.
- Keyboard focus, labels, alerts, and touch targets are accessible.
- Saved, pending, failure, retry, journal-only, complete-reflection, and safety states remain clear.

Run:

```text
pnpm test
pnpm typecheck
pnpm build
```

## Completion

Update project docs and ledgers only after migration, tests, build, and manual verification pass.

- Day 5 becomes `DONE`.
- Phase 2 remains `IN PROGRESS`.
- Day 6 becomes the next experience.
- The existing disposable test-account fixture remains the only approved all-days development setup.

Suggested commit:

```text
feat(program): add structured Day 5 perspective experience
```

Assumptions locked:

- Day 5 is private and standalone.
- The note is required.
- The line to keep is optional.
- Nothing is shared, sent, or delivered.
- One optional mood and one optional combined reflection remain.
- No advice, task list, score, diagnosis, or reminder is added.
