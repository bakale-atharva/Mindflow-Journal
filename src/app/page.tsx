"use client";

import { useState } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { ArrowRight, Sparkles, Flame } from "lucide-react";
import { mockEntries } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const MOODS = [
  { score: 1, emoji: "😞", color: "bg-red-500", label: "Terrible" },
  { score: 2, emoji: "😕", color: "bg-orange-500", label: "Bad" },
  { score: 3, emoji: "😐", color: "bg-yellow-500", label: "Okay" },
  { score: 4, emoji: "🙂", color: "bg-green-500", label: "Good" },
  { score: 5, emoji: "😄", color: "bg-teal-500", label: "Great" },
];

export default function Home() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10 space-y-10">
      
      {/* 1. Welcome Header */}
      <motion.section 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            {getGreeting()}, Atharva ☀️
          </h1>
          <p className="text-secondary-text mt-1">Ready to reflect on your day?</p>
        </div>
        <div className="flex items-center gap-2 bg-brand-50 border border-brand-200 px-4 py-2 rounded-xl">
          <Flame className="w-5 h-5 text-orange-500" />
          <span className="font-semibold text-brand-700">12 Day Streak</span>
        </div>
      </motion.section>

      {/* 2. Mood Quick-Check */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <h2 className="font-heading text-xl font-semibold text-foreground mb-6 text-center">
            How are you feeling right now?
          </h2>
          <div className="flex justify-center gap-3 md:gap-6 overflow-x-auto pb-2">
            {MOODS.map((mood) => {
              const isSelected = selectedMood === mood.score;
              return (
                <button
                  key={mood.score}
                  onClick={() => setSelectedMood(mood.score)}
                  className={cn(
                    "flex flex-col items-center gap-2 transition-all duration-200 group flex-shrink-0",
                    isSelected ? "scale-110" : "hover:scale-105 opacity-80 hover:opacity-100"
                  )}
                >
                  <div className={cn(
                    "w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-2xl md:text-3xl transition-colors duration-200 border-2",
                    isSelected ? "border-brand-500 bg-brand-50" : "border-border bg-tertiary group-hover:border-brand-200"
                  )}>
                    {mood.emoji}
                  </div>
                  <span className={cn(
                    "text-xs font-medium transition-colors",
                    isSelected ? "text-brand-600" : "text-secondary-text"
                  )}>
                    {mood.label}
                  </span>
                </button>
              );
            })}
          </div>
          {selectedMood && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-6 flex justify-center overflow-hidden"
            >
              <button className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-transform hover:-translate-y-0.5">
                Write about it <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* 3. Today's Prompt Card */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white p-8 md:p-10 shadow-glow group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          
          <div className="relative z-10 flex flex-col items-start gap-4">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Daily Prompt
            </div>
            <h3 className="font-heading text-2xl md:text-3xl font-bold leading-tight max-w-2xl">
              What moment today are you most grateful for?
            </h3>
            <Link 
              href="?new=true" 
              className="mt-4 inline-flex items-center gap-2 font-semibold text-brand-50 hover:text-white transition-colors group-hover:translate-x-1 duration-200"
            >
              Write about it <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.section>

      {/* 4. Recent Entries Feed */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold text-foreground">Recent Reflections</h2>
          <Link href="/entries" className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
            View all
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          {mockEntries.slice(0, 3).map((entry) => {
            const mood = MOODS.find(m => m.score === entry.mood);
            return (
              <Link 
                key={entry.id} 
                href={`/entry/${entry.id}`}
                className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 block group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-tertiary flex items-center justify-center text-lg">
                      {mood?.emoji}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-secondary-text">
                        {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  {entry.hasInsight && (
                    <div className="bg-brand-50 text-brand-600 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Insight
                    </div>
                  )}
                </div>
                
                <p className="text-foreground text-sm leading-relaxed line-clamp-2">
                  {entry.content}
                </p>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {entry.tags.map(tag => (
                    <span key={tag} className="text-xs font-medium text-secondary-text bg-tertiary px-2.5 py-1 rounded-full group-hover:bg-border transition-colors">
                      #{tag}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </motion.section>

    </div>
  );
}
