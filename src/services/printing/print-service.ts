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
  const logoUrl = typeof window !== 'undefined' ? `${window.location.origin}/images/fondasi1.png` : '/images/fondasi1.png'

  const itemsHtml = transaction.items
    .map(
      (item) => `
      <div style="padding-top: 2px; padding-bottom: 2px; border-bottom: 1px dotted #ccc;">
        <div style="font-size: ${is58 ? '8.5px' : '10.5px'}; font-weight: bold; word-break: break-word; text-align: left; line-height: 1.15;">
          ${item.productName}
        </div>
        <div style="display: flex; justify-content: space-between; font-size: ${is58 ? '8px' : '9.5px'}; line-height: 1.2;">
          <span>${item.quantity} x ${formatRupiah(item.price)}</span>
          <span style="font-weight: bold;">${formatRupiah(item.subtotal)}</span>
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
          margin: 0 !important;
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
          width: 100%;
          height: auto !important;
          min-height: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          background: #fff;
          color: #000;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          font-size: ${is58 ? '8.5px' : '10.5px'};
          line-height: 1.2;
        }
        .receipt-wrapper {
          width: ${is58 ? '38mm' : '68mm'};
          max-width: ${is58 ? '38mm' : '68mm'};
          margin: 0 auto;
          padding: 0 0 1mm 0;
          text-align: center;
          box-sizing: border-box;
        }
        .center {
          text-align: center !important;
        }
        .left {
          text-align: left !important;
        }
        .right {
          text-align: right !important;
          white-space: nowrap;
        }
        .bold {
          font-weight: bold;
        }
        .logo-img {
          display: block;
          margin: 0 auto 2px auto;
          max-width: ${is58 ? '65px' : '100px'};
          max-height: 24px;
          object-fit: contain;
          filter: grayscale(100%) contrast(180%);
        }
        .brand-title {
          font-size: ${is58 ? '9.5px' : '12px'};
          font-weight: 900;
          letter-spacing: 0.3px;
          text-align: center;
          margin-bottom: 1px;
        }
        .store-title {
          font-size: ${is58 ? '9px' : '11px'};
          font-weight: bold;
          text-align: center;
          margin-bottom: 1px;
          text-transform: uppercase;
        }
        .store-sub {
          font-size: ${is58 ? '7.5px' : '9px'};
          text-align: center;
          line-height: 1.15;
          color: #222;
        }
        .divider {
          border-top: 1px dashed #000;
          margin: 3px 0;
          width: 100%;
        }
        .row-flex {
          display: flex;
          justify-content: space-between;
          font-size: ${is58 ? '8px' : '9.5px'};
          line-height: 1.25;
          padding: 0.5px 0;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          font-size: ${is58 ? '10px' : '12px'};
          font-weight: 900;
          padding: 2px 0;
          border-top: 1px dashed #000;
          border-bottom: 1px dashed #000;
          margin: 2px 0;
        }
        .footer-note {
          text-align: center;
          font-size: ${is58 ? '7.5px' : '8.5px'};
          line-height: 1.15;
          margin-top: 2px;
          padding-bottom: 2px;
        }
        @media print {
          html, body {
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .receipt-wrapper {
            width: ${is58 ? '38mm' : '68mm'} !important;
            max-width: ${is58 ? '38mm' : '68mm'} !important;
            margin: 0 auto !important;
            padding: 0 !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt-wrapper">
        <!-- Logo & Header -->
        <div class="center" style="margin-bottom: 2px;">
          <img src="${logoUrl}" alt="Logo" class="logo-img" onerror="this.style.display='none'" />
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
        <div class="total-row"><span>TOTAL</span><span>${formatRupiah(transaction.total)}</span></div>
        <div class="row-flex"><span>Bayar (${paymentLabel[transaction.paymentMethod] ?? 'TUNAI'})</span><span>${formatRupiah(transaction.paidAmount)}</span></div>
        <div class="row-flex"><span class="bold">Kembali</span><span class="bold">${formatRupiah(transaction.changeAmount)}</span></div>

        <div class="divider"></div>

        <!-- Footer -->
        <div class="footer-note">
          <div class="bold">TERIMA KASIH</div>
          <div style="color: #333;">Barang yang dibeli tidak dapat ditukar</div>
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

