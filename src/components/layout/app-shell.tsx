'use client'

import { Sidebar } from './sidebar'
import { Header } from './header'
import { Toaster } from '@/components/ui/toaster'
import { useEffect } from 'react'
import { ensureSeedData } from '@/services/product-service'
import { useSidebarStore } from '@/hooks/use-sidebar'
import { cn } from '@/lib/utils/cn'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { isCollapsed } = useSidebarStore()

  // Initialize seed data on first load
  useEffect(() => {
    ensureSeedData()
  }, [])

  return (
    <div className="min-h-full">
      <Sidebar />
      <Header />

      {/* Main content */}
      <main
        className={cn(
          "pt-[var(--header-height)] pb-20 lg:pb-0 min-h-screen transition-all duration-200",
          isCollapsed ? "lg:ml-16" : "lg:ml-[var(--sidebar-width)]"
        )}
      >
        <div className="page-enter">
          {children}
        </div>
      </main>

      <Toaster />
    </div>
  )
}
