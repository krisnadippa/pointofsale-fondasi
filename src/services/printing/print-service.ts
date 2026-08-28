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
      <tr>
        <td colspan="2" style="padding-top: 5px; font-size: ${is58 ? '11px' : '12px'}; font-weight: bold; word-break: break-word; text-align: left;">
          ${item.productName}
        </td>
      </tr>
      <tr>
        <td style="font-size: ${is58 ? '10px' : '11px'}; color: #222; text-align: left; padding-bottom: 4px;">
          ${item.quantity} x ${formatRupiah(item.price)}
        </td>
        <td style="text-align: right; font-size: ${is58 ? '10px' : '11px'}; font-weight: 600; padding-bottom: 4px;">
          ${formatRupiah(item.subtotal)}
        </td>
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
    <html lang="id">
    <head>
      <meta charset="utf-8">
      <title>Struk ${transaction.invoiceNumber}</title>
      <style>
        @page {
          margin: 0;
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
          background: #fff;
          color: #000;
          font-family: 'Courier New', Courier, monospace;
          font-size: ${is58 ? '11px' : '12px'};
          line-height: 1.35;
        }
        .receipt-wrapper {
          width: 100%;
          max-width: ${is58 ? '48mm' : '72mm'};
          margin: 0 auto;
          padding: 6px 2px 24px 2px;
          text-align: center;
        }
        .center {
          text-align: center !important;
          margin-left: auto;
          margin-right: auto;
        }
        .left {
          text-align: left !important;
        }
        .right {
          text-align: right !important;
        }
        .bold {
          font-weight: bold;
        }
        .logo-img {
          display: block;
          margin: 0 auto 5px auto;
          max-width: ${is58 ? '120px' : '150px'};
          max-height: 44px;
          object-fit: contain;
        }
        .brand-title {
          font-size: ${is58 ? '13px' : '15px'};
          font-weight: bold;
          letter-spacing: 0.5px;
          text-align: center;
          margin-bottom: 2px;
        }
        .store-title {
          font-size: ${is58 ? '11px' : '13px'};
          font-weight: bold;
          text-align: center;
          margin-bottom: 2px;
          text-transform: uppercase;
        }
        .store-sub {
          font-size: ${is58 ? '9.5px' : '11px'};
          text-align: center;
          line-height: 1.3;
          color: #222;
        }
        .divider {
          border-top: 1px dashed #000;
          margin: 6px 0;
          width: 100%;
        }
        .divider-double {
          border-top: 2px solid #000;
          margin: 6px 0;
          width: 100%;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        td {
          vertical-align: top;
          padding: 1.5px 0;
        }
        .meta-table td {
          font-size: ${is58 ? '10px' : '11px'};
          padding: 1px 0;
        }
        .calc-table td {
          font-size: ${is58 ? '10.5px' : '12px'};
          padding: 2px 0;
        }
        .calc-table .total-row td {
          font-size: ${is58 ? '13px' : '15px'};
          font-weight: bold;
          padding: 4px 0;
        }
        .footer-note {
          text-align: center;
          font-size: ${is58 ? '9.5px' : '10.5px'};
          line-height: 1.35;
          margin-top: 4px;
        }
        @media print {
          html, body {
            width: 100%;
            margin: 0;
            padding: 0;
          }
          .receipt-wrapper {
            width: 100% !important;
            max-width: 100% !important;
            padding: 4px 2px 20px 2px;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt-wrapper">
        <!-- Logo & Header -->
        <div class="center" style="margin-bottom: 6px;">
          <img src="${logoUrl}" alt="Logo" class="logo-img" onerror="this.style.display='none'" />
          <div class="brand-title">FONDASI CREATIVE</div>
          <div class="store-title">${settings.storeName}</div>
          <div class="store-sub">${settings.storeAddress}</div>
          <div class="store-sub">Telp/WA: ${settings.storePhone}</div>
        </div>

        <div class="divider"></div>

        <!-- Meta Info -->
        <table class="meta-table">
          <tr>
            <td class="left">No. Struk</td>
            <td class="right bold">${transaction.invoiceNumber}</td>
          </tr>
          <tr>
            <td class="left">Tanggal</td>
            <td class="right">${formatDateTime(transaction.createdAt)}</td>
          </tr>
          <tr>
            <td class="left">Kasir</td>
            <td class="right">${transaction.cashierName}</td>
          </tr>
        </table>

        <div class="divider"></div>

        <!-- Items -->
        <table>
          ${itemsHtml}
        </table>

        <div class="divider"></div>

        <!-- Totals & Payment -->
        <table class="calc-table">
          <tr>
            <td class="left">Subtotal</td>
            <td class="right">${formatRupiah(transaction.subtotal)}</td>
          </tr>
          ${
            transaction.discount > 0
              ? `<tr>
                  <td class="left">Diskon</td>
                  <td class="right">-${formatRupiah(transaction.discount)}</td>
                </tr>`
              : ''
          }
          ${
            transaction.tax > 0
              ? `<tr>
                  <td class="left">Pajak</td>
                  <td class="right">${formatRupiah(transaction.tax)}</td>
                </tr>`
              : ''
          }
          <tr class="total-row">
            <td class="left" style="border-top: 1px dashed #000; border-bottom: 1px dashed #000;">TOTAL</td>
            <td class="right" style="border-top: 1px dashed #000; border-bottom: 1px dashed #000;">${formatRupiah(transaction.total)}</td>
          </tr>
          <tr>
            <td class="left" style="padding-top: 4px;">Bayar (${paymentLabel[transaction.paymentMethod] ?? 'TUNAI'})</td>
            <td class="right" style="padding-top: 4px;">${formatRupiah(transaction.paidAmount)}</td>
          </tr>
          <tr>
            <td class="left">Kembali</td>
            <td class="right bold">${formatRupiah(transaction.changeAmount)}</td>
          </tr>
        </table>

        <div class="divider"></div>

        <!-- Footer -->
        <div class="footer-note">
          <div class="bold" style="margin-bottom: 2px;">TERIMA KASIH</div>
          <div style="font-size: ${is58 ? '9px' : '10px'}; color: #333;">
            Barang yang sudah dibeli tidak dapat ditukar atau dikembalikan
          </div>
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

