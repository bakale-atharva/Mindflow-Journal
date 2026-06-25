import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Sparkles, Share, Edit3, Trash2 } from "lucide-react";
import { mockEntries } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const MOODS = [
  { score: 1, emoji: "😞", label: "Terrible", color: "text-red-500", bg: "bg-red-500/10" },
  { score: 2, emoji: "😕", label: "Bad", color: "text-orange-500", bg: "bg-orange-500/10" },
  { score: 3, emoji: "😐", label: "Okay", color: "text-yellow-500", bg: "bg-yellow-500/10" },
  { score: 4, emoji: "🙂", label: "Good", color: "text-green-500", bg: "bg-green-500/10" },
  { score: 5, emoji: "😄", label: "Great", color: "text-teal-500", bg: "bg-teal-500/10" },
];

export default async function EntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = mockEntries.find(e => e.id === id);

  if (!entry) {
    notFound();
  }

  const mood = MOODS.find(m => m.score === entry.mood);
  const date = new Date(entry.createdAt);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10">
      
      {/* Top Action Bar */}
      <div className="flex items-center justify-between mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-secondary-text hover:text-foreground font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div className="flex items-center gap-2">
          <button className="p-2 text-secondary-text hover:bg-tertiary hover:text-foreground rounded-full transition-colors">
            <Share className="w-4 h-4" />
          </button>
          <button className="p-2 text-secondary-text hover:bg-tertiary hover:text-foreground rounded-full transition-colors">
            <Edit3 className="w-4 h-4" />
          </button>
          <button className="p-2 text-secondary-text hover:bg-red-50 hover:text-red-600 rounded-full transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <article className="bg-card border border-border rounded-2xl p-6 md:p-10 shadow-sm">
        
        {/* Entry Meta */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
          <div>
            <h1 className="font-heading text-xl md:text-2xl font-semibold text-foreground">
              {format(date, "EEEE, MMMM d, yyyy")}
            </h1>
            <p className="text-sm font-medium text-secondary-text mt-1">
              {format(date, "h:mm a")}
            </p>
          </div>
          <div className={cn("flex items-center gap-2 px-4 py-2 rounded-xl font-medium", mood?.bg, mood?.color)}>
            <span className="text-2xl">{mood?.emoji}</span>
            {mood?.label}
          </div>
        </header>

        {/* Entry Content */}
        <div className="prose prose-p:text-foreground prose-p:leading-relaxed prose-p:text-lg max-w-none">
          <p className="whitespace-pre-wrap">{entry.content}</p>
        </div>

        {/* Tags */}
        <div className="mt-8 flex flex-wrap gap-2">
          {entry.tags.map(tag => (
            <span key={tag} className="text-sm font-medium text-secondary-text bg-tertiary px-3 py-1.5 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      </article>

      {/* AI Insight Card */}
      {entry.hasInsight && (
        <div className="mt-8 bg-gradient-to-br from-brand-50 to-brand-100 border border-brand-200 rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Sparkles className="w-32 h-32 text-brand-600" />
          </div>
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-brand-500" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-brand-700 mb-2">MindFlow Insight</h3>
              <p className="text-brand-900 leading-relaxed font-medium">
                You've mentioned finding joy in small moments ("yellow flower") despite feeling overwhelmed. This is a classic cognitive reframing technique. Your resilience is growing, Atharva. Keep noticing these tiny sparks of life around you.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
