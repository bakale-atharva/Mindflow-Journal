# Phase 4 — Internal Beta Verification

## Execution contract

**Outcome:** verify the existing seven-day beta with owner-controlled, disposable accounts; add regression coverage and fix only defects this phase reproduces. Do not rebuild Days 1–7 or work on acquisition/payment systems.

**Target audience:** AI-assisted implementers and the owner who approves live-environment evidence.

**Authorities:** `.agents/plans/Design.md` controls visual/design decisions; `docs/mvp-specification.md` controls product behavior; `src/lib/reflections.ts:25-164`, `src/app/actions.ts:180-359`, `src/lib/program.test.ts:14-64`, and `supabase/phase_3_groq.sql:63-171` are the implementation/test anchors. Begin from `cd10d16` and preserve all existing work.

### Non-negotiable safety and scope rules

1. Use only the existing Node test runner, Next.js app, Supabase project, Groq SDK, and SQL tooling. Do not add dependencies, browser-test frameworks, analytics providers, or database extensions.
2. Use artificial markers only, for example `PHASE4_<scenario>_<random>`. Never use real journal/reflection text, real-user accounts, secrets, magic links, JWTs, or realistic crisis text in fixtures, output, screenshots, ledgers, or commits.
3. `GROQ_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` stay server-only: never commit, print, put them in `NEXT_PUBLIC_*`, or expose them in a browser bundle.
4. Confirm the owner-approved test environment before a live query. Create only disposable `mindflow-phase4-*` accounts. Never alter a real user’s `program_started_at` or clean up real records.
5. Save-before-reflection is inviolable: any Groq failure leaves the entry saved and readable.
6. Do not modify an applied migration. A verified database defect requires a new additive migration, a matching update to `supabase/supabase_schema.sql`, owner-run SQL confirmation, and a re-run of the original failing query.
7. Every reproducible defect follows TDD: add a failing regression test/query, capture its failure, make the smallest fix, re-run the targeted check, then run the affected suite. Never weaken the test to make it pass.
8. Stop immediately if work needs a new dependency, a historical migration edit, an unapproved production-data operation, more than three unplanned files, or a test change intended to mask a failure. Revert only the current task’s changes, record the deviation in `docs/drift-incidents/YYYY-MM-DD-phase-4-<topic>.md`, and wait for owner review. Formatting, whitespace-only edits, and a type-checked one-line refactor in a scoped file are allowed.

### Evidence and environment preflight

Before any live test, create `docs/verification/phase-4/README.md`. Each result must record scenario ID, timestamp with timezone, commit, opaque fixture label, method (`unit`, `SQL`, `browser`, or `owner confirmation`), expected/actual outcome, redacted evidence location, defect/fix ID, and re-run outcome. Store redacted results under `docs/verification/phase-4/`; never store private text, secret values, passwords, or full disposable emails.

The preflight record must show all of the following without disclosing values:

- Owner-confirmed permitted Supabase project/environment and whether it is safe for disposable accounts.
- Server-only availability of `GROQ_API_KEY`, `GROQ_REFLECTION_MODEL=openai/gpt-oss-20b`, `GROQ_SAFETY_MODEL=openai/gpt-oss-safeguard-20b`, and `SUPABASE_SERVICE_ROLE_KEY`.
- Owner evidence that Groq Zero Data Retention is enabled for this account.
- Owner evidence that Phase 2 and Phase 3 SQL succeeded, plus a post-migration object/function query.
- Three clean, allowlisted disposable fixtures: User A, User B, and Delete Me.
- A redacted scan proving no configured secret is tracked or exposed through `NEXT_PUBLIC_*`.

For exact 24-hour and ten-day boundaries, use deterministic unit tests. For browser/database checks, use owner-approved fixture timestamps only, recording UTC start and expected unlock times. Do not change real user dates.

### Task sequence

