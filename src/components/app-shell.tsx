'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname.startsWith('/auth') || pathname.startsWith('/onboarding')) {
    return <main className="min-h-dvh w-full">{children}</main>
  }

  return (
    <div className="min-h-dvh bg-background md:grid md:grid-cols-[224px_minmax(0,1fr)]">
      <Sidebar />
      <div className="min-w-0">
        <main className="min-h-dvh pb-24 md:pb-0">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
