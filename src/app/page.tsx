import { redirect } from "next/navigation";
import { getDashboard } from "@/app/actions";
import { TodayView } from "@/components/todayView";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ day?: string }>;
}) {
  const [dashboard, query] = await Promise.all([getDashboard(), searchParams]);

  if (
    !dashboard.profile.onboarding_completed_at ||
    !dashboard.profile.program_started_at
  )
    redirect("/onboarding");

  const requestedDay = Number(query.day);
  const activeDay =
    dashboard.days.find(
      (day) => day.day === requestedDay && day.state !== "locked",
    ) ?? dashboard.days.find((day) => day.day === dashboard.currentDay);
    
  if (!activeDay) redirect("/onboarding");

  const activeEntry =
    dashboard.entries.find((entry) => entry.program_day === activeDay.day) ??
    null;

  return (
    <TodayView
      dashboard={dashboard}
      activeDay={activeDay}
      activeEntry={activeEntry}
    />
  );
}
