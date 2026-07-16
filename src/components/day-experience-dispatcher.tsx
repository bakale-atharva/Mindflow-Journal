import type { JournalEntry } from '@/app/actions'
import type { ProgramDayView } from '@/lib/program'
import { Day1Composer } from '@/components/day-1-composer'
import { Day2Composer } from '@/components/day-2-composer'

export function DayExperienceDispatcher({ day, entry }: { day: ProgramDayView; entry: JournalEntry | null }) {
  if (day.day === 2) {
    return <Day2Composer day={day} entry={entry} />
  }
  return <Day1Composer day={day} entry={entry} />
}
