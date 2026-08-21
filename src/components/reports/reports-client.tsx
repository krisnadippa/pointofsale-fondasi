'use client'

import { useState, useEffect } from 'react'
import { BarChart3 } from 'lucide-react'
import { formatRupiah } from '@/lib/formatters/currency'
import { formatDate, formatShortDate } from '@/lib/formatters/date'
import { getTransactions } from '@/lib/storage/transactions'
import { ensureSeedData } from '@/services/product-service'
import { subDays, format } from 'date-fns'
import type { Transaction } from '@/types/transaction'

function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="flex items-end gap-2 h-40 px-1">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[10px] text-[hsl(var(--muted-foreground))] mb-1">{d.value > 0 ? formatRupiah(d.value) : ''}</span>
          <div
            className="w-full rounded-t-sm bg-[hsl(var(--primary))] opacity-80 transition-all duration-500"
            style={{ height: `${Math.max(4, (d.value / max) * 100)}px` }}
          />
          <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

export function ReportsClient() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ensureSeedData()
    setTransactions(getTransactions())
    setLoading(false)
  }, [])

  // 30-day chart
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = subDays(new Date(), 29 - i)
    const dayStr = format(d, 'yyyy-MM-dd')
    return {
      label: i % 7 === 0 ? formatShortDate(d) : '',
      value: transactions.filter((t) => t.createdAt.startsWith(dayStr)).reduce((s, t) => s + t.total, 0),
    }
  })

  // Top products
  const productSales: Record<string, { name: string; qty: number; revenue: number }> = {}
  transactions.forEach((t) => {
    t.items.forEach((item) => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = { name: item.productName, qty: 0, revenue: 0 }
      }
      productSales[item.productId].qty += item.quantity
      productSales[item.productId].revenue += item.subtotal
    })
  })
  const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 10)

  // Summary stats
  const totalRevenue = transactions.reduce((s, t) => s + t.total, 0)
  const totalItems = transactions.reduce((s, t) => s + t.items.reduce((si, i) => si + i.quantity, 0), 0)
  const avgOrder = transactions.length > 0 ? totalRevenue / transactions.length : 0

  return (
    <div className="p-5 lg:p-6 space-y-6 max-w-7xl">
      <div>
        <h1 className="text-lg font-semibold">Reports</h1>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Sales analysis and trends</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: formatRupiah(totalRevenue) },
          { label: 'Total Transactions', value: String(transactions.length) },
          { label: 'Items Sold', value: String(totalItems) },
          { label: 'Avg Order Value', value: formatRupiah(avgOrder) },
        ].map((s) => (
          <div key={s.label} className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">{s.label}</p>
            <p className="text-xl font-semibold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* 30-day chart */}
      <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
        <div className="mb-4">
          <h2 className="text-sm font-semibold">Revenue — Last 30 Days</h2>
        </div>
        <BarChart data={last30} />
      </div>

      {/* Top products */}
      <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
        <div className="px-5 py-4 border-b border-[hsl(var(--border))]">
          <h2 className="text-sm font-semibold">Top Products by Revenue</h2>
        </div>
        {topProducts.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-2">
            <BarChart3 size={32} className="text-[hsl(var(--muted-foreground))] opacity-40" />
            <p className="text-sm text-[hsl(var(--muted-foreground))]">No sales data yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
                  {['#', 'Product', 'Qty Sold', 'Revenue'].map((h) => (
                    <th key={h} className="text-left text-xs text-[hsl(var(--muted-foreground))] font-medium px-5 py-2.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr key={p.name} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted))] transition-colors">
                    <td className="px-5 py-3 text-[hsl(var(--muted-foreground))]">{i + 1}</td>
                    <td className="px-5 py-3 font-medium">{p.name}</td>
                    <td className="px-5 py-3">{p.qty}</td>
                    <td className="px-5 py-3 font-medium text-[hsl(var(--primary))]">{formatRupiah(p.revenue)}</td>
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
