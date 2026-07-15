"use server";

import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

export type WaitlistActionState = {
  message?: string;
};

const journalingFrequencies = new Set([
  "never_started",
  "tried_a_few_times",
  "few_times_per_month",
  "few_times_per_week",
  "most_days",
]);

const journalingDifficulties = new Set([
  "dont_know_where_to_begin",
  "overthink_what_to_write",
  "forget_or_lose_consistency",
  "too_time_consuming",
  "not_found_useful_format",
  "other",
]);

const willingnessOptions = new Set(["yes", "maybe", "not_right_now"]);

function readValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function createWaitlistClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase public environment variables are not configured.");
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function submitWaitlist(
  _previousState: WaitlistActionState,
  formData: FormData,
): Promise<WaitlistActionState> {
  if (readValue(formData, "website")) {
    redirect("/waitlist/success");
  }

  const firstName = readValue(formData, "first_name");
  const email = readValue(formData, "email").toLowerCase();
  const is18OrOlder = formData.get("is_18_or_older") === "on";
  const journalingFrequency = readValue(formData, "journaling_frequency");
  const biggestDifficulty = readValue(formData, "biggest_difficulty");
  const willingnessToPay = readValue(formData, "willingness_to_pay");

  if (!firstName || firstName.length > 80 || !email || email.length > 254 || !is18OrOlder) {
    return { message: "Please complete your name, email, and age confirmation." };
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return { message: "Enter a valid email address." };
  }

  if (!journalingFrequencies.has(journalingFrequency) || !journalingDifficulties.has(biggestDifficulty)) {
    return { message: "Choose the options that best match your journaling experience." };
  }

  if (!willingnessOptions.has(willingnessToPay)) {
    return { message: "Choose whether you would consider the ₹299 founding beta." };
  }

  const { error } = await createWaitlistClient().from("waitlist_signups").insert({
    first_name: firstName,
    email,
    is_18_or_older: is18OrOlder,
    journaling_frequency: journalingFrequency,
    biggest_difficulty: biggestDifficulty,
    willingness_to_pay: willingnessToPay,
  });

  if (error) {
    if (error.code === "23505") {
      redirect("/waitlist/success");
    } else {
      console.error("Supabase insert error:", error);
      return { message: "We could not save your place just now. Please try again." };
    }
  }

  redirect("/waitlist/success");
}
