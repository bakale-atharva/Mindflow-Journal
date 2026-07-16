"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { createAdminClient } from "@/lib/admin";
import { requireBetaUser } from "@/lib/auth";
import { recordProductEvent } from "@/lib/events";
import {
  buildProgramDays,
  getProgramDay,
  getPrompt,
  getUnlockTime,
  isCompletionWindowOpen,
  isProgramComplete,
  PROGRAM_LENGTH,
  type ProgramDay,
  type ProgramDayView,
} from "@/lib/program";
import { generateReflection, type ReflectionResult } from "@/lib/reflections";
import { createClient } from "@/lib/server";

export type ReflectionStatus =
  | "pending"
  | "complete"
  | "failed"
  | "safety_redirect";

export type AIReflection = {
  entry_id: string;
  reflection: string | null;
  question: string | null;
  status: ReflectionStatus;
  attempt_count: number;
  created_at: string;
  updated_at: string;
};

export type Day2ResponseData = {
  version: 1;
  urgent: string;
  can_wait: string;
};

export type Day3ResponseData = {
  version: 1;
  within_control: string;
  outside_control: string;
};

export type Day4ResponseData = {
  version: 1;
  recurring_thought: string;
  usual_moment: string;
};

export type Day5ResponseData = {
  version: 1;
  note_to_friend: string;
  line_to_keep: string;
};

export type Day6ResponseData = {
  version: 1;
  small_action: string;
  first_moment: string;
};

export type StructuredResponseData =
  | Day2ResponseData
  | Day3ResponseData
  | Day4ResponseData
  | Day5ResponseData
  | Day6ResponseData
  | null;

export type JournalEntry = {
  id: string;
  user_id: string;
  program_day: number;
  prompt_id: string;
  content: string;
  response_data: StructuredResponseData;
  mood: number | null;
  created_at: string;
  updated_at: string;
  reflection: AIReflection | null;
};

export type ProfileState = {
  email: string;
  onboarding_completed_at: string | null;
  program_started_at: string | null;
  is_18_or_older: boolean;
  ai_processing_consent_at: string | null;
  ai_processing_provider: string | null;
  ai_consent_version: number | null;
  ai_processing_consent_revoked_at: string | null;
};

export type DashboardData = {
  profile: ProfileState;
  entries: JournalEntry[];
  days: ProgramDayView[];
  currentDay: ProgramDay | null;
  nextUnlockAt: string | null;
  completed: boolean;
  completionWindowOpen: boolean;
};

export type EntryActionState =
  | {
      status: "success";
      entryId: string;
      reflection:
        | ReflectionResult
        | { status: "not_requested"; reflection: null; question: null };
    }
  | { status: "error"; error: string }
  | null;

export type BasicActionState =
  | { status: "success"; message: string }
  | { status: "error"; error: string }
  | null;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseMood(value: FormDataEntryValue | null) {
  if (value === null || value === "") return null;
  const mood = Number(value);
  return Number.isInteger(mood) && mood >= 1 && mood <= 5 ? mood : undefined;
}

