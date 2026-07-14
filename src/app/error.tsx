'use client'

import { RotateCcw } from 'lucide-react'

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="grid min-h-[70dvh] place-items-center px-4 py-12">
      <section className="surface w-full max-w-lg rounded-[30px] p-7 text-center sm:p-10">
        <p className="font-mono text-[10px] uppercase tracking-[.18em] text-destructive">Journal unavailable</p>
        <h1 className="mt-4 font-heading text-4xl font-semibold tracking-[-.055em] text-ink">Your journal could not be loaded.</h1>
        <p className="mt-4 text-sm leading-6 text-ink/55">Your saved entries have not been changed. Check your connection and try loading this page again.</p>
        <button type="button" onClick={reset} className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white">
          <RotateCcw className="size-4" />Try again
        </button>
      </section>
    </div>
  )
}
