'use client'

import { useState } from 'react'
import { CreditCard, Banknote, Smartphone, Building2, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatRupiah, parseRupiah } from '@/lib/formatters/currency'
import { processCheckout } from '@/services/transaction-service'
import { getSettings } from '@/lib/storage/settings'
import type { CartItem, PaymentMethod, Transaction } from '@/types/transaction'
import { toast } from '@/components/ui/toaster'

interface CheckoutModalProps {
  items: CartItem[]
  subtotal: number
  onClose: () => void
  onSuccess: (transaction: Transaction) => void
}

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: React.ElementType }[] = [
  { id: 'cash', label: 'Cash', icon: Banknote },
  { id: 'qris', label: 'QRIS', icon: Smartphone },
  { id: 'debit', label: 'Debit', icon: CreditCard },
  { id: 'credit', label: 'Credit', icon: Building2 },
]

export function CheckoutModal({ items, subtotal, onClose, onSuccess }: CheckoutModalProps) {
  const settings = getSettings()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [qrLoading, setQrLoading] = useState(true)
  const [paidInput, setPaidInput] = useState('')
  const [discount, setDiscount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tax = Math.round(subtotal * (settings.taxRate / 100))
  const total = Math.max(0, subtotal - discount + tax)
  const paid = paymentMethod === 'cash' ? parseRupiah(paidInput) : total
  const change = paymentMethod === 'cash' ? paid - total : 0
  const insufficient = paymentMethod === 'cash' && paid < total && paidInput !== ''

  const handleProcess = async () => {
    if (paymentMethod === 'cash' && paid < total) {
      setError('Insufficient payment amount')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const result = processCheckout({ items, discount, paymentMethod, paidAmount: paid })
      toast({ title: 'Transaction completed', variant: 'success' })
      onSuccess(result.transaction)
    } catch (e) {
      setError('Failed to process transaction')
      setLoading(false)
    }
  }

  // Quick cash amounts
  const quickAmounts = [total, Math.ceil(total / 10000) * 10000, Math.ceil(total / 50000) * 50000, Math.ceil(total / 100000) * 100000]
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 4)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-[2px] p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-[hsl(var(--card))] rounded-t-xl sm:rounded-[var(--radius)] border border-[hsl(var(--border))] shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--border))]">
          <h2 className="text-sm font-semibold">Checkout</h2>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] text-xs">Cancel</button>
        </div>

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Order summary */}
          <div className="rounded-[var(--radius)] bg-[hsl(var(--muted))] p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted-foreground))]">Items</span>
              <span>{items.length} item{items.length > 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted-foreground))]">Subtotal</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatRupiah(discount)}</span>
              </div>
            )}
            {tax > 0 && (
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">Tax ({settings.taxRate}%)</span>
                <span>{formatRupiah(tax)}</span>
              </div>
            )}
            <div className="border-t border-[hsl(var(--border))] pt-2 flex justify-between font-semibold text-base">
              <span>Total</span>
              <span className="text-[hsl(var(--primary))]">{formatRupiah(total)}</span>
            </div>
          </div>

          {/* Payment method */}
          <div className="space-y-2">
            <Label className="text-xs text-[hsl(var(--muted-foreground))]">Payment Method</Label>
            <div className="grid grid-cols-4 gap-2">
              {PAYMENT_METHODS.map((pm) => {
                const Icon = pm.icon
                return (
                  <button
                    key={pm.id}
                    onClick={() => {
                      setPaymentMethod(pm.id)
                      if (pm.id === 'qris') {
                        setQrLoading(true)
                      }
                    }}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-[var(--radius)] border text-xs font-medium transition-all ${
                      paymentMethod === pm.id
                        ? 'border-[hsl(var(--primary))] bg-[hsl(221,83%,97%)] text-[hsl(var(--primary))]'
                        : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]'
                    }`}
                    aria-pressed={paymentMethod === pm.id}
                  >
                    <Icon size={16} />
                    {pm.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Cash payment input */}
          {paymentMethod === 'cash' && (
            <div className="space-y-2">
              <Label htmlFor="paid-amount" className="text-xs text-[hsl(var(--muted-foreground))]">Paid Amount</Label>
              <Input
                id="paid-amount"
                type="text"
                inputMode="numeric"
                placeholder="Enter amount..."
                value={paidInput}
                onChange={(e) => setPaidInput(e.target.value.replace(/[^0-9]/g, ''))}
                className={insufficient ? 'border-[hsl(var(--destructive))]' : ''}
              />
              {/* Quick amounts */}
              <div className="flex gap-2 flex-wrap">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setPaidInput(String(amt))}
                    className="px-2.5 py-1 rounded text-xs border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition-colors"
                  >
                    {formatRupiah(amt)}
                  </button>
                ))}
              </div>
              {/* Change display */}
              {paidInput && !insufficient && (
                <div className="rounded-[var(--radius)] bg-[hsl(var(--muted))] p-3 flex justify-between text-sm">
                  <span className="text-[hsl(var(--muted-foreground))]">Change</span>
                  <span className="font-semibold text-green-600">{formatRupiah(Math.max(0, change))}</span>
                </div>
              )}
              {insufficient && (
                <div className="flex items-center gap-1.5 text-[hsl(var(--destructive))] text-xs">
                  <AlertCircle size={13} />
                  <span>Insufficient payment (need {formatRupiah(total - paid)} more)</span>
                </div>
              )}
            </div>
          )}

          {/* QRIS payment display */}
          {paymentMethod === 'qris' && (
            <div className="flex flex-col items-center justify-center p-4 border border-[hsl(var(--border))] rounded-[var(--radius)] bg-[hsl(var(--muted))] space-y-3">
              <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] text-center">
                Pindai QRIS di bawah ini untuk membayar
              </p>
              <div className="relative bg-white p-3 rounded-lg shadow-sm border border-slate-200 w-[204px] h-[204px] flex items-center justify-center">
                {qrLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-lg">
                    <Loader2 className="w-7 h-7 text-[hsl(var(--primary))] animate-spin" />
                    <span className="text-[10px] text-[hsl(var(--muted-foreground))] mt-2 font-medium">Generating QRIS...</span>
                  </div>
                )}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    `00020101021226300024ID.CO.DANA.WWW011893600911000000000052045999530336054${String(total).length.toString().padStart(2, '0')}${total}5802ID5908TokoAnda6007Jakarta6304ABCD`
                  )}`}
                  alt="QRIS Code"
                  className={`w-[180px] h-[180px] transition-opacity duration-200 ${qrLoading ? 'opacity-0' : 'opacity-100'}`}
                  onLoad={() => setQrLoading(false)}
                />
              </div>
              <div className="text-center">
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Total Bayar</p>
                <p className="text-lg font-bold text-[hsl(var(--primary))]">{formatRupiah(total)}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-1.5 text-[hsl(var(--destructive))] text-sm">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
        </div>

        <div className="px-5 pb-5">
          <Button
            className="w-full"
            size="lg"
            onClick={handleProcess}
            disabled={loading || (paymentMethod === 'cash' && (paid < total || !paidInput))}
            id="process-payment"
          >
            {loading ? 'Processing...' : `Process ${formatRupiah(total)}`}
          </Button>
        </div>
      </div>
    </div>
  )
}
