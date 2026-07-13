'use client'

import { useActionState, useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { saveEntry } from "@/app/actions"
import { format } from 'date-fns'

const MOOD_LIST = [
  { label: 'Happy', emoji: '😊' },
  { label: 'Neutral', emoji: '😌' },
  { label: 'Sad', emoji: '😔' },
  { label: 'Anxious', emoji: '😰' },
  { label: 'Energetic', emoji: '🤩' },
  { label: 'Inspired', emoji: '✨' },
  { label: 'Calm', emoji: '🧘' }
]

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button 
      type="submit" 
      disabled={pending} 
      className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-rosegold-accent)] text-white font-medium px-8 py-3 rounded-2xl shadow-[var(--shadow-glow-rosegold)] hover:brightness-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Saving...' : 'Save'}
    </button>
  )
}

export function JournalForm({ onCancel }: { onCancel: () => void }) {
  const [state, formAction] = useActionState(saveEntry, null)
  const [selectedMood, setSelectedMood] = useState<string>('')
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"))

  useEffect(() => {
    if (state?.success) {
      onCancel()
    }
  }, [state, onCancel])

  return (
    <form action={formAction} className="flex flex-col h-full space-y-10">
      
      {/* Date & Time Picker */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-medium text-white/50 uppercase tracking-widest">Date & Time</label>
        <input 
          type="datetime-local" 
          name="created_at"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-transparent border-b border-white/10 pb-2 text-white/90 text-lg focus:outline-none focus:border-[var(--color-teal-accent)] transition-colors font-sans w-full max-w-[300px] cursor-pointer"
          required
        />
      </div>

      {/* Mood Picker */}
      <div className="flex flex-col gap-4">
        <label className="text-xs font-medium text-white/50 uppercase tracking-widest">Your Mood</label>
        <input type="hidden" name="mood" value={selectedMood} />
        <div className="flex flex-wrap items-center gap-4">
          {MOOD_LIST.map(({ label, emoji }) => {
            const isSelected = selectedMood === emoji;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setSelectedMood(emoji)}
                title={label}
                className={`w-14 h-14 text-2xl flex items-center justify-center rounded-2xl transition-all duration-500 ${
                  isSelected 
                    ? 'bg-white/5 border border-[var(--color-teal-accent)] shadow-[var(--shadow-glow-teal)] scale-110 z-10' 
                    : 'bg-transparent border border-white/5 hover:bg-white/5 hover:border-white/20 opacity-60 hover:opacity-100 grayscale hover:grayscale-0'
                }`}
              >
                {emoji}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Text Area */}
      <div className="flex-1 flex flex-col min-h-[40vh]">
        <div className="relative flex-1 flex flex-col rounded-2xl bg-white/[0.02] border border-white/5 p-6 shadow-[var(--shadow-floating)] transition-all duration-500 focus-within:shadow-[var(--shadow-glow-teal)] focus-within:border-[var(--color-teal-accent)]/30">
          <textarea 
            name="content"
            placeholder="What's on your mind today, Babe?" 
            className="flex-1 w-full bg-transparent border-none resize-none text-xl leading-relaxed text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-0 font-sans"
            required
          />
        </div>
      </div>
      
      {state?.error && (
        <p className="text-sm text-red-400 font-medium p-4 bg-red-400/10 rounded-2xl border border-red-400/20">
          {state.error}
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-5 pt-4">
        <button 
          type="button" 
          onClick={onCancel} 
          className="text-white/60 hover:text-white border border-white/10 hover:border-white/30 rounded-2xl px-8 py-3 transition-colors duration-300 font-medium"
        >
          Cancel
        </button>
        <SubmitButton />
      </div>
    </form>
  )
}
