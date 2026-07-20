# Detailed Clarity Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate, render, export, and reliably retain a detailed seven-day Clarity Map with Emotional Patterns and a practical Action Plan.

**Architecture:** The report remains a single `report_json` object in `ai_program_insights`. A strict server-side validator defines the report contract and is shared by generation and export code. The completed report receives its 30-minute expiry only after successful persistence; the existing 90-second expiry stays a generation lease only.

**Tech Stack:** Next.js 16 App Router, TypeScript, Supabase/Postgres RLS, NVIDIA OpenAI-compatible Chat Completions, Resend, pdf-lib, Node test runner.

## Global Constraints

- Use only journal details explicitly expressed by the user.
- Do not diagnose, label conditions, infer hidden motives, prescribe treatment, or make crisis-support claims.
- Action suggestions are optional, non-clinical choices—not commands.
- Preserve existing legacy reports: missing newly added sections must render safely.
- Never expose the Supabase service-role key or journal content in browser code or logs.
- A generation lease is 90 seconds; a completed report expires 30 minutes after completion.
- Limit failed attempts for one source revision to ten; a source, provider, or model change resets the counter.
- The dashboard must distinguish an expired map from a map that has never been generated, without exposing any other user's report.

---

### Task 1: Define and validate the detailed report contract

**Files:**
- Create: `src/lib/program-insight-schema.ts`
- Create: `src/lib/program-insight-schema.test.ts`
- Modify: `src/lib/program-review.ts`

**Interfaces:**
- Produces `ProgramInsight`, `parseProgramInsight(value)`, and `isLegacyProgramInsight(value)`.
- `parseProgramInsight` throws on invalid generated output and returns a strongly typed report for persistence.

- [ ] **Step 1: Write failing contract tests**

```ts
test('accepts a detailed report with emotional patterns and an action plan', () => {
  const report = parseProgramInsight(validDetailedReport)
  assert.equal(report.action_plan.length, 3)
  assert.equal(report.emotional_patterns.length, 2)
})

test('rejects an action plan missing one of its three required kinds', () => {
  assert.throws(() => parseProgramInsight(missingLongerTermAction), /action plan/)
})
```

- [ ] **Step 2: Run the new test file**

Run: `node --conditions=react-server --experimental-strip-types --test src/lib/program-insight-schema.test.ts`

Expected: fail because the module does not exist.

- [ ] **Step 3: Implement the schema module**

```ts
export type InsightItem = {
  explanation: string
  evidence_days: number[]
}

export type ActionPlanItem = InsightItem & {
  kind: 'immediate' | 'conversation_or_boundary' | 'longer_term'
  title: string
  action: string
}

export type ProgramInsight = {
  overview: string
  recurring_threads: Array<InsightItem & { label: string }>
  emotional_patterns: Array<InsightItem & { label: string; context: string }>
  perspective_shifts: InsightItem[]
  clarity_in_practice: InsightItem[]
  action_plan: ActionPlanItem[]
  carry_forward: string
}
```

Validate required strings, evidence days 1–7, count bounds from the approved spec, and exactly one action item of each `kind`. Reject unknown or malformed data from the model. Add `isLegacyProgramInsight` for the original five-field JSON shape.

- [ ] **Step 4: Update program generation**

Replace the local `ProgramInsight` type in `src/lib/program-review.ts` with the shared contract. Expand the NVIDIA prompt to request all seven approved sections, their exact counts, 2–3 sentence detail limits, and the three action kinds. Replace minimal `overview`/`recurring_threads` checking with `parseProgramInsight(parsed)` before saving.

- [ ] **Step 5: Verify tests**

Run: `node --conditions=react-server --experimental-strip-types --test src/lib/program-insight-schema.test.ts src/lib/nvidia-ai.test.ts`

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/program-insight-schema.ts src/lib/program-insight-schema.test.ts src/lib/program-review.ts
git commit -m "feat(insights): define detailed clarity map contract"
```

### Task 2: Render detailed report sections and preserve legacy maps

**Files:**
- Modify: `src/components/programInsightPanel.tsx`
- Create: `src/lib/program-insight-display.ts`
- Create: `src/lib/program-insight-display.test.ts`

**Interfaces:**
- Consumes `ProgramInsight` and `isLegacyProgramInsight` from Task 1.
- Produces `getDisplayableInsight(report_json)` returning either legacy-safe report data or the detailed report data.

- [ ] **Step 1: Write the failing display test**

```ts
test('keeps a legacy report displayable while identifying absent detailed sections', () => {
  const result = getDisplayableInsight(legacyReport)
  assert.equal(result.emotional_patterns, undefined)
  assert.equal(result.action_plan, undefined)
})
```

- [ ] **Step 2: Run the test**

Run: `node --conditions=react-server --experimental-strip-types --test src/lib/program-insight-display.test.ts`

Expected: fail because the display helper does not exist.

- [ ] **Step 3: Implement the display helper and panel**

Render `Emotional Patterns` after `Recurring Threads`, using the same evidence-day treatment and multi-paragraph text styling. Render `Action Plan` after `Clarity in Practice` as three distinct, calm cards labeled `For today`, `For a conversation`, and `For the longer view`. Each card shows `title`, `action`, `explanation`, and evidence days. Render neither section when reading a legacy report.

- [ ] **Step 4: Verify the component contract**

Run: `node --conditions=react-server --experimental-strip-types --test src/lib/program-insight-display.test.ts`

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/programInsightPanel.tsx src/lib/program-insight-display.ts src/lib/program-insight-display.test.ts
git commit -m "feat(insights): render emotional patterns and action plan"
```

