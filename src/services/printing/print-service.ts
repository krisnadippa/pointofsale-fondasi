import type { Transaction } from '@/types/transaction'
import { getSettings } from '@/lib/storage/settings'
import { formatRupiah } from '@/lib/formatters/currency'
import { formatDateTime } from '@/lib/formatters/date'

/**
 * Abstract print interface.
 * Replace the implementation here when migrating to thermal/ESC-POS.
 */
export interface PrintService {
  printReceipt(transaction: Transaction): void
}

/**
 * Browser print implementation.
 * Opens a print-friendly window with receipt layout.
 */
class BrowserPrintService implements PrintService {
  printReceipt(transaction: Transaction): void {
    const settings = getSettings()

    const itemsHtml = transaction.items
      .map(
        (item) => `
        <tr>
          <td colspan="2" style="padding-top:6px;font-size:12px;">${item.productName}</td>
        </tr>
        <tr>
          <td style="font-size:12px;color:#666;">${item.quantity} x ${formatRupiah(item.price)}</td>
          <td style="text-align:right;font-size:12px;">${formatRupiah(item.subtotal)}</td>
        </tr>`
      )
      .join('')

    const paymentLabel: Record<string, string> = {
      cash: 'TUNAI',
      qris: 'QRIS',
      debit: 'DEBIT',
      credit: 'KREDIT',
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Receipt ${transaction.invoiceNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Courier New', monospace;
            font-size: 13px;
            width: ${settings.receiptWidth};
            margin: 0 auto;
            padding: 12px 8px;
          }
          .center { text-align: center; }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
          table { width: 100%; border-collapse: collapse; }
          .total-row td { font-weight: bold; padding-top: 4px; }
          .grand-total td { font-size: 15px; font-weight: bold; }
          @media print {
            body { width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="center">
          <div style="font-weight:bold;font-size:15px;">${settings.storeName.toUpperCase()}</div>
          <div style="font-size:11px;">${settings.storeAddress}</div>
          <div style="font-size:11px;">${settings.storePhone}</div>
        </div>
        <div class="divider"></div>
        <div style="font-size:11px;">
          <div>No: ${transaction.invoiceNumber}</div>
          <div>Tgl: ${formatDateTime(transaction.createdAt)}</div>
          <div>Kasir: ${transaction.cashierName}</div>
        </div>
        <div class="divider"></div>
        <table>${itemsHtml}</table>
        <div class="divider"></div>
        <table>
          <tr><td>SUBTOTAL</td><td style="text-align:right;">${formatRupiah(transaction.subtotal)}</td></tr>
          ${transaction.discount > 0 ? `<tr><td>DISKON</td><td style="text-align:right;">-${formatRupiah(transaction.discount)}</td></tr>` : ''}
          ${transaction.tax > 0 ? `<tr><td>PAJAK</td><td style="text-align:right;">${formatRupiah(transaction.tax)}</td></tr>` : ''}
          <tr class="grand-total"><td>TOTAL</td><td style="text-align:right;">${formatRupiah(transaction.total)}</td></tr>
          <tr><td>${paymentLabel[transaction.paymentMethod] ?? 'BAYAR'}</td><td style="text-align:right;">${formatRupiah(transaction.paidAmount)}</td></tr>
          <tr><td>KEMBALI</td><td style="text-align:right;">${formatRupiah(transaction.changeAmount)}</td></tr>
        </table>
        <div class="divider"></div>
        <div class="center" style="font-size:12px;padding-top:4px;">TERIMA KASIH</div>
      </body>
      </html>
    `

    const win = window.open('', '_blank', 'width=400,height=600')
    if (!win) return
    win.document.write(html)
    win.document.close()
    win.focus()
    win.print()
    win.close()
  }
}

// Exported singleton — swap implementation here for thermal printer later
export const printService: PrintService = new BrowserPrintService()

export function printReceipt(transaction: Transaction): void {
  printService.printReceipt(transaction)
}