| ID | Deliverable | Estimate | Dependencies | Allowed files |
| --- | --- | ---: | --- | --- |
| P4-01 | Preflight, disposable fixtures, evidence record, ledger reconciliation | 60m | — | `docs/verification/phase-4/README.md`, `PROJECT_LEDGER.md`, `docs/task-ledger.md`; server config touch-only |
| P4-02 | Deterministic Groq/reflection regression coverage | 120m | P4-01 | `src/lib/reflections.test.ts` (new), `src/lib/reflections.ts`, `package.json` only if test discovery requires it |
| P4-03 | Live Groq success/safety/failure/edit/privacy checks | 90m | P4-01, P4-02 | `docs/verification/phase-4/groq-results.md`; production files only for a reproduced defect |
| P4-04 | Program and journal-operation regression coverage | 120m | P4-01 | `src/lib/program.test.ts`, one focused `src/lib/*.test.ts` if necessary, `src/lib/program.ts`/`src/app/actions.ts` only for a defect |
| P4-05 | Two-user RLS, events, and permanent deletion verification | 120m | P4-01 | `docs/verification/phase-4/privacy-deletion-results.md`, `supabase/supabase_rls_verification.sql` only for a verification query |
| P4-06 | Mobile/desktop journey and accessibility evidence | 90m | P4-03, P4-04 | `docs/verification/phase-4/browser-journey-results.md`; UI files only for a reproduced defect |
| P4-07 | Conditional defect/migration/package repair | 30–150m per defect | failing check | Smallest proven file boundary; additive migration/schema pair when required |
| P4-08 | Fresh final gate, ledger closure, and Gemini handoff | 60m | P4-02–P4-07 | `docs/verification/phase-4/final-results.md`, `PROJECT_LEDGER.md`, `docs/task-ledger.md` |

P4-02, P4-04, and P4-05 may proceed in parallel after P4-01. P4-06 waits for P4-03/P4-04. P4-08 is the only closing task.

### Required task procedures

**P4-01 — establish the baseline.** Record `git status --short` without resetting anything. Obtain the owner confirmations above; if any is absent, log it as a blocker and do not run the dependent live check. Reconcile Phase 2/3 migration wording in both ledgers using evidence, not assumptions. Create the evidence README with fixture-cleanup ownership, redaction rules, and the literal approved safety-notice source: `docs/mvp-specification.md:95-97`.

**P4-02 — deterministic reflection coverage.** Use only built-in Node test facilities. Prove: consent causes a safety then reflection request; declined consent causes no request; immediate danger bypasses reflection generation; malformed output, timeout, invalid key, and rate limit return a failed state without losing the saved entry; reflection is 2–3 sentences/≤80 words; optional question is ≤20 words; only one retry claims; duplicate calls reuse pending/complete state; a content edit is eligible for a new reflection while a mood-only edit is not. `pnpm test` must discover every added test. When a behavior cannot be isolated without adding a dependency, document it as a P4-03 manual scenario and do not claim it automated.

**P4-03 — live Groq matrix.** Execute these scenarios on clean synthetic entries and record each result: `G-01` consented safe save; `G-02` no consent; `G-03` immediate danger; `G-04` invalid key; `G-05` timeout; `G-06` malformed response; `G-07` rate limit; `G-08` duplicate request; `G-09` content edit; `G-10` mood-only edit; `G-11` marker absence from logs/events. For injected failures, use owner-controlled temporary configuration, restore it immediately, and never commit an invalid secret. Inspect only redacted status/count evidence; no entry/reflection text belongs in the result.

**P4-04 — program and journal matrix.** Extend the existing exact-boundary test style and verify: Day 1 after onboarding; each Day 2–7 24-hour boundary; future-day lock and server-side direct-save rejection; missed-day access and Day 2 before Day 1; fixed prompt identity; one editable primary entry/day; seven distinct entries within ten days; late non-completion with still-readable journal; no mood and moods 1–5; invalid mood; empty and >10,000-character content; content/mood edits; history/detail; entry deletion with reflection cascade; loading/empty/error/pending/retry states. Every item needs an automated assertion or a documented browser/manual reason and evidence.

