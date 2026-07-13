'use client'

import { useActionState } from 'react'
import { ArrowRight, Check, Mail } from 'lucide-react'
import {
  requestMagicLink,
  type MagicLinkState,
} from '@/app/auth/actions'

const initialState: MagicLinkState = { status: 'idle', message: '' }

export function MagicLinkForm() {
  const [state, formAction, pending] = useActionState(
    requestMagicLink,
    initialState
  )

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/50"
        >
          Founding access email
        </label>
        <div className="group flex items-center gap-3 border-b border-white/15 py-3 transition-colors focus-within:border-[var(--color-teal-accent)]">
          <Mail className="h-5 w-5 text-white/35 transition-colors group-focus-within:text-[var(--color-teal-accent)]" />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            autoFocus
            placeholder="you@example.com"
            className="min-w-0 flex-1 bg-transparent text-lg text-white outline-none placeholder:text-white/20"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 font-semibold text-[#0b0914] transition hover:bg-[var(--color-teal-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-teal-accent)] disabled:cursor-not-allowed disabled:opacity-55"
      >
        {pending ? 'Sending secure link…' : 'Email me a sign-in link'}
        {pending ? null : <ArrowRight className="h-4 w-4" />}
      </button>

      <p
        aria-live="polite"
        className={`min-h-6 text-sm leading-6 ${
          state.status === 'error'
            ? 'text-red-300'
            : state.status === 'success'
              ? 'text-emerald-300'
              : 'text-white/45'
        }`}
      >
        {state.status === 'success' ? (
          <span className="inline-flex items-start gap-2">
            <Check className="mt-1 h-4 w-4 shrink-0" />
            {state.message}
          </span>
        ) : (
          state.message || 'No password required. The link expires after one use.'
        )}
      </p>
    </form>
  )
}

