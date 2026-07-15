"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { submitWaitlist, type WaitlistActionState } from "./actions";

const initialState: WaitlistActionState = {};

const fieldClassName =
  "w-full h-11 bg-input rounded-[14px] px-4 border border-transparent focus:border-ring/30 focus:bg-white transition-colors outline-none text-ink text-[15px]";

export function WaitlistForm() {
  const [state, formAction, pending] = useActionState(submitWaitlist, initialState);

  return (
    <form action={formAction} className="relative z-10 flex flex-col gap-5">
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="space-y-1">
        <label htmlFor="first_name" className="text-sm font-medium text-ink block">First name</label>
        <input id="first_name" name="first_name" type="text" required maxLength={80} autoComplete="given-name" className={fieldClassName} placeholder="Your name" />
      </div>

      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium text-ink block">Email address</label>
        <input id="email" name="email" type="email" required maxLength={254} autoComplete="email" className={fieldClassName} placeholder="you@example.com" />
      </div>

      <div className="space-y-1">
        <label htmlFor="journaling_frequency" className="text-sm font-medium text-ink block">How often do you currently journal?</label>
        <select id="journaling_frequency" name="journaling_frequency" required defaultValue="" className={`${fieldClassName} appearance-none`}>
          <option value="" disabled>Select an option…</option>
          <option value="never_started">Never started</option>
          <option value="tried_a_few_times">Tried a few times</option>
          <option value="few_times_per_month">A few times per month</option>
          <option value="few_times_per_week">A few times per week</option>
          <option value="most_days">Most days</option>
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="biggest_difficulty" className="text-sm font-medium text-ink block">What usually makes journaling difficult?</label>
        <select id="biggest_difficulty" name="biggest_difficulty" required defaultValue="" className={`${fieldClassName} appearance-none`}>
          <option value="" disabled>Select an option…</option>
          <option value="dont_know_where_to_begin">I do not know where to begin</option>
          <option value="overthink_what_to_write">I overthink what to write</option>
          <option value="forget_or_lose_consistency">I forget or lose consistency</option>
          <option value="too_time_consuming">Writing feels too time-consuming</option>
          <option value="not_found_useful_format">I have not found a useful format</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="space-y-3 pt-2">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input type="checkbox" name="is_18_or_older" required className="mt-0.5 size-5 rounded-[6px] border-border text-primary focus:ring-primary/20 cursor-pointer" />
          <span className="text-[14px] leading-snug text-ink/80 group-hover:text-ink transition-colors">I confirm I am 18 years or older.</span>
        </label>

        <div className="space-y-1">
          <label htmlFor="willingness_to_pay" className="text-sm font-medium text-ink block">Would you consider paying ₹299 for the seven-day founding beta?</label>
          <select id="willingness_to_pay" name="willingness_to_pay" required defaultValue="" className={`${fieldClassName} appearance-none`}>
            <option value="" disabled>Select an option…</option>
            <option value="yes">Yes</option>
            <option value="maybe">Maybe, depending on details</option>
            <option value="not_right_now">Not right now</option>
          </select>
        </div>
      </div>

      {state.message ? <p className="rounded-[14px] border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive" aria-live="polite">{state.message}</p> : null}

      <Button type="submit" disabled={pending} className="w-full h-12 rounded-[14px] mt-2 text-[15px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
        {pending ? "Joining…" : "Join the interest list"}
      </Button>
    </form>
  );
}
