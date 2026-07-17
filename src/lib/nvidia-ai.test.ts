import test from 'node:test'
import assert from 'node:assert/strict'
import { getNvidiaAiConfig, parseJsonObject, hasActiveNvidiaConsent } from './nvidia-ai-config.ts'

function withEnvironment(env: Record<string, string | undefined>, cb: () => void) {
  const original = { ...process.env }
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
  try {
    cb()
  } finally {
    for (const key of Object.keys(env)) delete process.env[key]
    for (const [key, value] of Object.entries(original)) {
      if (value !== undefined) process.env[key] = value
    }
  }
}

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
  assert.throws(() => parseJsonObject('[]'), /valid JSON object/)
  assert.equal(parseJsonObject('{"practice":null}').practice, null)
  assert.equal(hasActiveNvidiaConsent({ ai_processing_consent_at: '2026-07-16T00:00:00Z', ai_processing_consent_revoked_at: null, ai_processing_provider: 'nvidia', ai_consent_version: 3 }), true)
  assert.equal(hasActiveNvidiaConsent({ ai_processing_consent_at: '2026-07-16T00:00:00Z', ai_processing_consent_revoked_at: null, ai_processing_provider: 'groq', ai_consent_version: 2 }), false)
})
