import Link from 'next/link'
import { Check, LockKeyhole } from 'lucide-react'
import type { ProgramDayView } from '@/lib/program'
import { cn } from '@/lib/utils'

export function SevenDayPath({ days, compact = false }: { days: ProgramDayView[]; compact?: boolean }) {
  return (
    <ol className={cn('grid grid-cols-7 gap-2', !compact && 'lg:grid-cols-1 lg:gap-1')} aria-label="Seven-day progress">
      {days.map((day) => {
        const marker = (
          <>
            <span className={cn('grid size-8 shrink-0 place-items-center rounded-full border text-xs font-semibold transition-colors', day.state === 'complete' && 'border-seafoam bg-seafoam text-ink', day.state === 'current' && 'border-ink bg-ink text-white', day.state === 'available' && 'border-lilac bg-orchid-mist text-ink', day.state === 'locked' && 'border-ink/8 bg-white/40 text-ink/30')}>
              {day.state === 'complete' ? <Check className="size-4" /> : day.state === 'locked' ? <LockKeyhole className="size-3.5" /> : day.day}
            </span>
            {!compact ? <span className="hidden min-w-0 lg:block"><span className="block font-mono text-[10px] uppercase tracking-[.12em] text-ink/40">Day {day.day}</span><span className="block truncate text-sm font-medium text-ink/75">{day.theme}</span></span> : null}
          </>
        )
        const classes = 'flex items-center justify-center gap-3 rounded-2xl p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:justify-start lg:p-2'
        const href = day.entryId ? `/entry/${day.entryId}` : day.state !== 'locked' ? `/?day=${day.day}` : null
        return <li key={day.id} className="min-w-0">{href ? <Link href={href} className={classes}>{marker}</Link> : <div className={classes}>{marker}</div>}</li>
      })}
    </ol>
  )
}
