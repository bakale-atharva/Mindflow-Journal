import 'server-only'

import crypto from 'crypto'
import type { JournalEntry, ProgramReviewStatus } from '@/app/actions'
import { createAdminClient } from '@/lib/admin'
import { getNvidiaAiConfig } from '@/lib/nvidia-ai'
import { parseJsonObject } from '@/lib/nvidia-ai-config'
import { parseProgramInsight, parseStoredProgramInsight } from '@/lib/program-insight-schema'
export type { LegacyProgramInsight, ProgramInsight, StoredProgramInsight } from '@/lib/program-insight-schema'
import type { ProgramInsight, StoredProgramInsight } from '@/lib/program-insight-schema'
import {
  PROGRAM_INSIGHT_GENERATION_TIMEOUT_MS,
  PROGRAM_INSIGHT_COMPLETED_RETENTION_MS,
  PROGRAM_INSIGHT_MAX_ATTEMPTS,
  PROGRAM_INSIGHT_MAX_TOKENS,
  PROGRAM_INSIGHT_REASONING_EFFORT,
} from '@/lib/program-insight-request'

export type ProgramReviewResult =
  | { status: 'complete'; insight: StoredProgramInsight }
  | { status: 'safety_redirect' | 'failed' | 'pending' | 'not_authorized' | 'consent_required' | 'retry_exhausted'; insight: null }

export function hashJournalEntries(entries: JournalEntry[]): string {
  // Sort entries to ensure deterministic ordering by day 1 to 7
  const sorted = [...entries].sort((a, b) => a.program_day - b.program_day)
  const payload = sorted.map(e => `${e.program_day}:${e.content.trim()}`).join('|||')
  return crypto.createHash('sha256').update(payload).digest('hex')
}

