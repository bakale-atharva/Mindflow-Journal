import 'server-only'

import crypto from 'crypto'
import Groq from 'groq-sdk'
import { createAdminClient } from '@/lib/admin'

export const IMMEDIATE_DANGER_NOTICE =
  'MindFlow isn’t equipped to help with immediate danger. If you may act on thoughts of harming yourself or someone else, contact local emergency services now or reach out to someone you trust.'

type ReflectionEntry = { id: string; user_id: string; content: string }

export type ReflectionResult =
  | { status: 'complete'; reflection: string; question: string | null }
  | { status: 'safety_redirect' | 'failed' | 'pending' | 'not_authorized' | 'consent_required' | 'retry_exhausted'; reflection: null; question: null }

function wordCount(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length
}

function normalizeAndHashContent(content: string): string {
  const normalized = content.replace(/\r\n/g, '\n').trim()
  return crypto.createHash('sha256').update(normalized).digest('hex')
}

export async function generateReflection(entry: ReflectionEntry, retry = false): Promise<ReflectionResult> {
  const admin = createAdminClient()
  const apiKey = process.env.GROQ_API_KEY
  if (!admin || !apiKey) return { status: 'failed', reflection: null, question: null }

  const contentHash = normalizeAndHashContent(entry.content)
  const provider = 'groq'
  const reflectionModel = process.env.GROQ_REFLECTION_MODEL ?? 'openai/gpt-oss-20b'
  const safetyModel = process.env.GROQ_SAFETY_MODEL ?? 'openai/gpt-oss-safeguard-20b'

  const { data: claimResult, error: claimError } = await admin.rpc('claim_reflection_generation', {
    p_entry_id: entry.id,
    p_user_id: entry.user_id,
    p_content_hash: contentHash,
    p_is_retry: retry,
    p_provider: provider,
    p_reflection_model: reflectionModel,
    p_safety_model: safetyModel
  })

  if (claimError) {
    console.error('Reflection claim failed:', claimError.message)
    return { status: 'failed', reflection: null, question: null }
  }

  if (claimResult === 'already_complete') {
    const { data } = await admin.from('ai_reflections').select('reflection, question').eq('entry_id', entry.id).single()
    return { status: 'complete', reflection: data?.reflection ?? '', question: data?.question }
  }

  if (claimResult === 'safety_redirect') return { status: 'safety_redirect', reflection: null, question: null }
  if (claimResult === 'already_pending') return { status: 'pending', reflection: null, question: null }
  if (claimResult === 'retry_required') return { status: 'failed', reflection: null, question: null }
  if (claimResult === 'retry_exhausted') return { status: 'retry_exhausted', reflection: null, question: null }
  if (claimResult === 'not_authorized' || claimResult === 'entry_not_found') return { status: 'failed', reflection: null, question: null }

  // Must be 'claimed' at this point. Time to call Groq.
  
  // We need to fetch the generation token so we can safely update it later
  const { data: pendingData } = await admin.from('ai_reflections').select('generation_token').eq('entry_id', entry.id).single()
  const generationToken = pendingData?.generation_token

  try {
    // 1. Safety Check
    const groq = new Groq({ apiKey, maxRetries: 0 })
    const safetyStart = Date.now()
    const safetyResponse = await groq.chat.completions.create({
      model: safetyModel,
      messages: [
        {
          role: 'system',
          content: 'You are a safety classification model. Output strictly JSON with keys "decision" (either "immediate_danger" or "safe_or_unclear") and "target" (either "self", "other", "both", or "null"). Classify as immediate_danger only for explicit near-term intent or plan to harm self/others.'
        },
        { role: 'user', content: entry.content }
      ],
      response_format: { type: 'json_object' },
      temperature: 0,
      max_tokens: 100,
    }, { timeout: 15000 })
    
    const safetyLatency = Date.now() - safetyStart
    const safetyInputTokens = safetyResponse.usage?.prompt_tokens ?? 0
    const safetyOutputTokens = safetyResponse.usage?.completion_tokens ?? 0
    const safetyContent = JSON.parse(safetyResponse.choices[0]?.message?.content ?? '{}')

    if (safetyContent.decision === 'immediate_danger') {
      await admin.from('ai_reflections')
        .update({ 
          status: 'safety_redirect', 
          safety_latency_ms: safetyLatency, 
          safety_input_tokens: safetyInputTokens,
          safety_output_tokens: safetyOutputTokens 
        })
        .eq('entry_id', entry.id)
        .eq('generation_token', generationToken)
        .eq('status', 'pending')
      return { status: 'safety_redirect', reflection: null, question: null }
    }

    if (safetyContent.decision !== 'safe_or_unclear') {
      throw new Error('Safety model returned unknown classification: ' + safetyContent.decision)
    }

    // 2. Reflection Generation
    const reflectionStart = Date.now()
    const reflectionResponse = await groq.chat.completions.create({
      model: reflectionModel,
      messages: [
        {
          role: 'system',
          content: 'You write brief reflections for a private journaling product. Reflect only what the writer explicitly expressed. Use calm, plain, non-clinical language. Do not diagnose, label, advise, infer hidden motives, mention policy, or claim certainty. The reflection must be 2–3 sentences and at most 80 words. The optional question must be open, gentle, grounded in the entry, and at most 20 words.'
        },
        { role: 'user', content: entry.content }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
      max_tokens: 300,
    }, { timeout: 15000 })

    const reflectionLatency = Date.now() - reflectionStart
    const reflectionInputTokens = reflectionResponse.usage?.prompt_tokens ?? 0
    const reflectionOutputTokens = reflectionResponse.usage?.completion_tokens ?? 0
    const parsed = JSON.parse(reflectionResponse.choices[0]?.message?.content ?? '{}') as { reflection?: unknown; question?: unknown }
    
    const reflection = typeof parsed.reflection === 'string' ? parsed.reflection.trim() : ''
    const question = typeof parsed.question === 'string' ? parsed.question.trim() : null
    
    if (!reflection || wordCount(reflection) > 80 || (question !== null && wordCount(question) > 20)) {
      throw new Error('Reflection output exceeded its content boundary.')
    }

    const { error } = await admin
      .from('ai_reflections')
      .update({ 
        status: 'complete', 
        reflection, 
        question,
        safety_latency_ms: safetyLatency,
        safety_input_tokens: safetyInputTokens,
        safety_output_tokens: safetyOutputTokens,
        reflection_latency_ms: reflectionLatency,
        reflection_input_tokens: reflectionInputTokens,
        reflection_output_tokens: reflectionOutputTokens
      })
      .eq('entry_id', entry.id)
      .eq('generation_token', generationToken)
      .eq('status', 'pending')
      
    if (error) throw error
    return { status: 'complete', reflection, question }
    
  } catch (error: any) {
    console.error('Reflection generation failed:', error)
    await admin.from('ai_reflections')
      .update({ status: 'failed', error_code: 'generation_invalid' })
      .eq('entry_id', entry.id)
      .eq('generation_token', generationToken)
      .eq('status', 'pending')
    return { status: 'failed', reflection: null, question: null }
  }
}
