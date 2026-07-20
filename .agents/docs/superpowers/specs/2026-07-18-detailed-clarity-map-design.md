# Detailed Clarity Map and Export Reliability

## Goal

Turn MindFlow's seven-day Clarity Map into a detailed, evidence-grounded self-reflection report. Each section must be useful without making clinical claims, diagnosing, inferring hidden motives, or presenting generated suggestions as professional advice.

## Report contract

The final insight JSON contains these sections:

1. `overview`: a 3-4 sentence synthesis of the user's seven entries.
2. `recurring_threads`: 2-4 items. Every item includes a label, evidence days, and a 2-3 sentence explanation of how the theme appeared.
3. `emotional_patterns`: 2-3 items. Every item includes the explicitly stated emotion or pattern, relevant context/triggers, evidence days, and a 2-3 sentence explanation. The model must not diagnose or label a condition.
4. `perspective_shifts`: 1-3 items. Every item includes evidence days and a 2-3 sentence account of an explicitly expressed change in framing, understanding, or intention.
5. `clarity_in_practice`: 1-3 items. Every item includes evidence days and a 2-3 sentence account of something the user already identified as helpful, grounding, or worth continuing.
6. `action_plan`: exactly three non-clinical suggestions:
   - one immediate, low-effort action;
   - one conversation or boundary action when relevant; otherwise a practical communication alternative;
   - one longer-term experiment.
   Each item includes a title, a concrete suggested action, a brief rationale connected to the user's entries, and evidence days. Suggestions are framed as options, never commands, diagnosis, treatment, or crisis support.
7. `carry_forward`: a 2-3 sentence closing reflection.

All content must rely only on details the user explicitly expressed. The model must return strict JSON. The app uses structured-output mode and accepts a JSON code fence only as a safe compatibility fallback.

## UI and exports

- The Clarity Map panel renders the new detailed sections with readable paragraph spacing and evidence-day labels.
- The Action Plan visually distinguishes immediate, conversation/boundary, and longer-term suggestions without turning the experience into a task manager.
- PDF and email exports render the same report contract as the app.
- Existing reports with the prior schema remain readable: missing new sections render nothing rather than crashing. Newly generated reports use the new schema.

## Report lifecycle and email

- A report generation lock lasts 90 seconds.
- When generation completes, `expires_at` is set to 30 minutes from completion, not from the initial claim.
- The authenticated email action first verifies the caller, then uses a server-only query to distinguish an expired report from a missing report without exposing another user's data.
- An expired report cannot be emailed. The UI shows a truthful expiry message and offers a fresh generation.
- A completed report may be dismissed, then regenerated. Failed generation attempts are limited to ten per current source revision; source, provider, or model changes reset the attempt counter.

## Data and validation

- Extend `ProgramInsight` with `emotional_patterns` and `action_plan` item types.
- Validate the full report shape before persisting it: required strings, valid day numbers from 1-7, bounded array counts, and no missing required action-plan categories.
- Keep existing owner-only RLS, limited browser privileges, and service-role-only generation claim RPC.

## Verification

- Unit-test structured report validation, including code-fenced JSON compatibility and rejection of malformed/missing sections.
- Test the prompt output with a synthetic seven-day request; verify strict JSON and all new sections.
- Test successful generation extends expiry by 30 minutes.
- Test email returns `expired` for the owner's expired report and `not found` only when no report exists.
- Test UI, PDF, and email rendering with both legacy and new report data.
- Run the full unit suite, TypeScript check, and production build.
