"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Save } from "lucide-react";
import { saveDayFourEntry, type JournalEntry } from "@/app/actions";
import type { ProgramDayView } from "@/lib/program";
import { ReflectionPanel } from "@/components/reflectionPanel";
import { MoodSelector } from "@/components/moodSelector";

export function DayFourComposer({
  day,
  entry,
}: {
  day: ProgramDayView;
  entry: JournalEntry | null;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(saveDayFourEntry, null);

  const responseData = entry?.response_data as
    | import("@/app/actions").DayFourResponseData
    | null
    | undefined;
  const initialThought =
    responseData?.recurring_thought ??
    (entry?.content && !entry?.response_data ? entry.content : "");
  const initialMoment = responseData?.usual_moment ?? "";

  const [thought, setThought] = useState(initialThought);
  const [moment, setMoment] = useState(initialMoment);
  const [mood, setMood] = useState<number | null>(entry?.mood ?? null);

  const thoughtRef = useRef<HTMLTextAreaElement>(null);
  const momentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (state?.status === "success") router.refresh();
  }, [router, state]);

  useEffect(() => {
    if (thoughtRef.current) {
      thoughtRef.current.style.height = "auto";
      thoughtRef.current.style.height = `${Math.min(Math.max(thoughtRef.current.scrollHeight, 140), window.innerHeight * 0.4)}px`;
    }
  }, [thought]);

  useEffect(() => {
    if (momentRef.current) {
      momentRef.current.style.height = "auto";
      momentRef.current.style.height = `${Math.min(Math.max(momentRef.current.scrollHeight, 140), window.innerHeight * 0.4)}px`;
    }
  }, [moment]);

  function discardChanges() {
    if (
      (thought === initialThought && moment === initialMoment) ||
      window.confirm("Discard the changes in this Day 4 exercise?")
    ) {
      setThought(initialThought);
      setMoment(initialMoment);
      setMood(entry?.mood ?? null);
    }
  }

  const combinedLength =
    (thought ? `The thought that returns:\n${thought}\n\n` : "").length +
    (moment ? `When it tends to return:\n${moment}` : "").length;

  return (
    <section className="surface rounded-[30px] p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.16em] text-ink/42">
            Day 4 · Recurrence
          </p>
          <p className="mt-2 text-sm leading-6 text-ink/60">
            A recurring thought often has a familiar moment. Name the thought,
            then notice when it tends to return.
          </p>
        </div>
        {entry ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-seafoam/55 px-3 py-1.5 text-xs font-semibold text-ink/65">
            <Check className="size-3.5" />
            Day 4 saved
          </span>
        ) : null}
      </div>
      <form action={action} className="mt-7">
        <input type="hidden" name="mood" value={mood ?? ""} />

        <div className="max-w-2xl mx-auto flex flex-col mb-8 relative">
          <div className="relative z-10 rounded-[24px] border border-lilac/30 bg-porcelain shadow-[0_8px_30px_rgba(167,123,239,0.06)] p-5 transition-all duration-300 focus-within:-translate-y-1 focus-within:border-lilac/50 focus-within:ring-4 focus-within:ring-lilac/15 focus-within:shadow-[0_16px_40px_rgba(167,123,239,0.12)] sm:p-7 flex flex-col">
            <label
              htmlFor="dayFour-thought"
              className="block text-sm font-semibold text-ink mb-1.5"
            >
              The thought that returns
            </label>
            <p className="text-xs text-ink/60 mb-5">
              What concern, question, or sentence keeps coming back?
            </p>
            <textarea
              id="dayFour-thought"
              ref={thoughtRef}
              name="recurring_thought"
              maxLength={10000}
              value={thought}
              onChange={(event) => setThought(event.target.value)}
              placeholder="Write the thought that keeps returning…"
              className="w-full flex-1 resize-none overflow-y-auto bg-transparent text-base leading-8 text-ink outline-none placeholder:text-ink/30 font-medium"
            />
          </div>

          <div className="h-8 sm:h-12 w-0.75 bg-linear-to-b from-lilac/40 to-ink/20 mx-auto -my-1 relative z-0 rounded-full"></div>

          <div className="relative z-10 rounded-[24px] border border-ink/15 bg-orchid-mist/40 p-5 transition-all duration-300 focus-within:-translate-y-1 focus-within:border-ink/30 focus-within:ring-4 focus-within:ring-ink/5 sm:p-7 flex flex-col">
            <label
              htmlFor="dayFour-moment"
              className="block text-sm font-semibold text-ink mb-1.5"
            >
              When it tends to return{" "}
              <span className="text-ink/40 font-normal text-xs ml-2">
                (optional)
              </span>
            </label>
            <p className="text-xs text-ink/60 mb-5">
              What time, place, situation, or moment do you notice it most?
            </p>
            <textarea
              id="dayFour-moment"
              ref={momentRef}
              name="usual_moment"
              maxLength={10000}
              value={moment}
              onChange={(event) => setMoment(event.target.value)}
              placeholder="Write when you tend to notice it…"
              className="w-full flex-1 resize-none overflow-y-auto bg-transparent text-base leading-8 text-ink outline-none placeholder:text-ink/30"
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
          {thought !== initialThought || moment !== initialMoment ? (
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
            disabled={pending || !thought.trim()}
            className="inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(36,33,53,.18)] disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Save className="size-4" />
            {pending ? "Saving Day 4…" : entry ? "Save changes" : "Save Day 4"}
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
