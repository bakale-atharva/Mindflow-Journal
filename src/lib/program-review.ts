import 'server-only'

import crypto from 'crypto'
import type { JournalEntry, ProgramReviewStatus } from '@/app/actions'
import { createAdminClient } from '@/lib/admin'
import { getNvidiaAiConfig } from '@/lib/nvidia-ai'
import { parseJsonObject } from '@/lib/nvidia-ai-config'

export type ProgramReviewResult =
  | { status: 'complete'; reflection: string; practice: string | null }
  | { status: 'safety_redirect' | 'failed' | 'pending' | 'not_authorized' | 'consent_required' | 'retry_exhausted'; reflection: null; practice: null }

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
  if (!admin || !config) return { status: 'failed', reflection: null, practice: null }

  const provider = config.provider
  const reflectionModel = config.reflectionModel
  const safetyModel = config.safetyModel

  // Mark as pending or increment retry count
  const { data: existing } = await admin
    .from('ai_program_reviews')
    .select('id, attempt_count, status')
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    if (existing.status === 'pending') return { status: 'pending', reflection: null, practice: null }
    if (!isRetry && existing.status === 'complete') {
      const { data: completeData } = await admin.from('ai_program_reviews').select('reflection, practice').eq('id', existing.id).single()
      return { status: 'complete', reflection: completeData?.reflection ?? '', practice: completeData?.practice ?? null }
    }
    if (isRetry && existing.attempt_count >= 3) return { status: 'retry_exhausted', reflection: null, practice: null }
    
    await admin.from('ai_program_reviews').update({
      status: 'pending',
      source_hash: sourceHash,
      attempt_count: isRetry ? existing.attempt_count + 1 : 1,
      provider,
      model: reflectionModel,
      safety_flags: null,
      reflection: null,
      practice: null,
    }).eq('id', existing.id)
  } else {
    await admin.from('ai_program_reviews').insert({
      user_id: userId,
      source_hash: sourceHash,
      status: 'pending',
      provider,
      model: reflectionModel,
      attempt_count: 1
    })
  }

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
    }, { timeout: 15000 })
    
    const safetyContent = parseJsonObject(safetyResponse.choices[0]?.message?.content)

    if (safetyContent.decision === 'immediate_danger') {
      await admin.from('ai_program_reviews')
        .update({ status: 'safety_redirect', safety_flags: safetyContent })
        .eq('user_id', userId)
      return { status: 'safety_redirect', reflection: null, practice: null }
    }

    // 2. Generation
    const reflectionResponse = await config.client.chat.completions.create({
      model: reflectionModel,
      messages: [
        {
          role: 'system',
          content: 'You write a brief seven-day reflection for a private journaling product. Read the seven provided entries. Write a calm synthesis of explicit themes across the entries. Write one optional, concrete practice grounded in the user\'s stated Day 6 action or Day 7 carry-forward. Do not gamify, assess, diagnose, label, advise, or score. Output strictly JSON with keys "reflection" and "practice". "practice" can be null.'
        },
        { role: 'user', content: combinedContent }
      ],
      temperature: 0.4,
      max_tokens: 500,
    }, { timeout: 20000 })

    const parsed = parseJsonObject(reflectionResponse.choices[0]?.message?.content)
    const reflection = typeof parsed.reflection === 'string' ? parsed.reflection.trim() : ''
    const practice = typeof parsed.practice === 'string' ? parsed.practice.trim() : null

    if (!reflection) {
      throw new Error('Missing reflection content')
    }

    await admin.from('ai_program_reviews')
      .update({ status: 'complete', reflection, practice })
      .eq('user_id', userId)

    return { status: 'complete', reflection, practice }
    
  } catch (error) {
    console.error('Program review generation failed:', error)
    await admin.from('ai_program_reviews')
      .update({ status: 'failed' })
      .eq('user_id', userId)
    return { status: 'failed', reflection: null, practice: null }
  }
}
