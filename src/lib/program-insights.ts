type ProgramInsightRelationError = {
  code?: string | null
  message?: string | null
}

/**
 * During a staged database rollout, an optional clarity-map relation can be
 * absent from PostgREST's schema cache. The journal must remain available.
 */
export function isOptionalProgramInsightRelationError(
  error: ProgramInsightRelationError,
): boolean {
  return error.code === 'PGRST205' || error.code === '42P01'
}
