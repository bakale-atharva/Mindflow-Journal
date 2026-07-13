import { getEntries } from "./actions";
import { JournalView } from "@/components/journal-view";

export const dynamic = "force-dynamic";

export default async function Home() {
  const entries = await getEntries();

  return (
    <div className="min-h-full bg-gradient-to-b from-[#070714] to-[#120E21] text-foreground selection:bg-[var(--color-teal-accent)]/30">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] pointer-events-none mix-blend-overlay"></div>
      <JournalView initialEntries={entries} />
    </div>
  );
}
