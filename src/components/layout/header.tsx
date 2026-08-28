'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useSidebarStore } from '@/hooks/use-sidebar'
import { cn } from '@/lib/utils/cn'
import { Menu, Settings, Bluetooth } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getConnectedBluetoothDevice } from '@/services/printing/bluetooth-print-service'
import { useState, useEffect } from 'react'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/pos': 'Point of Sale',
  '/products': 'Products',
  '/categories': 'Categories',
  '/inventory': 'Inventory',
  '/transactions': 'Transactions',
  '/reports': 'Reports',
  '/settings': 'Settings',
}

export function Header() {
  const pathname = usePathname()
  const { isCollapsed, toggleMobileOpen } = useSidebarStore()
  const [btDevice, setBtDevice] = useState<string | null>(null)

  useEffect(() => {
    setBtDevice(getConnectedBluetoothDevice())
  }, [pathname])

  const title = Object.entries(PAGE_TITLES).find(([key]) =>
    pathname === key || pathname.startsWith(key + '/')
  )?.[1] ?? 'POS System'

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-20 flex items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 transition-all duration-200",
        isCollapsed ? "lg:left-16" : "lg:left-[var(--sidebar-width)]"
      )}
      style={{ height: 'var(--header-height)' }}
    >
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger menu button */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleMobileOpen}
          className="lg:hidden h-8 w-8 text-[hsl(var(--foreground))]"
          aria-label="Open Navigation Menu"
        >
          <Menu size={18} />
        </Button>

        {/* Mobile brand icon */}
        <div className="flex items-center gap-2 lg:hidden">
          <img
            src="/images/fondasi1.png"
            alt="Logo"
            style={{ width: '22px', height: '22px', objectFit: 'contain' }}
          />
        </div>

        <h1 className="text-sm font-semibold text-[hsl(var(--foreground))]">{title}</h1>
      </div>

      {/* Right actions: Bluetooth indicator & Settings shortcut */}
      <div className="flex items-center gap-2">
        <Link href="/settings" title="Settings & Bluetooth Printer">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 gap-1.5 text-xs px-2.5 rounded-full border transition-colors",
              btDevice
                ? "border-green-300 text-green-700 bg-green-50"
                : pathname === '/settings'
                ? "bg-[hsl(var(--primary))] text-white"
                : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            )}
          >
            {btDevice ? (
              <>
                <Bluetooth size={14} className="text-green-600 animate-pulse" />
                <span className="hidden sm:inline text-[11px] font-medium">{btDevice.slice(0, 10)}</span>
              </>
            ) : (
              <>
                <Settings size={14} />
                <span className="hidden sm:inline text-[11px]">Settings</span>
              </>
            )}
          </Button>
        </Link>
      </div>
    </header>
  )
}
