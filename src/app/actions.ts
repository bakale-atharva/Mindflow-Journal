'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function saveEntry(prevState: any, formData: FormData) {
  const content = formData.get('content') as string
  
  if (!content || !content.trim()) {
    return { error: 'Entry content cannot be empty.' }
  }

  const { error } = await supabase
    .from('journal_entries')
    .insert([
      { content: content.trim(), user_id: '00000000-0000-0000-0000-000000000000' }
    ])

  if (error) {
    return { error: 'Failed to save entry: ' + error.message }
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
    // If table doesn't exist yet, we can return empty array to prevent breaking UI
    // 42P01 is Postgres native, PGRST106 is PostgREST schema cache miss
    if (error.code === '42P01' || error.code === 'PGRST106' || error.message.includes('schema cache')) {
       return []
    }
    throw new Error('Failed to fetch entries: ' + error.message)
  }

  return data || []
}
