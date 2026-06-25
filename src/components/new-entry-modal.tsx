"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, Send, Tag, Calendar as CalendarIcon, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const MOODS = [
  { score: 1, emoji: "😞", label: "Terrible" },
  { score: 2, emoji: "😕", label: "Bad" },
  { score: 3, emoji: "😐", label: "Okay" },
  { score: 4, emoji: "🙂", label: "Good" },
  { score: 5, emoji: "😄", label: "Great" },
];

export function NewEntryModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [state, setState] = useState<"writing" | "saving" | "success">("writing");
  
  const today = new Date();

  const handleSave = () => {
    setState("saving");
    // Simulate save
    setTimeout(() => {
      setState("success");
      setTimeout(() => {
        onClose();
        // Reset state after close
        setTimeout(() => {
          setState("writing");
          setContent("");
          setSelectedMood(null);
        }, 300);
      }, 2000);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background"
        >
          {/* Subtle animated background gradient for focus mode */}
          <div className="absolute inset-0 bg-gradient-to-b from-brand-50/50 to-transparent pointer-events-none" />
          
          {state === "success" ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative z-10 flex flex-col items-center justify-center text-center p-8"
            >
              <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-brand-500" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Entry Saved</h2>
              <p className="text-secondary-text max-w-sm">
                Your thoughts are safe. Generating AI insights for you shortly...
              </p>
            </motion.div>
          ) : (
            <div className="relative z-10 w-full h-full max-w-3xl mx-auto flex flex-col pt-8 md:pt-16 px-4 md:px-8 pb-safe">
              <header className="flex items-center justify-between mb-8">
                <button 
                  onClick={onClose}
                  className="p-2 -ml-2 text-secondary-text hover:bg-tertiary rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2 text-sm font-medium text-secondary-text bg-tertiary px-3 py-1.5 rounded-full">
                  <CalendarIcon className="w-4 h-4" />
                  {format(today, "MMMM d, yyyy")}
                </div>
                <div className="w-10" /> {/* Spacer for centering */}
              </header>

              <main className="flex-1 flex flex-col relative">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind today?"
                  className="w-full flex-1 resize-none bg-transparent border-none outline-none text-xl md:text-2xl font-medium text-foreground placeholder:text-muted-text leading-relaxed font-sans focus:ring-0 p-0"
                  autoFocus
                />
              </main>

              <footer className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-border mt-auto">
                {/* Tools */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-tertiary rounded-full p-1">
                    {MOODS.map(mood => (
                      <button
                        key={mood.score}
                        onClick={() => setSelectedMood(mood.score)}
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all",
                          selectedMood === mood.score 
                            ? "bg-white shadow-sm scale-110" 
                            : "opacity-60 hover:opacity-100 hover:scale-105"
                        )}
                      >
                        {mood.emoji}
                      </button>
                    ))}
                  </div>

                  <div className="hidden md:flex items-center gap-2">
                    <button className="p-2.5 text-secondary-text hover:bg-tertiary hover:text-foreground rounded-full transition-colors">
                      <Tag className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setIsVoiceMode(!isVoiceMode)}
                      className={cn(
                        "p-2.5 rounded-full transition-colors",
                        isVoiceMode 
                          ? "bg-red-100 text-red-500 animate-pulse" 
                          : "text-secondary-text hover:bg-tertiary hover:text-foreground"
                      )}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Save CTA */}
                <button
                  onClick={handleSave}
                  disabled={!content.trim() || state === "saving"}
                  className="flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:bg-tertiary disabled:text-muted-text text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                >
                  {state === "saving" ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    <>
                      Save Entry <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </footer>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
