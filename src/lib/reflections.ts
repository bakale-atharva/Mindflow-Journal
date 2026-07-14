import 'server-only'

import OpenAI from 'openai'
import { createAdminClient } from '@/lib/admin'

export const IMMEDIATE_DANGER_NOTICE =
  'MindFlow isn’t equipped to help with immediate danger. If you may act on thoughts of harming yourself or someone else, contact local emergency services now or reach out to someone you trust.'

type ReflectionEntry = { id: string; user_id: string; content: string }

export type ReflectionResult =
  | { status: 'complete'; reflection: string; question: string | null }
  | { status: 'safety_redirect' | 'failed' | 'pending'; reflection: null; question: null }

function wordCount(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length
}

export async function generateReflection(entry: ReflectionEntry, retry = false): Promise<ReflectionResult> {
  const admin = createAdminClient()
  const apiKey = process.env.OPENAI_API_KEY
  if (!admin || !apiKey) return { status: 'failed', reflection: null, question: null }

  const { data: existing } = await admin
    .from('ai_reflections')
    .select('status, reflection, question, attempt_count')
    .eq('entry_id', entry.id)
    .maybeSingle()

  if (existing?.status === 'complete') {
    return { status: 'complete', reflection: existing.reflection ?? '', question: existing.question }
  }
  if (existing?.status === 'safety_redirect') {
    return { status: 'safety_redirect', reflection: null, question: null }
  }
  if (existing?.status === 'pending' || (retry && (existing?.attempt_count ?? 0) >= 2)) {
    return { status: 'pending', reflection: null, question: null }
  }

  const attemptCount = (existing?.attempt_count ?? 0) + 1
  const model = process.env.OPENAI_MODEL ?? 'gpt-5-mini'
  const { error: pendingError } = await admin.from('ai_reflections').upsert({
    entry_id: entry.id,
    user_id: entry.user_id,
    status: 'pending',
    reflection: null,
    question: null,
    model,
    attempt_count: attemptCount,
  })
  if (pendingError) {
    console.error('Reflection state failed:', pendingError.message)
    return { status: 'failed', reflection: null, question: null }
  }

  try {
    const openai = new OpenAI({ apiKey })
    const moderation = await openai.moderations.create({ model: 'omni-moderation-latest', input: entry.content })
    const categories = moderation.results[0]?.categories
    const needsSafetyRedirect = Boolean(
      categories?.['self-harm/intent'] ||
        categories?.['self-harm/instructions'] ||
        categories?.['harassment/threatening']
    )

    if (needsSafetyRedirect) {
      await admin.from('ai_reflections').update({ status: 'safety_redirect', reflection: null, question: null }).eq('entry_id', entry.id)
      return { status: 'safety_redirect', reflection: null, question: null }
    }

    const response = await openai.responses.create({
      model,
      input: [
        {
          role: 'developer',
          content:
            'You write brief reflections for a private journaling product. Reflect only what the writer explicitly expressed. Use calm, plain, non-clinical language. Do not diagnose, label, advise, infer hidden motives, mention policy, or claim certainty. The reflection must be 2–3 sentences and at most 80 words. The optional question must be open, gentle, grounded in the entry, and at most 20 words.',
        },
        { role: 'user', content: entry.content },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'journal_reflection',
          strict: true,
          schema: {
            type: 'object',
            properties: { reflection: { type: 'string' }, question: { type: ['string', 'null'] } },
            required: ['reflection', 'question'],
            additionalProperties: false,
          },
        },
      },
      max_output_tokens: 300,
    })

    const parsed = JSON.parse(response.output_text) as { reflection?: unknown; question?: unknown }
    const reflection = typeof parsed.reflection === 'string' ? parsed.reflection.trim() : ''
    const question = typeof parsed.question === 'string' ? parsed.question.trim() : null
    if (!reflection || wordCount(reflection) > 80 || (question !== null && wordCount(question) > 20)) {
      throw new Error('Reflection output exceeded its content boundary.')
    }

    const { error } = await admin
      .from('ai_reflections')
      .update({ status: 'complete', reflection, question })
      .eq('entry_id', entry.id)
    if (error) throw error
    return { status: 'complete', reflection, question }
  } catch (error) {
    console.error('Reflection generation failed:', error)
    await admin.from('ai_reflections').update({ status: 'failed', reflection: null, question: null }).eq('entry_id', entry.id)
    return { status: 'failed', reflection: null, question: null }
  }
}
