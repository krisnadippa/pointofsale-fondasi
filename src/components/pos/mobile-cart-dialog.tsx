'use client'

import { ShoppingCart, Minus, Plus, Trash2, X, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatRupiah } from '@/lib/formatters/currency'
import type { CartItem } from '@/types/transaction'

interface MobileCartDialogProps {
  items: CartItem[]
  subtotal: number
  isOpen: boolean
  onClose: () => void
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemoveItem: (productId: string) => void
  onClearCart: () => void
  onCheckout: () => void
}

export function MobileCartDialog({
  items,
  subtotal,
  isOpen,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
}: MobileCartDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/50 backdrop-blur-[2px] lg:hidden animate-in fade-in duration-200">
      <div className="mt-auto max-h-[85vh] w-full bg-[hsl(var(--card))] rounded-t-2xl border-t border-[hsl(var(--border))] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-[hsl(var(--primary))]" />
            <span className="font-semibold text-base">Keranjang Belanja</span>
            {items.length > 0 && (
              <Badge variant="default" className="text-xs">{items.length}</Badge>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[hsl(var(--accent))] transition-colors"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content - Items List */}
        <div className="flex-1 overflow-y-auto px-5 py-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-[hsl(var(--muted-foreground))]">
              <ShoppingCart size={48} className="opacity-30" />
              <p className="text-sm font-medium">Keranjang masih kosong</p>
              <p className="text-xs">Silakan pilih produk untuk ditambahkan</p>
            </div>
          ) : (
            <div className="divide-y divide-[hsl(var(--border))]">
              {items.map((item) => (
                <div key={item.productId} className="py-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate leading-snug">{item.productName}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                        {formatRupiah(item.price)} / item
                      </p>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.productId)}
                      className="p-1.5 rounded-full hover:bg-[hsl(var(--destructive))] hover:text-white transition-colors text-[hsl(var(--muted-foreground))]"
                      aria-label={`Remove ${item.productName}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-sm font-bold text-[hsl(var(--foreground))]">{formatRupiah(item.subtotal)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[hsl(var(--border))] p-5 space-y-4 bg-[hsl(var(--card))] pb-[calc(20px+var(--sab,0px))]">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
                <span>Subtotal</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between text-base font-bold">
                <span>Total Bayar</span>
                <span className="text-[hsl(var(--primary))]">{formatRupiah(subtotal)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClearCart}
                className="px-4 py-2 border border-[hsl(var(--border))] rounded-[var(--radius)] text-xs text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--destructive))] transition-all font-medium"
              >
                Kosongkan
              </button>
              <Button
                className="flex-1 gap-2 text-sm h-11"
                onClick={() => {
                  onClose()
                  onCheckout()
                }}
              >
                Lanjut ke Checkout
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