**P4-05 — privacy and deletion matrix.** With A/B prove A cannot read, update, or delete B’s entries; cannot read or modify B’s reflections; and an authenticated client cannot insert/update reflection records. Open the same reflection twice and prove the permitted `reflection_viewed` event is recorded once. Query event metadata for a synthetic marker and prove it is absent. For Delete Me, create profile/entry/reflection/event/allowlist fixtures, complete permanent deletion, prove Auth user/profile/entry/reflection/attributable events/allowlist row are gone, then attempt a private action in the stale session and prove access is denied. Save only status/count SQL output.

**P4-06 — browser journey.** At approximately 390px and 1440px run `Allowlist → magic link → onboarding → Day 1 → save → Groq reflection → journal → Settings → sign out → sign in`. Prove 18+ gating, optional Groq consent, rejection of legacy OpenAI-only consent, correct next unlock, no horizontal overflow, visible keyboard focus, programmatic mood selection, understandable loading/error/pending/retry states, literal accessible safety notice, and consistency with the Living Field Journal design. Re-check state after sign-in instead of relying on a cached page.

**P4-07 — conditional repairs.** Link every repair to a scenario ID and a failing check. For a database defect create `supabase/<date>_phase_4_<short_name>.sql`, update `supabase/supabase_schema.sql`, give both files to the owner, and wait for confirmation before calling the live scenario fixed. For `openai` removal, first run `rg -n "from ['\"]openai|require\(['\"]openai" src`; only when it finds no source import, remove the package and lockfile entry with the existing package manager, then run typecheck/build. Re-run the original scenario and all affected checks.

**P4-08 — close with fresh evidence.** Verify no scenario row is missing. Then run, in order:

```text
pnpm test
pnpm typecheck
pnpm build
git diff --check
git status --short
```

The first four must exit 0. Capture the exact exit code and concise output summary; `git status --short` is informational and must list every remaining file if non-empty. Update `PROJECT_LEDGER.md` and `docs/task-ledger.md` with migration confirmation, every test outcome, defects/fixes, exact dates, remaining blockers, final output, and paused Carrd/Razorpay/Google Forms/payments/outreach/acquisition status. Write the Gemini handoff: files changed; bugs; fixes; tests; test/typecheck/build/diff/status results; manual and SQL checks; owner SQL or `None`; blockers; and a commit message.

### Final execution checklist

- [ ] Each task is 30–150 minutes or split before execution.
- [ ] Each defect begins with a failing regression test/query; no test is weakened to pass.
- [ ] No dependency, historical migration, secret, real-user data, or private text enters the worktree/evidence.
- [ ] Each scenario has dated evidence and a re-run after every fix.
- [ ] Final commands are freshly run; no skipped/failed gate is called a pass.
- [ ] Paused acquisition/payment work remains paused.

## Goal

Prove that the existing MindFlow seven-day beta works reliably using only owner-controlled test accounts.

Days 1–7 are already built. This phase tests and fixes them; it does not rebuild each day separately.

## Starting State

- Begin from commit `cd10d16`.
- Phase 2 and Phase 3 SQL ran successfully.
- Groq integration is committed.
- Preserve all existing work.
- Keep `.agents/plans/Design.md` as the design authority.

## Scope

### 1. Configure the internal test environment

- Configure `GROQ_API_KEY`.
- Configure `GROQ_REFLECTION_MODEL=openai/gpt-oss-20b`.
- Configure `GROQ_SAFETY_MODEL=openai/gpt-oss-safeguard-20b`.
- Configure `SUPABASE_SERVICE_ROLE_KEY`.
- Confirm Groq Zero Data Retention is enabled.
- Confirm no secret is exposed to browser code or committed files.
- Remove the unused `openai` dependency if nothing imports it.

### 2. Verify the Groq reflection flow

Test with artificial journal text only:

- Consent enabled → entry saves → safety screening runs → reflection appears.
- Consent declined → journal works without any Groq request.
- Safe content produces a two- or three-sentence reflection under 80 words.
- Optional question remains under 20 words.
- Immediate-danger test content displays the fixed safety notice.
- Immediate-danger content never reaches the reflection model.
- Invalid key, timeout, malformed response, and rate limit preserve the entry.
- A failed reflection offers one explicit retry.
- Duplicate requests do not generate duplicate reflections.
- Editing entry text produces a new reflection.
- Editing only the mood does not generate another reflection.
- No journal or reflection text appears in logs or product events.