export async function getDashboard(): Promise<DashboardData> {
  const user = await requireBetaUser();
  const supabase = await createClient();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "email, onboarding_completed_at, program_started_at, is_18_or_older, ai_processing_consent_at, ai_processing_provider, ai_consent_version, ai_processing_consent_revoked_at",
    )
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile)
    throw new Error("Your MindFlow profile could not be loaded.");

  const [entriesResult, reflectionsResult] = await Promise.all([
    supabase
      .from("journal_entries")
      .select(
        "id, user_id, program_day, prompt_id, content, response_data, mood, created_at, updated_at",
      )
      .eq("user_id", user.id)
      .not("program_day", "is", null)
      .order("program_day", { ascending: true }),
    supabase
      .from("ai_reflections")
      .select(
        "entry_id, reflection, question, status, attempt_count, created_at, updated_at",
      )
      .eq("user_id", user.id),
  ]);

  if (entriesResult.error)
    throw new Error("Your journal entries could not be loaded.");
  if (reflectionsResult.error)
    throw new Error("Your reflections could not be loaded.");

  const reflectionByEntry = new Map(
    (reflectionsResult.data ?? []).map((reflection) => [
      reflection.entry_id,
      reflection as AIReflection,
    ]),
  );
  const entries = (entriesResult.data ?? []).map((entry) => ({
    ...entry,
    program_day: Number(entry.program_day),
    prompt_id:
      entry.prompt_id ?? getPrompt(Number(entry.program_day))?.id ?? "",
    reflection: reflectionByEntry.get(entry.id) ?? null,
  })) as JournalEntry[];

  const startedAt = profile.program_started_at;
  const currentDay = startedAt ? getProgramDay(startedAt) : null;
  const days = startedAt ? buildProgramDays(startedAt, entries) : [];
  const completed = startedAt ? isProgramComplete(startedAt, entries) : false;

  return {
    profile,
    entries,
    days,
    currentDay,
    nextUnlockAt:
      startedAt && currentDay && currentDay < PROGRAM_LENGTH
        ? getUnlockTime(startedAt, (currentDay + 1) as ProgramDay).toISOString()
        : null,
    completed,
    completionWindowOpen: startedAt ? isCompletionWindowOpen(startedAt) : true,
  };
}

export async function completeOnboarding(
  _previous: BasicActionState,
  formData: FormData,
): Promise<BasicActionState> {
  const user = await requireBetaUser();
  const isAdult = formData.get("is_18_or_older") === "yes";
  const consentChoice = formData.get("ai_consent");

  if (!isAdult)
    return {
      status: "error",
      error: "You must be at least 18 to join the founding beta.",
    };
  if (consentChoice !== "yes" && consentChoice !== "no") {
    return {
      status: "error",
      error: "Choose whether you want AI reflections.",
    };
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("program_started_at")
    .eq("user_id", user.id)
    .single();
  if (profile?.program_started_at) redirect("/");

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("profiles")
    .update({
      is_18_or_older: true,
      ai_processing_consent_at: consentChoice === "yes" ? now : null,
      ai_processing_provider: consentChoice === "yes" ? "groq" : null,
      ai_consent_version: consentChoice === "yes" ? 2 : null,
      ai_processing_consent_revoked_at: null,
      onboarding_completed_at: now,
      program_started_at: now,
    })
    .eq("user_id", user.id);

  if (error)
    return {
      status: "error",
      error: "Your program could not be started. Try again.",
    };
  after(() => recordProductEvent(user.id, "program_started"));
  redirect("/");
}

export async function saveEntry(
  _previous: EntryActionState,
  formData: FormData,
): Promise<EntryActionState> {
  const user = await requireBetaUser();
  const contentValue = formData.get("content");
  const content = typeof contentValue === "string" ? contentValue.trim() : "";
  const day = Number(formData.get("program_day"));
  const prompt = getPrompt(day);
  const mood = parseMood(formData.get("mood"));

  if (!content)
    return {
      status: "error",
      error: "Write something before saving your entry.",
    };
  if (content.length > 10_000)
    return {
      status: "error",
      error: "Keep this entry under 10,000 characters.",
    };
  if (!prompt)
    return { status: "error", error: "Choose an available program day." };
  if (mood === undefined)
    return {
      status: "error",
      error: "Choose a mood from 1 to 5, or leave it blank.",
    };

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "program_started_at, onboarding_completed_at, ai_processing_consent_at, ai_processing_provider, ai_consent_version, ai_processing_consent_revoked_at",
    )
    .eq("user_id", user.id)
    .single();

  if (!profile?.program_started_at || !profile.onboarding_completed_at) {
    return {
      status: "error",
      error: "Start your seven-day program before writing an entry.",
    };
  }
  if (day > getProgramDay(profile.program_started_at)) {
    return { status: "error", error: "This day has not unlocked yet." };
  }

  const { data: existing } = await supabase
    .from("journal_entries")
    .select("id")
    .eq("user_id", user.id)
    .eq("program_day", day)
    .maybeSingle();

  const write = existing
    ? supabase
        .from("journal_entries")
        .update({ content, mood, prompt_id: prompt.id })
        .eq("id", existing.id)
        .eq("user_id", user.id)
        .select("id, user_id, content")
        .single()
    : supabase
        .from("journal_entries")
        .insert({
          user_id: user.id,
          program_day: day,
          prompt_id: prompt.id,
          content,
          mood,
        })
        .select("id, user_id, content")
        .single();

  const { data: entry, error } = await write;
  if (error || !entry)
    return {
      status: "error",
      error: "Your entry could not be saved. Try again.",
    };

  after(() => recordProductEvent(user.id, "entry_saved", { program_day: day }));
  if (!existing && day === 2)
    after(() => recordProductEvent(user.id, "day_2_return"));

  const { data: completionEntries } = await supabase
    .from("journal_entries")
    .select("program_day, created_at")
    .eq("user_id", user.id)
    .not("program_day", "is", null);
  if (
    !existing &&
    isProgramComplete(profile.program_started_at, completionEntries ?? [])
  ) {
    after(() => recordProductEvent(user.id, "program_completed"));
  }

  const hasGroqConsent =
    profile.ai_processing_consent_at !== null &&
    profile.ai_processing_consent_revoked_at === null &&
    profile.ai_processing_provider === "groq" &&
    profile.ai_consent_version === 2;

  const reflection = hasGroqConsent
    ? await generateReflection(entry)
    : { status: "not_requested" as const, reflection: null, question: null };

  revalidatePath("/");
  revalidatePath("/journal");
  revalidatePath(`/entry/${entry.id}`);
  return { status: "success", entryId: entry.id, reflection };
}