### Task 3: Make reports available for thirty minutes after successful generation

**Files:**
- Modify: `src/lib/program-review.ts`
- Modify: `supabase/NVIDIA AI Insights Query.sql`
- Create: `src/lib/program-insight-lifecycle.test.ts`

**Interfaces:**
- Completion update writes `expires_at = now() + interval '30 minutes'` only when the matching generation token is still pending.
- SQL claim function retains its 90-second `expires_at` lease while status is pending.

- [ ] **Step 1: Write a lifecycle test**

```ts
test('uses a 90-second lease while generating and a 30-minute expiry after completion', () => {
  assert.equal(INSIGHT_GENERATION_LEASE_MS, 90_000)
  assert.equal(INSIGHT_COMPLETED_RETENTION_MS, 1_800_000)
})
```

- [ ] **Step 2: Run the lifecycle test**

Run: `node --conditions=react-server --experimental-strip-types --test src/lib/program-insight-lifecycle.test.ts`

Expected: fail because the lifecycle constants do not exist.

- [ ] **Step 3: Implement lifecycle constants and completion update**

Create named constants in `src/lib/program-insight-request.ts`. In `generateProgramReviewHelper`, add `expires_at: new Date(Date.now() + INSIGHT_COMPLETED_RETENTION_MS).toISOString()` to the successful `ai_program_insights` update. Do not extend `expires_at` for failed or safety-redirect rows.

In `supabase/NVIDIA AI Insights Query.sql`, retain `v_lease_expires` for all pending claims. Add a short verification query comment that confirms a completed row has an expiry approximately thirty minutes after `updated_at`.

In the authenticated dashboard loader, derive an owner-only `programInsightExpired` state through a server-side lookup scoped to the already authenticated user ID. The UI should say that the temporary map expired and offer a fresh generation; it must not call an expired map "not found."

- [ ] **Step 4: Verify the lifecycle test**

Run: `node --conditions=react-server --experimental-strip-types --test src/lib/program-insight-lifecycle.test.ts`

Expected: pass.

- [ ] **Step 5: Apply and verify the SQL manually**

Run the complete `supabase/NVIDIA AI Insights Query.sql` in Supabase SQL Editor. Confirm with:

```sql
select status, updated_at, expires_at
from public.ai_program_insights
where user_id = auth.uid();
```

Expected: completed rows have `expires_at` approximately 30 minutes after completion.

- [ ] **Step 6: Commit**

```bash
git add src/lib/program-review.ts src/lib/program-insight-request.ts src/lib/program-insight-lifecycle.test.ts 'supabase/NVIDIA AI Insights Query.sql'
git commit -m "fix(insights): retain completed reports for thirty minutes"
```

### Task 4: Make email exports report true expiry state and include detailed sections

**Files:**
- Modify: `src/app/actions.ts`
- Modify: `src/lib/email.ts`
- Modify: `src/app/api/export-pdf/route.ts`
- Create: `src/lib/program-insight-export.test.ts`

**Interfaces:**
- `emailProgramInsightAction` returns `Insight expired. Generate a fresh map to email it.` only for the authenticated caller's expired report.
- Missing reports still return `Insight not found.`

- [ ] **Step 1: Write export-state tests**

```ts
test('maps an authenticated expired report to an actionable expiry message', () => {
  assert.equal(getInsightExportState(expiredReport, now), 'expired')
})

test('keeps a missing report distinct from an expired one', () => {
  assert.equal(getInsightExportState(null, now), 'missing')
})
```

- [ ] **Step 2: Run the test**

Run: `node --conditions=react-server --experimental-strip-types --test src/lib/program-insight-export.test.ts`

Expected: fail because the state helper does not exist.

- [ ] **Step 3: Implement owner-safe email lookup and exports**

After `requireBetaUser()` authenticates the server action, use `createAdminClient()` to load the report by that authenticated `user.id`, including expired rows. Map `null` to missing and an elapsed `expires_at` to expired; do not send either. Preserve the existing user-owned email destination lookup. Keep this privileged lookup entirely server-side and never accept a user ID from the request.

Extend `src/lib/email.ts` and `src/app/api/export-pdf/route.ts` to render Emotional Patterns and the three Action Plan cards when present, while retaining legacy safe rendering.

- [ ] **Step 4: Verify export-state tests**

Run: `node --conditions=react-server --experimental-strip-types --test src/lib/program-insight-export.test.ts`

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add src/app/actions.ts src/lib/email.ts src/app/api/export-pdf/route.ts src/lib/program-insight-export.test.ts
git commit -m "fix(insights): report expired exports clearly"
```

### Task 5: End-to-end validation

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update documentation**

Document the detailed Clarity Map sections, the ten-attempt cap, and the 30-minute completion-based retention window. State that regenerating a map is required to receive the new report format.

- [ ] **Step 2: Run all checks**

Run:

```bash
pnpm test
pnpm typecheck
pnpm build
```

Expected: all tests pass, no TypeScript errors, and the production build completes.

- [ ] **Step 3: Run live verification**

1. Generate a fresh map from a completed, consented account.
2. Confirm it contains Emotional Patterns and all three Action Plan cards.
3. Confirm the database expiry is about thirty minutes after generation completes.
4. Download the PDF and confirm both new sections appear.
5. Trigger email before expiry and confirm the detailed report is included.
6. After expiry, confirm the app offers a fresh generation instead of reporting a missing insight.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: describe detailed clarity map lifecycle"
```
