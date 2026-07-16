'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Save } from 'lucide-react'
import { saveDayTwoEntry, type JournalEntry } from '@/app/actions'
import type { ProgramDayView } from '@/lib/program'
import { ReflectionPanel } from '@/components/reflection-panel'
import { MoodSelector } from '@/components/mood-selector'

export function Day2Composer({ day, entry }: { day: ProgramDayView; entry: JournalEntry | null }) {
  const router = useRouter()
  const [state, action, pending] = useActionState(saveDayTwoEntry, null)
  
  const responseData = entry?.response_data as (import('@/app/actions').Day2ResponseData | null | undefined)
  const initialUrgent = responseData?.urgent ?? (entry?.content && !entry?.response_data ? entry.content : '')
  const initialCanWait = responseData?.can_wait ?? ''
  
  const [urgent, setUrgent] = useState(initialUrgent)
  const [canWait, setCanWait] = useState(initialCanWait)
  const [mood, setMood] = useState<number | null>(entry?.mood ?? null)
  
  const urgentRef = useRef<HTMLTextAreaElement>(null)
  const canWaitRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (state?.status === 'success') router.refresh()
  }, [router, state])

  useEffect(() => {
    if (urgentRef.current) {
      urgentRef.current.style.height = 'auto'
      urgentRef.current.style.height = `${Math.min(Math.max(urgentRef.current.scrollHeight, 180), window.innerHeight * 0.4)}px`
    }
  }, [urgent])

  useEffect(() => {
    if (canWaitRef.current) {
      canWaitRef.current.style.height = 'auto'
      canWaitRef.current.style.height = `${Math.min(Math.max(canWaitRef.current.scrollHeight, 180), window.innerHeight * 0.4)}px`
    }
  }, [canWait])

  function discardChanges() {
    if ((urgent === initialUrgent && canWait === initialCanWait) || window.confirm('Discard the changes in this Day 2 exercise?')) {
      setUrgent(initialUrgent)
      setCanWait(initialCanWait)
      setMood(entry?.mood ?? null)
    }
  }

  const combinedLength = (urgent ? `Feels urgent:\n${urgent}\n\n` : '').length + (canWait ? `Can safely wait:\n${canWait}` : '').length

  return (
    <section className="surface rounded-[30px] p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.16em] text-ink/42">Day 2 · Urgency</p>
          <p className="mt-2 text-sm leading-6 text-ink/60">Not everything asking for your attention needs an answer today. Place each thought where it belongs for now.</p>
        </div>
        {entry ? <span className="inline-flex items-center gap-1.5 rounded-full bg-seafoam/55 px-3 py-1.5 text-xs font-semibold text-ink/65"><Check className="size-3.5" />Saved</span> : null}
      </div>
      <form action={action} className="mt-7">
        <input type="hidden" name="mood" value={mood ?? ''} />
        
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
          <div className="rounded-[22px] border border-coral/30 bg-coral/5 p-4 transition focus-within:border-coral/50 focus-within:ring-4 focus-within:ring-coral/10 sm:p-5 flex flex-col">
            <label htmlFor="day2-urgent" className="block text-sm font-semibold text-ink mb-1">Feels urgent</label>
            <p className="text-xs text-ink/50 mb-3">What seems to need your attention now?</p>
            <textarea id="day2-urgent" ref={urgentRef} name="urgent" maxLength={10000} value={urgent} onChange={(event) => setUrgent(event.target.value)} placeholder="Write the thought, task, decision, or conversation that feels pressing…" className="min-h-44 w-full flex-1 resize-none overflow-y-auto bg-transparent text-base leading-8 text-ink outline-none placeholder:text-ink/30" />
          </div>

          <div className="rounded-[22px] border border-seafoam/30 bg-seafoam/5 p-4 transition focus-within:border-seafoam/50 focus-within:ring-4 focus-within:ring-seafoam/10 sm:p-5 flex flex-col">
            <label htmlFor="day2-canwait" className="block text-sm font-semibold text-ink mb-1">Can safely wait</label>
            <p className="text-xs text-ink/50 mb-3">What does not need to be solved today?</p>
            <textarea id="day2-canwait" ref={canWaitRef} name="can_wait" maxLength={10000} value={canWait} onChange={(event) => setCanWait(event.target.value)} placeholder="Write what you can leave alone for now…" className="min-h-44 w-full flex-1 resize-none overflow-y-auto bg-transparent text-base leading-8 text-ink outline-none placeholder:text-ink/30" />
          </div>
        </div>

        <MoodSelector mood={mood} setMood={setMood} />

        <div className="mt-3 flex justify-end font-mono text-[10px] text-ink/35">{combinedLength.toLocaleString()} / 10,000</div>
        
        {state?.status === 'error' ? <p role="alert" className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p> : null}
        
        <div className="mt-5 flex items-center justify-end gap-3">
          {(urgent !== initialUrgent || canWait !== initialCanWait) ? <button type="button" onClick={discardChanges} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-ink/45 hover:bg-ink/5">Discard changes</button> : null}
          <button type="submit" disabled={pending || (!urgent.trim() && !canWait.trim())} className="inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(36,33,53,.18)] disabled:cursor-not-allowed disabled:opacity-35"><Save className="size-4" />{pending ? 'Saving Day 2…' : entry ? 'Save changes' : 'Save Day 2'}</button>
        </div>
      </form>
      {state?.status === 'success' ? <div className="mt-6"><ReflectionPanel entryId={state.entryId} generated={state.reflection} /></div> : entry ? <div className="mt-6"><ReflectionPanel entryId={entry.id} reflection={entry.reflection} /></div> : null}
    </section>
  )
}
