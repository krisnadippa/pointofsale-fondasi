import type { Transaction } from '@/types/transaction'
import { getSettings } from '@/lib/storage/settings'
import { formatRupiah } from '@/lib/formatters/currency'
import { formatDateTime } from '@/lib/formatters/date'

export interface PrintService {
  printReceipt(transaction: Transaction): void
  printTestReceipt(): void
}

function buildReceiptHtml(transaction: Transaction): string {
  const settings = getSettings()
  const is58 = settings.receiptWidth === '58mm'

  const itemsHtml = transaction.items
    .map(
      (item) => `
      <div style="padding: 1.5px 0; border-bottom: 1px dotted #888;">
        <div style="font-size: ${is58 ? '10.5px' : '12px'}; font-weight: bold; word-break: break-word; text-align: left; line-height: 1.2;">
          ${item.productName}
        </div>
        <div style="display: flex; justify-content: space-between; font-size: ${is58 ? '10px' : '11px'}; line-height: 1.2; margin-top: 1px;">
          <span>${item.quantity} x ${formatRupiah(item.price)}</span>
          <span style="font-weight: bold; white-space: nowrap;">${formatRupiah(item.subtotal)}</span>
        </div>
      </div>`
    )
    .join('')

  const paymentLabel: Record<string, string> = {
    cash: 'TUNAI',
    qris: 'QRIS',
    debit: 'DEBIT',
    credit: 'KREDIT',
  }

  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="utf-8">
      <title>Struk ${transaction.invoiceNumber}</title>
      <style>
        @page {
          margin: 0mm !important;
          size: auto;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        html, body {
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          background: #fff;
          color: #000;
          font-family: 'Courier New', Courier, 'Lucida Console', Monaco, monospace;
          font-size: ${is58 ? '10px' : '11.5px'};
          line-height: 1.25;
          -webkit-font-smoothing: none;
          text-rendering: geometricPrecision;
        }
        .receipt-wrapper {
          width: ${is58 ? '44mm' : '72mm'};
          max-width: ${is58 ? '44mm' : '72mm'};
          margin: 0 !important;
          padding: 0 1mm 1mm 0 !important;
          text-align: left;
          box-sizing: border-box;
        }
        .center {
          text-align: center !important;
        }
        .bold {
          font-weight: bold;
        }
        .header-box {
          text-align: center;
          margin-bottom: 2px;
        }
        .brand-title {
          font-size: ${is58 ? '13px' : '15px'};
          font-weight: 900;
          letter-spacing: 0.5px;
          text-align: center;
          margin-bottom: 1px;
        }
        .store-title {
          font-size: ${is58 ? '11px' : '13px'};
          font-weight: bold;
          text-align: center;
          margin-bottom: 1px;
          text-transform: uppercase;
        }
        .store-sub {
          font-size: ${is58 ? '9px' : '10.5px'};
          text-align: center;
          line-height: 1.2;
          color: #000;
        }
        .divider {
          border-top: 1px dashed #000;
          margin: 3px 0;
          width: 100%;
        }
        .row-flex {
          display: flex;
          justify-content: space-between;
          font-size: ${is58 ? '9.5px' : '11px'};
          line-height: 1.25;
          padding: 1px 0;
        }
        .total-box {
          border-top: 1px dashed #000;
          border-bottom: 1px dashed #000;
          padding: 2px 0;
          margin: 3px 0;
        }
        .total-box .row-flex {
          font-size: ${is58 ? '12px' : '14px'} !important;
          font-weight: 900 !important;
        }
        .footer-note {
          text-align: center;
          font-size: ${is58 ? '8.5px' : '9.5px'};
          line-height: 1.2;
          margin-top: 3px;
          padding-bottom: 2px;
        }
        @media print {
          html, body {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-font-smoothing: none;
          }
          .receipt-wrapper {
            width: ${is58 ? '44mm' : '72mm'} !important;
            max-width: ${is58 ? '44mm' : '72mm'} !important;
            margin-left: 0 !important;
            margin-right: auto !important;
            padding: 0 !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt-wrapper">
        <!-- Brand & Store Header -->
        <div class="header-box">
          <div class="brand-title">FONDASI CREATIVE</div>
          <div class="store-title">${settings.storeName}</div>
          <div class="store-sub">${settings.storeAddress}</div>
          <div class="store-sub">Telp: ${settings.storePhone}</div>
        </div>

        <div class="divider"></div>

        <!-- Meta Info -->
        <div class="row-flex"><span>No:</span><span class="bold">${transaction.invoiceNumber}</span></div>
        <div class="row-flex"><span>Tgl:</span><span>${formatDateTime(transaction.createdAt)}</span></div>
        <div class="row-flex"><span>Kasir:</span><span>${transaction.cashierName}</span></div>

        <div class="divider"></div>

        <!-- Items -->
        <div>
          ${itemsHtml}
        </div>

        <div class="divider"></div>

        <!-- Totals & Payment -->
        <div class="row-flex"><span>Subtotal</span><span>${formatRupiah(transaction.subtotal)}</span></div>
        ${transaction.discount > 0 ? `<div class="row-flex"><span>Diskon</span><span>-${formatRupiah(transaction.discount)}</span></div>` : ''}
        ${transaction.tax > 0 ? `<div class="row-flex"><span>Pajak</span><span>${formatRupiah(transaction.tax)}</span></div>` : ''}

        <div class="total-box">
          <div class="row-flex"><span>TOTAL</span><span>${formatRupiah(transaction.total)}</span></div>
        </div>

        <div class="row-flex"><span>Bayar (${paymentLabel[transaction.paymentMethod] ?? 'TUNAI'})</span><span>${formatRupiah(transaction.paidAmount)}</span></div>
        <div class="row-flex"><span class="bold">Kembali</span><span class="bold">${formatRupiah(transaction.changeAmount)}</span></div>

        <div class="divider"></div>

        <!-- Footer -->
        <div class="footer-note">
          <div class="bold">TERIMA KASIH</div>
          <div style="color: #000; margin-top: 1px;">Barang yang dibeli tidak dapat ditukar</div>
        </div>
      </div>
    </body>
    </html>
  `
}

function executePrint(html: string): void {
  let iframe = document.getElementById('pos-receipt-iframe') as HTMLIFrameElement | null
  if (!iframe) {
    iframe = document.createElement('iframe')
    iframe.id = 'pos-receipt-iframe'
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = 'none'
    document.body.appendChild(iframe)
  }

  const doc = iframe.contentWindow?.document
  if (doc) {
    doc.open()
    doc.write(html)
    doc.close()

    iframe.contentWindow?.focus()
    setTimeout(() => {
      try {
        iframe?.contentWindow?.print()
      } catch (err) {
        console.error('Iframe print error, falling back to window.open:', err)
        const fallbackWin = window.open('', '_blank', 'width=400,height=600')
        if (fallbackWin) {
          fallbackWin.document.write(html)
          fallbackWin.document.close()
          fallbackWin.focus()
          setTimeout(() => fallbackWin.print(), 250)
        }
      }
    }, 300)
  }
}

import { printDirectBluetoothReceipt, printDirectBluetoothTest } from './bluetooth-print-service'

class HybridPrintService implements PrintService {
  async printReceipt(transaction: Transaction): Promise<void> {
    const settings = getSettings()
    if (settings.printMethod === 'bluetooth') {
      try {
        await printDirectBluetoothReceipt(transaction)
        return
      } catch (err: unknown) {
        console.warn('Bluetooth print failed, falling back to browser print:', err)
      }
    }
    const html = buildReceiptHtml(transaction)
    executePrint(html)
  }

  async printTestReceipt(): Promise<void> {
    const settings = getSettings()
    if (settings.printMethod === 'bluetooth') {
      try {
        await printDirectBluetoothTest()
        return
      } catch (err: unknown) {
        console.warn('Bluetooth test print failed, falling back to browser print:', err)
      }
    }

    const dummyTransaction: Transaction = {
      id: 'test-print-' + Date.now(),
      invoiceNumber: 'INV-TEST-' + Math.floor(1000 + Math.random() * 9000),
      items: [
        {
          id: 'item-1',
          productId: 'prod-1',
          productName: 'Kopi Susu Gula Aren (Test)',
          barcode: '899001',
          price: 18000,
          quantity: 2,
          subtotal: 36000,
        },
        {
          id: 'item-2',
          productId: 'prod-2',
          productName: 'Roti Bakar Coklat (Test)',
          barcode: '899002',
          price: 15000,
          quantity: 1,
          subtotal: 15000,
        },
      ],
      subtotal: 51000,
      discount: 0,
      tax: 0,
      total: 51000,
      paymentMethod: 'cash',
      paidAmount: 100000,
      changeAmount: 49000,
      status: 'completed',
      createdAt: new Date().toISOString(),
      cashierName: getSettings().cashierName || 'Kasir',
    }

    const html = buildReceiptHtml(dummyTransaction)
    executePrint(html)
  }
}

export const printService: PrintService = new HybridPrintService()

export function printReceipt(transaction: Transaction): void {
  printService.printReceipt(transaction)
}

export function printTestReceipt(): void {
  printService.printTestReceipt()
}

