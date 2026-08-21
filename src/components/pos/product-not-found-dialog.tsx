'use client'

import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProductNotFoundDialogProps {
  barcode: string
  onClose: () => void
  onScanAgain: () => void
  onAddProduct: () => void
}

export function ProductNotFoundDialog({
  barcode,
  onClose,
  onScanAgain,
  onAddProduct,
}: ProductNotFoundDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
      <div className="w-full max-w-sm bg-[hsl(var(--card))] rounded-[var(--radius)] border border-[hsl(var(--border))] shadow-xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-[hsl(38,92%,90%)] shrink-0">
            <AlertCircle size={18} className="text-[hsl(38,92%,35%)]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Product Not Found</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
              No product matches this barcode.
            </p>
          </div>
        </div>

        <div className="rounded-[var(--radius)] bg-[hsl(var(--muted))] px-4 py-3">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Barcode</p>
          <p className="text-sm font-mono font-semibold mt-0.5">{barcode}</p>
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={onAddProduct} className="w-full">
            Add Product
          </Button>
          <Button onClick={onScanAgain} variant="outline" className="w-full">
            Scan Again
          </Button>
          <button
            onClick={onClose}
            className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors py-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
