import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/server'

export type BetaUser = {
  id: string
  email: string
}

export const getBetaUser = cache(async (): Promise<BetaUser | null> => {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user?.email) {
    return null
  }

  const { data: hasAccess, error: accessError } = await supabase.rpc(
    'has_active_beta_access'
  )

  if (accessError || !hasAccess) {
    return null
  }

  return { id: user.id, email: user.email.toLowerCase() }
})

export async function requireBetaUser(): Promise<BetaUser> {
  const user = await getBetaUser()

  if (!user) {
    redirect('/auth/login')
  }

  return user
}

