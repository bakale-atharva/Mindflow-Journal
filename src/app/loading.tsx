import { ThoughtContour } from "@/components/thoughtContour";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-6 sm:px-7 sm:py-10 lg:px-10">
      <div className="h-3 w-32 rounded-full bg-ink/8" />
      <div className="mt-4 h-9 w-56 rounded-2xl bg-ink/8" />
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-6">
          <ThoughtContour className="opacity-45" />
          <div className="surface h-96 rounded-[30px]" />
        </div>
        <div className="surface hidden h-72 rounded-[26px] lg:block" />
      </div>
      <span className="sr-only">Loading your journal</span>
    </div>
  );
}
