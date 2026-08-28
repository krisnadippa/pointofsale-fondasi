'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, ReceiptText, Printer } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { formatRupiah } from '@/lib/formatters/currency'
import { formatDateTime } from '@/lib/formatters/date'
import { getTransactions } from '@/lib/storage/transactions'
import type { Transaction } from '@/types/transaction'
import { ensureSeedData } from '@/services/product-service'
import { printReceipt } from '@/services/printing/print-service'

const paymentLabel: Record<string, string> = {
  cash: 'Cash', qris: 'QRIS', debit: 'Debit', credit: 'Credit',
}

export function TransactionTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Transaction | null>(null)

  useEffect(() => {
    ensureSeedData()
    setTransactions(getTransactions())
    setLoading(false)
  }, [])

  const filtered = transactions.filter((t) =>
    !query || t.invoiceNumber.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <>
      {/* Transaction detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div className="w-full max-w-md bg-[hsl(var(--card))] rounded-[var(--radius)] border border-[hsl(var(--border))] shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--border))]">
              <div>
                <p className="text-sm font-semibold">{selected.invoiceNumber}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{formatDateTime(selected.createdAt)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">Close</button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                {selected.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{item.quantity} x {formatRupiah(item.price)}</p>
                    </div>
                    <p className="font-medium">{formatRupiah(item.subtotal)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-[hsl(var(--border))] pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">Subtotal</span>
                  <span>{formatRupiah(selected.subtotal)}</span>
                </div>
                {selected.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatRupiah(selected.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span className="text-[hsl(var(--primary))]">{formatRupiah(selected.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">Payment</span>
                  <span>{paymentLabel[selected.paymentMethod] ?? selected.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">Paid</span>
                  <span>{formatRupiah(selected.paidAmount)}</span>
                </div>
                {selected.changeAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[hsl(var(--muted-foreground))]">Change</span>
                    <span className="text-green-600">{formatRupiah(selected.changeAmount)}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[hsl(var(--muted-foreground))]">Cashier</span>
                <span>{selected.cashierName}</span>
              </div>
              <div className="pt-2">
                <Button
                  onClick={() => printReceipt(selected)}
                  variant="outline"
                  className="w-full gap-2 text-xs"
                >
                  <Printer size={14} />
                  Print Receipt (Cetak Struk)
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-5 lg:p-6 space-y-5 max-w-7xl">
        <div>
          <h1 className="text-lg font-semibold">Transactions</h1>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Transaction history</p>
        </div>

        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search invoice..." className="pl-8" id="tx-search" />
        </div>

        <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
          {loading ? (
            <div className="p-5 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-2">
              <ReceiptText size={32} className="text-[hsl(var(--muted-foreground))] opacity-40" />
              <p className="text-sm text-[hsl(var(--muted-foreground))]">No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
                    {['Invoice', 'Date', 'Items', 'Cashier', 'Payment', 'Total', 'Status', ''].map((h) => (
                      <th key={h} className="text-left text-xs text-[hsl(var(--muted-foreground))] font-medium px-4 py-2.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id} className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer" onClick={() => setSelected(t)}>
                      <td className="px-4 py-3 font-mono text-xs">{t.invoiceNumber}</td>
                      <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))] whitespace-nowrap">{formatDateTime(t.createdAt)}</td>
                      <td className="px-4 py-3">{t.items.length}</td>
                      <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">{t.cashierName}</td>
                      <td className="px-4 py-3 capitalize">{paymentLabel[t.paymentMethod]}</td>
                      <td className="px-4 py-3 font-medium">{formatRupiah(t.total)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={t.status === 'completed' ? 'success' : 'danger'}>
                          {t.status === 'completed' ? 'Completed' : 'Voided'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-[hsl(var(--primary))]">View</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</p>
      </div>
    </>
  )
}
