'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpenText, Feather, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { href: '/', icon: Feather, label: 'Today' },
  { href: '/journal', icon: BookOpenText, label: 'Journal' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed inset-x-4 bottom-4 z-40 flex h-[68px] items-center justify-around rounded-[24px] border border-white/70 bg-ink/95 px-3 shadow-[0_20px_60px_rgba(36,33,53,.26)] backdrop-blur-xl md:hidden" aria-label="Main navigation">
      {items.map((item) => {
        const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
        return (
          <Link key={item.href} href={item.href} className={cn('flex min-w-16 flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-medium transition-colors', active ? 'text-white' : 'text-white/45')}>
            <item.icon className={cn('size-5', active && 'text-seafoam')} strokeWidth={1.9} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
