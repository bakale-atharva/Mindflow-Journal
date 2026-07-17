import type { JournalEntry } from "@/app/actions";
import type { ProgramDayView } from "@/lib/program";
import { DayOneComposer } from "@/components/dayOneComposer";
import { Day2Composer } from "@/components/day-2-composer";
import { Day3Composer } from "@/components/day-3-composer";
import { Day4Composer } from "@/components/day-4-composer";
import { Day5Composer } from "@/components/day-5-composer";
import { Day6Composer } from "@/components/day-6-composer";
import { Day7Composer } from "@/components/day-7-composer";

export function DayExperienceDispatcher({
  day,
  entry,
}: {
  day: ProgramDayView;
  entry: JournalEntry | null;
}) {
  if (day.day === 2) {
    return <Day2Composer day={day} entry={entry} />;
  }

  if (day.day === 3) {
    return <Day3Composer day={day} entry={entry} />;
  }

  if (day.day === 4) {
    return <Day4Composer day={day} entry={entry} />;
  }

  if (day.day === 5) {
    return <Day5Composer day={day} entry={entry} />;
  }

  if (day.day === 6) {
    return <Day6Composer day={day} entry={entry} />;
  }

  if (day.day === 7) {
    return <Day7Composer day={day} entry={entry} />;
  }
  
  return <DayOneComposer day={day} entry={entry} />;
}
