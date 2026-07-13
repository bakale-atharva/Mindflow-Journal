import { NextResponse } from 'next/server'
import { createClient } from '@/lib/server'

function loginRedirect(requestUrl: URL, error: string) {
  const url = new URL('/auth/login', requestUrl.origin)
  url.searchParams.set('error', error)
  return NextResponse.redirect(url)
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (!code) {
    return loginRedirect(requestUrl, 'invalid-link')
  }

  const supabase = await createClient()
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    return loginRedirect(requestUrl, 'expired-link')
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user?.email) {
    await supabase.auth.signOut()
    return loginRedirect(requestUrl, 'invalid-session')
  }

  const { data: hasAccess, error: accessError } = await supabase.rpc(
    'has_active_beta_access'
  )

  if (accessError || !hasAccess) {
    await supabase.auth.signOut()
    return loginRedirect(requestUrl, 'access-required')
  }

  const { error: profileError } = await supabase.from('profiles').upsert(
    {
      user_id: user.id,
      email: user.email.trim().toLowerCase(),
    },
    { onConflict: 'user_id' }
  )

  if (profileError) {
    console.error('Profile initialization failed:', profileError.message)
    await supabase.auth.signOut()
    return loginRedirect(requestUrl, 'profile-error')
  }

  return NextResponse.redirect(new URL('/', requestUrl.origin))
}

