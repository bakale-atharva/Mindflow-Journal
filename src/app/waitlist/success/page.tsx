import Link from "next/link";

export const metadata = {
  title: "MindFlow Journal - Success",
  description: "You have joined the waitlist.",
};

export default function WaitlistSuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md surface p-8 rounded-[28px] flex flex-col items-center text-center gap-6 relative overflow-hidden">
        
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-lilac/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-seafoam/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="w-16 h-16 bg-seafoam/20 text-seafoam rounded-full flex items-center justify-center mb-2 z-10">
          <svg xmlns="http://www.w3.org/,2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        <div className="relative z-10 space-y-3">
          <h1 className="font-heading text-3xl font-medium tracking-tight text-ink">
            You&apos;re on the list.
          </h1>
          <p className="text-muted-foreground text-[15px] leading-relaxed">
            Thank you for your interest. I&apos;ll be in touch soon when your invite to the founding beta is ready.
          </p>
        </div>

        <div className="relative z-10 w-full bg-input/40 border border-border/50 rounded-[18px] p-5 text-left mt-2 space-y-2">
          <p className="text-sm font-medium text-ink">
            One quick question:
          </p>
          <p className="text-[15px] text-ink/80 italic">
            &quot;What usually stops you from journaling consistently?&quot;
          </p>
          <p className="text-xs text-muted-foreground pt-1">
            Reply to the founder on LinkedIn or keep this in mind for our first chat.
          </p>
        </div>

        <Link
          href="/"
          className="relative z-10 mt-4 text-[14px] font-medium text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
        >
          Return to home
        </Link>
      </div>
    </main>
  );
}