Fix only defects discovered during these tests.

### 3. Verify Days 1–7

Use disposable test accounts and controlled database test data. Never modify real-user program dates.

Verify:

- Day 1 unlocks immediately after onboarding.
- Day 2 unlocks exactly 24 hours after program start.
- Days 3–7 unlock at their corresponding 24-hour boundaries.
- Future days remain locked.
- Direct attempts to save a future day are rejected.
- Previously unlocked missed days remain available.
- Users may complete Day 2 before a missed Day 1.
- Each day has the correct fixed prompt.
- Each day permits one editable primary entry.
- Entry history shows all completed days.
- Seven distinct entries complete the program.
- Completion must occur within ten days.
- The journal remains readable after the completion window ends.

Extend the existing program tests where coverage is missing.

### 4. Verify journal operations

For multiple unlocked days, test:

- Create entry.
- Save without a mood.
- Save with moods one through five.
- Reject invalid mood values.
- Reject empty content.
- Reject content beyond the limit.
- Edit content.
- Edit mood only.
- View entry in journal history.
- Open entry detail.
- Delete entry.
- Confirm associated reflection is deleted.
- Test loading, empty, error, pending, and retry states.

### 5. Verify privacy and account deletion

Using two separate test users:

- User A cannot read User B’s entries.
- User A cannot edit or delete User B’s entries.
- User A cannot read or modify User B’s reflections.
- Authenticated users cannot directly write reflection records.
- Product events contain no journal text.
- Reflection views are recorded only once.

Using a disposable account, verify permanent deletion removes:

- Auth user.
- Profile.
- Journal entries.
- AI reflections.
- Attributable product events.
- Internal beta allowlist record.

Confirm the deleted session can no longer access the application.

### 6. Verify the complete user journey

Test this journey on mobile and desktop:

```text
Allowlist → magic link → onboarding → Day 1 → entry save
→ Groq reflection → journal history → Settings → sign out → sign in
```

Also verify:

- 18+ confirmation is required.
- Groq consent is optional.
- Legacy OpenAI consent does not authorize Groq.
- Next unlock time is accurate.
- No horizontal overflow occurs.
- Keyboard focus is visible.
- Mood controls expose their selected state.
- Loading and error states are understandable.
- The safety notice is accessible and displayed exactly as approved.
- The Living Field Journal design remains consistent.

### 7. Run final checks

Run:

```text
pnpm test
pnpm typecheck
pnpm build
git diff --check
git status --short
```

Do not claim the phase is complete unless all required checks pass.

If a database fix is required:

- Create a new additive SQL migration.
- Do not modify previously applied migration history.
- Update the complete `supabase_schema.sql`.
- Give the owner both the incremental SQL and full schema.
- Wait for confirmation that the incremental SQL ran successfully before marking it verified.

### 8. Update the project record

Update the project and task ledgers with:

- Phase 2 SQL confirmed successful.
- Phase 3 SQL confirmed successful.
- Every internal test result.
- Defects found and fixed.
- Remaining blockers.
- Exact verification dates.
- Final build and test results.

Keep Carrd, Razorpay, Google Forms, payments, outreach, and acquisition marked as paused.

## Completion Gate

Phase 4 is complete only when:

- Groq success, safety, failure, consent, and retry paths pass.
- All seven day-unlock states pass.
- Entries remain safe during every AI failure.
- Missed-day and completion behavior pass.
- Two-user isolation passes.
- Account deletion passes.
- Mobile and desktop journeys pass.
- Tests, TypeScript, and production build pass.
- No private journal text appears in logs or analytics.

## Gemini Handoff

When finished, return:

- Files changed.
- Bugs discovered.
- Fixes implemented.
- Tests added.
- Test, type-check, and build output.
- Manual checks performed.
- Any SQL the owner must run.
- Remaining blockers.
- A suitable commit message.

Do not work on customer acquisition or payments during this phase.
