'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function saveEntry(prevState: any, formData: FormData) {
  const content = formData.get('content') as string
  const mood = formData.get('mood') as string
  const customDate = formData.get('created_at') as string
  
  if (!content || !content.trim()) {
    return { error: 'Entry content cannot be empty.' }
  }

  // Create payload
  const payload: any = { 
    content: content.trim(), 
    user_id: '00000000-0000-0000-0000-000000000000' 
  }
  
  if (mood) payload.mood = mood
  if (customDate) payload.created_at = new Date(customDate).toISOString()

  const { error } = await supabase
    .from('journal_entries')
    .insert([payload])

  if (error) {
    return { error: 'Failed to save entry: ' + error.message }
  }

  revalidatePath('/')
  return { success: true }
}

export async function deleteEntry(id: string) {
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error('Failed to delete entry: ' + error.message)
  }

  revalidatePath('/')
  return { success: true }
}

export async function getEntries() {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    if (error.code === '42P01' || error.code === 'PGRST106' || error.message.includes('schema cache')) {
       return []
    }
    throw new Error('Failed to fetch entries: ' + error.message)
  }

  return data || []
}
