# Phase 2 — Activation and Journey Verification

The seven-day experience is implemented locally. Complete these steps before treating Phase 2 as live.

## 1. Apply the program migration

Run the complete `supabase/phase_2_program_migration.sql` file in the connected Supabase SQL editor. It adds immutable program start, fixed day/prompt identity, and database-enforced unlock rules.

## 2. Re-run private-data isolation

Create two clean allowlisted Auth test users with no journal entries. Replace the placeholders in `supabase/supabase_rls_verification.sql` and run it. Any `RLS FAILURE` is a launch blocker.

## 3. Verify onboarding

- A returning onboarded user goes directly to Today.
- A fresh user sees all three onboarding stages.
- The program cannot start without the 18+ confirmation.
- Both AI-consent choices allow the program to start.
- Refreshing after program start does not restart or change the start timestamp.

## 4. Verify the seven-day journey

- Day 1 opens immediately.
- A future day cannot be opened or saved.
- Previously unlocked missed days remain selectable.
- Saving the same day again edits the existing entry instead of creating another.
- Mood is optional and accepts only 1–5.
- Empty and over-10,000-character entries are rejected.
- Delete removes the selected entry and returns to the journal.
- Seven distinct entries created before the ten-day deadline produce the completion view.
- Entries remain readable after the completion window closes.

## 5. Verify responsive presentation

Check login, onboarding, Today, Journal, entry detail, and Settings at approximately 390px, 768px, 1024px, and 1440px. Confirm keyboard focus, readable mood labels, no horizontal overflow, and reduced-motion behavior.

## 6. Required checks

Run `pnpm test`, `pnpm typecheck`, and `pnpm build`. Do not begin acquisition until the migration and authenticated browser journey pass.