export async function saveDayTwoEntry(
  _previous: EntryActionState,
  formData: FormData,
): Promise<EntryActionState> {
  const user = await requireBetaUser();
  const urgentValue = formData.get("urgent");
  const urgent = typeof urgentValue === "string" ? urgentValue.trim() : "";
  const canWaitValue = formData.get("can_wait");
  const can_wait = typeof canWaitValue === "string" ? canWaitValue.trim() : "";
  const day = 2;
  const prompt = getPrompt(day);
  const mood = parseMood(formData.get("mood"));

  if (!urgent && !can_wait) {
    return {
      status: "error",
      error: "Write in at least one section before saving Day 2.",
    };
  }

  const combinedParts = [];
  if (urgent) combinedParts.push(`Feels urgent:\n${urgent}`);
  if (can_wait) combinedParts.push(`Can safely wait:\n${can_wait}`);
  const content = combinedParts.join("\n\n").replace(/\r\n/g, "\n");

  if (content.length > 10_000) {
    return {
      status: "error",
      error: "Keep your Day 2 entry under 10,000 characters.",
    };
  }
  if (!prompt)
    return { status: "error", error: "Day 2 prompt not found." };
  if (mood === undefined)
    return {
      status: "error",
      error: "Choose a mood from 1 to 5, or leave it blank.",
    };

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "program_started_at, onboarding_completed_at, ai_processing_consent_at, ai_processing_provider, ai_consent_version, ai_processing_consent_revoked_at",
    )
    .eq("user_id", user.id)
    .single();

  if (!profile?.program_started_at || !profile.onboarding_completed_at) {
    return {
      status: "error",
      error: "Start your seven-day program before writing an entry.",
    };
  }
  if (day > getProgramDay(profile.program_started_at)) {
    return { status: "error", error: "This day has not unlocked yet." };
  }

  const { data: existing } = await supabase
    .from("journal_entries")
    .select("id")
    .eq("user_id", user.id)
    .eq("program_day", day)
    .maybeSingle();

  const response_data: Day2ResponseData = { version: 1, urgent, can_wait };

  const write = existing
    ? supabase
        .from("journal_entries")
        .update({ content, response_data, mood, prompt_id: prompt.id })
        .eq("id", existing.id)
        .eq("user_id", user.id)
        .select("id, user_id, content")
        .single()
    : supabase
        .from("journal_entries")
        .insert({
          user_id: user.id,
          program_day: day,
          prompt_id: prompt.id,
          content,
          response_data,
          mood,
        })
        .select("id, user_id, content")
        .single();

  const { data: entry, error } = await write;
  if (error || !entry)
    return {
      status: "error",
      error: "Your Day 2 entry could not be saved. Try again.",
    };

  after(() => recordProductEvent(user.id, "entry_saved", { program_day: day }));
  if (!existing)
    after(() => recordProductEvent(user.id, "day_2_return"));

  const { data: completionEntries } = await supabase
    .from("journal_entries")
    .select("program_day, created_at")
    .eq("user_id", user.id)
    .not("program_day", "is", null);
  if (
    !existing &&
    isProgramComplete(profile.program_started_at, completionEntries ?? [])
  ) {
    after(() => recordProductEvent(user.id, "program_completed"));
  }

  const hasGroqConsent =
    profile.ai_processing_consent_at !== null &&
    profile.ai_processing_consent_revoked_at === null &&
    profile.ai_processing_provider === "groq" &&
    profile.ai_consent_version === 2;

  const reflection = hasGroqConsent
    ? await generateReflection(entry)
    : { status: "not_requested" as const, reflection: null, question: null };

  revalidatePath("/");
  revalidatePath("/journal");
  revalidatePath(`/entry/${entry.id}`);
  return { status: "success", entryId: entry.id, reflection };
}

