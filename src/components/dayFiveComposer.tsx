"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Save } from "lucide-react";
import { saveDayFiveEntry, type JournalEntry } from "@/app/actions";
import type { ProgramDayView } from "@/lib/program";
import { ReflectionPanel } from "@/components/reflectionPanel";
import { MoodSelector } from "@/components/moodSelector";

export function DayFiveComposer({
  day,
  entry,
}: {
  day: ProgramDayView;
  entry: JournalEntry | null;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(saveDayFiveEntry, null);

  const responseData = entry?.response_data as
    | import("@/app/actions").DayFiveResponseData
    | null
    | undefined;
  const initialNote =
    responseData?.note_to_friend ??
    (entry?.content && !entry?.response_data ? entry.content : "");
  const initialLine = responseData?.line_to_keep ?? "";

  const [note, setNote] = useState(initialNote);
  const [line, setLine] = useState(initialLine);
  const [mood, setMood] = useState<number | null>(entry?.mood ?? null);

  const noteRef = useRef<HTMLTextAreaElement>(null);
  const lineRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (state?.status === "success") router.refresh();
  }, [router, state]);

  useEffect(() => {
    if (noteRef.current) {
      noteRef.current.style.height = "auto";
      noteRef.current.style.height = `${Math.min(Math.max(noteRef.current.scrollHeight, 180), window.innerHeight * 0.45)}px`;
    }
  }, [note]);

  useEffect(() => {
    if (lineRef.current) {
      lineRef.current.style.height = "auto";
      lineRef.current.style.height = `${Math.min(Math.max(lineRef.current.scrollHeight, 80), window.innerHeight * 0.2)}px`;
    }
  }, [line]);

  function discardChanges() {
    if (
      (note === initialNote && line === initialLine) ||
      window.confirm("Discard the changes in this Day 5 exercise?")
    ) {
      setNote(initialNote);
      setLine(initialLine);
      setMood(entry?.mood ?? null);
    }
  }

  const combinedLength =
    (note ? `What I would say:\n${note}\n\n` : "").length +
    (line ? `A line to keep:\n${line}` : "").length;

  return (
    <section className="surface rounded-[30px] p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.16em] text-ink/42">
            Day 5 · Perspective
          </p>
          <p className="mt-2 text-sm leading-6 text-ink/60">
            Sometimes a little distance makes the words easier to find.
          </p>
        </div>
        {entry ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-seafoam/55 px-3 py-1.5 text-xs font-semibold text-ink/65">
            <Check className="size-3.5" />
            Day 5 saved
          </span>
        ) : null}
      </div>
      <form action={action} className="mt-7">
        <input type="hidden" name="mood" value={mood ?? ""} />

        <div className="max-w-2xl mx-auto flex flex-col gap-6 mb-8 relative">
          <div className="relative z-10 rounded-[12px] rounded-tr-none bg-porcelain shadow-[0_4px_24px_rgba(36,33,53,0.04)] p-6 sm:p-8 transition-all duration-300 focus-within:shadow-[0_12px_40px_rgba(36,33,53,0.08)] flex flex-col group border-t border-l border-b border-transparent border-r">
            {/* Folded corner detail */}
            <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none before:absolute before:inset-0 before:bg-white before:rounded-bl-[12px] before:shadow-[-2px_2px_4px_rgba(36,33,53,0.03)] before:border-b before:border-l before:border-ink/5 after:absolute after:inset-0 after:bg-background after:[clip-path:polygon(0_0,100%_0,100%_100%)]"></div>

            <label
              htmlFor="dayFive-note"
              className="block text-sm font-semibold text-ink mb-1.5 group-focus-within:text-ink/80 transition-colors"
            >
              What you would say
            </label>
            <p className="text-xs text-ink/60 mb-5">
              Imagine someone you care about carrying the same concern.
            </p>
            <div className="relative flex-1">
              {/* Subtle ink rule lines mimicking a notepad */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(transparent 95%, rgba(36,33,53,0.04) 95%)",
                  backgroundSize: "100% 2rem",
                  marginTop: "4px",
                }}
              ></div>
              <textarea
                id="dayFive-note"
                ref={noteRef}
                name="note_to_friend"
                maxLength={10000}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Write what you would want them to hear…"
                className="w-full h-full resize-none bg-transparent text-base leading-8 text-ink outline-none placeholder:text-ink/30 relative z-10"
                style={{ lineHeight: "2rem" }}
              />
            </div>
          </div>

          <div className="relative z-10 rounded-[12px] border border-ink/10 bg-orchid-mist/20 p-5 transition-all duration-300 focus-within:-translate-y-0.5 focus-within:border-ink/20 focus-within:shadow-[0_8px_30px_rgba(167,123,239,0.1)] sm:p-6 flex flex-col ml-0 sm:ml-8 lg:ml-16">
            <label
              htmlFor="dayFive-line"
              className="block text-sm font-semibold text-ink mb-1.5"
            >
              A line to keep{" "}
              <span className="text-ink/40 font-normal text-xs ml-2">
                (optional)
              </span>
            </label>
            <p className="text-xs text-ink/60 mb-4">
              Is there one sentence you want to remember too?
            </p>
            <textarea
              id="dayFive-line"
              ref={lineRef}
              name="line_to_keep"
              maxLength={10000}
              value={line}
              onChange={(event) => setLine(event.target.value)}
              placeholder="Keep one line here, if it feels useful…"
              className="w-full flex-1 resize-none overflow-y-auto bg-transparent text-base leading-8 text-ink outline-none placeholder:text-ink/30 italic"
            />
          </div>
        </div>

        <MoodSelector mood={mood} setMood={setMood} />

        <div className="mt-3 flex justify-end font-mono text-[10px] text-ink/35">
          {combinedLength.toLocaleString()} / 10,000
        </div>

        {state?.status === "error" ? (
          <p
            role="alert"
            className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {state.error}
          </p>
        ) : null}

        <div className="mt-5 flex items-center justify-end gap-3">
          {note !== initialNote || line !== initialLine ? (
            <button
              type="button"
              onClick={discardChanges}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-ink/45 hover:bg-ink/5"
            >
              Discard changes
            </button>
          ) : null}
          <button
            type="submit"
            disabled={pending || !note.trim()}
            className="inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(36,33,53,.18)] disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Save className="size-4" />
            {pending ? "Saving Day 5…" : entry ? "Save changes" : "Save Day 5"}
          </button>
        </div>
      </form>
      {state?.status === "success" ? (
        <div className="mt-6">
          <ReflectionPanel
            entryId={state.entryId}
            generated={state.reflection}
          />
        </div>
      ) : entry ? (
        <div className="mt-6">
          <ReflectionPanel entryId={entry.id} reflection={entry.reflection} />
        </div>
      ) : null}
    </section>
  );
}
