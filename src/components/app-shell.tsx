'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { TopBar } from '@/components/layout/topbar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { ModalProvider } from '@/components/modal-provider'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname.startsWith('/auth')) {
    return <main className="min-h-dvh w-full">{children}</main>
  }

  return (
    <div className="flex h-full min-h-full w-full flex-col overflow-hidden bg-secondary md:flex-row">
      <Sidebar />
      <div className="relative flex h-full flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="relative flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </main>
        <BottomNav />
      </div>
      <ModalProvider />
    </div>
  )
}

