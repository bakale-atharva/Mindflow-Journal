# Day 3 — Control Boundary Experience

## Goal

Build Day 3 as a distinct, structured chapter of the Seven-Day Emotional Reset.

Prompt:

> Which parts of this situation are within your control?

Day 3 helps users distinguish their own choices from factors that belong to others, timing, or circumstances. It must not tell them what to do, rank their concerns, or make therapeutic claims.

Before Day 3, fix dashboard loading so existing structured Day 2 data actually reloads as two separate fields.

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
**Objective:** Add Day 3 structured JSON support to the database and types.
**Style Anchors:**
- [supabase/phase_4_day_2.sql](file:///d:/Coding/JavaScript/Projects/Mindflow%20Journal/mindflow-journal/supabase/phase_4_day_2.sql) (for incremental migration pattern)
- [supabase/supabase_schema.sql](file:///d:/Coding/JavaScript/Projects/Mindflow%20Journal/mindflow-journal/supabase/supabase_schema.sql) (for overall schema)

**Implementation Steps:**
1. Update `Day2ResponseData` and create `Day3ResponseData` type as a discriminated union in source code.
2. Create `supabase/phase_4_day_3.sql` that:
   - Backfills generic Day 3 entries.
   - Adds JSON validation for Day 3 (`version = 1`, `within_control`, `outside_control`).
   - Tightens Day 2 validation.
3. Update `supabase/supabase_schema.sql` with these changes.

**TDD / Validation Checklist:**
- [ ] Run `pnpm typecheck` to ensure `StructuredResponseData` union is valid.
- [ ] Ensure `supabase/phase_4_day_3.sql` is additive.

### Task 2: Server Action (Size: ~1.5h)
**Objective:** Create the authenticated save action for Day 3.
**Style Anchors:**
- [src/app/actions.ts:L338](file:///d:/Coding/JavaScript/Projects/Mindflow%20Journal/mindflow-journal/src/app/actions.ts#L338) (`saveDayTwoEntry` - use as template for authentication, validation, and AI trigger).

**Implementation Steps:**
1. Create `saveDayThreeEntry(previousState, formData)` in `src/app/actions.ts`.
2. Authenticate user, verify beta access, verify onboarding/program start, and check Day 3 unlock time (>= 48 hours).
3. Validate inputs (trim, non-empty, mood 1-5).
4. Construct `Day3ResponseData` and derive readable text.
5. Save entry and trigger AI reflection.
6. Revalidate relevant paths.

**TDD / Validation Checklist:**
- [ ] Run `pnpm typecheck`.
- [ ] Write/run a test or test script verifying validation logic if applicable.

### Task 3: Composer UI & Dispatcher (Size: ~1.5h)
**Objective:** Build the Day 3 client interface.
**Style Anchors:**
- [src/components/day-2-composer.tsx](file:///d:/Coding/JavaScript/Projects/Mindflow%20Journal/mindflow-journal/src/components/day-2-composer.tsx) (for form state and input styling)
- [src/components/day-experience-dispatcher.tsx](file:///d:/Coding/JavaScript/Projects/Mindflow%20Journal/mindflow-journal/src/components/day-experience-dispatcher.tsx) (for routing)

**Implementation Steps:**
1. Create `Day3Composer` component with two writing sections (Seafoam tint for "Within", Orchid tint for "Outside").
2. Connect to `saveDayThreeEntry` using `useActionState`.
3. Add form validation (length under 10k, at least one section filled).
4. Update `DayExperienceDispatcher` to render `Day3Composer` for Day 3.

**TDD / Validation Checklist:**
- [ ] Run `pnpm lint` and `pnpm typecheck`.
- [ ] Visually verify responsive layout (stacked on mobile, side-by-side on desktop).

### Task 4: Internal Testing Fixture (Size: ~30m)
**Objective:** Create a SQL script to unlock all days for development.
**Style Anchors:**
- General `supabase/` SQL files.

**Implementation Steps:**
1. Create `supabase/internal_test_unlock_all_days.sql`.
2. Allow `+mf-test-` emails to have `program_started_at = now() - interval '6 days'`.
3. Ensure RLS and existing data are respected.

**TDD / Validation Checklist:**
- [ ] Test the fixture against a clean dev db instance.

---

## Experience

### Day 3 exercise

Show two writing sections:

| Section | Helper text | Placeholder |
|---|---|---|
| Within your control | What can you choose, say, do, or leave alone? | Write the part that is yours to decide or act on… |
| Outside your control | What belongs to other people, timing, or circumstances? | Write what you cannot decide for yourself right now… |

Rules:

- The user may fill either section or both.
- At least one section must contain non-whitespace text.
- Day 3 is standalone: do not show, copy, summarize, or prefill Day 1 or Day 2.
- Mood remains one optional overall 1–5 selection.
- One saved Day 3 entry produces one optional combined Groq reflection.
- Do not add scores, checklists, urgency rankings, reminders, deadlines, or advice.

Use the existing Today screen and seven-day path. The Day 3 composer sits beneath the existing Day 3 prompt panel.

### Layout and copy

- Eyebrow: `Day 3 · Control`
- Supporting copy: `You do not need to carry every part of a situation alone. Notice what is yours to choose and what is not.`
- Primary action: `Save Day 3`
- Edit action: `Save changes`
- Saved badge: `Day 3 saved`
- Empty error: `Write in at least one section before saving Day 3.`
- Length error: `Keep your Day 3 entry under 10,000 characters.`

Desktop uses two equal writing cards:

- Seafoam-tinted card: Within your control.
- Orchid-mist-tinted card: Outside your control.

Mobile stacks them in that order. Do not use red/green or “right/wrong” styling. Keep the existing thought contour, shared mood control, reflection panel, spacing, typography, focus states, and reduced-motion behavior.

## Data and Server Changes

### Shared structured response support

Replace the current Day 2-only response type with a discriminated union:

```ts
type Day2ResponseData = {
  version: 1
  urgent: string
  can_wait: string
}

type Day3ResponseData = {
  version: 1
  within_control: string
  outside_control: string
}

type StructuredResponseData =
  | Day2ResponseData
  | Day3ResponseData
  | null
```

Update `JournalEntry.response_data` to use the shared union.

In dashboard loading:

- Select `response_data` from Supabase.
- Validate it at runtime against the entry’s `program_day`.
- Do not cast raw JSON directly to a TypeScript type.
- For malformed structured data, preserve access to the entry by using the existing readable `content` as a legacy fallback.
- Never log entry text or raw JSON; log only entry ID and a safe internal error code.

### Day 3 persisted shape

Store Day 3 in `journal_entries.response_data` as:

```json
{
  "version": 1,
  "within_control": "User-authored text",
  "outside_control": "User-authored text"
}
```

Server-generated readable `content`:

When both sections contain text:

```text
Within your control:
[user text]

Outside your control:
[user text]
```

When only one section contains text, include only that heading and text.

Do not store placeholder text for an empty section.

### Migration

Create one new additive migration, for example:

```text
supabase/phase_4_day_3.sql
```

It must:

1. Backfill any existing generic Day 3 test entries with:

   ```json
   {
     "version": 1,
     "within_control": "<existing content>",
     "outside_control": ""
   }
   ```

2. Add Day 3 JSON validation:
   - `version` equals `1`.
   - `within_control` is a string.
   - `outside_control` is a string.
   - At least one trimmed value is nonempty.
   - No unexpected keys are accepted.

3. Tighten the existing Day 2 validation so new Day 2 rows cannot bypass structured data with `response_data = null`.

4. Preserve all existing RLS, ownership, unique-day, prompt-ID, and cascade-delete protections.

5. Update the complete `supabase_schema.sql`.

Do not alter previous applied migrations. Give the owner:

- The new incremental Day 3 migration.
- The complete updated schema.
- Updated verification SQL.
- Clear instructions to run only the incremental migration against the existing database.

### Save action

Create a dedicated authenticated server action:

```ts
saveDayThreeEntry(previousState, formData)
```

It accepts only:

```text
within_control
outside_control
mood
```

The server must:

1. Authenticate the user.
2. Verify beta access.
3. Verify onboarding completion and immutable program start.
4. Verify Day 3 has unlocked using server time.
5. Reject Day 3 before 48 hours.
6. Normalize line endings and trim outer whitespace.
7. Require at least one nonempty section.
8. Validate mood as absent or integer 1–5.
9. Construct `Day3ResponseData`.
10. Derive readable combined content server-side.
11. Enforce the final 10,000-character limit.
12. Always assign:
    - `program_day = 3`
    - `prompt_id = day-3-control`
13. Insert one Day 3 entry or update the existing Day 3 entry.
14. Preserve the existing unique `(user_id, program_day)` protection.
15. Record `entry_saved` with `{ program_day: 3 }` and no journal content.
16. Trigger the existing optional reflection behavior only after the entry is saved.
17. Revalidate Today, Journal, and entry-detail pages.

Do not create a `day_3_return` event; only Day 2 uses the return measurement event.

### Composer and dispatching

Create `Day3Composer`.

Update `DayExperienceDispatcher`:

- Day 1 → `Day1Composer`
- Day 2 → `Day2Composer`
- Day 3 → `Day3Composer`
- Days 4–7 → existing generic composer until their dedicated experiences are built

The entry-detail route must use the same dispatcher so Day 3 loads in its two-field editable form.

Mood-only edits must preserve the existing reflection. Editing either Day 3 writing section must create a new content revision for reflection behavior.

## Development Access to All Days

Do not add a browser query parameter, public switch, or production bypass.

Create a guarded, non-migration SQL fixture:

```text
supabase/internal_test_unlock_all_days.sql
```

Purpose: unlock all Days 1–7 for one disposable development account through the real existing time and RLS rules.

Requirements:

- Operator supplies one test email.
- The fixture refuses emails that do not contain `+mf-test-`.
- The auth user must already exist.
- The profile must exist.
- `program_started_at` must still be null; never modify an already-started program.
- It sets:
  - `is_18_or_older = true`
  - onboarding complete
  - `program_started_at = now() - interval '6 days'`
- It must not disable RLS.
- It must not alter database functions or policies.
- It must not affect another user.
- It must raise a clear success or failure message.

Result: the selected disposable account genuinely sees and can save Days 1–7. Day 7 is current; Days 1–6 are available or complete. This allows all experiences to be built and tested without waiting six real days.

Never use this fixture on a real beta user.

## Tests

### Day 3 timing and access

- Day 3 is locked one millisecond before 48 hours.
- Day 3 unlocks exactly at 48 hours.
- Day 3 does not require Day 1 or Day 2 completion.
- Day 3 remains available after Days 4–7 unlock.
- Direct Day 3 saves before 48 hours fail.
- Direct Day 3 saves after 48 hours succeed.
- Browser timezone does not affect server-derived unlocks.

### Structured response validation

- Both sections populated.
- Within-control only.
- Outside-control only.
- Both sections empty.
- Whitespace-only values.
- Multiline content.
- Valid and invalid mood values.
- Exact 10,000-character serialized content.
- Over-limit serialized content.
- Invalid JSON version.
- Missing keys.
- Extra keys.
- Non-string section values.
- Malformed legacy response data.

### Persistence and compatibility

- Day 3 initial save creates one entry.
- Re-saving updates the same Day 3 row.
- Duplicate concurrent saves cannot create two Day 3 rows.
- Prompt ID always remains `day-3-control`.
- Existing generic Day 3 rows backfill correctly.
- Existing structured Day 2 rows reload as distinct urgent and can-wait fields.
- Day 3 reloads as distinct within-control and outside-control fields.
- Mood-only edits do not alter structured text.
- Text edits update structured data and readable content together.
- Deleting Day 3 deletes its reflection and returns Day 3 to available when still unlocked.

### AI behavior

- No Groq consent saves Day 3 without a provider request.
- Safe Day 3 input creates one combined reflection.
- Either section can trigger safety handling.
- Immediate-danger content prevents reflection generation.
- Failed reflection preserves both fields.
- Retry uses the current Day 3 structured content.
- Day 1 and Day 2 content never enters the Day 3 AI request.
- Mood-only edits do not create a new reflection.

### Privacy and RLS

- User A cannot read, update, or delete User B’s Day 3 entry.
- User A cannot access User B’s reflection.
- Browser clients cannot write AI reflections directly.
- No entry text appears in product-event metadata.
- The all-days fixture refuses non-test emails.
- The all-days fixture cannot update an already-started account.

### Manual verification

With a fresh disposable `+mf-test-` account:

1. Allowlist and sign in.
2. Run the all-days fixture.
3. Open Days 1–7 and confirm each is genuinely unlocked.
4. Open Day 3.
5. Save within-control only.
6. Reload and edit it.
7. Save outside-control only on a separate test account.
8. Save both sections.
9. Test mood selection and clearing.
10. Test over-limit input.
11. Test AI consent on and off.
12. Test safe reflection, failure, retry, and safety redirect.
13. Delete Day 3.
14. Confirm progress changes correctly.
15. Test at 390px, 768px, 1024px, and 1440px.
16. Run `pnpm test`, `pnpm typecheck`, and `pnpm build`.

## Documentation and Completion

Update:

- MVP specification: Day 3 structured control-boundary exercise and response shape.
- Product blueprint: Day 3 is a two-part control-boundary chapter.
- Project ledger: Day 2 complete only after its SQL and live verification are confirmed; Day 3 in progress.
- Task ledger: Day 3 becomes `DONE` only after migration, tests, build, and manual verification pass.
- Internal test runbook: all-days fixture setup and safety warning.

Suggested commit:

```text
feat(program): add structured Day 3 control experience
```

Day 3 is complete only when the two-part exercise persists correctly, unlock rules are verified, all-days test access works exclusively through the guarded disposable-account fixture, and no Day 4–7 product work is claimed as complete.
