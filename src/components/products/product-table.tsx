'use client'

import { useState, useEffect, useCallback, useDeferredValue } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Plus,
  Search,
  ScanBarcode,
  Package,
  Pencil,
  Trash2,
  Eye,
  MoreHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarcodeScanner } from '@/components/barcode/barcode-scanner'
import { ProductForm } from './product-form'
import { formatRupiah } from '@/lib/formatters/currency'
import { getProductStatus } from '@/types/product'
import { ensureSeedData, getAllProducts, getAllCategories, searchProducts, softDeleteProduct } from '@/services/product-service'
import { toast } from '@/components/ui/toaster'
import type { Product, Category } from '@/types/product'

export function ProductTable() {
  const searchParams = useSearchParams()
  const initialBarcode = searchParams.get('barcode') ?? ''

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [scannerOpen, setScannerOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(initialBarcode !== '')
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [formBarcode, setFormBarcode] = useState(initialBarcode)

  const deferredQuery = useDeferredValue(query)

  const loadData = useCallback(() => {
    ensureSeedData()
    setProducts(getAllProducts())
    setCategories(getAllCategories())
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const filtered = searchProducts(deferredQuery, categoryFilter === 'all' ? undefined : categoryFilter)

  const handleScan = (barcode: string) => {
    setScannerOpen(false)
    setFormBarcode(barcode)
    setEditProduct(null)
    setFormOpen(true)
  }

  const handleDelete = (product: Product) => {
    if (confirm(`Delete "${product.name}"?`)) {
      softDeleteProduct(product.id)
      toast({ title: 'Product deleted', variant: 'success' })
      loadData()
    }
  }

  const statusBadge = (product: Product) => {
    const s = getProductStatus(product)
    if (!product.isActive) return <Badge variant="secondary">Inactive</Badge>
    if (s === 'out-of-stock') return <Badge variant="danger">Out of Stock</Badge>
    if (s === 'low-stock') return <Badge variant="warning">Low Stock</Badge>
    return <Badge variant="success">In Stock</Badge>
  }

  return (
    <>
      <BarcodeScanner isOpen={scannerOpen} onDetected={handleScan} onClose={() => setScannerOpen(false)} />
      <ProductForm
        isOpen={formOpen}
        product={editProduct}
        initialBarcode={formBarcode}
        categories={categories}
        onClose={() => { setFormOpen(false); setEditProduct(null); setFormBarcode('') }}
        onSaved={() => { setFormOpen(false); setEditProduct(null); setFormBarcode(''); loadData() }}
      />

      <div className="p-5 lg:p-6 space-y-5 max-w-7xl">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold">Products</h1>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Manage your product catalog</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setScannerOpen(true)} className="gap-2">
              <ScanBarcode size={14} />
              Scan Barcode
            </Button>
            <Button size="sm" onClick={() => { setEditProduct(null); setFormBarcode(''); setFormOpen(true) }} className="gap-2">
              <Plus size={14} />
              Add Product
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="pl-8"
              id="product-search"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40" id="category-filter">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <Package size={36} className="text-[hsl(var(--muted-foreground))] opacity-40" />
              <p className="text-sm text-[hsl(var(--muted-foreground))]">No products found</p>
              <Button size="sm" onClick={() => { setEditProduct(null); setFormBarcode(''); setFormOpen(true) }}>Add Product</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
                    {['Barcode', 'Product', 'Category', 'Price', 'Stock', 'Status', ''].map((h) => (
                      <th key={h} className="text-left text-xs text-[hsl(var(--muted-foreground))] font-medium px-4 py-2.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const cat = categories.find((c) => c.id === p.categoryId)
                    return (
                      <tr key={p.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted))] transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-[hsl(var(--muted-foreground))]">{p.barcode}</td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{p.name}</p>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">{p.sku}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">{cat?.name ?? '-'}</td>
                        <td className="px-4 py-3 font-medium">{formatRupiah(p.sellingPrice)}</td>
                        <td className="px-4 py-3">{p.stock} {p.unit}</td>
                        <td className="px-4 py-3">{statusBadge(p)}</td>
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm" aria-label="Product actions">
                                <MoreHorizontal size={14} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setEditProduct(p); setFormOpen(true) }} className="gap-2">
                                <Pencil size={13} /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(p)}
                                className="gap-2 text-[hsl(var(--destructive))] focus:text-[hsl(var(--destructive))]"
                              >
                                <Trash2 size={13} /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>
      </div>
    </>
  )
}