export async function generateProgramReviewHelper(
  userId: string,
  entries: JournalEntry[],
  sourceHash: string,
  isRetry: boolean = false
): Promise<ProgramReviewResult> {
  const admin = createAdminClient()
  const config = getNvidiaAiConfig()
  if (!admin || !config) return { status: 'failed', insight: null }

  const provider = config.provider
  const reflectionModel = config.reflectionModel
  const safetyModel = config.safetyModel

  // Mark as pending or increment retry count
  const { data: claimResult, error: claimError } = await admin.rpc('claim_program_insight_generation', {
    p_user_id: userId,
    p_source_hash: sourceHash,
    p_is_retry: isRetry,
    p_provider: provider,
    p_model: reflectionModel
  })

  if (claimError) {
    console.error('Insight claim failed:', claimError.message)
    return { status: 'failed', insight: null }
  }

  if (claimResult === 'already_complete') {
    const { data: completeData } = await admin.from('ai_program_insights').select('report_json').eq('user_id', userId).single()
    try {
      return { status: 'complete', insight: parseStoredProgramInsight(completeData?.report_json) }
    } catch (error) {
      console.error('Stored program insight is invalid:', error)
      return { status: 'failed', insight: null }
    }
  }

  if (claimResult === 'safety_redirect') return { status: 'safety_redirect', insight: null }
  if (claimResult === 'already_pending') return { status: 'pending', insight: null }
  if (claimResult === 'retry_required') return { status: 'failed', insight: null }
  if (claimResult === 'retry_exhausted') return { status: 'retry_exhausted', insight: null }

  // Must be 'claimed' at this point. Time to call NVIDIA.
  const { data: pendingData } = await admin.from('ai_program_insights').select('generation_token').eq('user_id', userId).single()
  const generationToken = pendingData?.generation_token

  // Combine entries for NVIDIA
  const combinedContent = [...entries]
    .sort((a, b) => a.program_day - b.program_day)
    .map(e => `Day ${e.program_day}:\n${e.content}`)
    .join('\n\n')

  try {
    // 1. Safety Check
    const safetyResponse = await config.client.chat.completions.create({
      model: safetyModel,
      messages: [
        {
          role: 'system',
          content: 'You are a safety classification model. Output strictly JSON with keys "decision" (either "immediate_danger" or "safe_or_unclear") and "target" (either "self", "other", "both", or "null"). Classify as immediate_danger only for explicit near-term intent or plan to harm self/others.'
        },
        { role: 'user', content: combinedContent }
      ],
      temperature: 0,
      max_tokens: 100,
      response_format: { type: 'json_object' },
    }, { timeout: 15000 })
    
    const safetyContent = parseJsonObject(safetyResponse.choices[0]?.message?.content)

    if (safetyContent.decision === 'immediate_danger') {
      await admin.from('ai_program_insights')
        .update({ status: 'safety_redirect' })
        .eq('user_id', userId)
        .eq('generation_token', generationToken)
        .eq('status', 'pending')
      return { status: 'safety_redirect', insight: null }
    }

    // 2. Generation
    const systemPrompt = `You create a private 7-day clarity map. Read the seven entries. Act like a supportive friend who listens.
Generate strict JSON matching this structure:
{
  "overview": "A calm, empathetic synthesis (3-4 sentences).",
  "recurring_threads": [{"label": "String", "explanation": "String", "evidence_days": [Numbers]}],
  "emotional_patterns": [{"label": "String", "context": "String", "explanation": "String", "evidence_days": [Numbers]}],
  "perspective_shifts": [{"explanation": "String", "evidence_days": [Numbers]}],
  "clarity_in_practice": [{"explanation": "String", "evidence_days": [Numbers]}],
  "action_plan": [{"kind": "immediate | conversation_or_boundary | longer_term", "title": "String", "action": "String", "explanation": "String", "evidence_days": [Numbers]}],
  "carry_forward": "A short, supportive closing (2-3 sentences)."
}
Rules:
- Include 2-4 recurring threads, 2-3 emotional patterns, 1-3 perspective shifts, and 1-3 clarity-in-practice observations. Each item explanation is 2-3 sentences.
- Include exactly three action-plan items: one "immediate", one "conversation_or_boundary", and one "longer_term". Give each a concise title, a concrete optional action, a 2-3 sentence rationale, and evidence days.
- Use only explicitly expressed details.
- Do not diagnose, label conditions, score moods, infer hidden motives, prescribe treatment, make crisis-support claims, or claim improvement. Frame every action as an optional non-clinical choice, never a command.`

    const reflectionResponse = await config.client.chat.completions.create({
      model: reflectionModel,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        { role: 'user', content: combinedContent }
      ],
      temperature: 0.4,
      max_tokens: PROGRAM_INSIGHT_MAX_TOKENS,
      reasoning_effort: PROGRAM_INSIGHT_REASONING_EFFORT,
      response_format: { type: 'json_object' },
    }, { timeout: PROGRAM_INSIGHT_GENERATION_TIMEOUT_MS })

    const reflectionChoice = reflectionResponse.choices[0]
    if (reflectionChoice?.finish_reason === 'length') {
      throw new Error('Insight response was truncated. Please retry.')
    }

    const parsed = parseJsonObject(reflectionChoice?.message?.content)

    const insight = parseProgramInsight(parsed)

    const { error } = await admin.from('ai_program_insights')
      .update({
        status: 'complete',
        report_json: insight,
        expires_at: new Date(Date.now() + PROGRAM_INSIGHT_COMPLETED_RETENTION_MS).toISOString(),
      })
      .eq('user_id', userId)
      .eq('generation_token', generationToken)
      .eq('status', 'pending')

    if (error) throw error

    return { status: 'complete', insight }
    
  } catch (error) {
    console.error('Program insight generation failed:', error)
    await admin.from('ai_program_insights')
      .update({ status: 'failed', error_code: 'generation_failed' })
      .eq('user_id', userId)
      .eq('generation_token', generationToken)
      .eq('status', 'pending')
    return { status: 'failed', insight: null }
  }
}
