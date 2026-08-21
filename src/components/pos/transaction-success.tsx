'use client'

import { CheckCircle2, Printer, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatRupiah } from '@/lib/formatters/currency'
import { formatDateTime } from '@/lib/formatters/date'
import { printReceipt } from '@/services/printing/print-service'
import type { Transaction } from '@/types/transaction'

interface TransactionSuccessProps {
  transaction: Transaction
  onNewTransaction: () => void
  onClose: () => void
}

const paymentLabel: Record<string, string> = {
  cash: 'Cash',
  qris: 'QRIS',
  debit: 'Debit',
  credit: 'Credit',
}

export function TransactionSuccess({ transaction, onNewTransaction, onClose }: TransactionSuccessProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
      <div className="w-full max-w-sm bg-[hsl(var(--card))] rounded-[var(--radius)] border border-[hsl(var(--border))] shadow-xl overflow-hidden">
        {/* Success header */}
        <div className="flex flex-col items-center py-8 px-5 bg-[hsl(142,71%,97%)] border-b border-[hsl(142,71%,85%)]">
          <CheckCircle2 size={40} className="text-[hsl(142,71%,40%)] mb-3 success-pulse" />
          <p className="text-sm font-semibold text-[hsl(142,71%,30%)]">Transaction Successful</p>
          <p className="text-xs text-[hsl(142,71%,40%)] font-mono mt-1">{transaction.invoiceNumber}</p>
        </div>

        {/* Details */}
        <div className="p-5 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[hsl(var(--muted-foreground))]">Date</span>
            <span className="text-xs">{formatDateTime(transaction.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[hsl(var(--muted-foreground))]">Items</span>
            <span>{transaction.items.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[hsl(var(--muted-foreground))]">Payment</span>
            <span>{paymentLabel[transaction.paymentMethod] ?? transaction.paymentMethod}</span>
          </div>
          <div className="border-t border-[hsl(var(--border))] pt-3 flex justify-between font-semibold text-base">
            <span>Total</span>
            <span className="text-[hsl(var(--primary))]">{formatRupiah(transaction.total)}</span>
          </div>
          {transaction.paymentMethod === 'cash' && transaction.changeAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted-foreground))]">Change</span>
              <span className="font-semibold text-green-600">{formatRupiah(transaction.changeAmount)}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex flex-col gap-2">
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => printReceipt(transaction)}
            id="print-receipt"
          >
            <Printer size={15} />
            Print Receipt
          </Button>
          <Button
            className="w-full gap-2"
            onClick={onNewTransaction}
            id="new-transaction"
          >
            <RotateCcw size={15} />
            New Transaction
          </Button>
        </div>
      </div>
    </div>
  )
}
