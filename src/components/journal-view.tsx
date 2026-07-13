'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { JournalForm } from './journal-form'
import { JournalEntryCard } from './journal-entry-card'

export function JournalView({ initialEntries }: { initialEntries: any[] }) {
  const [view, setView] = useState<'list' | 'form'>('list')

  return (
    <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 flex flex-col relative z-10">
      {/* Header */}
      <header className="flex items-center justify-between mb-10 pb-6 border-b border-white/5">
        <h1 className="text-3xl font-medium tracking-widest font-heading text-white/90">
          {view === 'list' ? 'My Entries' : 'New Entry'}
        </h1>
        {view === 'list' && (
          <button
            onClick={() => setView('form')}
            className="text-white/60 hover:text-[var(--color-teal-accent)] p-2 rounded-full transition-all duration-300 focus:outline-none hover:shadow-[var(--shadow-glow-teal)] hover:scale-110"
            aria-label="Add new entry"
          >
            <Plus className="w-8 h-8 stroke-[1.5]" />
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          {view === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-6 pb-12"
            >
              {initialEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-white/40 text-center">
                  <p className="text-xl mb-3 font-light tracking-wide">The canvas is empty.</p>
                  <p className="text-sm tracking-wider uppercase opacity-70">Tap + to begin</p>
                </div>
              ) : (
                initialEntries.map(entry => (
                  <JournalEntryCard key={entry.id} entry={entry} />
                ))
              )}
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="h-full"
            >
              <JournalForm onCancel={() => setView('list')} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
