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

export type LegacyProgramInsight = {
  overview: string
  recurring_threads: Array<InsightItem & { label: string }>
  perspective_shifts: InsightItem[]
  clarity_in_practice: InsightItem[]
  carry_forward: string
}

export type StoredProgramInsight = ProgramInsight | LegacyProgramInsight

type RecordValue = Record<string, unknown>

const DETAILED_KEYS = new Set([
  'overview',
  'recurring_threads',
  'emotional_patterns',
  'perspective_shifts',
  'clarity_in_practice',
  'action_plan',
  'carry_forward',
])

const LEGACY_KEYS = new Set([
  'overview',
  'recurring_threads',
  'perspective_shifts',
  'clarity_in_practice',
  'carry_forward',
])

function asRecord(value: unknown, field: string): RecordValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${field} must be an object`)
  }
  return value as RecordValue
}

function requireExactKeys(value: RecordValue, keys: Set<string>, field: string) {
  for (const key of Object.keys(value)) {
    if (!keys.has(key)) throw new Error(`${field} contains unknown key: ${key}`)
  }
  for (const key of keys) {
    if (!(key in value)) throw new Error(`${field} is missing required key: ${key}`)
  }
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} must be a non-empty string`)
  }
  return value.trim()
}

function parseEvidenceDays(value: unknown, field: string): number[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${field} must be a non-empty array`)
  }
  if (value.some(day => !Number.isInteger(day) || day < 1 || day > 7)) {
    throw new Error(`${field} must contain only day numbers from 1 through 7`)
  }
  if (new Set(value).size !== value.length) {
    throw new Error(`${field} must not contain duplicate days`)
  }
  return value as number[]
}

function parseInsightItem(value: unknown, field: string): InsightItem {
  const item = asRecord(value, field)
  return {
    explanation: requireString(item.explanation, `${field}.explanation`),
    evidence_days: parseEvidenceDays(item.evidence_days, `${field}.evidence_days`),
  }
}

function parseBoundedArray<T>(value: unknown, field: string, min: number, max: number, parseItem: (item: unknown, itemField: string) => T): T[] {
  if (!Array.isArray(value) || value.length < min || value.length > max) {
    throw new Error(`${field} must contain between ${min} and ${max} items`)
  }
  return value.map((item, index) => parseItem(item, `${field}[${index}]`))
}

export function parseProgramInsight(value: unknown): ProgramInsight {
  const report = asRecord(value, 'report')
  requireExactKeys(report, DETAILED_KEYS, 'report')

  const actionPlan = parseBoundedArray<ActionPlanItem>(report.action_plan, 'action_plan', 3, 3, (item, field) => {
    const action = asRecord(item, field)
    requireExactKeys(action, new Set(['kind', 'title', 'action', 'explanation', 'evidence_days']), field)
    if (action.kind !== 'immediate' && action.kind !== 'conversation_or_boundary' && action.kind !== 'longer_term') {
      throw new Error(`${field}.kind must be a supported action plan kind`)
    }
    return {
      kind: action.kind as ActionPlanItem['kind'],
      title: requireString(action.title, `${field}.title`),
      action: requireString(action.action, `${field}.action`),
      ...parseInsightItem(action, field),
    }
  })

  const actionKinds = new Set(actionPlan.map(item => item.kind))
  if (actionKinds.size !== 3 || !actionKinds.has('immediate') || !actionKinds.has('conversation_or_boundary') || !actionKinds.has('longer_term')) {
    throw new Error('action plan must include exactly one item of each required kind')
  }

  return {
    overview: requireString(report.overview, 'overview'),
    recurring_threads: parseBoundedArray(report.recurring_threads, 'recurring_threads', 2, 4, (item, field) => {
      const thread = asRecord(item, field)
      requireExactKeys(thread, new Set(['label', 'explanation', 'evidence_days']), field)
      return {
        label: requireString(thread.label, `${field}.label`),
        ...parseInsightItem(thread, field),
      }
    }),
    emotional_patterns: parseBoundedArray(report.emotional_patterns, 'emotional_patterns', 2, 3, (item, field) => {
      const pattern = asRecord(item, field)
      requireExactKeys(pattern, new Set(['label', 'context', 'explanation', 'evidence_days']), field)
      return {
        label: requireString(pattern.label, `${field}.label`),
        context: requireString(pattern.context, `${field}.context`),
        ...parseInsightItem(pattern, field),
      }
    }),
    perspective_shifts: parseBoundedArray(report.perspective_shifts, 'perspective_shifts', 1, 3, (item, field) => {
      const shift = asRecord(item, field)
      requireExactKeys(shift, new Set(['explanation', 'evidence_days']), field)
      return parseInsightItem(shift, field)
    }),
    clarity_in_practice: parseBoundedArray(report.clarity_in_practice, 'clarity_in_practice', 1, 3, (item, field) => {
      const practice = asRecord(item, field)
      requireExactKeys(practice, new Set(['explanation', 'evidence_days']), field)
      return parseInsightItem(practice, field)
    }),
    action_plan: actionPlan,
    carry_forward: requireString(report.carry_forward, 'carry_forward'),
  }
}

export function parseLegacyProgramInsight(value: unknown): LegacyProgramInsight {
  const report = asRecord(value, 'report')
  requireExactKeys(report, LEGACY_KEYS, 'report')

  return {
    overview: requireString(report.overview, 'overview'),
    recurring_threads: parseBoundedArray(report.recurring_threads, 'recurring_threads', 1, 4, (item, field) => {
      const thread = asRecord(item, field)
      requireExactKeys(thread, new Set(['label', 'explanation', 'evidence_days']), field)
      return {
        label: requireString(thread.label, `${field}.label`),
        ...parseInsightItem(thread, field),
      }
    }),
    perspective_shifts: parseBoundedArray(report.perspective_shifts, 'perspective_shifts', 1, 3, (item, field) => {
      const shift = asRecord(item, field)
      requireExactKeys(shift, new Set(['explanation', 'evidence_days']), field)
      return parseInsightItem(shift, field)
    }),
    clarity_in_practice: parseBoundedArray(report.clarity_in_practice, 'clarity_in_practice', 1, 3, (item, field) => {
      const practice = asRecord(item, field)
      requireExactKeys(practice, new Set(['explanation', 'evidence_days']), field)
      return parseInsightItem(practice, field)
    }),
    carry_forward: requireString(report.carry_forward, 'carry_forward'),
  }
}

export function isLegacyProgramInsight(value: unknown): value is LegacyProgramInsight {
  try {
    parseLegacyProgramInsight(value)
    return true
  } catch {
    return false
  }
}

export function parseStoredProgramInsight(value: unknown): StoredProgramInsight {
  const report = asRecord(value, 'report')
  if (Object.keys(report).some(key => DETAILED_KEYS.has(key)) && 'emotional_patterns' in report) {
    return parseProgramInsight(report)
  }
  return parseLegacyProgramInsight(report)
}
