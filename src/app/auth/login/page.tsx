import { redirect } from "next/navigation";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { MagicLinkForm } from "@/components/magic-link-form";
import { ThoughtContour } from "@/components/thought-contour";
import { getBetaUser } from "@/lib/auth";

const AUTH_ERRORS: Record<string, string> = {
  "invalid-link": "This sign-in link is incomplete. Request a new one.",
  "expired-link":
    "This sign-in link has expired or was already used. Request a new one.",
  "invalid-session":
    "Your session could not be verified. Request a new sign-in link.",
  "access-required": "This email no longer has active founding access.",
  "profile-error":
    "Your private workspace could not be prepared. Try signing in again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getBetaUser();
  if (user) redirect("/");
  const { error } = await searchParams;
  const authError = error ? AUTH_ERRORS[error] : null;

  return (
    <div className="min-h-dvh px-4 py-4 sm:px-7 sm:py-7">
      <div className="mx-auto grid min-h-[calc(100dvh-2rem)] max-w-330 overflow-hidden rounded-[32px] border border-white/70 bg-white/45 shadow-[0_30px_100px_rgba(67,55,91,.12)] lg:grid-cols-[1.08fr_.92fr] sm:min-h-[calc(100dvh-3.5rem)]">
        <section className="relative hidden overflow-hidden p-10 lg:flex lg:flex-col lg:justify-between">
          <ThoughtContour
            mood={4}
            className="absolute inset-0 min-h-0 rounded-none"
          />
          <div className="relative z-10 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-md bg-ink text-sm font-semibold text-white">
              M
            </span>
            <span className="font-heading text-xl font-semibold tracking-[-.04em]">
              MindFlow Journal
            </span>
          </div>
          <div className="relative z-10 max-w-2xl pb-6">
            <p className="font-mono text-[11px] uppercase tracking-[.19em] text-ink/52">
              Private founding beta
            </p>
            <h1 className="mt-5 font-heading text-6xl font-semibold leading-[.96] tracking-[-.07em] text-ink xl:text-7xl">
              A quieter place for what’s taking up space.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-8 text-ink/62">
              One focused prompt each day, a private place to answer, and a
              concise reflection when you choose it.
            </p>
          </div>
        </section>
        <section className="flex items-center justify-center bg-porcelain/78 p-5 sm:p-10 lg:p-14">
          <div className="w-full max-w-md">
            <div className="mb-12 flex items-center gap-3 lg:hidden">
              <span className="grid size-10 place-items-center rounded-md bg-ink text-sm font-semibold text-white">
                M
              </span>
              <span className="font-heading text-xl font-semibold tracking-[-.04em]">
                MindFlow
              </span>
            </div>
            <span className="grid size-12 place-items-center rounded-2xl bg-orchid-mist text-primary">
              <LockKeyhole className="size-5" />
            </span>
            <p className="mt-8 font-mono text-[10px] uppercase tracking-[.18em] text-primary">
              Founding access
            </p>
            <h2 className="mt-3 font-heading text-4xl font-semibold tracking-[-.055em] text-ink">
              Open your private journal.
            </h2>
            <p className="mt-4 text-sm leading-6 text-ink/52">
              Enter the email used for your founding access. We’ll send one
              secure link—no password to remember.
            </p>
            {authError ? (
              <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                {authError}
              </p>
            ) : null}
            <div className="mt-8">
              <MagicLinkForm />
            </div>
            <div className="mt-9 flex items-start gap-3 border-t border-ink/8 pt-6 text-xs leading-5 text-ink/40">
              <ShieldCheck className="mt-0.5 size-4 shrink-0" />
              For adults 18+. MindFlow is a journaling and self-reflection tool,
              not clinical care.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