export async function saveDayThreeEntry(
  _previous: EntryActionState,
  formData: FormData,
): Promise<EntryActionState> {
  const user = await requireBetaUser();
  const withinValue = formData.get("within_control");
  const within = typeof withinValue === "string" ? withinValue.trim() : "";
  const outsideValue = formData.get("outside_control");
  const outside = typeof outsideValue === "string" ? outsideValue.trim() : "";
  const day = 3;
  const prompt = getPrompt(day);
  const mood = parseMood(formData.get("mood"));

  if (!within && !outside) {
    return {
      status: "error",
      error: "Write in at least one section before saving Day 3.",
    };
  }

  const combinedParts = [];
  if (within) combinedParts.push(`Within your control:\n${within}`);
  if (outside) combinedParts.push(`Outside your control:\n${outside}`);
  const content = combinedParts.join("\n\n").replace(/\r\n/g, "\n");

  if (content.length > 10_000) {
    return {
      status: "error",
      error: "Keep your Day 3 entry under 10,000 characters.",
    };
  }
  if (!prompt)
    return { status: "error", error: "Day 3 prompt not found." };
  if (mood === undefined)
    return {
      status: "error",
      error: "Choose a mood from 1 to 5, or leave it blank.",
    };

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "program_started_at, onboarding_completed_at, ai_processing_consent_at, ai_processing_provider, ai_consent_version, ai_processing_consent_revoked_at",
    )
    .eq("user_id", user.id)
    .single();

  if (!profile?.program_started_at || !profile.onboarding_completed_at) {
    return {
      status: "error",
      error: "Start your seven-day program before writing an entry.",
    };
  }
  if (day > getProgramDay(profile.program_started_at)) {
    return { status: "error", error: "This day has not unlocked yet." };
  }

  const { data: existing } = await supabase
    .from("journal_entries")
    .select("id")
    .eq("user_id", user.id)
    .eq("program_day", day)
    .maybeSingle();

  const response_data: Day3ResponseData = {
    version: 1,
    within_control: within,
    outside_control: outside,
  };

  const write = existing
    ? supabase
        .from("journal_entries")
        .update({ content, response_data, mood, prompt_id: prompt.id })
        .eq("id", existing.id)
        .eq("user_id", user.id)
        .select("id, user_id, content")
        .single()
    : supabase
        .from("journal_entries")
        .insert({
          user_id: user.id,
          program_day: day,
          prompt_id: prompt.id,
          content,
          response_data,
          mood,
        })
        .select("id, user_id, content")
        .single();

  const { data: entry, error } = await write;
  if (error || !entry)
    return {
      status: "error",
      error: "Your Day 3 entry could not be saved. Try again.",
    };

  after(() => recordProductEvent(user.id, "entry_saved", { program_day: day }));

  const { data: completionEntries } = await supabase
    .from("journal_entries")
    .select("program_day, created_at")
    .eq("user_id", user.id)
    .not("program_day", "is", null);
  if (
    !existing &&
    isProgramComplete(profile.program_started_at, completionEntries ?? [])
  ) {
    after(() => recordProductEvent(user.id, "program_completed"));
  }

  const hasGroqConsent =
    profile.ai_processing_consent_at !== null &&
    profile.ai_processing_consent_revoked_at === null &&
    profile.ai_processing_provider === "groq" &&
    profile.ai_consent_version === 2;

  const reflection = hasGroqConsent
    ? await generateReflection(entry)
    : { status: "not_requested" as const, reflection: null, question: null };

  revalidatePath("/");
  revalidatePath("/journal");
  revalidatePath(`/entry/${entry.id}`);
  return { status: "success", entryId: entry.id, reflection };
}

