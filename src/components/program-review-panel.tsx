'use client'

import { useActionState, useEffect } from 'react'
import { Sparkles, Check, RefreshCw, TriangleAlert } from 'lucide-react'
import type { DashboardData } from '@/app/actions'
import { generateProgramReview, retryProgramReview, keepProgramPractice, updateAiConsent } from '@/app/actions'

export function ProgramReviewPanel({ dashboard, currentHash }: { dashboard: DashboardData; currentHash: string }) {
  const review = dashboard.programReview
  const hasGroqConsent =
    dashboard.profile.ai_processing_consent_at !== null &&
    dashboard.profile.ai_processing_consent_revoked_at === null &&
    dashboard.profile.ai_processing_provider === 'groq' &&
    dashboard.profile.ai_consent_version === 2

  const [genState, genAction, isGenerating] = useActionState(generateProgramReview, null)
  const [retryState, retryAction, isRetrying] = useActionState(retryProgramReview, null)
  const [keepState, keepAction, isKeeping] = useActionState(keepProgramPractice, null)
  const [consentState, consentAction, isConsenting] = useActionState(updateAiConsent, null)

  const isStale = review && review.status === 'complete' && review.source_hash !== currentHash
  const isPending = review?.status === 'pending' || isGenerating || isRetrying

  useEffect(() => {
    if (isPending) {
      const interval = setInterval(() => {
        window.location.reload()
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [isPending])

  if (!hasGroqConsent) {
    return (
      <section className="surface mt-6 rounded-[32px] p-7 sm:p-10 flex flex-col items-center text-center">
        <Sparkles className="size-6 text-ink/35 mb-4" />
        <h2 className="font-heading text-2xl font-semibold tracking-[-.02em] text-ink mb-3">Looking back</h2>
        <p className="text-sm leading-6 text-ink/65 max-w-md mx-auto mb-6">
          7 of 7 entries completed. You can choose to have AI read your entries and write a gentle, private reflection of the themes that emerged over the last seven days.
        </p>
        <form action={consentAction}>
          <input type="hidden" name="ai_consent" value="yes" />
          <button type="submit" disabled={isConsenting} className="inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(36,33,53,.18)] disabled:opacity-50">
            {isConsenting ? 'Updating…' : 'Enable AI reflections'}
          </button>
        </form>
        {consentState?.status === 'error' && <p className="mt-3 text-xs text-red-600">{consentState.error}</p>}
      </section>
    )
  }

  if (!review || (review.status === 'failed' && review.attempt_count === 0)) {
    return (
      <section className="surface mt-6 rounded-[32px] p-7 sm:p-10 flex flex-col items-center text-center">
        <Sparkles className="size-6 text-ink/35 mb-4" />
        <h2 className="font-heading text-2xl font-semibold tracking-[-.02em] text-ink mb-3">Looking back</h2>
        <p className="text-sm leading-6 text-ink/65 max-w-md mx-auto mb-6">
          7 of 7 entries completed. Generate a private, synthesized reflection of your week.
        </p>
        <form action={genAction}>
          <button type="submit" disabled={isGenerating} className="inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(36,33,53,.18)] disabled:opacity-50">
            {isGenerating ? <><RefreshCw className="size-4 animate-spin" /> Generating…</> : 'Create my seven-day reflection'}
          </button>
        </form>
        {genState?.status === 'error' && <p className="mt-3 text-xs text-red-600">{genState.error}</p>}
      </section>
    )
  }

  if (isPending) {
    return (
      <section className="surface mt-6 rounded-[32px] p-7 sm:p-10 flex flex-col items-center text-center animate-pulse">
        <RefreshCw className="size-6 text-ink/35 mb-4 animate-spin" />
        <h2 className="font-heading text-2xl font-semibold tracking-[-.02em] text-ink mb-3">Writing your reflection</h2>
        <p className="text-sm leading-6 text-ink/65 max-w-md mx-auto">This may take a moment to gather the threads from your week.</p>
      </section>
    )
  }

  if (review.status === 'safety_redirect') {
    return (
      <section className="mt-6 rounded-[32px] bg-red-50/50 p-7 sm:p-10 text-center border border-red-100">
        <TriangleAlert className="size-6 text-red-500 mx-auto mb-4" />
        <p className="text-sm leading-6 text-red-800 max-w-md mx-auto">
          MindFlow isn’t equipped to help with immediate danger. If you may act on thoughts of harming yourself or someone else, contact local emergency services now or reach out to someone you trust.
        </p>
      </section>
    )
  }

  if (review.status === 'failed') {
    return (
      <section className="surface mt-6 rounded-[32px] p-7 sm:p-10 flex flex-col items-center text-center">
        <h2 className="font-heading text-xl font-semibold text-ink mb-3">Reflection failed</h2>
        <p className="text-sm text-ink/65 mb-6">We couldn't generate your review.</p>
        <form action={retryAction}>
          <button type="submit" disabled={isRetrying} className="inline-flex items-center gap-2 rounded-xl bg-ink/5 px-4 py-2 text-sm font-semibold text-ink hover:bg-ink/10">
            {isRetrying ? 'Retrying…' : 'Try again'}
          </button>
        </form>
      </section>
    )
  }

  return (
    <section className="surface mt-6 rounded-[32px] p-7 sm:p-10">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="size-5 text-seafoam" />
        <h2 className="font-heading text-2xl font-semibold tracking-[-.02em] text-ink">Seven-day reflection</h2>
      </div>
      
      <div className="text-base leading-8 text-ink/80 mb-8 whitespace-pre-wrap">
        {review.reflection}
      </div>

      {review.practice ? (
        <div className="rounded-2xl bg-orchid-mist/15 p-6 sm:p-8">
          <h3 className="text-sm font-semibold text-ink mb-2">A gentle practice</h3>
          <p className="text-sm leading-7 text-ink/75 mb-5">{review.practice}</p>
          
          {review.practice_kept_at ? (
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-ink/50 bg-white/50 px-3 py-1.5 rounded-full">
              <Check className="size-3.5" /> Kept with you
            </div>
          ) : (
            <form action={keepAction}>
              <button type="submit" disabled={isKeeping} className="inline-flex items-center gap-2 text-xs font-semibold text-ink px-4 py-2 rounded-xl border border-ink/10 hover:bg-ink/5 transition-colors disabled:opacity-50">
                Keep this practice
              </button>
            </form>
          )}
        </div>
      ) : null}

      {isStale ? (
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-ink/5 bg-white/40 p-4">
          <p className="text-xs text-ink/60">Your journal has been edited since this was generated.</p>
          <form action={retryAction}>
            <button type="submit" disabled={isRetrying} className="inline-flex items-center gap-2 text-xs font-semibold text-ink px-3 py-1.5 rounded-lg hover:bg-ink/5 transition-colors">
              <RefreshCw className="size-3.5" /> Regenerate reflection
            </button>
          </form>
        </div>
      ) : null}
    </section>
  )
}
