'use client'

import { ScanBarcode } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useSidebarStore } from '@/hooks/use-sidebar'
import { cn } from '@/lib/utils/cn'
import Image from 'next/image'

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
  const { isCollapsed } = useSidebarStore()
  const title = Object.entries(PAGE_TITLES).find(([key]) =>
    pathname === key || pathname.startsWith(key + '/')
  )?.[1] ?? 'POS System'

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-20 flex items-center border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-5 transition-all duration-200",
        isCollapsed ? "lg:left-16" : "lg:left-[var(--sidebar-width)]"
      )}
      style={{ height: 'var(--header-height)' }}
    >
      {/* Mobile logo */}
      <div className="flex items-center gap-2 mr-3 lg:hidden">
        <div className="relative w-7 h-7 shrink-0 flex items-center justify-center">
          <Image
            src="/images/fondasi1.png"
            alt="Fondasi Logo"
            width={24}
            height={24}
            className="object-contain"
          />
        </div>
      </div>

      <h1 className="text-sm font-semibold text-[hsl(var(--foreground))]">{title}</h1>
    </header>
  )
}
