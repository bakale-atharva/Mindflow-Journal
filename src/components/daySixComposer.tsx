"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Save } from "lucide-react";
import { saveDaySixEntry, type JournalEntry } from "@/app/actions";
import type { ProgramDayView } from "@/lib/program";
import { ReflectionPanel } from "@/components/reflection-panel";
import { MoodSelector } from "@/components/mood-selector";

export function DaySixComposer({
  day,
  entry,
}: {
  day: ProgramDayView;
  entry: JournalEntry | null;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(saveDaySixEntry, null);

  const responseData = entry?.response_data as
    | import("@/app/actions").DaySixResponseData
    | null
    | undefined;
  const initialAction =
    responseData?.small_action ??
    (entry?.content && !entry?.response_data ? entry.content : "");
  const initialMoment = responseData?.first_moment ?? "";

  const [smallAction, setSmallAction] = useState(initialAction);
  const [moment, setMoment] = useState(initialMoment);
  const [mood, setMood] = useState<number | null>(entry?.mood ?? null);

  const actionRef = useRef<HTMLTextAreaElement>(null);
  const momentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (state?.status === "success") router.refresh();
  }, [router, state]);

  useEffect(() => {
    if (actionRef.current) {
      actionRef.current.style.height = "auto";
      actionRef.current.style.height = `${Math.min(Math.max(actionRef.current.scrollHeight, 160), window.innerHeight * 0.45)}px`;
    }
  }, [smallAction]);

  useEffect(() => {
    if (momentRef.current) {
      momentRef.current.style.height = "auto";
      momentRef.current.style.height = `${Math.min(Math.max(momentRef.current.scrollHeight, 120), window.innerHeight * 0.25)}px`;
    }
  }, [moment]);

  function discardChanges() {
    if (
      (smallAction === initialAction && moment === initialMoment) ||
      window.confirm("Discard the changes in this Day 6 exercise?")
    ) {
      setSmallAction(initialAction);
      setMoment(initialMoment);
      setMood(entry?.mood ?? null);
    }
  }

  const combinedLength =
    (smallAction ? `One small action:\n${smallAction}\n\n` : "").length +
    (moment ? `Make starting lighter:\n${moment}` : "").length;

  return (
    <section className="surface rounded-[30px] p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.16em] text-ink/42">
            Day 6 · Movement
          </p>
          <p className="mt-2 text-sm leading-6 text-ink/60">
            A small action can break the freeze. It doesn&apos;t have to solve
            everything.
          </p>
        </div>
        {entry ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-seafoam/55 px-3 py-1.5 text-xs font-semibold text-ink/65">
            <Check className="size-3.5" />
            Day 6 saved
          </span>
        ) : null}
      </div>
      <form action={action} className="mt-7">
        <input type="hidden" name="mood" value={mood ?? ""} />

        <div className="max-w-2xl mx-auto flex flex-col mb-10 relative">
          <div className="relative z-10 rounded-[32px] border border-lilac/20 bg-porcelain shadow-[0_8px_30px_rgba(167,123,239,0.06)] p-6 sm:p-8 transition-all duration-300 focus-within:-translate-y-1 focus-within:border-lilac/40 focus-within:shadow-[0_16px_40px_rgba(167,123,239,0.1)] flex flex-col group">
            <label
              htmlFor="daySix-action"
              className="block text-sm font-semibold text-ink mb-1.5 group-focus-within:text-ink/80 transition-colors"
            >
              One small action
            </label>
            <p className="text-xs text-ink/60 mb-5">
              What is one small action that could create a little more clarity?
            </p>
            <textarea
              id="daySix-action"
              ref={actionRef}
              name="small_action"
              maxLength={10000}
              value={smallAction}
              onChange={(event) => setSmallAction(event.target.value)}
              placeholder="Write a single, small step…"
              className="w-full flex-1 resize-none bg-transparent text-base leading-8 text-ink outline-none placeholder:text-ink/30 font-medium"
            />
          </div>

          <div className="flex items-center ml-10 sm:ml-16 h-10 sm:h-12 relative z-0">
            <div className="w-0.5 h-full bg-linear-to-b from-lilac/40 to-seafoam/40"></div>
          </div>

          <div className="relative z-10 rounded-2xl border border-seafoam/40 bg-[#f0fbf4] p-5 sm:p-7 transition-all duration-300 focus-within:-translate-y-1 focus-within:border-seafoam/80 focus-within:shadow-[0_12px_36px_rgba(189,244,209,0.2)] flex flex-col ml-6 sm:ml-12 w-[90%] sm:w-[85%] self-start group">
            <label
              htmlFor="daySix-moment"
              className="block text-sm font-semibold text-ink mb-1.5 group-focus-within:text-ink/80 transition-colors"
            >
              Make starting lighter{" "}
              <span className="text-ink/40 font-normal text-xs ml-2">
                (optional)
              </span>
            </label>
            <p className="text-xs text-ink/60 mb-5">
              What could make starting feel a little lighter?
            </p>
            <textarea
              id="daySix-moment"
              ref={momentRef}
              name="first_moment"
              maxLength={10000}
              value={moment}
              onChange={(event) => setMoment(event.target.value)}
              placeholder="Write an idea to make it easier to begin…"
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
          {smallAction !== initialAction || moment !== initialMoment ? (
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
            disabled={pending || !smallAction.trim()}
            className="inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(36,33,53,.18)] disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Save className="size-4" />
            {pending
              ? "Saving Day 6…"
              : entry
                ? "Save changes"
                : "Save today's entry"}
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
