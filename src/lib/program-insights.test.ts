import test from 'node:test'
import assert from 'node:assert/strict'

import { isOptionalProgramInsightRelationError } from './program-insights.ts'

test('recognizes an insight relation that is absent from the PostgREST schema cache', () => {
  assert.equal(
    isOptionalProgramInsightRelationError({
      code: 'PGRST205',
      message: "Could not find the table 'public.ai_program_insights' in the schema cache",
    }),
    true,
  )
})

test('recognizes a missing program insight relation reported by Postgres', () => {
  assert.equal(
    isOptionalProgramInsightRelationError({
      code: '42P01',
      message: 'relation "public.ai_program_insights" does not exist',
    }),
    true,
  )
})

test('does not hide an insight permission failure', () => {
  assert.equal(
    isOptionalProgramInsightRelationError({
      code: '42501',
      message: 'permission denied for table ai_program_insights',
    }),
    false,
  )
})
