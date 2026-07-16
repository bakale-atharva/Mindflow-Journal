"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";

export type MagicLinkState = {
  status: "idle" | "success" | "error";
  message: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

async function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configuredUrl) return configuredUrl;

  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";

  if (!host) {
    throw new Error("Unable to determine the application URL.");
  }

  return `${protocol}://${host}`;
}

export async function requestMagicLink(
  _previousState: MagicLinkState,
  formData: FormData,
): Promise<MagicLinkState> {
  const email = normalizeEmail(formData.get("email"));

  if (!EMAIL_PATTERN.test(email) || email.length > 320) {
    return {
      status: "error",
      message: "Enter the email address used for your founding access.",
    };
  }

  const supabase = await createClient();
  const { data: isAllowed, error: accessError } = await supabase.rpc(
    "is_beta_email_allowed",
    { candidate_email: email },
  );

  if (accessError) {
    console.error("Beta access check failed:", accessError.message);
    return {
      status: "error",
      message: "Access could not be checked. Try again in a moment.",
    };
  }

  if (!isAllowed) {
    return {
      status: "error",
      message:
        "This email does not have active founding access. Use the email entered at Razorpay.",
    };
  }

  const siteUrl = await getSiteUrl();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
      shouldCreateUser: true,
    },
  });

  if (error) {
    console.error("Magic-link request failed:", error.message);
    return {
      status: "error",
      message: "The sign-in link could not be sent. Try again in a moment.",
    };
  }

  return {
    status: "success",
    message: "Check your inbox. Your secure sign-in link is on its way.",
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
