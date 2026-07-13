import { redirect } from 'next/navigation'
import { LockKeyhole } from 'lucide-react'
import { MagicLinkForm } from '@/components/magic-link-form'
import { getBetaUser } from '@/lib/auth'

const AUTH_ERRORS: Record<string, string> = {
  'invalid-link': 'This sign-in link is incomplete. Request a new one.',
  'expired-link': 'This sign-in link has expired or was already used. Request a new one.',
  'invalid-session': 'Your session could not be verified. Request a new sign-in link.',
  'access-required': 'This email no longer has active founding access.',
  'profile-error': 'Your private workspace could not be prepared. Try signing in again.',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const user = await getBetaUser()
  if (user) redirect('/')

  const { error } = await searchParams
  const authError = error ? AUTH_ERRORS[error] : null

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#070714] px-5 py-10 text-white selection:bg-teal-300/30 sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(94,234,212,0.09),transparent_30%),radial-gradient(circle_at_20%_80%,rgba(139,92,246,0.13),transparent_35%)]" />
      <div className="relative mx-auto flex min-h-[calc(100dvh-5rem)] max-w-6xl items-center">
        <div className="grid w-full gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <section className="max-w-2xl">
            <div className="mb-12 flex items-center gap-3 text-sm font-semibold tracking-[0.16em] text-white/65 uppercase">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 font-heading text-white">
                M
              </span>
              MindFlow Journal
            </div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-teal-accent)]">
              Private founding beta
            </p>
            <h1 className="max-w-xl font-heading text-4xl font-medium leading-[1.08] tracking-[-0.04em] sm:text-6xl">
              A quieter place for what’s taking up space.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-8 text-white/55 sm:text-lg">
              Enter the email used for your founding access. We’ll send one secure link—no password to remember.
            </p>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 shadow-[0_24px_100px_rgba(0,0,0,0.45)] backdrop-blur sm:p-9">
            <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-2xl border border-teal-200/20 bg-teal-200/5 text-[var(--color-teal-accent)]">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <h2 className="font-heading text-2xl font-medium">Open your private journal</h2>
            <p className="mb-8 mt-2 text-sm leading-6 text-white/45">
              Access is limited to verified founding members aged 18 and over.
            </p>
            {authError ? (
              <p className="mb-5 rounded-xl border border-red-300/15 bg-red-300/5 px-4 py-3 text-sm leading-6 text-red-200">
                {authError}
              </p>
            ) : null}
            <MagicLinkForm />
            <p className="mt-8 border-t border-white/8 pt-6 text-xs leading-5 text-white/35">
              MindFlow is a journaling and self-reflection tool. It does not provide therapy, diagnosis, medical advice, or crisis support.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
