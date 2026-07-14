'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { after } from 'next/server'
import { createAdminClient } from '@/lib/admin'
import { requireBetaUser } from '@/lib/auth'
import { recordProductEvent } from '@/lib/events'
import {
  buildProgramDays,
  getProgramDay,
  getPrompt,
  getUnlockTime,
  isCompletionWindowOpen,
  isProgramComplete,
  PROGRAM_LENGTH,
  type ProgramDay,
  type ProgramDayView,
} from '@/lib/program'
import { generateReflection, type ReflectionResult } from '@/lib/reflections'
import { createClient } from '@/lib/server'

export type ReflectionStatus = 'pending' | 'complete' | 'failed' | 'safety_redirect'

export type AIReflection = {
  entry_id: string
  reflection: string | null
  question: string | null
  status: ReflectionStatus
  attempt_count: number
  created_at: string
  updated_at: string
}

export type JournalEntry = {
  id: string
  user_id: string
  program_day: number
  prompt_id: string
  content: string
  mood: number | null
  created_at: string
  updated_at: string
  reflection: AIReflection | null
}

export type ProfileState = {
  email: string
  onboarding_completed_at: string | null
  program_started_at: string | null
  is_18_or_older: boolean
  ai_processing_consent_at: string | null
}

export type DashboardData = {
  profile: ProfileState
  entries: JournalEntry[]
  days: ProgramDayView[]
  currentDay: ProgramDay | null
  nextUnlockAt: string | null
  completed: boolean
  completionWindowOpen: boolean
}

export type EntryActionState =
  | {
      status: 'success'
      entryId: string
      reflection: ReflectionResult | { status: 'not_requested'; reflection: null; question: null }
    }
  | { status: 'error'; error: string }
  | null

export type BasicActionState = { status: 'success'; message: string } | { status: 'error'; error: string } | null

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function parseMood(value: FormDataEntryValue | null) {
  if (value === null || value === '') return null
  const mood = Number(value)
  return Number.isInteger(mood) && mood >= 1 && mood <= 5 ? mood : undefined
}

export async function getDashboard(): Promise<DashboardData> {
  const user = await requireBetaUser()
  const supabase = await createClient()
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('email, onboarding_completed_at, program_started_at, is_18_or_older, ai_processing_consent_at')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile) throw new Error('Your MindFlow profile could not be loaded.')

  const [entriesResult, reflectionsResult] = await Promise.all([
    supabase
      .from('journal_entries')
      .select('id, user_id, program_day, prompt_id, content, mood, created_at, updated_at')
      .eq('user_id', user.id)
      .not('program_day', 'is', null)
      .order('program_day', { ascending: true }),
    supabase
      .from('ai_reflections')
      .select('entry_id, reflection, question, status, attempt_count, created_at, updated_at')
      .eq('user_id', user.id),
  ])

  if (entriesResult.error) throw new Error('Your journal entries could not be loaded.')
  if (reflectionsResult.error) throw new Error('Your reflections could not be loaded.')

  const reflectionByEntry = new Map(
    (reflectionsResult.data ?? []).map((reflection) => [reflection.entry_id, reflection as AIReflection])
  )
  const entries = (entriesResult.data ?? []).map((entry) => ({
    ...entry,
    program_day: Number(entry.program_day),
    prompt_id: entry.prompt_id ?? getPrompt(Number(entry.program_day))?.id ?? '',
    reflection: reflectionByEntry.get(entry.id) ?? null,
  })) as JournalEntry[]

  const startedAt = profile.program_started_at
  const currentDay = startedAt ? getProgramDay(startedAt) : null
  const days = startedAt ? buildProgramDays(startedAt, entries) : []
  const completed = startedAt ? isProgramComplete(startedAt, entries) : false

  return {
    profile,
    entries,
    days,
    currentDay,
    nextUnlockAt:
      startedAt && currentDay && currentDay < PROGRAM_LENGTH
        ? getUnlockTime(startedAt, (currentDay + 1) as ProgramDay).toISOString()
        : null,
    completed,
    completionWindowOpen: startedAt ? isCompletionWindowOpen(startedAt) : true,
  }
}

export async function completeOnboarding(_previous: BasicActionState, formData: FormData): Promise<BasicActionState> {
  const user = await requireBetaUser()
  const isAdult = formData.get('is_18_or_older') === 'yes'
  const consentChoice = formData.get('ai_consent')

  if (!isAdult) return { status: 'error', error: 'You must be at least 18 to join the founding beta.' }
  if (consentChoice !== 'yes' && consentChoice !== 'no') {
    return { status: 'error', error: 'Choose whether you want AI reflections.' }
  }

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('program_started_at')
    .eq('user_id', user.id)
    .single()
  if (profile?.program_started_at) redirect('/')

  const now = new Date().toISOString()
  const { error } = await supabase
    .from('profiles')
    .update({
      is_18_or_older: true,
      ai_processing_consent_at: consentChoice === 'yes' ? now : null,
      onboarding_completed_at: now,
      program_started_at: now,
    })
    .eq('user_id', user.id)

  if (error) return { status: 'error', error: 'Your program could not be started. Try again.' }
  after(() => recordProductEvent(user.id, 'program_started'))
  redirect('/')
}

