'use client'

import { useState } from 'react'
import { Minus, Plus, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatRupiah } from '@/lib/formatters/currency'
import type { Product } from '@/types/product'

interface QuantityDialogProps {
  product: Product
  onClose: () => void
  onConfirm: (quantity: number) => void
}

export function QuantityDialog({ product, onClose, onConfirm }: QuantityDialogProps) {
  const [quantity, setQuantity] = useState<number | ''>(1)

  const handleDecrease = () => {
    if (quantity === '') {
      setQuantity(1)
    } else if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const handleIncrease = () => {
    if (quantity === '') {
      setQuantity(1)
    } else if (quantity < product.stock) {
      setQuantity(quantity + 1)
    }
  }

  const handleInputChange = (val: string) => {
    if (val === '') {
      setQuantity('')
      return
    }
    const parsed = parseInt(val, 10)
    if (isNaN(parsed) || parsed < 1) {
      setQuantity(1)
    } else if (parsed > product.stock) {
      setQuantity(product.stock)
    } else {
      setQuantity(parsed)
    }
  }

  const subtotal = product.sellingPrice * (quantity === '' ? 0 : quantity)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[hsl(var(--card))] rounded-[var(--radius)] border border-[hsl(var(--border))] shadow-xl p-6 space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold">Tentukan Jumlah</h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Masukkan jumlah yang ingin ditambahkan ke keranjang.
          </p>
        </div>

        <div className="rounded-[var(--radius)] bg-[hsl(var(--muted))] p-4 space-y-2">
          <p className="text-sm font-semibold leading-snug">{product.name}</p>
          <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
            <span>Harga Satuan:</span>
            <span className="font-medium text-[hsl(var(--foreground))]">{formatRupiah(product.sellingPrice)}</span>
          </div>
          <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
            <span>Stok Tersedia:</span>
            <span className={`font-semibold ${product.stock <= product.minimumStock ? 'text-[hsl(var(--destructive))]' : 'text-[hsl(var(--foreground))]'}`}>
              {product.stock} unit
            </span>
          </div>
        </div>

        {/* Quantity selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Jumlah Pembelian</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDecrease}
              disabled={quantity !== '' && quantity <= 1}
              className="w-10 h-10 flex items-center justify-center rounded border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              <Minus size={16} />
            </button>
            <Input
              type="number"
              min={1}
              max={product.stock}
              value={quantity}
              onChange={(e) => handleInputChange(e.target.value)}
              className="text-center font-semibold text-base h-10"
              autoFocus
              onFocus={(e) => e.target.select()}
            />
            <button
              type="button"
              onClick={handleIncrease}
              disabled={quantity !== '' && quantity >= product.stock}
              className="w-10 h-10 flex items-center justify-center rounded border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="border-t border-[hsl(var(--border))] pt-3 flex justify-between items-center text-sm">
          <span className="text-[hsl(var(--muted-foreground))] font-medium">Subtotal:</span>
          <span className="text-base font-bold text-[hsl(var(--primary))]">{formatRupiah(subtotal)}</span>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => onConfirm(quantity === '' ? 1 : quantity)}
            className="flex-1 gap-2"
          >
            <ShoppingCart size={16} />
            Tambah Keranjang
          </Button>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
        </div>
      </div>
    </div>
  )
}
