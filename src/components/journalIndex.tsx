import Link from "next/link";
import {
  ArrowUpRight,
  BookOpenText,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import type { DashboardData } from "@/app/actions";
import { getPrompt } from "@/lib/program";
import { ThoughtContour } from "@/components/thoughtContour";

const moodLabels: Record<number, string> = {
  1: "Heavy",
  2: "Low",
  3: "Steady",
  4: "Light",
  5: "Energized",
};

export function JournalIndex({ dashboard }: { dashboard: DashboardData }) {
  const entries = dashboard.entries.toReversed();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-7 sm:py-10 lg:px-10">
      <header className="flex flex-col gap-5 border-b border-ink/8 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.18em] text-ink/42">
            Your seven-day archive
          </p>
          <h1 className="mt-3 font-heading text-5xl font-semibold tracking-[-.065em] text-ink sm:text-6xl">
            Journal
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-ink/55">
            Your own words, organized by the prompt that opened them.
          </p>
        </div>
        <div className="rounded-full border border-ink/8 bg-white/60 px-4 py-2 font-mono text-xs text-ink/50">
          {entries.length} of 7 entries
        </div>
      </header>

      {entries.length ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {entries.map((entry) => {
            const prompt = getPrompt(entry.program_day);

            return (
              <Link
                key={entry.id}
                href={`/entry/${entry.id}`}
                className="surface content-auto group overflow-hidden rounded-2xl transition duration-200 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(67,55,91,.13)]"
              >
                <div className="relative h-36 overflow-hidden">
                  <ThoughtContour
                    mood={entry.mood}
                    compact
                    className="absolute inset-0 rounded-none"
                  />
                  <div className="absolute inset-0 flex items-start justify-between p-5">
                    <span className="rounded-full bg-white/58 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[.15em] text-ink/55 backdrop-blur">
                      Day {entry.program_day} · {prompt?.theme}
                    </span>
                    <ArrowUpRight className="size-5 text-ink/45 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
                <div className="p-5 sm:p-6">
                  <p className="line-clamp-2 font-heading text-xl font-semibold leading-7 tracking-[-.035em] text-ink">
                    {prompt?.prompt}
                  </p>
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-ink/55">
                    {entry.content}
                  </p>
                  <div className="mt-6 flex items-center justify-between border-t border-ink/8 pt-4 font-mono text-[9px] uppercase tracking-[.12em] text-ink/35">
                    <span>
                      {format(new Date(entry.updated_at), "MMM d · h:mm a")}
                    </span>
                    <span className="flex items-center gap-1.5">
                      {entry.reflection?.status === "complete" ? (
                        <>
                          <Sparkles className="size-3" />
                          Reflected
                        </>
                      ) : entry.mood ? (
                        moodLabels[entry.mood]
                      ) : (
                        "No mood"
                      )}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <section className="surface mt-8 rounded-[30px] p-8 text-center sm:p-14">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-orchid-mist text-primary">
            <BookOpenText className="size-6" />
          </span>
          <h2 className="mt-6 font-heading text-3xl font-semibold tracking-[-.045em]">
            Your first page is ready.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink/55">
            Start with today’s prompt. There is no perfect way to answer it.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white"
          >
            Open today’s prompt
          </Link>
        </section>
      )}
    </div>
  );
}
