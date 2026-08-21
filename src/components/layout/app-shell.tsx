'use client'

import { Sidebar } from './sidebar'
import { Header } from './header'
import { Toaster } from '@/components/ui/toaster'
import { useEffect } from 'react'
import { ensureSeedData } from '@/services/product-service'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
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
        className="lg:ml-[var(--sidebar-width)] pt-[var(--header-height)] pb-20 lg:pb-0 min-h-screen"
      >
        <div className="page-enter">
          {children}
        </div>
      </main>

      <Toaster />
    </div>
  )
}
