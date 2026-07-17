import type { JournalEntry } from "@/app/actions";
import type { ProgramDayView } from "@/lib/program";
import { DayOneComposer } from "@/components/dayOneComposer";
import { DayTwoComposer } from "@/components/dayTwoComposer";
import { DayThreeComposer } from "@/components/dayThreeComposer";
import { DayFourComposer } from "@/components/dayFourComposer";
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
    return <DayTwoComposer day={day} entry={entry} />;
  }

  if (day.day === 3) {
    return <DayThreeComposer day={day} entry={entry} />;
  }

  if (day.day === 4) {
    return <DayFourComposer day={day} entry={entry} />;
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
