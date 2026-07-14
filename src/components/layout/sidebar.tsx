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

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="sticky top-0 hidden h-dvh flex-col border-r border-ink/8 bg-white/55 px-5 py-7 backdrop-blur-xl md:flex">
      <Link href="/" className="flex items-center gap-3 rounded-2xl px-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
        <span className="grid size-10 place-items-center rounded-[14px] bg-ink text-sm font-semibold text-white">M</span>
        <span className="font-heading text-xl font-semibold tracking-[-0.04em] text-ink">MindFlow</span>
      </Link>
      <nav className="mt-14 space-y-2" aria-label="Main navigation">
        {items.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} className={cn('flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors', active ? 'bg-ink text-white shadow-[0_12px_34px_rgba(36,33,53,.16)]' : 'text-ink/58 hover:bg-white hover:text-ink')}>
              <item.icon className="size-[18px]" strokeWidth={1.8} />{item.label}
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto rounded-[22px] border border-ink/8 bg-white/65 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/42">Private by design</p>
        <p className="mt-2 text-sm leading-6 text-ink/66">Your journal stays tied to your account and out of product analytics.</p>
      </div>
    </aside>
  )
}
