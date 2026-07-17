"use client";

import { useActionState, useEffect } from "react";
import { Sparkles, RefreshCw, TriangleAlert, Download, Mail, X } from "lucide-react";
import type { DashboardData } from "@/app/actions";
import {
  generateProgramReview,
  retryProgramReview,
  updateAiConsent,
  dismissProgramInsightAction,
  emailProgramInsightAction
} from "@/app/actions";
import { hasActiveNvidiaConsent } from "@/lib/nvidia-ai-config";
import type { ProgramInsight } from "@/lib/program-review";

export function ProgramInsightPanel({
  dashboard,
  currentHash,
}: {
  dashboard: DashboardData;
  currentHash: string;
}) {
  const insightState = dashboard.programInsight;
  const hasNvidiaConsent = hasActiveNvidiaConsent(dashboard.profile);

  const [genState, genAction, isGenerating] = useActionState(
    generateProgramReview,
    null,
  );
  const [retryState, retryAction, isRetrying] = useActionState(
    retryProgramReview,
    null,
  );
  const [consentState, consentAction, isConsenting] = useActionState(
    updateAiConsent,
    null,
  );
  const [dismissState, dismissAction, isDismissing] = useActionState(
    dismissProgramInsightAction,
    null,
  );
  const [emailState, emailAction, isEmailing] = useActionState(
    emailProgramInsightAction,
    null,
  );

  const isPending = insightState?.status === "pending" || isGenerating || isRetrying;
  const insight = insightState?.report_json as ProgramInsight | undefined | null;

  useEffect(() => {
    if (isPending) {
      const interval = setInterval(() => {
        window.location.reload();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isPending]);

  if (!hasNvidiaConsent) {
    return (
      <section className="surface mt-6 rounded-[32px] p-7 sm:p-10 flex flex-col items-center text-center">
        <Sparkles className="size-6 text-ink/35 mb-4" />
        <h2 className="font-heading text-2xl font-semibold tracking-[-.02em] text-ink mb-3">
          Your Clarity Map
        </h2>
        <p className="text-sm leading-6 text-ink/65 max-w-md mx-auto mb-6">
          7 of 7 entries completed. You can choose to have AI read your entries
          and generate a 7-day clarity map. It acts as a supportive friend who listens.
        </p>
        <form action={consentAction}>
          <input type="hidden" name="ai_consent" value="yes" />
          <button
            type="submit"
            disabled={isConsenting}
            className="inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(36,33,53,.18)] disabled:opacity-50"
          >
            {isConsenting ? "Updating…" : "Enable AI clarity map"}
          </button>
        </form>
        {consentState?.status === "error" && (
          <p className="mt-3 text-xs text-red-600">{consentState.error}</p>
        )}
      </section>
    );
  }

  if (!insightState || (insightState.status === "failed" && insightState.attempt_count === 0)) {
    return (
      <section className="surface mt-6 rounded-[32px] p-7 sm:p-10 flex flex-col items-center text-center">
        <Sparkles className="size-6 text-ink/35 mb-4" />
        <h2 className="font-heading text-2xl font-semibold tracking-[-.02em] text-ink mb-3">
          Your Clarity Map
        </h2>
        <p className="text-sm leading-6 text-ink/65 max-w-md mx-auto mb-6">
          7 of 7 entries completed. Generate your ephemeral 7-day clarity map.
          It will delete itself 30 minutes after generation.
        </p>
        
        <form action={genAction}>
          <button
            type="submit"
            disabled={isGenerating}
            className="inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(36,33,53,.18)] disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="size-4 animate-spin" /> Generating…
              </>
            ) : (
              "Create my clarity map"
            )}
          </button>
        </form>
        
        {genState?.status === "error" && (
          <p className="mt-3 text-xs text-red-600">{genState.error}</p>
        )}
      </section>
    );
  }

  if (isPending) {
    return (
      <section className="surface mt-6 rounded-[32px] p-7 sm:p-10 flex flex-col items-center text-center animate-pulse">
        <RefreshCw className="size-6 text-ink/35 mb-4 animate-spin" />
        <h2 className="font-heading text-2xl font-semibold tracking-[-.02em] text-ink mb-3">
          Synthesizing your clarity map
        </h2>
        <p className="text-sm leading-6 text-ink/65 max-w-md mx-auto">
          This may take up to 20 seconds to read through all 7 days.
        </p>
      </section>
    );
  }

  if (insightState.status === "safety_redirect") {
    return (
      <section className="mt-6 rounded-[32px] bg-red-50/50 p-7 sm:p-10 text-center border border-red-100">
        <TriangleAlert className="size-6 text-red-500 mx-auto mb-4" />
        <p className="text-sm leading-6 text-red-800 max-w-md mx-auto">
          MindFlow isn’t equipped to help with immediate danger. If you may act
          on thoughts of harming yourself or someone else, contact local
          emergency services now or reach out to someone you trust.
        </p>
      </section>
    );
  }

  if (insightState.status === "failed") {
    return (
      <section className="surface mt-6 rounded-[32px] p-7 sm:p-10 flex flex-col items-center text-center">
        <h2 className="font-heading text-xl font-semibold text-ink mb-3">
          Generation failed
        </h2>
        <p className="text-sm text-ink/65 mb-6">
          We couldn't generate your clarity map.
        </p>
        <form action={retryAction}>
          <button
            type="submit"
            disabled={isRetrying}
            className="inline-flex items-center gap-2 rounded-xl bg-ink/5 px-4 py-2 text-sm font-semibold text-ink hover:bg-ink/10"
          >
            {isRetrying ? "Retrying…" : "Try again"}
          </button>
        </form>
      </section>
    );
  }

  if (!insight) return null;

  return (
    <section className="surface mt-6 rounded-[32px] p-7 sm:p-10 relative">
      <div className="absolute top-6 right-6">
        <form action={dismissAction}>
          <button
            type="submit"
            disabled={isDismissing}
            className="p-2 rounded-full hover:bg-ink/5 text-ink/40 hover:text-ink/60 transition-colors"
            title="Dismiss map"
          >
            <X className="size-5" />
          </button>
        </form>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="size-5 text-seafoam" />
        <h2 className="font-heading text-3xl font-semibold tracking-[-.02em] text-ink">
          Your Clarity Map
        </h2>
      </div>

      <div className="text-base leading-8 text-ink/80 mb-8 whitespace-pre-wrap">
        {insight.overview}
      </div>

      {insight.recurring_threads?.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm uppercase tracking-[.18em] font-mono text-ink/50 mb-4">Recurring Threads</h3>
          <div className="space-y-4">
            {insight.recurring_threads.map((thread, i) => (
              <div key={i} className="rounded-2xl bg-orchid-mist/15 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-ink">{thread.label}</span>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-ink/40">
                    Days {thread.evidence_days?.join(", ")}
                  </span>
                </div>
                <p className="text-sm text-ink/75 leading-relaxed">{thread.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {insight.perspective_shifts?.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm uppercase tracking-[.18em] font-mono text-ink/50 mb-4">Perspective Shifts</h3>
          <ul className="space-y-3">
            {insight.perspective_shifts.map((shift, i) => (
              <li key={i} className="flex gap-3 text-sm text-ink/75 leading-relaxed">
                <span className="text-seafoam mt-1">●</span>
                <span>
                  {shift.explanation}
                  <span className="ml-2 text-[10px] uppercase font-mono tracking-wider text-ink/40">
                    Days {shift.evidence_days?.join(", ")}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {insight.clarity_in_practice?.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm uppercase tracking-[.18em] font-mono text-ink/50 mb-4">Clarity in Practice</h3>
          <ul className="space-y-3">
            {insight.clarity_in_practice.map((practice, i) => (
              <li key={i} className="flex gap-3 text-sm text-ink/75 leading-relaxed">
                <span className="text-coral mt-1">●</span>
                <span>
                  {practice.explanation}
                  <span className="ml-2 text-[10px] uppercase font-mono tracking-wider text-ink/40">
                    Days {practice.evidence_days?.join(", ")}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 pt-8 border-t border-ink/5">
        <h3 className="text-sm uppercase tracking-[.18em] font-mono text-ink/50 mb-4">Carry Forward</h3>
        <p className="text-base text-ink/80 italic">"{insight.carry_forward}"</p>
      </div>

      <div className="mt-10 flex flex-wrap gap-4 items-center justify-start border-t border-ink/5 pt-6">
        <a
          href="/api/export-pdf"
          download
          className="inline-flex items-center gap-2 rounded-xl border border-ink/10 bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-sm hover:bg-ink/5 transition-colors"
        >
          <Download className="size-4" /> Save as PDF
        </a>

        <form action={emailAction}>
          <button
            type="submit"
            disabled={isEmailing || !!insightState.email_sent_at}
            className="inline-flex items-center gap-2 rounded-xl border border-ink/10 bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-sm hover:bg-ink/5 transition-colors disabled:opacity-50"
          >
            <Mail className="size-4" /> 
            {insightState.email_sent_at ? "Email sent" : (isEmailing ? "Sending..." : "Email me a copy")}
          </button>
        </form>
        {emailState?.status === "error" && (
          <span className="text-xs text-red-500">{emailState.error}</span>
        )}
      </div>

      <p className="mt-6 text-xs text-ink/40 font-mono text-center">
        Your journals and insights are yours only. If you wish to save your insight, you have 30 minutes to download or email it before it is deleted from our servers.
      </p>
    </section>
  );
}
