export const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1'
export const NVIDIA_CONSENT_VERSION = 4

export type AiConsentProfile = {
  ai_processing_consent_at: string | null
  ai_processing_consent_revoked_at: string | null
  ai_processing_provider: string | null
  ai_consent_version: number | null
}

export type NvidiaAiConfig = {
  provider: 'nvidia'
  reflectionModel: string
  safetyModel: string
}

export function getNvidiaAiConfig(env: NodeJS.ProcessEnv = process.env): NvidiaAiConfig | null {
  if (!env.NVIDIA_API_KEY) return null

  return {
    provider: 'nvidia',
    reflectionModel: env.NVIDIA_REFLECTION_MODEL ?? 'openai/gpt-oss-20b',
    safetyModel: env.NVIDIA_SAFETY_MODEL ?? 'nvidia/llama-3.1-nemoguard-8b-content-safety',
  }
}

export function parseJsonObject(content: string | null | undefined): Record<string, unknown> {
  let value: unknown
  try {
    const trimmed = (content ?? '').trim()
    const json = trimmed
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/, '')
    value = JSON.parse(json)
  } catch {
    throw new Error('Expected a valid JSON object')
  }

  if (!value || Array.isArray(value) || typeof value !== 'object') {
    throw new Error('Expected a valid JSON object')
  }

  return value as Record<string, unknown>
}

export function hasActiveNvidiaConsent(profile: AiConsentProfile): boolean {
  return Boolean(profile.ai_processing_consent_at) &&
    profile.ai_processing_consent_revoked_at === null &&
    profile.ai_processing_provider === 'nvidia' &&
    profile.ai_consent_version === NVIDIA_CONSENT_VERSION
}
