'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ScanBarcode,
  Package,
  Tags,
  Boxes,
  ReceiptText,
  BarChart3,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pos', label: 'Point of Sale', icon: ScanBarcode },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/categories', label: 'Categories', icon: Tags },
  { href: '/inventory', label: 'Inventory', icon: Boxes },
  { href: '/transactions', label: 'Transactions', icon: ReceiptText },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
] as const

export function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-30 border-r border-[hsl(var(--border))] bg-[hsl(var(--card))]"
        style={{ width: 'var(--sidebar-width)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 h-[var(--header-height)] px-5 border-b border-[hsl(var(--border))]">
          <div className="flex items-center justify-center w-7 h-7 rounded-[6px] bg-[hsl(var(--primary))]">
            <ScanBarcode size={14} className="text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight">POS System</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius)] text-sm transition-colors',
                      isActive
                        ? 'bg-[hsl(var(--primary))] text-white font-medium'
                        : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]'
                    )}
                  >
                    <Icon size={16} className="shrink-0" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>

      {/* Mobile bottom navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] safe-area-bottom">
        <div className="flex items-center justify-around px-1 py-1">
          {NAV_ITEMS.slice(0, 5).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-2 py-1.5 rounded-[var(--radius)] transition-colors min-w-[52px]',
                  isActive
                    ? 'text-[hsl(var(--primary))]'
                    : 'text-[hsl(var(--muted-foreground))]'
                )}
                aria-label={item.label}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium leading-none">{item.label.split(' ')[0]}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
