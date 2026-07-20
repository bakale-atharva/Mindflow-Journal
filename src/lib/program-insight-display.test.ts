import assert from 'node:assert/strict'
import test from 'node:test'
import { getDisplayableInsight } from './program-insight-display.ts'

const legacyReport = {
  overview: 'A quieter through-line emerged across the week.',
  recurring_threads: [
    { label: 'Rest', explanation: 'Rest appeared in several entries.', evidence_days: [1, 3] },
    { label: 'Pace', explanation: 'A slower pace appeared in several entries.', evidence_days: [2, 4] },
  ],
  perspective_shifts: [
    { explanation: 'A smaller next step felt more possible.', evidence_days: [4] },
  ],
  clarity_in_practice: [
    { explanation: 'A short pause could make room for choice.', evidence_days: [5] },
  ],
  carry_forward: 'Keep noticing what gives you room to breathe.',
}

const detailedReport = {
  ...legacyReport,
  emotional_patterns: [
    {
      label: 'Tension before decisions',
      context: 'It appeared around competing expectations.',
      explanation: 'The tension softened when the decision became smaller.',
      evidence_days: [2, 6],
    },
    {
      label: 'Relief after pausing',
      context: 'It followed moments of space.',
      explanation: 'A pause seemed to make the next step easier to see.',
      evidence_days: [3, 5],
    },
  ],
  action_plan: [
    {
      kind: 'immediate',
      title: 'Make room for a pause',
      action: 'Try one brief pause before responding today.',
      explanation: 'This can preserve the clarity you noticed.',
      evidence_days: [3],
    },
    {
      kind: 'conversation_or_boundary',
      title: 'Name the pace you need',
      action: 'Consider sharing the pace that feels manageable.',
      explanation: 'It may make expectations easier to hold together.',
      evidence_days: [2, 6],
    },
    {
      kind: 'longer_term',
      title: 'Keep a small reflection ritual',
      action: 'You could reserve a few minutes each week to notice patterns.',
      explanation: 'This may help the thread stay visible over time.',
      evidence_days: [1, 5],
    },
  ],
}

test('keeps a legacy report displayable while identifying absent detailed sections', () => {
  const result = getDisplayableInsight(legacyReport)

  assert.ok(result)
  assert.equal('emotional_patterns' in result, false)
  assert.equal('action_plan' in result, false)
})

test('keeps validated detailed sections available for display', () => {
  const result = getDisplayableInsight(detailedReport)

  assert.ok(result)
  assert.ok('emotional_patterns' in result && 'action_plan' in result)
  assert.equal(result.emotional_patterns[0]?.context, 'It appeared around competing expectations.')
  assert.deepEqual(result.action_plan.map(item => item.kind), [
    'immediate',
    'conversation_or_boundary',
    'longer_term',
  ])
})

test('does not make malformed report data displayable', () => {
  assert.equal(getDisplayableInsight({ ...legacyReport, overview: '' }), undefined)
})