export async function saveEntry(_previous: EntryActionState, formData: FormData): Promise<EntryActionState> {
  const user = await requireBetaUser()
  const contentValue = formData.get('content')
  const content = typeof contentValue === 'string' ? contentValue.trim() : ''
  const day = Number(formData.get('program_day'))
  const prompt = getPrompt(day)
  const mood = parseMood(formData.get('mood'))

  if (!content) return { status: 'error', error: 'Write something before saving your entry.' }
  if (content.length > 10_000) return { status: 'error', error: 'Keep this entry under 10,000 characters.' }
  if (!prompt) return { status: 'error', error: 'Choose an available program day.' }
  if (mood === undefined) return { status: 'error', error: 'Choose a mood from 1 to 5, or leave it blank.' }

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('program_started_at, onboarding_completed_at, ai_processing_consent_at')
    .eq('user_id', user.id)
    .single()

  if (!profile?.program_started_at || !profile.onboarding_completed_at) {
    return { status: 'error', error: 'Start your seven-day program before writing an entry.' }
  }
  if (day > getProgramDay(profile.program_started_at)) {
    return { status: 'error', error: 'This day has not unlocked yet.' }
  }

  const { data: existing } = await supabase
    .from('journal_entries')
    .select('id')
    .eq('user_id', user.id)
    .eq('program_day', day)
    .maybeSingle()

  const write = existing
    ? supabase
        .from('journal_entries')
        .update({ content, mood, prompt_id: prompt.id })
        .eq('id', existing.id)
        .eq('user_id', user.id)
        .select('id, user_id, content')
        .single()
    : supabase
        .from('journal_entries')
        .insert({ user_id: user.id, program_day: day, prompt_id: prompt.id, content, mood })
        .select('id, user_id, content')
        .single()

  const { data: entry, error } = await write
  if (error || !entry) return { status: 'error', error: 'Your entry could not be saved. Try again.' }

  after(() => recordProductEvent(user.id, 'entry_saved', { program_day: day }))
  if (!existing && day === 2) after(() => recordProductEvent(user.id, 'day_2_return'))

  const { data: completionEntries } = await supabase
    .from('journal_entries')
    .select('program_day, created_at')
    .eq('user_id', user.id)
    .not('program_day', 'is', null)
  if (!existing && isProgramComplete(profile.program_started_at, completionEntries ?? [])) {
    after(() => recordProductEvent(user.id, 'program_completed'))
  }

  const reflection = profile.ai_processing_consent_at
    ? await generateReflection(entry)
    : { status: 'not_requested' as const, reflection: null, question: null }

  revalidatePath('/')
  revalidatePath('/journal')
  revalidatePath(`/entry/${entry.id}`)
  return { status: 'success', entryId: entry.id, reflection }
}

export async function retryReflection(_previous: BasicActionState, formData: FormData): Promise<BasicActionState> {
  const user = await requireBetaUser()
  const id = String(formData.get('entry_id') ?? '')
  if (!UUID_PATTERN.test(id)) return { status: 'error', error: 'This entry could not be found.' }

  const supabase = await createClient()
  const [{ data: entry }, { data: profile }] = await Promise.all([
    supabase.from('journal_entries').select('id, user_id, content').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('profiles').select('ai_processing_consent_at').eq('user_id', user.id).single(),
  ])
  if (!entry) return { status: 'error', error: 'This entry could not be found.' }
  if (!profile?.ai_processing_consent_at) return { status: 'error', error: 'Turn on AI reflections in Settings before retrying.' }

  const result = await generateReflection(entry, true)
  revalidatePath('/')
  revalidatePath('/journal')
  revalidatePath(`/entry/${id}`)
  return result.status === 'failed'
    ? { status: 'error', error: 'The reflection could not be generated. Your entry is still saved.' }
    : { status: 'success', message: result.status === 'pending' ? 'A retry is already in progress.' : 'Reflection ready.' }
}

export async function deleteEntry(_previous: BasicActionState, formData: FormData): Promise<BasicActionState> {
  const user = await requireBetaUser()
  const id = String(formData.get('entry_id') ?? '')
  if (!UUID_PATTERN.test(id)) return { status: 'error', error: 'This entry could not be found.' }
  const supabase = await createClient()
  const { error } = await supabase.from('journal_entries').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { status: 'error', error: 'The entry could not be deleted.' }
  revalidatePath('/')
  revalidatePath('/journal')
  return { status: 'success', message: 'Entry deleted.' }
}

export async function updateAiConsent(_previous: BasicActionState, formData: FormData): Promise<BasicActionState> {
  const user = await requireBetaUser()
  const enabled = formData.get('ai_consent') === 'yes'
  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ ai_processing_consent_at: enabled ? new Date().toISOString() : null })
    .eq('user_id', user.id)
  if (error) return { status: 'error', error: 'Your reflection preference could not be updated.' }
  revalidatePath('/settings')
  return { status: 'success', message: enabled ? 'AI reflections are on.' : 'AI reflections are off.' }
}

export async function deleteAccount(_previous: BasicActionState, formData: FormData): Promise<BasicActionState> {
  const user = await requireBetaUser()
  if (formData.get('confirmation') !== 'DELETE') {
    return { status: 'error', error: 'Type DELETE to confirm permanent account deletion.' }
  }
  const admin = createAdminClient()
  if (!admin) return { status: 'error', error: 'Account deletion is not configured. Contact support.' }
  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) return { status: 'error', error: 'Your account could not be deleted. Try again.' }
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}
