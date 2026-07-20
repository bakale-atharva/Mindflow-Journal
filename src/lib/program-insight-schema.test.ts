import test from 'node:test'
import assert from 'node:assert/strict'
import {
  isLegacyProgramInsight,
  parseProgramInsight,
  parseStoredProgramInsight,
} from './program-insight-schema.ts'

const validDetailedReport = {
  overview: 'The week moved between a demanding workload and small moments of rest. You repeatedly noticed how planning ahead made the busy periods feel more manageable. By the end of the week, you were considering a steadier pace for the days ahead.',
  recurring_threads: [
    { label: 'Workload', explanation: 'You described several busy workdays. Planning tasks ahead appeared to make those days feel more manageable.', evidence_days: [1, 3] },
    { label: 'Rest', explanation: 'You mentioned taking short breaks during the week. Those pauses seemed worth keeping in your routine.', evidence_days: [2, 5] },
  ],
  emotional_patterns: [
    { label: 'Overwhelm', context: 'On especially busy workdays', explanation: 'You explicitly described feeling overwhelmed when several tasks arrived at once. The feeling was connected to the workload you recorded.', evidence_days: [1, 3] },
    { label: 'Relief', context: 'After taking a short break', explanation: 'You described feeling relief after stepping away briefly. That change appeared alongside the rest you chose to take.', evidence_days: [2, 5] },
  ],
  perspective_shifts: [
    { explanation: 'You wrote that planning tasks ahead made the next day feel less daunting. This was an explicitly stated change in how you approached the workload.', evidence_days: [3, 6] },
  ],
  clarity_in_practice: [
    { explanation: 'You identified short breaks as helpful during demanding days. You also said you wanted to continue making space for them.', evidence_days: [2, 5] },
  ],
  action_plan: [
    { kind: 'immediate', title: 'Choose one priority', action: 'You could choose one task to begin with tomorrow morning.', explanation: 'This is a small option connected to the planning that you said made busy days more manageable.', evidence_days: [3, 6] },
    { kind: 'conversation_or_boundary', title: 'Share the workload', action: 'If it feels useful, you could ask a teammate which task can wait.', explanation: 'This offers a practical communication option for the workload you described on busy days.', evidence_days: [1, 3] },
    { kind: 'longer_term', title: 'Try a weekly planning note', action: 'You could experiment with a short planning note at the end of each week.', explanation: 'This is an optional longer-view experiment based on your stated benefit from planning ahead.', evidence_days: [3, 6] },
  ],
  carry_forward: 'You noticed that a little planning and a short pause could change the shape of a demanding day. You might keep what feels useful from those observations as the next week begins.',
}

test('accepts a detailed report with emotional patterns and an action plan', () => {
  const report = parseProgramInsight(validDetailedReport)

  assert.equal(report.action_plan.length, 3)
  assert.equal(report.emotional_patterns.length, 2)
})

test('rejects an action plan missing one of its three required kinds', () => {
  const missingLongerTermAction = {
    ...validDetailedReport,
    action_plan: validDetailedReport.action_plan.map(item =>
      item.kind === 'longer_term' ? { ...item, kind: 'immediate' } : item,
    ),
  }

  assert.throws(() => parseProgramInsight(missingLongerTermAction), /action plan/)
})

test('rejects malformed data, out-of-range evidence days, and unknown keys', () => {
  assert.throws(() => parseProgramInsight({ ...validDetailedReport, emotional_patterns: [] }), /emotional_patterns/)
  assert.throws(() => parseProgramInsight({ ...validDetailedReport, recurring_threads: [{ ...validDetailedReport.recurring_threads[0], evidence_days: [8] }, validDetailedReport.recurring_threads[1]] }), /evidence_days/)
  assert.throws(() => parseProgramInsight({ ...validDetailedReport, unexpected: true }), /unknown key/)
})

test('recognizes only the original five-field report shape as legacy', () => {
  const legacyReport = {
    overview: 'A legacy overview.',
    recurring_threads: [{ label: 'Thread', explanation: 'A legacy explanation.', evidence_days: [1] }],
    perspective_shifts: [{ explanation: 'A legacy shift.', evidence_days: [2] }],
    clarity_in_practice: [{ explanation: 'A legacy practice.', evidence_days: [3] }],
    carry_forward: 'A legacy closing.',
  }

  assert.equal(isLegacyProgramInsight(legacyReport), true)
  assert.equal(isLegacyProgramInsight(validDetailedReport), false)
})

test('rejects legacy reports with malformed section fields and evidence days', () => {
  const legacyReport = {
    overview: 'A legacy overview.',
    recurring_threads: [{ label: 'Thread', explanation: 'A legacy explanation.', evidence_days: [1] }],
    perspective_shifts: [{ explanation: 'A legacy shift.', evidence_days: [2] }],
    clarity_in_practice: [{ explanation: 'A legacy practice.', evidence_days: [3] }],
    carry_forward: 'A legacy closing.',
  }

  assert.equal(isLegacyProgramInsight({ ...legacyReport, recurring_threads: [{ ...legacyReport.recurring_threads[0], explanation: '' }] }), false)
  assert.equal(isLegacyProgramInsight({ ...legacyReport, perspective_shifts: [{ ...legacyReport.perspective_shifts[0], evidence_days: [8] }] }), false)
  assert.equal(isLegacyProgramInsight({ ...legacyReport, clarity_in_practice: [{ ...legacyReport.clarity_in_practice[0], evidence_days: [3, 3] }] }), false)
  assert.equal(isLegacyProgramInsight({ ...legacyReport, perspective_shifts: [{ ...legacyReport.perspective_shifts[0], unexpected: true }] }), false)
  assert.equal(isLegacyProgramInsight({ ...legacyReport, clarity_in_practice: [{ ...legacyReport.clarity_in_practice[0], unexpected: true }] }), false)
})

test('normalizes only validated detailed or legacy stored reports', () => {
  const legacyReport = {
    overview: 'A legacy overview.',
    recurring_threads: [{ label: 'Thread', explanation: 'A legacy explanation.', evidence_days: [1] }],
    perspective_shifts: [{ explanation: 'A legacy shift.', evidence_days: [2] }],
    clarity_in_practice: [{ explanation: 'A legacy practice.', evidence_days: [3] }],
    carry_forward: 'A legacy closing.',
  }

  assert.equal(parseProgramInsight(validDetailedReport).emotional_patterns.length, 2)
  assert.equal('emotional_patterns' in parseStoredProgramInsight(legacyReport), false)
  assert.throws(() => parseStoredProgramInsight({ ...validDetailedReport, action_plan: [] }), /action_plan/)
})
