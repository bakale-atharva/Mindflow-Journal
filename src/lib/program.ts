export const DAY_MS = 24 * 60 * 60 * 1000
export const PROGRAM_LENGTH = 7

export const PROGRAM_PROMPTS = [
  { day: 1, id: 'day-1-mental-load', theme: 'Mental load', prompt: 'What thoughts are taking up the most space in your mind today?' },
  { day: 2, id: 'day-2-urgency', theme: 'Urgency', prompt: 'What feels urgent, and what can safely wait?' },
  { day: 3, id: 'day-3-control', theme: 'Control', prompt: 'Which parts of this situation are within your control?' },
  { day: 4, id: 'day-4-recurrence', theme: 'Recurrence', prompt: 'What thought or concern keeps returning, and when does it usually appear?' },
  { day: 5, id: 'day-5-perspective', theme: 'Perspective', prompt: 'What might you say to a friend carrying the same concern?' },
  { day: 6, id: 'day-6-movement', theme: 'Movement', prompt: 'What is one small action that would create a little more clarity?' },
  { day: 7, id: 'day-7-review', theme: 'Review', prompt: 'Looking back, what became clearer, and what do you want to carry forward?' },
] as const

export type ProgramDay = (typeof PROGRAM_PROMPTS)[number]['day']
export type PromptId = (typeof PROGRAM_PROMPTS)[number]['id']
export type ProgramPrompt = (typeof PROGRAM_PROMPTS)[number]
export type ProgramDayState = 'complete' | 'available' | 'current' | 'locked'

export type ProgramDayView = ProgramPrompt & {
  state: ProgramDayState
  unlocksAt: string
  entryId: string | null
}

export function getProgramDay(programStartedAt: string | Date, now: string | Date = new Date()): ProgramDay {
  const elapsed = Math.max(0, new Date(now).getTime() - new Date(programStartedAt).getTime())
  return Math.min(PROGRAM_LENGTH, Math.floor(elapsed / DAY_MS) + 1) as ProgramDay
}

export function getUnlockTime(programStartedAt: string | Date, day: ProgramDay) {
  return new Date(new Date(programStartedAt).getTime() + (day - 1) * DAY_MS)
}

export function isProgramComplete(
  entries: ReadonlyArray<{ program_day: number; created_at: string | Date }>
) {
  if (entries.length !== PROGRAM_LENGTH) return false

  const submittedDays = new Set(entries.map((entry) => entry.program_day))
  if (submittedDays.size !== PROGRAM_LENGTH || PROGRAM_PROMPTS.some(({ day }) => !submittedDays.has(day))) {
    return false
  }

  return true
}

export function buildProgramDays(
  programStartedAt: string,
  entries: ReadonlyArray<{ id: string; program_day: number }>,
  now: string | Date = new Date()
): ProgramDayView[] {
  const currentDay = getProgramDay(programStartedAt, now)
  const entryByDay = new Map(entries.map((entry) => [entry.program_day, entry.id]))

  return PROGRAM_PROMPTS.map((prompt) => {
    const entryId = entryByDay.get(prompt.day) ?? null
    let state: ProgramDayState = 'locked'
    if (entryId) state = 'complete'
    else if (prompt.day === currentDay) state = 'current'
    else if (prompt.day < currentDay) state = 'available'
    return { ...prompt, state, entryId, unlocksAt: getUnlockTime(programStartedAt, prompt.day).toISOString() }
  })
}

export function getPrompt(day: number): ProgramPrompt | null {
  return PROGRAM_PROMPTS.find((prompt) => prompt.day === day) ?? null
}
