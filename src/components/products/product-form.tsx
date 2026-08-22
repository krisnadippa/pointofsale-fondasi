'use client'

import { useState, useEffect } from 'react'
import { ScanBarcode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarcodeScanner } from '@/components/barcode/barcode-scanner'
import { createProduct, updateProduct, generateProductSku } from '@/services/product-service'
import { toast } from '@/components/ui/toaster'
import type { Product, Category } from '@/types/product'

interface ProductFormProps {
  isOpen: boolean
  product: Product | null
  initialBarcode: string
  categories: Category[]
  onClose: () => void
  onSaved: () => void
}

const formatThousand = (val: string | number) => {
  if (val === undefined || val === null || val === '') return ''
  const clean = String(val).replace(/\D/g, '')
  if (!clean) return ''
  return new Intl.NumberFormat('id-ID').format(Number(clean))
}

const parseThousand = (val: string) => {
  return val.replace(/\D/g, '')
}

const UNITS = ['Pcs', 'Botol', 'Bungkus', 'Kaleng', 'Kg', 'Gram', 'Liter', 'Pak', 'Dus']

export function ProductForm({ isOpen, product, initialBarcode, categories, onClose, onSaved }: ProductFormProps) {
  const [form, setForm] = useState({
    name: '', barcode: '', sku: '', categoryId: '', purchasePrice: '', sellingPrice: '',
    stock: '', minimumStock: '5', unit: 'Pcs',
  })
  const [scannerOpen, setScannerOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!isOpen) return
    if (product) {
      setForm({
        name: product.name, barcode: product.barcode, sku: product.sku,
        categoryId: product.categoryId, purchasePrice: String(product.purchasePrice),
        sellingPrice: String(product.sellingPrice), stock: String(product.stock),
        minimumStock: String(product.minimumStock), unit: product.unit,
      })
    } else {
      setForm({
        name: '', barcode: initialBarcode, sku: '', categoryId: categories[0]?.id ?? '',
        purchasePrice: '', sellingPrice: '', stock: '', minimumStock: '5', unit: 'Pcs',
      })
    }
    setErrors({})
  }, [isOpen, product, initialBarcode, categories])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Product name is required'
    if (!form.barcode.trim()) e.barcode = 'Barcode is required'
    if (!form.sellingPrice || Number(form.sellingPrice) <= 0) e.sellingPrice = 'Selling price must be > 0'
    if (!form.stock || Number(form.stock) < 0) e.stock = 'Stock must be >= 0'
    if (!form.categoryId) e.categoryId = 'Category is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const data = {
        name: form.name.trim(),
        barcode: form.barcode.trim(),
        sku: form.sku.trim(),
        categoryId: form.categoryId,
        purchasePrice: Number(form.purchasePrice) || 0,
        sellingPrice: Number(form.sellingPrice),
        stock: Number(form.stock),
        minimumStock: Number(form.minimumStock),
        unit: form.unit,
      }
      if (product) {
        updateProduct(product.id, data)
        toast({ title: 'Product updated', variant: 'success' })
      } else {
        createProduct(data)
        toast({ title: 'Product added', variant: 'success' })
      }
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <BarcodeScanner
        isOpen={scannerOpen}
        onDetected={(code) => { setScannerOpen(false); setForm((f) => ({ ...f, barcode: code })) }}
        onClose={() => setScannerOpen(false)}
      />

      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-[2px] p-0 sm:p-4">
        <div className="w-full sm:max-w-lg bg-[hsl(var(--card))] rounded-t-xl sm:rounded-[var(--radius)] border border-[hsl(var(--border))] shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--border))]">
            <h2 className="text-sm font-semibold">{product ? 'Edit Product' : 'Add Product'}</h2>
            <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] text-xs">Cancel</button>
          </div>

          <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Product Name */}
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="pf-name">Product Name <span className="text-[hsl(var(--destructive))]">*</span></Label>
                <Input id="pf-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Coca Cola 390ml" className={errors.name ? 'border-[hsl(var(--destructive))]' : ''} />
                {errors.name && <p className="text-xs text-[hsl(var(--destructive))]">{errors.name}</p>}
              </div>

              {/* Barcode */}
              <div className="space-y-1.5">
                <Label htmlFor="pf-barcode">Barcode <span className="text-[hsl(var(--destructive))]">*</span></Label>
                <div className="flex gap-2">
                  <Input id="pf-barcode" value={form.barcode} onChange={(e) => setForm((f) => ({ ...f, barcode: e.target.value }))} placeholder="e.g. 8991234001230" className={errors.barcode ? 'border-[hsl(var(--destructive))]' : ''} />
                  <Button type="button" variant="outline" size="icon" onClick={() => setScannerOpen(true)} aria-label="Scan barcode">
                    <ScanBarcode size={15} />
                  </Button>
                </div>
                {errors.barcode && <p className="text-xs text-[hsl(var(--destructive))]">{errors.barcode}</p>}
              </div>

              {/* SKU */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="pf-sku">SKU</Label>
                  <button
                    type="button"
                    onClick={() => {
                      if (form.categoryId) {
                        const generated = generateProductSku(form.categoryId)
                        setForm((f) => ({ ...f, sku: generated }))
                      } else {
                        toast({ title: 'Please select a category first', variant: 'error' })
                      }
                    }}
                    className="text-xs text-[hsl(var(--primary))] hover:underline font-medium"
                  >
                    Generate Otomatis
                  </button>
                </div>
                <Input id="pf-sku" value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} placeholder="e.g. BEV-001" />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <Label htmlFor="pf-category">Category <span className="text-[hsl(var(--destructive))]">*</span></Label>
                <Select value={form.categoryId} onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}>
                  <SelectTrigger id="pf-category" className={errors.categoryId ? 'border-[hsl(var(--destructive))]' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Unit */}
              <div className="space-y-1.5">
                <Label htmlFor="pf-unit">Unit</Label>
                <Select value={form.unit} onValueChange={(v) => setForm((f) => ({ ...f, unit: v }))}>
                  <SelectTrigger id="pf-unit"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Purchase Price */}
              <div className="space-y-1.5">
                <Label htmlFor="pf-purchase">Purchase Price (Rp)</Label>
                <Input id="pf-purchase" type="text" value={formatThousand(form.purchasePrice)} onChange={(e) => setForm((f) => ({ ...f, purchasePrice: parseThousand(e.target.value) }))} placeholder="0" />
              </div>

              {/* Selling Price */}
              <div className="space-y-1.5">
                <Label htmlFor="pf-selling">Selling Price (Rp) <span className="text-[hsl(var(--destructive))]">*</span></Label>
                <Input id="pf-selling" type="text" value={formatThousand(form.sellingPrice)} onChange={(e) => setForm((f) => ({ ...f, sellingPrice: parseThousand(e.target.value) }))} placeholder="0" className={errors.sellingPrice ? 'border-[hsl(var(--destructive))]' : ''} />
                {errors.sellingPrice && <p className="text-xs text-[hsl(var(--destructive))]">{errors.sellingPrice}</p>}
              </div>

              {/* Stock */}
              <div className="space-y-1.5">
                <Label htmlFor="pf-stock">Current Stock <span className="text-[hsl(var(--destructive))]">*</span></Label>
                <Input id="pf-stock" type="number" min="0" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} placeholder="0" className={errors.stock ? 'border-[hsl(var(--destructive))]' : ''} />
                {errors.stock && <p className="text-xs text-[hsl(var(--destructive))]">{errors.stock}</p>}
              </div>

              {/* Minimum Stock */}
              <div className="space-y-1.5">
                <Label htmlFor="pf-min-stock">Minimum Stock</Label>
                <Input id="pf-min-stock" type="number" min="0" value={form.minimumStock} onChange={(e) => setForm((f) => ({ ...f, minimumStock: e.target.value }))} placeholder="5" />
              </div>
            </div>
          </div>

          <div className="px-5 pb-5 flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1" id="save-product">
              {saving ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
