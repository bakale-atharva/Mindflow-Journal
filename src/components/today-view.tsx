import Link from 'next/link'
import { ArrowRight, BookOpenText, Clock3, ShieldCheck } from 'lucide-react'
import { format } from 'date-fns'
import type { DashboardData, JournalEntry } from '@/app/actions'
import type { ProgramDayView } from '@/lib/program'
import { EntryComposer } from '@/components/entry-composer'
import { SevenDayPath } from '@/components/seven-day-path'
import { ThoughtContour } from '@/components/thought-contour'

export function TodayView({ dashboard, activeDay, activeEntry }: { dashboard: DashboardData; activeDay: ProgramDayView; activeEntry: JournalEntry | null }) {
  const recent = dashboard.entries.slice(-3).reverse()
  if (dashboard.completed) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-7 sm:py-10 lg:px-10">
        <MobileBrand />
        <section className="surface relative overflow-hidden rounded-[32px] p-7 sm:p-12">
          <ThoughtContour mood={5} className="absolute inset-y-0 right-0 hidden w-1/2 opacity-65 md:block" />
          <div className="relative z-10 max-w-xl"><p className="font-mono text-[11px] uppercase tracking-[.18em] text-primary">Seven-day journal complete</p><h1 className="mt-5 font-heading text-5xl font-semibold leading-[.98] tracking-[-.065em] text-ink sm:text-7xl">You made space for all seven days.</h1><p className="mt-6 text-base leading-8 text-ink/60">Your entries remain yours to revisit. MindFlow does not turn them into a score or a claim about you.</p><Link href="/journal" className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white">Read your journal<ArrowRight className="size-4" /></Link></div>
        </section>
        <div className="surface mt-6 rounded-[28px] p-6"><SevenDayPath days={dashboard.days} compact /></div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-5 sm:px-7 sm:py-8 lg:px-10">
      <MobileBrand />
      <header className="mb-6 flex items-end justify-between gap-4">
        <div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-ink/42">{format(new Date(), 'EEEE · MMMM d')}</p><h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-.05em] text-ink sm:text-4xl">Day {activeDay.day} · {activeDay.theme}</h1></div>
        {activeDay.day !== dashboard.currentDay ? <Link href="/" className="hidden rounded-xl bg-white px-4 py-2 text-sm font-semibold text-ink/55 sm:block">Back to today</Link> : null}
      </header>

      <div className="mb-6 rounded-[26px] border border-ink/8 bg-white/65 p-4 lg:hidden"><SevenDayPath days={dashboard.days} compact /></div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-[32px] border border-white/70 shadow-[0_28px_80px_rgba(75,54,112,.12)]">
            <ThoughtContour mood={activeEntry?.mood} />
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 sm:p-9">
              <div className="flex items-center justify-between"><span className="rounded-full border border-white/55 bg-white/48 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[.15em] text-ink/55 backdrop-blur">Today’s prompt</span><span className="font-mono text-xs text-ink/45">{String(activeDay.day).padStart(2, '0')} / 07</span></div>
              <h2 className="max-w-2xl font-heading text-3xl font-semibold leading-[1.06] tracking-[-.05em] text-ink sm:text-5xl">{activeDay.prompt}</h2>
            </div>
          </section>
          <EntryComposer key={`${activeDay.day}-${activeEntry?.updated_at ?? 'new'}`} day={activeDay} entry={activeEntry} />
        </div>

        <aside className="hidden space-y-5 lg:block">
          <section className="surface rounded-[26px] p-5"><div className="mb-4 flex items-center justify-between"><h2 className="font-heading text-lg font-semibold tracking-[-.03em]">Seven-day path</h2><span className="font-mono text-[10px] text-ink/35">{dashboard.entries.length}/7</span></div><SevenDayPath days={dashboard.days} /></section>
          {dashboard.nextUnlockAt ? <section className="rounded-[24px] border border-ink/8 bg-ink p-5 text-white"><Clock3 className="size-5 text-seafoam" /><p className="mt-4 font-mono text-[10px] uppercase tracking-[.15em] text-white/45">Next prompt</p><p className="mt-1 text-sm leading-6 text-white/78">Unlocks {format(new Date(dashboard.nextUnlockAt), 'EEEE, MMM d · h:mm a')}</p></section> : null}
          {recent.length ? <section className="surface rounded-[26px] p-5"><div className="flex items-center justify-between"><h2 className="font-heading text-lg font-semibold tracking-[-.03em]">Recent entries</h2><Link href="/journal" aria-label="Open journal" className="text-ink/45 hover:text-ink"><ArrowRight className="size-4" /></Link></div><div className="mt-4 space-y-3">{recent.map((entry) => <Link key={entry.id} href={`/entry/${entry.id}`} className="block rounded-2xl bg-porcelain p-3"><span className="font-mono text-[9px] uppercase tracking-[.13em] text-ink/35">Day {entry.program_day}</span><span className="mt-1 block line-clamp-2 text-xs leading-5 text-ink/60">{entry.content}</span></Link>)}</div></section> : null}
          <div className="flex items-start gap-3 px-2 text-xs leading-5 text-ink/42"><ShieldCheck className="mt-0.5 size-4 shrink-0" />Your entry text is never stored in product-event metadata.</div>
        </aside>
      </div>
    </div>
  )
}

function MobileBrand() {
  return <div className="mb-7 flex items-center gap-2 md:hidden"><span className="grid size-8 place-items-center rounded-xl bg-ink text-xs font-semibold text-white">M</span><span className="font-heading text-lg font-semibold tracking-[-.04em]">MindFlow</span><BookOpenText className="ml-auto size-4 text-ink/35" /></div>
}
