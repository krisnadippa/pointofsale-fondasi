'use client'

import { useState, useEffect, useCallback } from 'react'
import { Boxes, ArrowUp, ArrowDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getProductStatus } from '@/types/product'
import { getStockMovements } from '@/lib/storage/inventory'
import { getProducts, getCategories } from '@/lib/storage/products'
import { ensureSeedData } from '@/services/product-service'
import { formatRelativeDate } from '@/lib/formatters/date'
import type { Product } from '@/types/product'
import type { StockMovement } from '@/types/inventory'

export function InventoryTable() {
  const [products, setProducts] = useState<Product[]>([])
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'stock' | 'movements'>('stock')

  useEffect(() => {
    ensureSeedData()
    setProducts(getProducts().filter((p) => p.isActive))
    setMovements(getStockMovements().slice(0, 50))
    setLoading(false)
  }, [])

  const categories = getCategories()

  const statusBadge = (p: Product) => {
    const s = getProductStatus(p)
    if (s === 'out-of-stock') return <Badge variant="danger">Out of Stock</Badge>
    if (s === 'low-stock') return <Badge variant="warning">Low Stock</Badge>
    return <Badge variant="success">In Stock</Badge>
  }

  const movTypeColor = (t: string) => {
    if (t === 'SALE') return 'text-[hsl(var(--destructive))]'
    if (t === 'PURCHASE' || t === 'RETURN') return 'text-green-600'
    return 'text-[hsl(var(--muted-foreground))]'
  }

  return (
    <div className="p-5 lg:p-6 space-y-5 max-w-7xl">
      <div>
        <h1 className="text-lg font-semibold">Inventory</h1>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Stock levels and movement history</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[hsl(var(--muted))] rounded-[var(--radius)] w-fit">
        {([['stock', 'Stock Levels'], ['movements', 'Stock Movements']] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-3 py-1.5 text-sm rounded-[calc(var(--radius)-2px)] font-medium transition-colors ${
              tab === id ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'stock' && (
        <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
          {loading ? (
            <div className="p-5 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
                    {['Product', 'Barcode', 'Category', 'Current Stock', 'Min Stock', 'Status'].map((h) => (
                      <th key={h} className="text-left text-xs text-[hsl(var(--muted-foreground))] font-medium px-4 py-2.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const cat = categories.find((c) => c.id === p.categoryId)
                    return (
                      <tr key={p.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted))] transition-colors">
                        <td className="px-4 py-3 font-medium">{p.name}</td>
                        <td className="px-4 py-3 font-mono text-xs text-[hsl(var(--muted-foreground))]">{p.barcode}</td>
                        <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">{cat?.name ?? '-'}</td>
                        <td className="px-4 py-3 font-medium">{p.stock} {p.unit}</td>
                        <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">{p.minimumStock}</td>
                        <td className="px-4 py-3">{statusBadge(p)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'movements' && (
        <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
          {loading ? (
            <div className="p-5 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : movements.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-2">
              <Boxes size={32} className="text-[hsl(var(--muted-foreground))] opacity-40" />
              <p className="text-sm text-[hsl(var(--muted-foreground))]">No stock movements recorded</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
                    {['Product', 'Type', 'Qty Change', 'Before', 'After', 'Notes', 'Date'].map((h) => (
                      <th key={h} className="text-left text-xs text-[hsl(var(--muted-foreground))] font-medium px-4 py-2.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => (
                    <tr key={m.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted))] transition-colors">
                      <td className="px-4 py-3 font-medium">{m.productName}</td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="text-xs">{m.type}</Badge>
                      </td>
                      <td className={`px-4 py-3 font-semibold ${movTypeColor(m.type)}`}>
                        {m.quantity > 0 ? '+' : ''}{m.quantity}
                      </td>
                      <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">{m.previousStock}</td>
                      <td className="px-4 py-3">{m.newStock}</td>
                      <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))] max-w-32 truncate">{m.notes ?? '-'}</td>
                      <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))] whitespace-nowrap">{formatRelativeDate(m.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
