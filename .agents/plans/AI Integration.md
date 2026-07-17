# NVIDIA AI Insights: Repair and Completion-Map Plan

## Summary

Repair the broken AI foundation first, then add a consent-gated insight system with two layers:

1. **Daily reflection:** brief, private feedback after each saved entry.
2. **Automatic final clarity map:** a deeper four-section report after all seven entries are saved.

Root cause already identified: the app is coded for NVIDIA AI and consent version 3, but the environment still supplies Groq variables. That makes every AI call fail before reaching a model. The current final-review table is also persistent, which conflicts with the chosen temporary-report privacy model.

NVIDIA’s API supports the OpenAI-compatible `POST /v1/chat/completions` interface, including `openai/gpt-oss-20b` and NVIDIA’s Nemoguard safety model. [NVIDIA LLM API documentation](https://docs.api.nvidia.com/nim/reference/llm-apis)

## 1. Stabilise the AI foundation

- Make NVIDIA the only supported provider. Remove legacy Groq configuration, copy, migration references, and dead environment variables.
- Configure server-only environment variables:

  ```bash
  NVIDIA_API_KEY=
  NVIDIA_REFLECTION_MODEL=openai/gpt-oss-20b
  NVIDIA_SAFETY_MODEL=nvidia/llama-3.1-nemoguard-8b-content-safety
  SUPABASE_SERVICE_ROLE_KEY=
  ```

- Add those values to local development and Vercel production environments. Do not expose either secret through `NEXT_PUBLIC_` variables.
- Keep the existing OpenAI SDK, configured only with NVIDIA’s OpenAI-compatible base URL.
- Change consent to **version 4**. The onboarding and Settings copy must explicitly say that consent covers:
  - safety screening;
  - concise reflections after saved entries;
  - an automatic seven-day clarity map after completion;
  - temporary handling of the final report and export options.
- Existing version-3 consent becomes inactive until the user explicitly re-consents. Journal-only users continue using every non-AI feature normally.
- Remove the public `test-nvidia` route. It is not a safe production diagnostic endpoint because it can invoke server-side AI logic outside the normal authenticated product flow.

## 2. Repair daily reflections before adding insights

- Preserve the current order: validate → save/update private entry → generate reflection.
- Rebuild the `claim_reflection_generation` database function as the canonical NVIDIA-compatible reflection state machine:
  - verify the entry belongs to the supplied user;
  - hash normalized entry text;
  - return the existing result when the same revision already completed;
  - allow one active generation lock per entry;
  - expire a stuck lock after 90 seconds;
  - allow one controlled retry per content revision and a bounded total retry count;
  - write only server-side provider/model/latency/token/error metadata.
- Keep daily output constrained to:
  - `reflection`: 2–3 sentences, maximum 80 words;
  - optional `question`: maximum 20 words.
- Validate model output as strict JSON before saving it. Treat malformed output, timeout, provider errors, and unknown safety output as a failed reflection—not a lost journal entry.
- Run the safety model on every entry before generation. Immediate-danger results skip interpretation and show the existing direct emergency message.
- Update the reflection UI to clearly distinguish: journal-only, pending, complete, failed/retry, and safety redirect.

## 3. Replace the persistent completion review with a temporary clarity map

- Purge all existing rows from `ai_program_reviews`, per the selected migration decision, then retire that table and its old UI/actions.
- Create `ai_program_insights` as the only final-insight store:

  ```text
  id, user_id, source_hash, status, provider, model,
  report_json, generation_token, attempt_count, error_code,
  expires_at, email_sent_at, created_at, updated_at
  ```

- Enable RLS. Authenticated users may read only their own currently unexpired report; all insert/update/delete operations remain server-only.
- Add an atomic `claim_program_insight_generation` function with the same ownership, source-hash, idempotency, stale-lock, and retry guarantees as entry reflections.
- The final map generates automatically when:
  - all seven distinct entries exist;
  - the user has active NVIDIA consent version 4;
  - no valid report exists for the current source hash.
- Do not make the map an extra opt-in button for consented users. It starts automatically on the completion screen.
- Users without active consent see the normal completion screen and a clear journal-only note; no entries are sent to NVIDIA.

### Final clarity-map contract

Generate strict JSON with four evidence-grounded sections:

```ts
type ProgramInsight = {
  overview: string
  recurring_threads: Array<{
    label: string
    explanation: string
    evidence_days: number[]
  }>
  perspective_shifts: Array<{
    explanation: string
    evidence_days: number[]
  }>
  clarity_in_practice: Array<{
    explanation: string
    evidence_days: number[]
  }>
  carry_forward: string
}
```

- Use 2–4 recurring threads, 1–3 perspective shifts, and 1–3 clarity-in-practice observations.
- Use only details explicitly expressed in the seven entries.
- Do not diagnose, assign labels, score moods, infer hidden motives, prescribe treatment, or claim improvement.
- Send all seven validated entries, in day order, to the completion safety check first. The current maximum input is bounded by seven entries of 10,000 characters each.
- A safety redirect prevents generation, PDF creation, and email delivery.
- Editing any entry invalidates and deletes the current report; the completion screen automatically generates a fresh report from the new source hash.

## 4. Temporary retention, PDF, and email delivery

- Store the final report only while it is needed on the completion screen, with a 30-minute `expires_at`.
- On normal navigation away, call an authenticated dismiss action to delete the report immediately.
- Add a protected Vercel Cron route that deletes expired reports every 15 minutes. Protect it with `CRON_SECRET`; it must use the server-side Supabase client and delete only rows past `expires_at`.
- State the privacy rule in the UI: MindFlow deletes its server-side report when the user leaves or within 30 minutes if the tab closes unexpectedly.
- Add a server-generated PDF download using `pdf-lib`:
  - generate bytes in memory from the authenticated user’s unexpired report;
  - return an attachment response;
  - do not upload the PDF to Supabase Storage or persist it on the server.
- Add one requested email export using Resend:
  - add `RESEND_API_KEY` and `RESEND_FROM_EMAIL`;
  - send only to the authenticated profile’s registered email;
  - attach the in-memory PDF;
  - store only `email_sent_at` for idempotency, never a copy of the report or attachment;
  - allow one successful send per report.
- Before either export, state plainly that downloaded files and email copies remain outside MindFlow’s control even after MindFlow deletes its own copy.

## 5. Interface and product-flow changes

- Replace the current manual final-review button with an automatic pending state on the completed-program screen.
- Add a dedicated `ProgramInsightPanel` with:
  - journal-only completion state;
  - generating state;
  - complete four-section map;
  - failed state with one retry;
  - safety redirect;
  - PDF download;
  - one-time email action;
  - privacy expiry notice.
- Preserve the Day 7 reflection before transitioning into the completion experience.
- Rename product events to reflect the real behavior without recording journal text:

  ```text
  insight_generation_started
  insight_generated
  insight_exported_pdf
  insight_emailed
  insight_deleted
  ```

- Update README, onboarding, Settings, privacy copy, environment documentation, and the live project ledger to describe NVIDIA, consent version 4, automatic insights, and temporary report retention.

## 6. Tests and launch gates

### Automated tests

- NVIDIA config accepts only a server-side key and uses the configured models.
- Consent versions 1–3 are inactive; version 4 NVIDIA consent is active.
- Daily reflection and final-insight JSON parsers reject malformed objects, unknown keys, overlong text, invalid day references, and invalid section counts.
- Completion requires seven distinct days, regardless of time elapsed.
- Entry edits change the source hash and invalidate an existing report.
- Report access is limited to the owning user and expires correctly.
- PDF/email actions reject missing, expired, foreign-user, safety-redirect, and duplicate-email cases.

### Live Supabase and NVIDIA matrix

- Confirm the canonical reflection state-machine SQL and insight-table SQL run successfully.
- Verify an allowlisted, consented user receives a safe daily reflection.
- Verify a journal-only user saves entries without any NVIDIA request.
- Verify immediate-danger content receives the safety message and no insight/export.
- Verify provider timeout, malformed JSON, and retry behavior preserve the entry.
- Verify duplicate clicks do not create duplicate reflections, insights, or emails.
- Verify a consented seven-day user receives the automatic map; edit an entry and confirm regeneration uses the new revision.
- Verify one user cannot read, change, download, or email another user’s reflection or report.
- Verify navigation dismissal and Vercel Cron delete the server-side report.
- Verify mobile and desktop completion, PDF, email, and privacy disclosure flows.
- Run `pnpm test`, `pnpm typecheck`, and a production build before beta access is opened.

## Assumptions and defaults

- NVIDIA is the sole AI provider.
- Daily reflections and the final map are enabled automatically only after active version-4 consent.
- `openai/gpt-oss-20b` is the default NVIDIA generation model; the current NVIDIA API documents it and the Nemoguard safety model as available through the OpenAI-compatible endpoint. [NVIDIA LLM API documentation](https://docs.api.nvidia.com/nim/reference/llm-apis)
- The final map is temporary; PDF downloads and requested Resend emails remain under the user’s control after delivery.
- The existing persistent final-review data will be purged during the migration.
