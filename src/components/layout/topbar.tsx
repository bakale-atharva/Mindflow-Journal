"use client";

import { LogOut } from "lucide-react";
import { format } from "date-fns";
import { signOut } from "@/app/auth/actions";

export function TopBar() {
  const today = new Date();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-4 bg-background/80 backdrop-blur-md border-b border-border transition-all duration-300">
      <div className="md:hidden flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-white font-heading font-bold text-sm">
          M
        </div>
        <span className="font-heading font-bold text-lg text-foreground">MindFlow</span>
      </div>

      {/* Spacer for mobile to center or just push right */}
      <div className="hidden md:block flex-1" />

      <div className="hidden md:block absolute left-1/2 -translate-x-1/2">
        <p className="text-sm font-medium text-secondary-text">
          Today is <span className="text-foreground font-semibold">{format(today, "EEEE, MMMM d")}</span>
        </p>
      </div>

      <div className="ml-auto flex items-center gap-4 md:ml-0">
        <form action={signOut}>
          <button
            type="submit"
            className="flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-secondary-text transition-colors hover:bg-tertiary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </form>
      </div>
    </header>
  );
}
