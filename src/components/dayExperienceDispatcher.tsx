import type { JournalEntry } from "@/app/actions";
import type { ProgramDayView } from "@/lib/program";
import { DayOneComposer } from "@/components/dayOneComposer";
import { DayTwoComposer } from "@/components/dayTwoComposer";
import { DayThreeComposer } from "@/components/dayThreeComposer";
import { DayFourComposer } from "@/components/dayFourComposer";
import { DayFiveComposer } from "@/components/dayFiveComposer";
import { DaySixComposer } from "@/components/daySixComposer";
import { DaySevenComposer } from "@/components/daySevenComposer";

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
    return <DayFiveComposer day={day} entry={entry} />;
  }

  if (day.day === 6) {
    return <DaySixComposer day={day} entry={entry} />;
  }

  if (day.day === 7) {
    return <DaySevenComposer day={day} entry={entry} />;
  }

  return <DayOneComposer day={day} entry={entry} />;
}
