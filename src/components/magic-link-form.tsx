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
          className="mb-2 block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-ink/42"
        >
          Founding access email
        </label>
        <div className="group flex items-center gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3 transition focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-lilac/10">
          <Mail className="h-5 w-5 text-ink/30 transition-colors group-focus-within:text-primary" />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            autoFocus
            placeholder="you@example.com"
            className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink/24"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-5 py-3.5 font-semibold text-white shadow-[0_12px_30px_rgba(36,33,53,.18)] transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-55"
      >
        {pending ? 'Sending secure link…' : 'Email me a sign-in link'}
        {pending ? null : <ArrowRight className="h-4 w-4" />}
      </button>

      <p
        aria-live="polite"
        className={`min-h-6 text-sm leading-6 ${
          state.status === 'error'
            ? 'text-red-700'
            : state.status === 'success'
              ? 'text-emerald-700'
              : 'text-ink/45'
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
