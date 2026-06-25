import { getEntries } from "./actions";
import { JournalForm } from "@/components/journal-form";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function Home() {
  const entries = await getEntries();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <main className="max-w-2xl mx-auto space-y-12">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            MindFlow Journal
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Capture your thoughts, ideas, and reflections.
          </p>
        </header>

        <section>
          <JournalForm />
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Previous Entries
          </h2>
          
          <div className="space-y-4">
            {entries.length === 0 ? (
              <p className="text-zinc-500 dark:text-zinc-400 italic">
                No entries yet. Write your first one above!
              </p>
            ) : (
              entries.map((entry: any) => (
                <Card key={entry.id} className="overflow-hidden bg-white dark:bg-zinc-900/50">
                  <CardContent className="p-6 space-y-3">
                    <time className="text-sm font-medium text-zinc-500 dark:text-zinc-400 block">
                      {format(new Date(entry.created_at), "MMMM d, yyyy 'at' h:mm a")}
                    </time>
                    <p className="text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
                      {entry.content.length > 100 
                        ? entry.content.substring(0, 100) + '...' 
                        : entry.content}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
