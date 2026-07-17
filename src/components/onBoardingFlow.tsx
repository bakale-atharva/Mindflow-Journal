"use client";

import { useActionState, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { completeOnboarding } from "@/app/actions";
import { cn } from "@/lib/utils";

export function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [isAdult, setIsAdult] = useState(false);
  const [consent, setConsent] = useState<"yes" | "no" | null>(null);
  const [state, action, pending] = useActionState(completeOnboarding, null);

  return (
    <form
      action={action}
      className="surface relative mx-auto w-full max-w-xl overflow-hidden rounded-[32px] p-6 sm:p-9 lg:max-w-4xl lg:min-h-[min(820px,calc(100dvh-5rem))] lg:translate-x-[8%] lg:p-12 xl:p-14"
    >
      <input
        type="hidden"
        name="is_18_or_older"
        value={isAdult ? "yes" : "no"}
      />
      <input type="hidden" name="ai_consent" value={consent ?? ""} />
      <div className="mb-10 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[.18em] text-ink/45">
          Set up your journal
        </span>
        <span className="font-mono text-xs text-ink/45">{step} / 3</span>
      </div>
      <div className="mb-8 flex gap-2" aria-hidden="true">
        {[1, 2, 3].map((item) => (
          <span
            key={item}
            className={cn(
              "h-1 flex-1 rounded-full",
              item <= step ? "bg-ink" : "bg-ink/8",
            )}
          />
        ))}
      </div>

      {step === 1 ? (
        <section className="lg:max-w-3xl">
          <span className="grid size-12 place-items-center rounded-2xl bg-orchid-mist text-primary">
            <Sparkles className="size-5" />
          </span>
          <h1 className="mt-7 font-heading text-4xl font-semibold leading-[1.02] tracking-[-.055em] text-ink sm:text-5xl lg:text-6xl">
            Seven days.
            <br />
            One honest prompt at a time.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-ink/60 lg:text-lg lg:leading-8">
            MindFlow gives you one focused prompt, a private place to write,
            and—if you choose—a concise reflection grounded in your words.
          </p>
          <div className="mt-7 max-w-2xl rounded-[20px] border border-ink/8 bg-porcelain p-4 text-sm leading-6 text-ink/58 lg:p-5 lg:text-base">
            MindFlow is a self-reflection tool. It does not provide therapy,
            diagnosis, medical advice, or crisis support.
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section>
          <span className="grid size-12 place-items-center rounded-2xl bg-seafoam/65 text-ink">
            <LockKeyhole className="size-5" />
          </span>
          <h1 className="mt-7 font-heading text-4xl font-semibold tracking-tighter text-ink">
            A private space for adults.
          </h1>
          <p className="mt-4 text-base leading-7 text-ink/60">
            The founding beta is available only to people aged 18 and over.
          </p>
          <label
            className={cn(
              "mt-8 flex cursor-pointer items-start gap-4 rounded-xl border p-5 transition-colors",
              isAdult
                ? "border-primary/35 bg-orchid-mist/50"
                : "border-ink/10 bg-white",
            )}
          >
            <input
              type="checkbox"
              checked={isAdult}
              onChange={(event) => setIsAdult(event.target.checked)}
              className="sr-only"
            />
            <span
              className={cn(
                "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border",
                isAdult ? "border-ink bg-ink text-white" : "border-ink/20",
              )}
            >
              <Check className={cn("size-3.5", !isAdult && "opacity-0")} />
            </span>
            <span>
              <span className="block font-semibold text-ink">
                I am at least 18 years old
              </span>
              <span className="mt-1 block text-sm leading-6 text-ink/55">
                This confirmation is required before Day 1 unlocks.
              </span>
            </span>
          </label>
        </section>
      ) : null}

      {step === 3 ? (
        <section>
          <span className="grid size-12 place-items-center rounded-2xl bg-coral/20 text-ink">
            <Sparkles className="size-5" />
          </span>
          <h1 className="mt-7 font-heading text-4xl font-semibold tracking-tighter text-ink">
            Would you like a reflection?
          </h1>
          <p className="mt-4 text-base leading-7 text-ink/60">
            MindFlow sends the text of each saved entry to NVIDIA for automated
            safety screening and one concise AI-generated reflection. This is
            optional. If you decline, your journal will still work normally.
          </p>
          <div className="mt-7 grid gap-3">
            {[
              {
                value: "yes" as const,
                title: "Yes, include reflections",
                body: "Send each saved entry for a short, non-clinical reflection.",
              },
              {
                value: "no" as const,
                title: "No, keep it journal-only",
                body: "Save entries privately without sending their text to NVIDIA.",
              },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setConsent(option.value)}
                className={cn(
                  "rounded-xl border p-5 text-left transition-colors",
                  consent === option.value
                    ? "border-primary/40 bg-orchid-mist/55"
                    : "border-ink/10 bg-white hover:border-ink/20",
                )}
              >
                <span className="font-semibold text-ink">{option.title}</span>
                <span className="mt-1 block text-sm leading-6 text-ink/55">
                  {option.body}
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {state?.status === "error" ? (
        <p
          role="alert"
          className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.error}
        </p>
      ) : null}
      <div className="mt-10 flex items-center justify-between gap-3 lg:mt-14">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep((value) => value - 1)}
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-ink/55 hover:bg-ink/5"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
        ) : (
          <span />
        )}
        {step < 3 ? (
          <button
            type="button"
            disabled={step === 2 && !isAdult}
            onClick={() => setStep((value) => value + 1)}
            className="inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-35"
          >
            Continue
            <ArrowRight className="size-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!consent || pending}
            className="rounded-2xl bg-ink px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-35"
          >
            {pending ? "Starting…" : "Start Day 1"}
          </button>
        )}
      </div>
    </form>
  );
}
