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
  const { isCollapsed, toggleCollapse } = useSidebarStore()

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-30 border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-all duration-200",
          isCollapsed ? "w-16" : "w-[var(--sidebar-width)]"
        )}
      >
        {/* Logo Header */}
        <div className={cn(
          "flex items-center h-[var(--header-height)] border-b border-[hsl(var(--border))] overflow-hidden transition-all duration-200",
          isCollapsed ? "justify-center px-0" : "gap-2.5 px-4"
        )}>
          <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
            <Image
              src="/images/fondasi1.png"
              alt="Fondasi Logo"
              width={28}
              height={28}
              className="object-contain"
              priority
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
