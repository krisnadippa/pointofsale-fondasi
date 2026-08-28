'use client'

import Link from 'next/link'
import Image from 'next/image'
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useSidebarStore } from '@/hooks/use-sidebar'
import { Button } from '@/components/ui/button'

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
  const { isCollapsed, toggleCollapse, isMobileOpen, setMobileOpen } = useSidebarStore()

  // 5 quick navigation items for mobile bottom bar
  const MOBILE_BOTTOM_ITEMS = [
    { href: '/pos', label: 'Kasir', icon: ScanBarcode },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/products', label: 'Produk', icon: Package },
    { href: '/transactions', label: 'Riwayat', icon: ReceiptText },
    { href: '/settings', label: 'Setting', icon: Settings },
  ] as const

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-64 bg-[hsl(var(--card))] border-r border-[hsl(var(--border))] flex flex-col transition-transform duration-200 ease-in-out lg:hidden",
          isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between h-[var(--header-height)] px-4 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-2.5">
            <img
              src="/images/fondasi1.png"
              alt="Fondasi Logo"
              style={{ width: '26px', height: '26px', objectFit: 'contain' }}
            />
            <span className="text-sm font-semibold tracking-tight text-[hsl(var(--foreground))]">
              Fondasi POS
            </span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1 rounded-md text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]"
            aria-label="Close menu"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* Drawer Nav List */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius)] text-sm transition-colors',
                      isActive
                        ? 'bg-[hsl(var(--primary))] text-white font-medium shadow-sm'
                        : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]'
                    )}
                  >
                    <Icon size={18} className="shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-30 border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-all duration-200"
        style={{ width: isCollapsed ? '64px' : 'var(--sidebar-width)' }}
      >
        {/* Logo Header */}
        <div className={cn(
          "flex items-center h-[var(--header-height)] border-b border-[hsl(var(--border))] overflow-hidden transition-all duration-200",
          isCollapsed ? "justify-center px-0" : "gap-2.5 px-4"
        )}>
          <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
            <img
              src="/images/fondasi1.png"
              alt="Fondasi Logo"
              style={{ width: '28px', height: '28px', objectFit: 'contain' }}
            />
          </div>
          {!isCollapsed && (
            <span className="text-sm font-semibold tracking-tight text-[hsl(var(--foreground))] whitespace-nowrap">
              Fondasi
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      'flex items-center rounded-[var(--radius)] text-sm transition-all duration-150',
                      isCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2',
                      isActive
                        ? 'bg-[hsl(var(--primary))] text-white font-medium'
                        : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]'
                    )}
                  >
                    <Icon size={16} className="shrink-0" />
                    {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Collapse/Expand Toggle Button */}
        <div className="p-2 border-t border-[hsl(var(--border))] flex justify-center">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleCollapse}
            className="w-full h-8 hover:bg-[hsl(var(--accent))] flex items-center justify-center rounded-[var(--radius)]"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </Button>
        </div>
      </aside>

      {/* Mobile bottom navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] safe-area-bottom">
        <div className="flex items-center justify-around px-1 py-1">
          {MOBILE_BOTTOM_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-2 py-1.5 rounded-[var(--radius)] transition-colors min-w-[52px]',
                  isActive
                    ? 'text-[hsl(var(--primary))] font-semibold'
                    : 'text-[hsl(var(--muted-foreground))]'
                )}
                aria-label={item.label}
              >
                <Icon size={19} />
                <span className="text-[10px] leading-none">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
