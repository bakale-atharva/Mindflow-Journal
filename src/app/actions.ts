'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/server'
import { requireBetaUser } from '@/lib/auth'

export type JournalEntry = {
  id: string
  content: string
  mood: number | null
  created_at: string
  updated_at: string
}

export type EntryActionState =
  | { success: true }
  | { success?: false; error: string }
  | null

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function parseMood(value: FormDataEntryValue | null) {
  if (value === null || value === '') return null
  const mood = Number(value)
  return Number.isInteger(mood) && mood >= 1 && mood <= 5 ? mood : undefined
}

export async function saveEntry(
  _previousState: EntryActionState,
  formData: FormData
): Promise<EntryActionState> {
  const user = await requireBetaUser()
  const contentValue = formData.get('content')
  const content = typeof contentValue === 'string' ? contentValue.trim() : ''
  const mood = parseMood(formData.get('mood'))
  const customDateValue = formData.get('created_at')
  const customDate =
    typeof customDateValue === 'string' ? new Date(customDateValue) : null

  if (!content) {
    return { error: 'Write something before saving your entry.' }
  }

  if (content.length > 10_000) {
    return { error: 'Keep this entry under 10,000 characters.' }
  }

  if (mood === undefined) {
    return { error: 'Choose a mood between 1 and 5, or leave it blank.' }
  }

  if (customDate && Number.isNaN(customDate.getTime())) {
    return { error: 'Choose a valid date and time.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('journal_entries').insert({
    content,
    mood,
    user_id: user.id,
    created_at: customDate?.toISOString() ?? new Date().toISOString(),
  })

  if (error) {
    console.error('Journal entry save failed:', error.message)
    return { error: 'Your entry could not be saved. Try again.' }
  }

  revalidatePath('/')
  return { success: true }
}

export async function deleteEntry(id: string) {
  const user = await requireBetaUser()

  if (!UUID_PATTERN.test(id)) {
    throw new Error('Invalid entry.')
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Journal entry delete failed:', error.message)
    throw new Error('The entry could not be deleted.')
  }

  revalidatePath('/')
  return { success: true }
}

export async function getEntries(): Promise<JournalEntry[]> {
  const user = await requireBetaUser()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('journal_entries')
    .select('id, content, mood, created_at, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Journal entry fetch failed:', error.message)
    throw new Error('Your entries could not be loaded.')
  }

  return data ?? []
}
