"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Save } from "lucide-react";
import { saveDayThreeEntry, type JournalEntry } from "@/app/actions";
import type { ProgramDayView } from "@/lib/program";
import { ReflectionPanel } from "@/components/reflectionPanel";
import { MoodSelector } from "@/components/moodSelector";

export function DayThreeComposer({
  day,
  entry,
}: {
  day: ProgramDayView;
  entry: JournalEntry | null;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(saveDayThreeEntry, null);

  const responseData = entry?.response_data as
    | import("@/app/actions").DayThreeResponseData
    | null
    | undefined;
  const initialWithin =
    responseData?.within_control ??
    (entry?.content && !entry?.response_data ? entry.content : "");
  const initialOutside = responseData?.outside_control ?? "";

  const [within, setWithin] = useState(initialWithin);
  const [outside, setOutside] = useState(initialOutside);
  const [mood, setMood] = useState<number | null>(entry?.mood ?? null);

  const withinRef = useRef<HTMLTextAreaElement>(null);
  const outsideRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (state?.status === "success") router.refresh();
  }, [router, state]);

  useEffect(() => {
    if (withinRef.current) {
      withinRef.current.style.height = "auto";
      withinRef.current.style.height = `${Math.min(Math.max(withinRef.current.scrollHeight, 180), window.innerHeight * 0.4)}px`;
    }
  }, [within]);

  useEffect(() => {
    if (outsideRef.current) {
      outsideRef.current.style.height = "auto";
      outsideRef.current.style.height = `${Math.min(Math.max(outsideRef.current.scrollHeight, 180), window.innerHeight * 0.4)}px`;
    }
  }, [outside]);

  function discardChanges() {
    if (
      (within === initialWithin && outside === initialOutside) ||
      window.confirm("Discard the changes in this Day 3 exercise?")
    ) {
      setWithin(initialWithin);
      setOutside(initialOutside);
      setMood(entry?.mood ?? null);
    }
  }

  const combinedLength =
    (within ? `Within your control:\n${within}\n\n` : "").length +
    (outside ? `Outside your control:\n${outside}` : "").length;

  return (
    <section className="surface rounded-[30px] p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.16em] text-ink/42">
            Day 3 · Control
          </p>
          <p className="mt-2 text-sm leading-6 text-ink/60">
            You do not need to carry every part of a situation alone. Notice
            what is yours to choose and what is not.
          </p>
        </div>
        {entry ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-seafoam/55 px-3 py-1.5 text-xs font-semibold text-ink/65">
            <Check className="size-3.5" />
            Day 3 saved
          </span>
        ) : null}
      </div>
      <form action={action} className="mt-7">
        <input type="hidden" name="mood" value={mood ?? ""} />

        <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
          <div className="rounded-xl border border-seafoam/30 bg-seafoam/5 p-4 transition focus-within:border-seafoam/50 focus-within:ring-4 focus-within:ring-seafoam/10 sm:p-5 flex flex-col">
            <label
              htmlFor="dayThree-within"
              className="block text-sm font-semibold text-ink mb-1"
            >
              Within your control
            </label>
            <p className="text-xs text-ink/50 mb-3">
              What can you choose, say, do, or leave alone?
            </p>
            <textarea
              id="dayThree-within"
              ref={withinRef}
              name="within_control"
              maxLength={10000}
              value={within}
              onChange={(event) => setWithin(event.target.value)}
              placeholder="Write the part that is yours to decide or act on…"
              className="min-h-44 w-full flex-1 resize-none overflow-y-auto bg-transparent text-base leading-8 text-ink outline-none placeholder:text-ink/30"
            />
          </div>

          <div className="rounded-xl border border-lilac/30 bg-orchid-mist/10 p-4 transition focus-within:border-lilac/50 focus-within:ring-4 focus-within:ring-lilac/10 sm:p-5 flex flex-col">
            <label
              htmlFor="dayThree-outside"
              className="block text-sm font-semibold text-ink mb-1"
            >
              Outside your control
            </label>
            <p className="text-xs text-ink/50 mb-3">
              What belongs to other people, timing, or circumstances?
            </p>
            <textarea
              id="dayThree-outside"
              ref={outsideRef}
              name="outside_control"
              maxLength={10000}
              value={outside}
              onChange={(event) => setOutside(event.target.value)}
              placeholder="Write what you cannot decide for yourself right now…"
              className="min-h-44 w-full flex-1 resize-none overflow-y-auto bg-transparent text-base leading-8 text-ink outline-none placeholder:text-ink/30"
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
          {within !== initialWithin || outside !== initialOutside ? (
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
            disabled={pending || (!within.trim() && !outside.trim())}
            className="inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(36,33,53,.18)] disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Save className="size-4" />
            {pending ? "Saving Day 3…" : entry ? "Save changes" : "Save Day 3"}
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
