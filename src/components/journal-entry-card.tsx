'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Edit2 } from 'lucide-react'
import { deleteEntry } from '@/app/actions'
import type { JournalEntry } from '@/app/actions'

const MOOD_EMOJI: Record<number, string> = {
  1: '😔',
  2: '😕',
  3: '😌',
  4: '🙂',
  5: '😊',
}

export function JournalEntryCard({ entry }: { entry: JournalEntry }) {
  const [expanded, setExpanded] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteEntry(entry.id)
    } catch (e) {
      console.error(e)
      setIsDeleting(false)
    }
  }

  return (
    <motion.div
      layout
      onClick={() => setExpanded(!expanded)}
      className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 cursor-pointer overflow-hidden shadow-[var(--shadow-floating)] hover:shadow-[var(--shadow-glow-teal)] hover:border-[var(--color-teal-accent)]/20 transition-all duration-500"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <motion.div layout className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-white/50 tracking-wider">
          {format(new Date(entry.created_at), "MMMM d, yyyy - HH:mm")}
        </span>
        {entry.mood && (
          <span className="text-2xl bg-white/5 border border-white/10 rounded-2xl w-12 h-12 flex items-center justify-center shadow-sm">
            {MOOD_EMOJI[entry.mood]}
          </span>
        )}
      </motion.div>
      
      <motion.div layout>
        <p className={`text-white/80 leading-relaxed whitespace-pre-wrap font-sans ${!expanded ? 'line-clamp-3 text-white/60' : ''}`}>
          {entry.content}
        </p>
      </motion.div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="flex items-center gap-4 pt-5 border-t border-white/5"
          >
            <button 
              className="flex items-center text-white/50 hover:text-white/90 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-colors duration-300 text-sm font-medium"
              onClick={(e) => {
                e.stopPropagation()
                alert("Edit functionality coming soon!")
              }}
            >
              <Edit2 className="w-4 h-4 mr-2" /> Edit
            </button>
            <button 
              className="flex items-center text-red-400/70 hover:text-red-400 bg-red-400/5 hover:bg-red-400/10 px-4 py-2 rounded-xl transition-colors duration-300 text-sm font-medium disabled:opacity-50"
              onClick={(e) => {
                e.stopPropagation()
                handleDelete()
              }}
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-2" /> {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
