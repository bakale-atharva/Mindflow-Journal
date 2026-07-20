import {
  isLegacyProgramInsight,
  parseProgramInsight,
  type StoredProgramInsight,
} from './program-insight-schema.ts'

export function getDisplayableInsight(reportJson: unknown): StoredProgramInsight | undefined {
  if (isLegacyProgramInsight(reportJson)) {
    return reportJson
  }

  try {
    return parseProgramInsight(reportJson)
  } catch {
    return undefined
  }
}