export async function saveDayFourEntry(
  _previous: EntryActionState,
  formData: FormData,
): Promise<EntryActionState> {
  const user = await requireBetaUser();
  const thoughtValue = formData.get("recurring_thought");
  const recurring_thought = typeof thoughtValue === "string" ? thoughtValue.trim() : "";
  const momentValue = formData.get("usual_moment");
  const usual_moment = typeof momentValue === "string" ? momentValue.trim() : "";
  const day = 4;
  const prompt = getPrompt(day);
  const mood = parseMood(formData.get("mood"));

  if (!recurring_thought) {
    return {
      status: "error",
      error: "Write the thought that keeps returning before saving Day 4.",
    };
  }

  const combinedParts = [];
  combinedParts.push(`The thought that returns:\n${recurring_thought}`);
  if (usual_moment) combinedParts.push(`When it tends to return:\n${usual_moment}`);
  const content = combinedParts.join("\n\n").replace(/\r\n/g, "\n");

  if (content.length > 10_000) {
    return {
      status: "error",
      error: "Keep your Day 4 entry under 10,000 characters.",
    };
  }
  if (!prompt)
    return { status: "error", error: "Day 4 prompt not found." };
  if (mood === undefined)
    return {
      status: "error",
      error: "Choose a mood from 1 to 5, or leave it blank.",
    };

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "program_started_at, onboarding_completed_at, ai_processing_consent_at, ai_processing_provider, ai_consent_version, ai_processing_consent_revoked_at",
    )
    .eq("user_id", user.id)
    .single();

  if (!profile?.program_started_at || !profile.onboarding_completed_at) {
    return {
      status: "error",
      error: "Start your seven-day program before writing an entry.",
    };
  }
  if (day > getProgramDay(profile.program_started_at)) {
    return { status: "error", error: "This day has not unlocked yet." };
  }

  const { data: existing } = await supabase
    .from("journal_entries")
    .select("id")
    .eq("user_id", user.id)
    .eq("program_day", day)
    .maybeSingle();

  const response_data: Day4ResponseData = {
    version: 1,
    recurring_thought,
    usual_moment,
  };

  const write = existing
    ? supabase
        .from("journal_entries")
        .update({ content, response_data, mood, prompt_id: prompt.id })
        .eq("id", existing.id)
        .eq("user_id", user.id)
        .select("id, user_id, content")
        .single()
    : supabase
        .from("journal_entries")
        .insert({
          user_id: user.id,
          program_day: day,
          prompt_id: prompt.id,
          content,
          response_data,
          mood,
        })
        .select("id, user_id, content")
        .single();

  const { data: entry, error } = await write;
  if (error || !entry)
    return {
      status: "error",
      error: "Your Day 4 entry could not be saved. Try again.",
    };

  after(() => recordProductEvent(user.id, "entry_saved", { program_day: day }));

  const { data: completionEntries } = await supabase
    .from("journal_entries")
    .select("program_day, created_at")
    .eq("user_id", user.id)
    .not("program_day", "is", null);
  if (
    !existing &&
    isProgramComplete(profile.program_started_at, completionEntries ?? [])
  ) {
    after(() => recordProductEvent(user.id, "program_completed"));
  }

  const hasGroqConsent =
    profile.ai_processing_consent_at !== null &&
    profile.ai_processing_consent_revoked_at === null &&
    profile.ai_processing_provider === "groq" &&
    profile.ai_consent_version === 2;

  const reflection = hasGroqConsent
    ? await generateReflection(entry)
    : { status: "not_requested" as const, reflection: null, question: null };

  revalidatePath("/");
  revalidatePath("/journal");
  revalidatePath(`/entry/${entry.id}`);
  return { status: "success", entryId: entry.id, reflection };
}

