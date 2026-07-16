# NVIDIA AI Reflections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (\`- [ ]\`) syntax for tracking.

**Goal:** Replace Groq with NVIDIA's OpenAI-compatible API for entry reflections and seven-day program reviews, while requiring users to explicitly consent to NVIDIA processing.

**Architecture:** Add a small server-only NVIDIA module that centralizes the endpoint, API-key validation, models, and JSON parsing. Both generation flows use this module while preserving the existing Supabase claim/status and telemetry lifecycle. A consent version bump makes prior Groq consent legacy rather than silently sending journal text to a new processor.

**Tech Stack:** Next.js 16, TypeScript, OpenAI JavaScript SDK, NVIDIA Integrate API, Supabase.

## Global Constraints

- Use \`https://integrate.api.nvidia.com/v1\` as the NVIDIA OpenAI-compatible base URL.
- Read only server-side \`NVIDIA_API_KEY\`; never expose it through \`NEXT_PUBLIC_\` variables or logs.
- Default models: \`nvidia/llama-3.3-nemotron-super-49b-v1.5\` for reflections and \`nvidia/llama-3.1-nemoguard-8b-content-safety\` for safety screening.
- Store \`provider = 'nvidia'\` in AI telemetry rows.
- Treat all version-2/Groq consent as legacy; only provider \`nvidia\` with consent version \`3\` may send journal text.
- Preserve existing Supabase RPC claim/update guards and user-visible failure states.
- Do not add dependencies; \`openai\` is already installed.

---

## File Structure

- Create: \`src/lib/nvidia-ai.ts\` — server-only NVIDIA client, model configuration, JSON parsing, and consent predicate.
- Create: \`src/lib/nvidia-ai.test.ts\` — zero-dependency unit tests for configuration, parsing, and consent.
- Modify: \`src/lib/reflections.ts\` — NVIDIA safety and entry reflection generation.
- Modify: \`src/lib/program-review.ts\` — NVIDIA safety and seven-day review generation.
- Modify: \`src/app/actions.ts\` — use one NVIDIA version-3 consent predicate and write it during onboarding/settings updates.
- Modify: \`src/components/onboarding-flow.tsx\`, \`src/components/settings-panel.tsx\`, and \`src/components/program-review-panel.tsx\` — accurate NVIDIA disclosure and gating.
- Rename: \`src/app/auth/test-groq/route.ts\` to \`src/app/auth/test-nvidia/route.ts\`.
- Modify: \`package.json\` and \`pnpm-lock.yaml\` — remove Groq SDK after migration.

### Task 1: Create an NVIDIA configuration and parsing boundary

**Files:**
- Create: \`src/lib/nvidia-ai.ts\`
- Create: \`src/lib/nvidia-ai.test.ts\`

**Interfaces:**
- Produces \`getNvidiaAiConfig(): NvidiaAiConfig | null\` with provider, models, and initialized client.
- Produces \`parseJsonObject(content: string | null | undefined): Record<string, unknown>\`.
- Produces \`hasActiveNvidiaConsent(profile): boolean\`.

- [ ] **Step 1: Write the failing tests**

\`\`\`ts
test('uses NVIDIA defaults only when an API key exists', () => {
  withEnvironment({ NVIDIA_API_KEY: 'test-key' }, () => {
    const config = getNvidiaAiConfig()
    assert.equal(config?.provider, 'nvidia')
    assert.equal(config?.reflectionModel, 'nvidia/llama-3.3-nemotron-super-49b-v1.5')
    assert.equal(config?.safetyModel, 'nvidia/llama-3.1-nemoguard-8b-content-safety')
  })
  withEnvironment({ NVIDIA_API_KEY: undefined }, () => assert.equal(getNvidiaAiConfig(), null))
})

test('parses JSON and requires explicit NVIDIA version-3 consent', () => {
  assert.deepEqual(parseJsonObject('{"reflection":"A calm note.","question":null}'), { reflection: 'A calm note.', question: null })
  assert.throws(() => parseJsonObject('not json'), /valid JSON object/)
  assert.equal(hasActiveNvidiaConsent({ ai_processing_consent_at: '2026-07-16T00:00:00Z', ai_processing_consent_revoked_at: null, ai_processing_provider: 'nvidia', ai_consent_version: 3 }), true)
  assert.equal(hasActiveNvidiaConsent({ ai_processing_consent_at: '2026-07-16T00:00:00Z', ai_processing_consent_revoked_at: null, ai_processing_provider: 'groq', ai_consent_version: 2 }), false)
})
\`\`\`

- [ ] **Step 2: Run the test to verify it fails**

Run: \`node --test src/lib/nvidia-ai.test.ts\`

Expected: FAIL because the module does not yet exist.

- [ ] **Step 3: Write the minimal implementation**

\`\`\`ts
import 'server-only'
import OpenAI from 'openai'

export const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1'
export const NVIDIA_CONSENT_VERSION = 3

export function getNvidiaAiConfig() {
  const apiKey = process.env.NVIDIA_API_KEY
  if (!apiKey) return null
  return {
    provider: 'nvidia' as const,
    reflectionModel: process.env.NVIDIA_REFLECTION_MODEL ?? 'nvidia/llama-3.3-nemotron-super-49b-v1.5',
    safetyModel: process.env.NVIDIA_SAFETY_MODEL ?? 'nvidia/llama-3.1-nemoguard-8b-content-safety',
    client: new OpenAI({ apiKey, baseURL: NVIDIA_BASE_URL, maxRetries: 0 }),
  }
}

export function parseJsonObject(content: string | null | undefined) {
  const value: unknown = JSON.parse(content ?? '')
  if (!value || Array.isArray(value) || typeof value !== 'object') throw new Error('Expected a valid JSON object')
  return value as Record<string, unknown>
}
\`\`\`

Add \`hasActiveNvidiaConsent\` beside the config so server actions and UI can share the exact provider/version rule.

- [ ] **Step 4: Run the test to verify it passes**

Run: \`node --test src/lib/nvidia-ai.test.ts\`

Expected: PASS with both tests passing.

- [ ] **Step 5: Commit**

\`\`\`bash
git add src/lib/nvidia-ai.ts src/lib/nvidia-ai.test.ts
git commit -m "feat: add NVIDIA AI client configuration"
\`\`\`

### Task 2: Move both generation flows to NVIDIA

**Files:**
- Modify: \`src/lib/reflections.ts\`
- Modify: \`src/lib/program-review.ts\`
- Test: \`src/lib/nvidia-ai.test.ts\`

**Interfaces:**
- Consumes \`getNvidiaAiConfig\` and \`parseJsonObject\`.
- Produces the existing \`ReflectionResult\` and \`ProgramReviewResult\` types, with NVIDIA provider/model telemetry.

- [ ] **Step 1: Extend the parser test**

\`\`\`ts
test('rejects a JSON array and preserves optional fields', () => {
  assert.throws(() => parseJsonObject('[]'), /valid JSON object/)
  assert.equal(parseJsonObject('{"practice":null}').practice, null)
})
\`\`\`

- [ ] **Step 2: Run the test to verify it fails**

Run: \`node --test src/lib/nvidia-ai.test.ts\`

Expected: FAIL until non-object JSON rejection is implemented.

- [ ] **Step 3: Replace Groq client calls**

\`\`\`ts
const config = getNvidiaAiConfig()
if (!admin || !config) return { status: 'failed', reflection: null, question: null }

const response = await config.client.chat.completions.create({
  model: config.reflectionModel,
  messages,
  temperature: 0.4,
  max_tokens: 300,
}, { timeout: 15_000 })
const parsed = parseJsonObject(response.choices[0]?.message?.content)
\`\`\`

Use the same client for the safety screen and seven-day review. Keep existing prompts, word limits, usage/latency capture, \`generation_token\` guards, retry behavior, and Supabase status updates. Require a JSON object in the prompts but do not rely on provider-specific \`response_format\`.

- [ ] **Step 4: Run focused tests and typecheck**

Run: \`pnpm test; pnpm typecheck\`

Expected: PASS with no TypeScript errors.

- [ ] **Step 5: Commit**

\`\`\`bash
git add src/lib/reflections.ts src/lib/program-review.ts src/lib/nvidia-ai.test.ts
git commit -m "feat: generate journal reflections with NVIDIA"
\`\`\`

### Task 3: Require and disclose NVIDIA consent

**Files:**
- Modify: \`src/app/actions.ts\`
- Modify: \`src/components/onboarding-flow.tsx\`
- Modify: \`src/components/settings-panel.tsx\`
- Modify: \`src/components/program-review-panel.tsx\`

**Interfaces:**
- Consumes \`NVIDIA_CONSENT_VERSION\` and \`hasActiveNvidiaConsent\`.
- Produces profiles with \`ai_processing_provider: 'nvidia'\` and \`ai_consent_version: 3\` only after a user enables reflections.

- [ ] **Step 1: Add the old-Groq consent regression assertion**

\`\`\`ts
test('does not authorize prior Groq consent', () => {
  assert.equal(hasActiveNvidiaConsent({
    ai_processing_consent_at: '2026-07-16T00:00:00Z',
    ai_processing_consent_revoked_at: null,
    ai_processing_provider: 'groq',
    ai_consent_version: 2,
  }), false)
})
\`\`\`

- [ ] **Step 2: Run the test to verify it passes**

Run: \`node --test src/lib/nvidia-ai.test.ts\`

Expected: PASS.

- [ ] **Step 3: Implement the shared consent rule in every gate**

Replace every duplicated \`hasGroqConsent\` check in actions with \`hasActiveNvidiaConsent\`. On onboarding/settings enable, write provider \`nvidia\` and version \`3\`; disabling continues to revoke consent. Change the onboarding and settings disclosure from “Groq” to “NVIDIA”. Existing version-2/Groq profiles must see “Update to NVIDIA AI reflections” and remain unable to send entry text until they choose it.

- [ ] **Step 4: Run tests and typecheck**

Run: \`pnpm test; pnpm typecheck\`

Expected: PASS, including the old-Groq-consent rejection case.

- [ ] **Step 5: Commit**

\`\`\`bash
git add src/app/actions.ts src/components/onboarding-flow.tsx src/components/settings-panel.tsx src/components/program-review-panel.tsx src/lib/nvidia-ai.ts src/lib/nvidia-ai.test.ts
git commit -m "feat: require NVIDIA AI consent"
\`\`\`

### Task 4: Remove Groq remnants and verify the integration

**Files:**
- Rename: \`src/app/auth/test-groq/route.ts\` → \`src/app/auth/test-nvidia/route.ts\`
- Modify: \`package.json\`
- Modify: \`pnpm-lock.yaml\`

**Interfaces:**
- Produces a development test route named for the active provider and no Groq SDK dependency.

- [ ] **Step 1: Add the final provider regression test**

\`\`\`ts
test('never configures Groq as the active provider', () => {
  withEnvironment({ NVIDIA_API_KEY: 'test-key' }, () => {
    assert.notEqual(getNvidiaAiConfig()?.provider, 'groq')
  })
})
\`\`\`

- [ ] **Step 2: Run the test**

Run: \`node --test src/lib/nvidia-ai.test.ts\`

Expected: PASS.

- [ ] **Step 3: Rename the test route and remove the SDK**

Run: \`pnpm remove groq-sdk\`

Move the route folder to \`test-nvidia\`, retaining its request/response behavior. Search \`src\` for \`Groq\` and \`groq-sdk\`; neither may remain.

- [ ] **Step 4: Verify build and live NVIDIA call**

Run: \`pnpm test; pnpm typecheck; pnpm build\`

Expected: all commands pass. Once \`NVIDIA_API_KEY\` is configured, submit a non-sensitive test entry through the renamed local route and verify a \`complete\` result plus \`provider = 'nvidia'\` in \`ai_reflections\`.

- [ ] **Step 5: Commit**

\`\`\`bash
git add src/app/auth/test-nvidia/route.ts src/app/auth/test-groq/route.ts package.json pnpm-lock.yaml src/lib/nvidia-ai.test.ts
git commit -m "chore: remove Groq reflection integration"
\`\`\`

## Self-Review

- Spec coverage: Tasks 1–2 replace both generation paths and retain Supabase lifecycle controls; Task 3 makes processor disclosure/consent accurate; Task 4 removes old integration and verifies build plus a live call.
- Placeholder scan: no TODO/TBD or unspecified tests remain.
- Type consistency: the shared NVIDIA module owns the provider configuration, parser, consent version, and consent predicate; all callers use those interfaces.

