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
      <tr>
        <td colspan="2" style="padding-top:4px;font-size:${is58 ? '11px' : '12px'};font-weight:600;word-break:break-word;">${item.productName}</td>
      </tr>
      <tr>
        <td style="font-size:${is58 ? '10px' : '11px'};color:#333;">${item.quantity} x ${formatRupiah(item.price)}</td>
        <td style="text-align:right;font-size:${is58 ? '10px' : '11px'};font-weight:500;">${formatRupiah(item.subtotal)}</td>
      </tr>`
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
    <html>
    <head>
      <meta charset="utf-8">
      <title>Receipt ${transaction.invoiceNumber}</title>
      <style>
        @page {
          margin: 0;
          size: ${is58 ? '58mm auto' : '80mm auto'};
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        body {
          font-family: 'Courier New', Courier, monospace, sans-serif;
          font-size: ${is58 ? '11px' : '12px'};
          line-height: 1.3;
          color: #000;
          width: ${is58 ? '48mm' : '72mm'};
          margin: 0 auto;
          padding: 8px 4px;
          background: #fff;
        }
        .center { text-align: center; }
        .right { text-align: right; }
        .bold { font-weight: bold; }
        .divider {
          border-top: 1px dashed #000;
          margin: 6px 0;
          width: 100%;
        }
        .divider-double {
          border-top: 1px double #000;
          margin: 6px 0;
          width: 100%;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        td {
          padding: 1px 0;
          vertical-align: top;
        }
        .totals td {
          font-size: ${is58 ? '11px' : '12px'};
          padding: 2px 0;
        }
        .grand-total td {
          font-size: ${is58 ? '13px' : '14px'};
          font-weight: bold;
          padding: 4px 0;
        }
        @media print {
          body {
            width: 100%;
            padding: 4px 2px;
          }
        }
      </style>
    </head>
    <body>
      <div class="center" style="margin-bottom: 6px;">
        <img src="/images/fondasi1.png" alt="Fondasi Creative Logo" style="height: 32px; object-fit: contain; margin-bottom: 3px; display: block; margin-left: auto; margin-right: auto;" onerror="this.style.display='none'" />
        <div style="font-weight:bold;font-size:${is58 ? '13px' : '15px'};letter-spacing: 0.5px;">FONDASI CREATIVE</div>
        <div style="font-weight:bold;font-size:${is58 ? '11px' : '12px'};color:#111;">${settings.storeName.toUpperCase()}</div>
        <div style="font-size:${is58 ? '10px' : '11px'};">${settings.storeAddress}</div>
        <div style="font-size:${is58 ? '10px' : '11px'};">Telp: ${settings.storePhone}</div>
      </div>

      <div class="divider"></div>

      <div style="font-size:${is58 ? '10px' : '11px'};">
        <div style="display:flex;justify-content:space-between;"><span>No:</span><span class="bold">${transaction.invoiceNumber}</span></div>
        <div style="display:flex;justify-content:space-between;"><span>Tgl:</span><span>${formatDateTime(transaction.createdAt)}</span></div>
        <div style="display:flex;justify-content:space-between;"><span>Kasir:</span><span>${transaction.cashierName}</span></div>
      </div>

      <div class="divider"></div>

      <table>${itemsHtml}</table>

      <div class="divider"></div>

      <table class="totals">
        <tr><td>SUBTOTAL</td><td class="right">${formatRupiah(transaction.subtotal)}</td></tr>
        ${transaction.discount > 0 ? `<tr><td>DISKON</td><td class="right">-${formatRupiah(transaction.discount)}</td></tr>` : ''}
        ${transaction.tax > 0 ? `<tr><td>PAJAK</td><td class="right">${formatRupiah(transaction.tax)}</td></tr>` : ''}
        <tr class="grand-total"><td>TOTAL</td><td class="right">${formatRupiah(transaction.total)}</td></tr>
        <tr><td>${paymentLabel[transaction.paymentMethod] ?? 'BAYAR'}</td><td class="right">${formatRupiah(transaction.paidAmount)}</td></tr>
        <tr><td>KEMBALI</td><td class="right">${formatRupiah(transaction.changeAmount)}</td></tr>
      </table>

      <div class="divider-double"></div>

      <div class="center" style="font-size:${is58 ? '10px' : '11px'};padding-top:2px;">
        <div class="bold">TERIMA KASIH</div>
        <div>Barang yang sudah dibeli tidak dapat ditukar/dikembalikan</div>
      </div>
    </body>
    </html>
  `
}

function executePrint(html: string): void {
  // Use hidden iframe to avoid popup blockers and handle print cleanly
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

    // Wait for images to load before printing
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
    }, 250)
  }
}

class BrowserPrintService implements PrintService {
  printReceipt(transaction: Transaction): void {
    const html = buildReceiptHtml(transaction)
    executePrint(html)
  }

  printTestReceipt(): void {
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

    this.printReceipt(dummyTransaction)
  }
}

export const printService: PrintService = new BrowserPrintService()

export function printReceipt(transaction: Transaction): void {
  printService.printReceipt(transaction)
}

export function printTestReceipt(): void {
  printService.printTestReceipt()
}