export async function saveDayFiveEntry(
  _previous: EntryActionState,
  formData: FormData,
): Promise<EntryActionState> {
  const user = await requireBetaUser();
  const noteValue = formData.get("note_to_friend");
  const note_to_friend = typeof noteValue === "string" ? noteValue.trim() : "";
  const lineValue = formData.get("line_to_keep");
  const line_to_keep = typeof lineValue === "string" ? lineValue.trim() : "";
  const day = 5;
  const prompt = getPrompt(day);
  const mood = parseMood(formData.get("mood"));

  if (!note_to_friend) {
    return {
      status: "error",
      error: "Write what you would say before saving Day 5.",
    };
  }

  const combinedParts = [];
  combinedParts.push(`What I would say:\n${note_to_friend}`);
  if (line_to_keep) combinedParts.push(`A line to keep:\n${line_to_keep}`);
  const content = combinedParts.join("\n\n").replace(/\r\n/g, "\n");

  if (content.length > 10_000) {
    return {
      status: "error",
      error: "Keep your Day 5 entry under 10,000 characters.",
    };
  }
  if (!prompt)
    return { status: "error", error: "Day 5 prompt not found." };
  if (mood === undefined)
    return {
      status: "error",
      error: "Choose a mood from 1 to 5, or leave it blank.",
    };

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "program_started_at, onboarding_completed_at, ai_processing_consent_at, ai_processing_provider, ai_consent_version, ai_processing_consent_revoked_at",
    )
    .eq("user_id", user.id)
    .single();

  if (!profile?.program_started_at || !profile.onboarding_completed_at) {
    return {
      status: "error",
      error: "Start your seven-day program before writing an entry.",
    };
  }
  if (day > getProgramDay(profile.program_started_at)) {
    return { status: "error", error: "This day has not unlocked yet." };
  }

  const { data: existing } = await supabase
    .from("journal_entries")
    .select("id")
    .eq("user_id", user.id)
    .eq("program_day", day)
    .maybeSingle();

  const response_data: Day5ResponseData = {
    version: 1,
    note_to_friend,
    line_to_keep,
  };

  const write = existing
    ? supabase
        .from("journal_entries")
        .update({ content, response_data, mood, prompt_id: prompt.id })
        .eq("id", existing.id)
        .eq("user_id", user.id)
        .select("id, user_id, content")
        .single()
    : supabase
        .from("journal_entries")
        .insert({
          user_id: user.id,
          program_day: day,
          prompt_id: prompt.id,
          content,
          response_data,
          mood,
        })
        .select("id, user_id, content")
        .single();

  const { data: entry, error } = await write;
  if (error || !entry)
    return {
      status: "error",
      error: "Your Day 5 entry could not be saved. Try again.",
    };

  after(() => recordProductEvent(user.id, "entry_saved", { program_day: day }));

  const { data: completionEntries } = await supabase
    .from("journal_entries")
    .select("program_day, created_at")
    .eq("user_id", user.id)
    .not("program_day", "is", null);
  if (
    !existing &&
    isProgramComplete(profile.program_started_at, completionEntries ?? [])
  ) {
    after(() => recordProductEvent(user.id, "program_completed"));
  }

  const hasGroqConsent =
    profile.ai_processing_consent_at !== null &&
    profile.ai_processing_consent_revoked_at === null &&
    profile.ai_processing_provider === "groq" &&
    profile.ai_consent_version === 2;

  const reflection = hasGroqConsent
    ? await generateReflection(entry)
    : { status: "not_requested" as const, reflection: null, question: null };

  revalidatePath("/");
  revalidatePath("/journal");
  revalidatePath(`/entry/${entry.id}`);
  return { status: "success", entryId: entry.id, reflection };
}

