'use client'

import { useActionState, useEffect, useRef } from 'react'
import { AlertTriangle, RotateCcw, Sparkles } from 'lucide-react'
import { retryReflection, recordReflectionViewedAction, type AIReflection } from '@/app/actions'
import { cn } from '@/lib/utils'

const dangerNotice = 'MindFlow isn’t equipped to help with immediate danger. If you may act on thoughts of harming yourself or someone else, contact local emergency services now or reach out to someone you trust.'

export function ReflectionPanel({ entryId, reflection, generated }: { entryId: string; reflection?: AIReflection | null; generated?: { status: string; reflection: string | null; question: string | null } | null }) {
  const [retryState, retryAction, pending] = useActionState(retryReflection, null)
  const status = generated?.status ?? reflection?.status ?? 'not_requested'
  const text = generated?.reflection ?? reflection?.reflection
  const question = generated?.question ?? reflection?.question
  const hasRecorded = useRef(false)

  useEffect(() => {
    if (status === 'complete' && text && !hasRecorded.current) {
      hasRecorded.current = true;
      recordReflectionViewedAction(entryId).catch(console.error);
    }
  }, [status, text, entryId])

  if (status === 'not_requested') {
    return <div className="rounded-[22px] border border-ink/8 bg-porcelain p-5"><p className="font-mono text-[10px] uppercase tracking-[.15em] text-ink/42">Journal-only</p><p className="mt-2 text-sm leading-6 text-ink/58">This entry stayed in your journal without an AI reflection.</p></div>
  }
  if (status === 'safety_redirect') {
    return <div role="alert" className="rounded-[22px] border border-coral/35 bg-coral/10 p-5"><AlertTriangle className="size-5 text-destructive" /><p className="mt-3 text-sm font-medium leading-6 text-ink">{dangerNotice}</p></div>
  }
  if (status === 'pending') {
    return <div className="rounded-[22px] border border-lilac/25 bg-orchid-mist/35 p-5" aria-live="polite"><p className="font-mono text-[10px] uppercase tracking-[.15em] text-primary">Reflection in progress</p><div className="mt-4 h-2 w-2/3 animate-pulse rounded-full bg-lilac/30" /><div className="mt-3 h-2 w-1/2 animate-pulse rounded-full bg-lilac/20" /></div>
  }
  if (status === 'failed') {
    const hasRetryError = retryState?.status === 'error'
    const notice = hasRetryError
      ? retryState.error
      : 'Your entry is saved, but the reflection could not be generated.'

    return <div className="rounded-[22px] border border-ink/10 bg-white p-5"><form action={retryAction}><input type="hidden" name="entry_id" value={entryId} /><button disabled={pending} className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><RotateCcw className="size-4" />{pending ? 'Retrying…' : 'Try once more'}</button><p aria-live="polite" className={cn('mt-4 border-t pt-4 text-sm leading-6', hasRetryError ? 'border-destructive/30 text-destructive' : 'border-ink/8 text-ink/60')}>{notice}</p></form></div>
  }
  if (status === 'complete' && text) {
    return <section className="rounded-[26px] border border-lilac/20 bg-[linear-gradient(145deg,rgba(232,217,255,.55),rgba(255,255,255,.9))] p-6"><div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.15em] text-primary"><Sparkles className="size-4" />Your reflection</div><p className="mt-4 font-heading text-xl leading-8 tracking-[-.02em] text-ink">{text}</p>{question ? <p className="mt-5 border-t border-ink/8 pt-4 text-sm font-medium leading-6 text-ink/58">{question}</p> : null}</section>
  }
  return null
}
