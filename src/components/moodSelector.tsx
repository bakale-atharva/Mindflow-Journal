import { cn } from "@/lib/utils";

const moods = [
  { score: 1, label: "Heavy" },
  { score: 2, label: "Low" },
  { score: 3, label: "Steady" },
  { score: 4, label: "Light" },
  { score: 5, label: "Energized" },
];

export function MoodSelector({
  mood,
  setMood,
}: {
  mood: number | null;
  setMood: (mood: number | null) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink/58">
        How does today feel?{" "}
        <span className="font-normal text-ink/35">Optional</span>
      </legend>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {moods.map((item) => (
          <button
            key={item.score}
            type="button"
            title={item.label}
            aria-label={`${item.label}, ${item.score} out of 5`}
            aria-pressed={mood === item.score}
            onClick={() => setMood(mood === item.score ? null : item.score)}
            className={cn(
              "group flex min-w-0 flex-col items-center gap-2 rounded-2xl border px-1 py-3 transition-all",
              mood === item.score
                ? "border-ink/25 bg-ink text-white"
                : "border-ink/8 bg-porcelain text-ink/48 hover:border-ink/18",
            )}
          >
            <span
              className="size-5 rounded-full border-2 border-white/50 bg-(--mood-color) shadow-sm"
              style={
                {
                  "--mood-color": `var(--mood-${item.score})`,
                } as React.CSSProperties
              }
            />
            <span className="truncate text-[9px] font-medium sm:text-[10px]">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
