# MindFlow Journal — Task Ledger

Status: Canonical execution queue  
Last updated: 2026-07-13

Status key: `DONE`, `IN PROGRESS`, `NEXT`, `BLOCKED`, `LATER`.

## Done

- `P0-01` Define profitability-first, privacy-first, and non-clinical operating principles. `DONE`
- `P0-02` Lock the founding offer: 20 users, ₹299, paid before access, seven-day refund window. `DONE`
- `P0-03` Lock delivery: Carrd, Razorpay, manual allowlist, magic-link web app. `DONE`
- `P0-04` Lock one fixed seven-prompt program and one AI reflection per consenting user entry. `DONE`
- `P0-05` Lock privacy decisions: 18+ beta, no founder entry access, user deletion, 30-day migrate-or-delete window. `DONE`
- `P0-06` Audit repository implementation and preserve all existing uncommitted work. `DONE`
- `P0-07` Create the canonical Phase 0 document set and living project ledger. `DONE`
- `TECH-01` Scaffold Next.js, React, TypeScript, Tailwind, and Supabase application. `DONE`
- `TECH-02` Build onboarding, navigation, and journal prototypes. `DONE`
- `TECH-03` Verify production build and TypeScript on 2026-07-13. `DONE`

## Existing Uncommitted Work

- `APP-01` Journal list/form redesign and Supabase-backed home flow. `IN PROGRESS`
- `APP-02` Mood and custom entry-date persistence. `IN PROGRESS`
- `APP-03` Delete-entry presentation and handling. `IN PROGRESS`
- `DB-01` Mood schema migration. `IN PROGRESS`

These changes predate the canonical MVP. Review them against `mvp-specification.md`; do not discard or reset them.

## Security Gate

- `SEC-01` Read bundled Next.js 16 authentication, cookies, server-action, and request-boundary documentation. `DONE`
- `DB-02` Create the complete migration-aware beta schema and RLS SQL. `DONE`
- `SEC-02` Implement email magic-link login, PKCE callback, and session refresh Proxy. `DONE`
- `SEC-03` Implement normalized-email allowlist checks without exposing the allowlist table. `DONE`
- `SEC-04` Replace shared user ID with authenticated server identity in every journal operation. `DONE`
- `SEC-05` Implement per-user row-level security and pass the live two-user isolation test. `DONE`
- `SEC-06` Add sign-out and hide unfinished mock routes from the launch path. `DONE`
- `SEC-07` Apply `supabase_schema.sql` and pass the connected-project verification journey. `DONE`

`SEC-02` through `SEC-05` are verified. The private-data security gate is closed.

## Product Build

- `PROD-01` Reconcile current UI with the 1–5 mood model and one-entry-per-day rule.
- `PROD-02` Implement 18+ confirmation, AI consent, onboarding, and immutable program start.
- `PROD-03` Implement seven prompts and 24-hour unlock behavior; retain unlocked missed days.
- `PROD-04` Implement create, edit, delete, progress, completion, and real history states.
- `PROD-05` Remove mock and random data from the paid path.
- `PROD-06` Implement permanent account/data deletion and beta-end migration/deletion operations.

## AI Build

- `AI-01` Configure server-only OpenAI Responses API client and configurable model.
- `AI-02` Enforce consent, moderation, and the immediate-danger redirect.
- `AI-03` Implement structured reflection and optional question.
- `AI-04` Preserve saved entries on failure and add idempotent retry.
- `AI-05` Test clinical-claim, unsupported-inference, failure, and no-consent paths.

## Revenue and Operations

- `REV-01` Publish Carrd page using `copy-library.md`. `BLOCKED` by Carrd account access.
- `REV-02` Create ₹299 Razorpay Payment Link in test and live modes. `BLOCKED` by Razorpay account access.
- `REV-03` Publish seven-day refund, privacy, AI limitation, 18+, and non-clinical terms.
- `REV-04` Prepare allowlist administration and customer tracker.
- `REV-05` Rehearse the complete test-payment-to-reflection runbook.

## Measurement and Acquisition

- `DATA-01` Add product events without journal-content metadata.
- `DATA-02` Create a lightweight prospect/customer sheet.
- `ACQ-01` Begin warm outreach only after `REV-05` passes.
- `ACQ-02` Recruit five paid users and interview each after completion or abandonment.
- `ACQ-03` Fix purchase, access, trust, activation, return, and completion blockers.
- `ACQ-04` Expand toward twenty only after the first-five launch gates hold.
- `ACQ-05` Set up Typefully only if manual posting becomes inconsistent.

## Verification

- `QA-01` Allowlist and magic-link tests. `DONE`
- `QA-02` Cross-user RLS isolation tests. `DONE`
- `QA-03` Unlock, missed-day, edit, deletion, completion, and 30-day lifecycle tests.
- `QA-04` AI consent, success, safety, timeout, retry, and idempotency tests.
- `QA-05` Mobile and desktop journey.
- `QA-06` Production build and TypeScript checks.
- `QA-07` Razorpay test payment and manual-access rehearsal.

## Later

- Voice-to-entry, advanced analytics, complex streaks, reminders, generated prompts, aggregate summaries, payment automation, native apps, and scale architecture. `LATER`
- Licensed-professional support is a separate future product, privacy, safeguarding, and compliance track. `LATER`

## Current Blockers

- Carrd and Razorpay setup require the owner’s external account access.
- Presence of real data in the connected Supabase project is unverified.
- Live magic-link behavior and two-user isolation are verified.
- No OpenAI API key is configured locally.
- Hosting target and production URL are not evidenced in the repository.

## Next Best Action

Implement the Phase 2 seven-day program state, onboarding start time, unlock rules, progress dashboard, and one editable entry per day.