export async function saveDaySixEntry(
  _previous: EntryActionState,
  formData: FormData,
): Promise<EntryActionState> {
  const user = await requireBetaUser();
  const actionValue = formData.get("small_action");
  const small_action = typeof actionValue === "string" ? actionValue.trim() : "";
  const momentValue = formData.get("first_moment");
  const first_moment = typeof momentValue === "string" ? momentValue.trim() : "";
  const day = 6;
  const prompt = getPrompt(day);
  const mood = parseMood(formData.get("mood"));

  if (!small_action) {
    return {
      status: "error",
      error: "Write one small action before saving Day 6.",
    };
  }

  const combinedParts = [];
  combinedParts.push(`One small action:\n${small_action}`);
  if (first_moment) combinedParts.push(`Make starting lighter:\n${first_moment}`);
  const content = combinedParts.join("\n\n").replace(/\r\n/g, "\n");

  if (content.length > 10_000) {
    return {
      status: "error",
      error: "Keep your Day 6 entry under 10,000 characters.",
    };
  }
  if (!prompt)
    return { status: "error", error: "Day 6 prompt not found." };
  if (mood === undefined)
    return {
      status: "error",
      error: "Choose a mood from 1 to 5, or leave it blank.",
    };

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "program_started_at, onboarding_completed_at, ai_processing_consent_at, ai_processing_provider, ai_consent_version, ai_processing_consent_revoked_at",
    )
    .eq("user_id", user.id)
    .single();

  if (!profile?.program_started_at || !profile.onboarding_completed_at) {
    return {
      status: "error",
      error: "Start your seven-day program before writing an entry.",
    };
  }
  if (day > getProgramDay(profile.program_started_at)) {
    return { status: "error", error: "This day has not unlocked yet." };
  }

  const { data: existing } = await supabase
    .from("journal_entries")
    .select("id")
    .eq("user_id", user.id)
    .eq("program_day", day)
    .maybeSingle();

  const response_data: Day6ResponseData = {
    version: 1,
    small_action,
    first_moment,
  };

  const write = existing
    ? supabase
        .from("journal_entries")
        .update({ content, response_data, mood, prompt_id: prompt.id })
        .eq("id", existing.id)
        .eq("user_id", user.id)
        .select("id, user_id, content")
        .single()
    : supabase
        .from("journal_entries")
        .insert({
          user_id: user.id,
          program_day: day,
          prompt_id: prompt.id,
          content,
          response_data,
          mood,
        })
        .select("id, user_id, content")
        .single();

  const { data: entry, error } = await write;
  if (error || !entry)
    return {
      status: "error",
      error: "Your Day 6 entry could not be saved. Try again.",
    };

  after(() => recordProductEvent(user.id, "entry_saved", { program_day: day }));

  const { data: completionEntries } = await supabase
    .from("journal_entries")
    .select("program_day, created_at")
    .eq("user_id", user.id)
    .not("program_day", "is", null);
  if (
    !existing &&
    isProgramComplete(profile.program_started_at, completionEntries ?? [])
  ) {
    after(() => recordProductEvent(user.id, "program_completed"));
  }

  const hasGroqConsent =
    profile.ai_processing_consent_at !== null &&
    profile.ai_processing_consent_revoked_at === null &&
    profile.ai_processing_provider === "groq" &&
    profile.ai_consent_version === 2;

  const reflection = hasGroqConsent
    ? await generateReflection(entry)
    : { status: "not_requested" as const, reflection: null, question: null };

  revalidatePath("/");
  revalidatePath("/journal");
  revalidatePath(`/entry/${entry.id}`);
  return { status: "success", entryId: entry.id, reflection };
}

