import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getDashboard } from '@/app/actions'
import { DeleteEntryDialog } from '@/components/delete-entry-dialog'
import { DayExperienceDispatcher } from '@/components/day-experience-dispatcher'
import { ThoughtContour } from '@/components/thought-contour'

export default async function EntryPage({ params }: { params: Promise<{ id: string }> }) {
  const [dashboard, { id }] = await Promise.all([getDashboard(), params])
  if (!dashboard.profile.onboarding_completed_at) redirect('/onboarding')
  const entry = dashboard.entries.find((item) => item.id === id)
  if (!entry) notFound()
  const day = dashboard.days.find((item) => item.day === entry.program_day)
  if (!day) notFound()
  return <div className="mx-auto max-w-4xl px-4 py-6 sm:px-7 sm:py-10 lg:px-10"><div className="mb-6 flex items-center justify-between"><Link href="/journal" className="inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-ink/50 hover:bg-white hover:text-ink"><ArrowLeft className="size-4" />Journal</Link><DeleteEntryDialog entryId={entry.id} /></div><section className="relative mb-6 h-48 overflow-hidden rounded-[30px] sm:h-64"><ThoughtContour mood={entry.mood} className="absolute inset-0 min-h-0" /><div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8"><span className="w-fit rounded-full bg-white/55 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[.15em] text-ink/50">Day {day.day} · {day.theme}</span><h1 className="max-w-2xl font-heading text-3xl font-semibold leading-[1.05] tracking-[-.05em] text-ink sm:text-4xl">{day.prompt}</h1></div></section><DayExperienceDispatcher day={day} entry={entry} /></div>
}
