'use client'

import { useState } from 'react'
import { CheckCircle2, Printer, RotateCcw, Bluetooth, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatRupiah } from '@/lib/formatters/currency'
import { formatDateTime } from '@/lib/formatters/date'
import { printReceipt } from '@/services/printing/print-service'
import { getConnectedBluetoothDevice } from '@/services/printing/bluetooth-print-service'
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
  const [printing, setPrinting] = useState(false)
  const [printed, setPrinted] = useState(false)
  const btDevice = getConnectedBluetoothDevice()

  const handlePrint = async () => {
    setPrinting(true)
    try {
      await printReceipt(transaction)
      setPrinted(true)
    } finally {
      setPrinting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
      <div className="w-full max-w-sm bg-[hsl(var(--card))] rounded-[var(--radius)] border border-[hsl(var(--border))] shadow-xl overflow-hidden">
        {/* Success header */}
        <div className="flex flex-col items-center py-6 px-5 bg-[hsl(142,71%,97%)] border-b border-[hsl(142,71%,85%)]">
          <CheckCircle2 size={36} className="text-[hsl(142,71%,40%)] mb-2 success-pulse" />
          <p className="text-sm font-bold text-[hsl(142,71%,30%)]">Transaksi Berhasil</p>
          <p className="text-xs text-[hsl(142,71%,40%)] font-mono mt-0.5">{transaction.invoiceNumber}</p>
        </div>

        {/* Details */}
        <div className="p-5 space-y-2.5 text-sm">
          <div className="flex justify-between text-xs">
            <span className="text-[hsl(var(--muted-foreground))]">Tanggal</span>
            <span>{formatDateTime(transaction.createdAt)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[hsl(var(--muted-foreground))]">Total Item</span>
            <span>{transaction.items.length} item</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[hsl(var(--muted-foreground))]">Metode Bayar</span>
            <span className="font-medium">{paymentLabel[transaction.paymentMethod] ?? transaction.paymentMethod}</span>
          </div>
          <div className="border-t border-[hsl(var(--border))] pt-2.5 flex justify-between font-bold text-base">
            <span>Total</span>
            <span className="text-[hsl(var(--primary))]">{formatRupiah(transaction.total)}</span>
          </div>
          {transaction.paymentMethod === 'cash' && transaction.changeAmount > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-[hsl(var(--muted-foreground))]">Kembalian</span>
              <span className="font-bold text-green-600 text-sm">{formatRupiah(transaction.changeAmount)}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex flex-col gap-2">
          <Button
            variant="outline"
            className="w-full gap-2 border-[hsl(var(--primary)/30)] hover:bg-[hsl(var(--primary)/10)]"
            onClick={handlePrint}
            disabled={printing}
            id="print-receipt"
          >
            {printed ? <Check size={15} className="text-green-600" /> : <Printer size={15} />}
            {printing ? 'Mencetak Struk...' : printed ? 'Cetak Ulang Struk' : 'Cetak Struk'}
          </Button>

          <Button
            className="w-full gap-2"
            onClick={onNewTransaction}
            id="new-transaction"
          >
            <RotateCcw size={15} />
            Transaksi Baru
          </Button>
        </div>
      </div>
    </div>
  )
}
