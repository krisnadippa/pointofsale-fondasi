'use client'

import { useEffect, useState } from 'react'
import {
  TrendingUp,
  Receipt,
  Package,
  AlertTriangle,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { formatRupiah } from '@/lib/formatters/currency'
import { formatRelativeDate, formatShortDate } from '@/lib/formatters/date'
import { ensureSeedData } from '@/services/product-service'
import { getTransactions, getTodayTransactions } from '@/lib/storage/transactions'
import { getLowStockProducts } from '@/services/inventory-service'
import { getProducts } from '@/lib/storage/products'
import type { Transaction } from '@/types/transaction'
import type { Product } from '@/types/product'
import { subDays, format } from 'date-fns'

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
  accent,
}: {
  label: string
  value: string
  icon: React.ElementType
  loading: boolean
  accent?: boolean
}) {
  return (
    <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">{label}</p>
          {loading ? (
            <Skeleton className="h-7 w-28" />
          ) : (
            <p className={`text-xl font-semibold ${accent ? 'text-[hsl(var(--primary))]' : ''}`}>
              {value}
            </p>
          )}
        </div>
        <div className="p-2 rounded-[var(--radius)] bg-[hsl(var(--muted))]">
          <Icon size={16} className="text-[hsl(var(--muted-foreground))]" />
        </div>
      </div>
    </div>
  )
}

// Simple SVG bar chart
function SalesChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="flex items-end gap-2 h-28 px-1">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-sm bg-[hsl(var(--primary))] opacity-80 transition-all duration-300"
            style={{ height: `${Math.max(4, (d.value / max) * 96)}px` }}
            title={formatRupiah(d.value)}
          />
          <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

export function DashboardClient() {
  const [loading, setLoading] = useState(true)
  const [todaySales, setTodaySales] = useState(0)
  const [todayTransactions, setTodayTransactions] = useState(0)
  const [totalProducts, setTotalProducts] = useState(0)
  const [lowStockCount, setLowStockCount] = useState(0)
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
  const [chartData, setChartData] = useState<{ label: string; value: number }[]>([])

  useEffect(() => {
    ensureSeedData()

    // Calculate stats
    const todayTx = getTodayTransactions()
    const sales = todayTx.reduce((s, t) => s + t.total, 0)
    const allProducts = getProducts().filter((p) => p.isActive)
    const lowStock = getLowStockProducts()

    setTodaySales(sales)
    setTodayTransactions(todayTx.length)
    setTotalProducts(allProducts.length)
    setLowStockCount(lowStock.length)
    setRecentTransactions(getTransactions().slice(0, 8))
    setLowStockProducts(lowStock.slice(0, 5))

    // Build 7-day chart
    const allTx = getTransactions()
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i)
      const dayStr = format(d, 'yyyy-MM-dd')
      const dayTotal = allTx
        .filter((t) => t.createdAt.startsWith(dayStr))
        .reduce((s, t) => s + t.total, 0)
      return { label: formatShortDate(d), value: dayTotal }
    })
    setChartData(days)
    setLoading(false)
  }, [])

  const paymentLabel: Record<string, string> = {
    cash: 'Cash',
    qris: 'QRIS',
    debit: 'Debit',
    credit: 'Credit',
  }

  return (
    <div className="p-5 lg:p-6 space-y-6 max-w-7xl">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Sales" value={formatRupiah(todaySales)} icon={TrendingUp} loading={loading} accent />
        <StatCard label="Transactions" value={String(todayTransactions)} icon={Receipt} loading={loading} />
        <StatCard label="Products" value={String(totalProducts)} icon={Package} loading={loading} />
        <StatCard label="Low Stock" value={String(lowStockCount)} icon={AlertTriangle} loading={loading} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sales chart */}
        <div className="lg:col-span-2 rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold">Sales Overview</h2>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Last 7 days</p>
          </div>
          {loading ? (
            <Skeleton className="h-28 w-full" />
          ) : (
            <SalesChart data={chartData} />
          )}
        </div>

        {/* Low stock */}
        <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold">Low Stock Alert</h2>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Needs restock</p>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : lowStockProducts.length === 0 ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">All products have adequate stock</p>
          ) : (
            <div className="space-y-2">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-[hsl(var(--border))] last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Min: {p.minimumStock}</p>
                  </div>
                  <Badge variant={p.stock === 0 ? 'danger' : 'warning'}>
                    {p.stock === 0 ? 'Out' : p.stock}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="px-5 py-4 border-b border-[hsl(var(--border))]">
          <h2 className="text-sm font-semibold">Recent Transactions</h2>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : recentTransactions.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <Receipt size={32} className="mx-auto mb-2 text-[hsl(var(--muted-foreground))] opacity-50" />
            <p className="text-sm text-[hsl(var(--muted-foreground))]">No transactions yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))]">
                  {['Invoice', 'Cashier', 'Items', 'Total', 'Payment', 'Date', 'Status'].map((h) => (
                    <th key={h} className="text-left text-xs text-[hsl(var(--muted-foreground))] font-medium px-5 py-2.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((t) => (
                  <tr key={t.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted))] transition-colors">
                    <td className="px-5 py-3 font-mono text-xs">{t.invoiceNumber}</td>
                    <td className="px-5 py-3">{t.cashierName}</td>
                    <td className="px-5 py-3 text-[hsl(var(--muted-foreground))]">{t.items.length}</td>
                    <td className="px-5 py-3 font-medium">{formatRupiah(t.total)}</td>
                    <td className="px-5 py-3 capitalize">{paymentLabel[t.paymentMethod] ?? t.paymentMethod}</td>
                    <td className="px-5 py-3 text-[hsl(var(--muted-foreground))] text-xs whitespace-nowrap">{formatRelativeDate(t.createdAt)}</td>
                    <td className="px-5 py-3">
                      <Badge variant={t.status === 'completed' ? 'success' : 'danger'}>
                        {t.status === 'completed' ? 'Completed' : 'Voided'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
