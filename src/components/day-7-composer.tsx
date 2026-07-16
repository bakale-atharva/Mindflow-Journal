'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Save, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { saveDaySevenEntry, type JournalEntry } from '@/app/actions'
import type { ProgramDayView } from '@/lib/program'
import { ReflectionPanel } from '@/components/reflection-panel'
import { MoodSelector } from '@/components/mood-selector'

export function Day7Composer({ day, entry }: { day: ProgramDayView; entry: JournalEntry | null }) {
  const router = useRouter()
  const [state, action, pending] = useActionState(saveDaySevenEntry, null)
  
  const responseData = entry?.response_data as (import('@/app/actions').Day7ResponseData | null | undefined)
  const initialClearer = responseData?.became_clearer ?? (entry?.content && !entry?.response_data ? entry.content : '')
  const initialCarry = responseData?.carry_forward ?? ''
  
  const [becameClearer, setBecameClearer] = useState(initialClearer)
  const [carryForward, setCarryForward] = useState(initialCarry)
  const [mood, setMood] = useState<number | null>(entry?.mood ?? null)
  
  const clearerRef = useRef<HTMLTextAreaElement>(null)
  const carryRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (state?.status === 'success') router.refresh()
  }, [router, state])

  useEffect(() => {
    if (clearerRef.current) {
      clearerRef.current.style.height = 'auto'
      clearerRef.current.style.height = `${Math.min(Math.max(clearerRef.current.scrollHeight, 180), window.innerHeight * 0.45)}px`
    }
  }, [becameClearer])

  useEffect(() => {
    if (carryRef.current) {
      carryRef.current.style.height = 'auto'
      carryRef.current.style.height = `${Math.min(Math.max(carryRef.current.scrollHeight, 120), window.innerHeight * 0.25)}px`
    }
  }, [carryForward])

  function discardChanges() {
    if ((becameClearer === initialClearer && carryForward === initialCarry) || window.confirm('Discard the changes in this Day 7 exercise?')) {
      setBecameClearer(initialClearer)
      setCarryForward(initialCarry)
      setMood(entry?.mood ?? null)
    }
  }

  const combinedLength = (becameClearer ? `Looking back, what became clearer:\n${becameClearer}\n\n` : '').length + (carryForward ? `What I want to carry forward:\n${carryForward}` : '').length

  return (
    <section className="surface rounded-[30px] p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.16em] text-ink/42">Day 7 · Closing</p>
          <p className="mt-2 text-sm leading-6 text-ink/60">A moment to gather what you&apos;ve found before moving forward.</p>
        </div>
        {entry ? <span className="inline-flex items-center gap-1.5 rounded-full bg-seafoam/55 px-3 py-1.5 text-xs font-semibold text-ink/65"><Check className="size-3.5" />Day 7 saved</span> : null}
      </div>
      <form action={action} className="mt-7">
        <input type="hidden" name="mood" value={mood ?? ''} />
        
        <div className="max-w-2xl mx-auto flex flex-col mb-10 relative">
          
          <div className="relative z-10 rounded-t-[32px] rounded-b-none border border-b-0 border-ink/5 bg-porcelain shadow-[0_-8px_24px_rgba(36,33,53,0.02)] p-6 sm:p-8 flex flex-col group">
            <label htmlFor="day7-clearer" className="block text-sm font-semibold text-ink mb-1.5 group-focus-within:text-ink/80 transition-colors">What became clearer?</label>
            <p className="text-xs text-ink/60 mb-5">Looking back on the past six days, what became clearer for you?</p>
            <textarea id="day7-clearer" ref={clearerRef} name="became_clearer" maxLength={10000} value={becameClearer} onChange={(event) => setBecameClearer(event.target.value)} placeholder="Write what you've noticed or realized…" className="w-full flex-1 resize-none bg-transparent text-base leading-8 text-ink outline-none placeholder:text-ink/30" />
          </div>

          <div className="h-[1px] w-full bg-ink/10 relative z-20 shadow-[0_2px_8px_rgba(36,33,53,0.05)]"></div>

          <div className="relative z-10 rounded-b-[32px] rounded-t-none border border-t-0 border-ink/10 bg-orchid-mist/15 p-6 sm:p-8 transition-all duration-300 focus-within:bg-orchid-mist/25 flex flex-col group">
            <label htmlFor="day7-carry" className="block text-sm font-semibold text-ink mb-1.5 group-focus-within:text-ink/80 transition-colors">Carry forward <span className="text-ink/40 font-normal text-xs ml-2">(optional)</span></label>
            <p className="text-xs text-ink/60 mb-5">What would you like to carry forward from here?</p>
            <textarea id="day7-carry" ref={carryRef} name="carry_forward" maxLength={10000} value={carryForward} onChange={(event) => setCarryForward(event.target.value)} placeholder="Write a thought to take with you…" className="w-full flex-1 resize-none overflow-y-auto bg-transparent text-base leading-8 text-ink outline-none placeholder:text-ink/30 italic" />
          </div>
        </div>

        <MoodSelector mood={mood} setMood={setMood} />

        <div className="mt-3 flex justify-end font-mono text-[10px] text-ink/35">{combinedLength.toLocaleString()} / 10,000</div>
        
        {state?.status === 'error' ? <p role="alert" className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p> : null}
        
        <div className="mt-5 flex items-center justify-end gap-3">
          {(becameClearer !== initialClearer || carryForward !== initialCarry) ? <button type="button" onClick={discardChanges} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-ink/45 hover:bg-ink/5">Discard changes</button> : null}
          <button type="submit" disabled={pending || !becameClearer.trim()} className="inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(36,33,53,.18)] disabled:cursor-not-allowed disabled:opacity-35"><Save className="size-4" />{pending ? 'Saving Day 7…' : entry ? 'Save changes' : 'Save final entry'}</button>
        </div>
      </form>
      {state?.status === 'success' ? (
        <div className="mt-8 flex flex-col items-center">
          <div className="w-full"><ReflectionPanel entryId={state.entryId} generated={state.reflection} /></div>
          <Link href="/journal" className="mt-8 inline-flex items-center gap-2 rounded-full bg-porcelain border border-ink/10 px-6 py-3 text-sm font-semibold text-ink hover:bg-ink/5 hover:border-ink/20 transition-all group">
            View your completed journal
            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      ) : entry ? (
        <div className="mt-8 flex flex-col items-center">
          <div className="w-full"><ReflectionPanel entryId={entry.id} reflection={entry.reflection} /></div>
          <Link href="/journal" className="mt-8 inline-flex items-center gap-2 rounded-full bg-porcelain border border-ink/10 px-6 py-3 text-sm font-semibold text-ink hover:bg-ink/5 hover:border-ink/20 transition-all group">
            View your completed journal
            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      ) : null}
    </section>
  )
}
