import { cn } from "@/lib/utils";

export function ThoughtContour({
  mood,
  compact = false,
  className,
}: {
  mood?: number | null;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "thought-contour",
        compact && "thought-contour--compact",
        className,
      )}
      data-mood={mood ?? 3}
      aria-hidden="true"
    >
      <div className="thought-contour__wash" />
      <div className="thought-contour__orb thought-contour__orb--one" />
      <div className="thought-contour__orb thought-contour__orb--two" />
      <svg
        className="thought-contour__lines"
        viewBox="0 0 560 360"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <path d="M-22 236C70 144 128 132 222 158c98 27 139 18 205-49 44-44 95-54 154-30" />
        <path d="M-18 270c93-82 165-91 252-58 81 31 130 16 202-48 51-46 99-56 151-42" />
        <path d="M-15 306c100-65 173-68 259-34 82 32 139 22 210-32 51-39 92-48 143-37" />
      </svg>
    </div>
  );
}
