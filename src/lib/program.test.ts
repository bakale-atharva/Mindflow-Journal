import test from 'node:test'
import assert from 'node:assert/strict'
import { buildProgramDays, DAY_MS, getProgramDay, getUnlockTime, isCompletionWindowOpen } from './program.ts'

const start = '2026-07-01T10:00:00.000Z'

test('Day 1 is available immediately and Day 2 begins at exactly 24 hours', () => {
  assert.equal(getProgramDay(start, start), 1)
  assert.equal(getProgramDay(start, new Date(new Date(start).getTime() + DAY_MS - 1)), 1)
  assert.equal(getProgramDay(start, new Date(new Date(start).getTime() + DAY_MS)), 2)
})

test('the current day caps at Day 7', () => {
  assert.equal(getProgramDay(start, '2026-08-01T10:00:00.000Z'), 7)
})

test('previously unlocked missed days stay available and future days stay locked', () => {
  const now = new Date(new Date(start).getTime() + DAY_MS * 2)
  const days = buildProgramDays(start, [{ id: 'entry-1', program_day: 1 }], now)
  assert.equal(days[0].state, 'complete')
  assert.equal(days[1].state, 'available')
  assert.equal(days[2].state, 'current')
  assert.equal(days[3].state, 'locked')
})

test('unlock timestamps derive from the immutable start instant', () => {
  assert.equal(getUnlockTime(start, 3).toISOString(), '2026-07-03T10:00:00.000Z')
})

test('the completion window closes at exactly ten days', () => {
  assert.equal(isCompletionWindowOpen(start, new Date(new Date(start).getTime() + DAY_MS * 10 - 1)), true)
  assert.equal(isCompletionWindowOpen(start, new Date(new Date(start).getTime() + DAY_MS * 10)), false)
})