export async function retryReflection(
  _previous: BasicActionState,
  formData: FormData,
): Promise<BasicActionState> {
  const user = await requireBetaUser();
  const id = String(formData.get("entry_id") ?? "");
  if (!UUID_PATTERN.test(id))
    return { status: "error", error: "This entry could not be found." };

  const supabase = await createClient();
  const [{ data: entry }, { data: profile }] = await Promise.all([
    supabase
      .from("journal_entries")
      .select("id, user_id, content")
      .eq("id", id)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("profiles")
      .select(
        "ai_processing_consent_at, ai_processing_provider, ai_consent_version, ai_processing_consent_revoked_at",
      )
      .eq("user_id", user.id)
      .single(),
  ]);
  if (!entry)
    return { status: "error", error: "This entry could not be found." };

  const hasGroqConsent =
    profile?.ai_processing_consent_at !== null &&
    profile?.ai_processing_consent_revoked_at === null &&
    profile?.ai_processing_provider === "groq" &&
    profile?.ai_consent_version === 2;

  if (!hasGroqConsent)
    return {
      status: "error",
      error: "Turn on AI reflections in Settings before retrying.",
    };

  const result = await generateReflection(entry, true);
  revalidatePath("/");
  revalidatePath("/journal");
  revalidatePath(`/entry/${id}`);
  return result.status === "failed"
    ? {
        status: "error",
        error:
          "The reflection could not be generated. Your entry is still saved.",
      }
    : {
        status: "success",
        message:
          result.status === "pending"
            ? "A retry is already in progress."
            : "Reflection ready.",
      };
}

export async function deleteEntry(
  _previous: BasicActionState,
  formData: FormData,
): Promise<BasicActionState> {
  const user = await requireBetaUser();
  const id = String(formData.get("entry_id") ?? "");
  if (!UUID_PATTERN.test(id))
    return { status: "error", error: "This entry could not be found." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("journal_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error)
    return { status: "error", error: "The entry could not be deleted." };
  revalidatePath("/");
  revalidatePath("/journal");
  return { status: "success", message: "Entry deleted." };
}

export async function updateAiConsent(
  _previous: BasicActionState,
  formData: FormData,
): Promise<BasicActionState> {
  const user = await requireBetaUser();
  const enabled = formData.get("ai_consent") === "yes";
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("profiles")
    .update({
      ai_processing_consent_at: enabled ? now : null,
      ai_processing_provider: enabled ? "groq" : null,
      ai_consent_version: enabled ? 2 : null,
      ai_processing_consent_revoked_at: enabled ? null : now,
    })
    .eq("user_id", user.id);
  if (error)
    return {
      status: "error",
      error: "Your reflection preference could not be updated.",
    };
  revalidatePath("/settings");
  return {
    status: "success",
    message: enabled ? "AI reflections are on." : "AI reflections are off.",
  };
}

export async function markReflectionViewed(entryId: string): Promise<void> {
  const user = await requireBetaUser();
  const supabase = await createClient();

  // Verify ownership and get reflection
  const { data: reflection, error: verifyError } = await supabase
    .from("ai_reflections")
    .select("viewed_at, status")
    .eq("entry_id", entryId)
    .eq("user_id", user.id)
    .single();

  if (verifyError || !reflection || reflection.status !== "complete") return;
  if (reflection.viewed_at) return; // Already viewed

  const { error: updateError } = await supabase
    .from("ai_reflections")
    .update({ viewed_at: new Date().toISOString() })
    .eq("entry_id", entryId)
    .eq("user_id", user.id);

  if (!updateError) {
    // Determine program day if possible
    const { data: entry } = await supabase
      .from("journal_entries")
      .select("program_day")
      .eq("id", entryId)
      .single();
    after(() =>
      recordProductEvent(
        user.id,
        "reflection_viewed",
        entry ? { program_day: entry.program_day } : undefined,
      ),
    );
  }
}

export async function deleteAccount(
  _previous: BasicActionState,
  formData: FormData,
): Promise<BasicActionState> {
  const user = await requireBetaUser();
  if (formData.get("confirmation") !== "DELETE") {
    return {
      status: "error",
      error: "Type DELETE to confirm permanent account deletion.",
    };
  }
  const admin = createAdminClient();
  if (!admin)
    return {
      status: "error",
      error: "Account deletion is not configured. Contact support.",
    };
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error)
    return {
      status: "error",
      error: "Your account could not be deleted. Try again.",
    };
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
