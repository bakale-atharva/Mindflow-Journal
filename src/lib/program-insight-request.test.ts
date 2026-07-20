import test from 'node:test'
import assert from 'node:assert/strict'

import {
  PROGRAM_INSIGHT_GENERATION_TIMEOUT_MS,
  PROGRAM_INSIGHT_COMPLETED_RETENTION_MS,
  PROGRAM_INSIGHT_MAX_ATTEMPTS,
  PROGRAM_INSIGHT_MAX_TOKENS,
  PROGRAM_INSIGHT_REASONING_EFFORT,
} from './program-insight-request.ts'

test('uses a bounded low-latency request budget for the seven-day clarity map', () => {
  assert.equal(PROGRAM_INSIGHT_GENERATION_TIMEOUT_MS, 60_000)
  assert.equal(PROGRAM_INSIGHT_COMPLETED_RETENTION_MS, 1_800_000)
  assert.equal(PROGRAM_INSIGHT_MAX_TOKENS, 1_800)
  assert.equal(PROGRAM_INSIGHT_MAX_ATTEMPTS, 10)
  assert.equal(PROGRAM_INSIGHT_REASONING_EFFORT, 'low')
})
