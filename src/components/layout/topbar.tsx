"use client";

import { Bell } from "lucide-react";
import { format } from "date-fns";

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

      <div className="flex items-center gap-4 ml-auto md:ml-0">
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-secondary-text hover:bg-tertiary transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <div className="md:hidden w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-medium text-sm">
          A
        </div>
      </div>
    </header>
  );
}
