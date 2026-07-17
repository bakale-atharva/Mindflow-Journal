import { redirect } from "next/navigation";
import { getDashboard } from "@/app/actions";
import { JournalIndex } from "@/components/journalIndex";

export default async function JournalPage() {
  const dashboard = await getDashboard();

  if (!dashboard.profile.onboarding_completed_at) redirect("/onboarding");
  
  return <JournalIndex dashboard={dashboard} />;
}
