import { WaitlistForm } from "./waitlist-form";

export const metadata = {
  title: "MindFlow Journal - Waitlist",
  description: "Join the waitlist for MindFlow Journal.",
};

export default function WaitlistPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md surface p-8 rounded-[28px] flex flex-col gap-6 relative overflow-hidden">
        
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-lilac/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-seafoam/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <h1 className="font-heading text-3xl font-medium tracking-tight text-ink">
            MindFlow Journal
          </h1>
          <p className="text-muted-foreground text-[15px] leading-relaxed">
            I’m inviting a small group to try a seven-day guided journaling experience. Join the interest list.
          </p>
        </div>

        <WaitlistForm />
      </div>
    </main>
  );
}
