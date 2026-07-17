"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Save } from "lucide-react";
import { saveEntry, type JournalEntry } from "@/app/actions";
import type { ProgramDayView } from "@/lib/program";
import { ReflectionPanel } from "@/components/reflection-panel";
import { MoodSelector } from "@/components/mood-selector";

export function DayOneComposer({
  day,
  entry,
}: {
  day: ProgramDayView;
  entry: JournalEntry | null;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(saveEntry, null);
  const [content, setContent] = useState(entry?.content ?? "");
  const [mood, setMood] = useState<number | null>(entry?.mood ?? null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const originalContent = entry?.content ?? "";

  useEffect(() => {
    if (state?.status === "success") router.refresh();
  }, [router, state]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, 224), window.innerHeight * 0.6)}px`;
  }, [content]);

  function discardChanges() {
    if (
      content === originalContent ||
      window.confirm("Discard the changes in this writing area?")
    ) {
      setContent(originalContent);
      setMood(entry?.mood ?? null);
    }
  }

  return (
    <section className="surface rounded-[30px] p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.16em] text-ink/42">
            Your private entry
          </p>
          <h2 className="mt-2 font-heading text-2xl font-semibold tracking-[-.04em] text-ink">
            Write what is true right now.
          </h2>
        </div>
        {entry ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-seafoam/55 px-3 py-1.5 text-xs font-semibold text-ink/65">
            <Check className="size-3.5" />
            Saved
          </span>
        ) : null}
      </div>

      <form action={action} className="mt-7">
        <input type="hidden" name="program_day" value={day.day} />
        <input type="hidden" name="mood" value={mood ?? ""} />
        <MoodSelector mood={mood} setMood={setMood} />

        <div className="mt-6 rounded-xl border border-ink/10 bg-white p-4 transition focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-lilac/10 sm:p-5">
          <textarea
            ref={textareaRef}
            name="content"
            required
            maxLength={10000}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Begin wherever the thought starts…"
            className="min-h-56 w-full resize-none overflow-y-auto bg-transparent text-base leading-8 text-ink outline-none placeholder:text-ink/25"
          />

          <div className="mt-3 flex justify-end font-mono text-[10px] text-ink/35">
            {content.length.toLocaleString()} / 10,000
          </div>
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
          {content !== originalContent ? (
            <button
              type="button"
              onClick={discardChanges}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-ink/45 hover:bg-ink/5"
            >
              Discard
            </button>
          ) : null}

          <button
            type="submit"
            disabled={pending || !content.trim()}
            className="inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(36,33,53,.18)] disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Save className="size-4" />
            {pending ? "Saving entry…" : entry ? "Save changes" : "Save entry"}
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
