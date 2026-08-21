'use client'

import { ScanBarcode } from 'lucide-react'
import { usePathname } from 'next/navigation'

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
  const title = Object.entries(PAGE_TITLES).find(([key]) =>
    pathname === key || pathname.startsWith(key + '/')
  )?.[1] ?? 'POS System'

  return (
    <header
      className="fixed top-0 left-0 right-0 lg:left-[var(--sidebar-width)] z-20 flex items-center border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-5"
      style={{ height: 'var(--header-height)' }}
    >
      {/* Mobile logo */}
      <div className="flex items-center gap-2 mr-3 lg:hidden">
        <div className="flex items-center justify-center w-7 h-7 rounded-[6px] bg-[hsl(var(--primary))]">
          <ScanBarcode size={14} className="text-white" />
        </div>
      </div>

      <h1 className="text-sm font-semibold text-[hsl(var(--foreground))]">{title}</h1>
    </header>
  )
}
