import type { Transaction } from '@/types/transaction'
import { getSettings } from '@/lib/storage/settings'
import { formatRupiah } from '@/lib/formatters/currency'
import { formatDateTime } from '@/lib/formatters/date'

// Common thermal printer Bluetooth Service & Characteristic UUIDs
const THERMAL_PRINTER_SERVICES = [
  '000018f0-0000-1000-8000-00805f9b34fb', // Standard Printer Service
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // Rongta / RPP
  '49535343-fe7d-4ae5-8fa9-9fafd205e455', // ISSC / Gprinter / POS58
  '0000ffe0-0000-1000-8000-00805f9b34fb', // HMSoft / Feasycom / Chinese POS
  '0000ff00-0000-1000-8000-00805f9b34fb', // Generic POS
  '0000fff0-0000-1000-8000-00805f9b34fb', // Zjiang / Milestone
]

// Minimal Web Bluetooth TypeScript declarations
interface BluetoothCharacteristicProperties {
  write?: boolean
  writeWithoutResponse?: boolean
}

interface BluetoothRemoteGATTCharacteristic {
  properties: BluetoothCharacteristicProperties
  writeValue(value: BufferSource): Promise<void>
  writeValueWithoutResponse?(value: BufferSource): Promise<void>
}

interface BluetoothRemoteGATTService {
  getCharacteristics(): Promise<BluetoothRemoteGATTCharacteristic[]>
}

interface BluetoothRemoteGATTServer {
  connected: boolean
  connect(): Promise<BluetoothRemoteGATTServer>
  disconnect(): void
  getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>
  getPrimaryServices(): Promise<BluetoothRemoteGATTService[]>
}

interface BluetoothDevice extends EventTarget {
  name?: string
  gatt?: BluetoothRemoteGATTServer
}

interface BluetoothDeviceState {
  device: BluetoothDevice | null
  characteristic: BluetoothRemoteGATTCharacteristic | null
  deviceName: string | null
}

const state: BluetoothDeviceState = {
  device: null,
  characteristic: null,
  deviceName: null,
}

export function isBluetoothSupported(): boolean {
  if (typeof window === 'undefined') return false
  return 'bluetooth' in navigator
}

export function getConnectedBluetoothDevice(): string | null {
  if (state.device && state.device.gatt?.connected) {
    return state.deviceName || state.device.name || 'Bluetooth Printer'
  }
  return null
}

export async function connectBluetoothPrinter(): Promise<string> {
  if (!isBluetoothSupported()) {
    throw new Error('Web Bluetooth tidak didukung pada browser ini. Gunakan Google Chrome di Android atau Desktop.')
  }

  try {
    const navBt = (navigator as unknown as { bluetooth: { requestDevice(options: unknown): Promise<BluetoothDevice> } }).bluetooth

    const device = await navBt.requestDevice({
      acceptAllDevices: true,
      optionalServices: THERMAL_PRINTER_SERVICES,
    })

    if (!device.gatt) {
      throw new Error('GATT server tidak ditemukan pada perangkat.')
    }

    const server = await device.gatt.connect()
    
    // Find writable characteristic across known printer services
    let writableChar: BluetoothRemoteGATTCharacteristic | null = null

    for (const serviceUuid of THERMAL_PRINTER_SERVICES) {
      try {
        const service = await server.getPrimaryService(serviceUuid)
        const characteristics = await service.getCharacteristics()
        for (const c of characteristics) {
          if (c.properties.write || c.properties.writeWithoutResponse) {
            writableChar = c
            break
          }
        }
        if (writableChar) break
      } catch {
        // Continue searching next service UUID
      }
    }

    // If still not found, search all available primary services
    if (!writableChar) {
      try {
        const services = await server.getPrimaryServices()
        for (const service of services) {
          try {
            const chars = await service.getCharacteristics()
            for (const c of chars) {
              if (c.properties.write || c.properties.writeWithoutResponse) {
                writableChar = c
                break
              }
            }
            if (writableChar) break
          } catch {
            // Continue
          }
        }
      } catch {
        // Continue
      }
    }

    if (!writableChar) {
      throw new Error('Karakteristik cetak printer tidak ditemukan. Pastikan perangkat adalah printer thermal Bluetooth.')
    }

    state.device = device
    state.characteristic = writableChar
    state.deviceName = device.name || 'Bluetooth POS Printer'

    device.addEventListener('gattserverdisconnected', () => {
      state.device = null
      state.characteristic = null
      state.deviceName = null
    })

    return state.deviceName || 'Bluetooth POS Printer'
  } catch (err: unknown) {
    state.device = null
    state.characteristic = null
    state.deviceName = null
    const errorMsg = err instanceof Error ? err.message : String(err)
    if (errorMsg.includes('User cancelled') || errorMsg.includes('cancelled')) {
      throw new Error('Pencarian Bluetooth dibatalkan.')
    }
    throw new Error(`Gagal terhubung ke Bluetooth: ${errorMsg}`)
  }
}

export async function disconnectBluetoothPrinter(): Promise<void> {
  if (state.device?.gatt?.connected) {
    state.device.gatt.disconnect()
  }
  state.device = null
  state.characteristic = null
  state.deviceName = null
}

// ── ESC/POS Binary Helper ──
class EscPosBuilder {
  private buffer: number[] = []

  init(): this {
    this.buffer.push(0x1b, 0x40) // ESC @ (Initialize)
    this.buffer.push(0x1b, 0x74, 0x00) // ESC t 0 (Code page: PC437 / Standard)
    return this
  }

  alignLeft(): this {
    this.buffer.push(0x1b, 0x61, 0x00) // ESC a 0
    return this
  }

  alignCenter(): this {
    this.buffer.push(0x1b, 0x61, 0x01) // ESC a 1
    return this
  }

  alignRight(): this {
    this.buffer.push(0x1b, 0x61, 0x02) // ESC a 2
    return this
  }

  bold(enable = true): this {
    this.buffer.push(0x1b, 0x45, enable ? 0x01 : 0x00) // ESC E n
    return this
  }

  doubleSize(enable = true): this {
    this.buffer.push(0x1b, 0x21, enable ? 0x30 : 0x00) // ESC ! n
    return this
  }

  text(str: string): this {
    // Convert string to bytes
    const encoder = new TextEncoder()
    const bytes = encoder.encode(str)
    for (let i = 0; i < bytes.length; i++) {
      this.buffer.push(bytes[i])
    }
    return this
  }

  newLine(count = 1): this {
    for (let i = 0; i < count; i++) {
      this.buffer.push(0x0d, 0x0a) // CR + LF to flush thermal line buffer
    }
    return this
  }

  line(char = '-', maxLen = 32): this {
    this.alignLeft()
    this.text(char.repeat(maxLen))
    this.newLine()
    return this
  }

  row(left: string, right: string, maxLen = 32): this {
    this.alignLeft()
    const leftLen = left.length
    const rightLen = right.length
    const spaces = Math.max(1, maxLen - leftLen - rightLen)
    const line = left + ' '.repeat(spaces) + right
    this.text(line.slice(0, maxLen))
    this.newLine()
    return this
  }

  feedAndCut(): this {
    this.newLine(4)
    this.buffer.push(0x1d, 0x56, 0x42, 0x00) // GS V 66 0 (Cut paper if supported)
    return this
  }

  getBuffer(): Uint8Array {
    return new Uint8Array(this.buffer)
  }
}

function buildEscPosReceipt(transaction: Transaction): Uint8Array {
  const settings = getSettings()
  const is58 = settings.receiptWidth === '58mm'
  const maxChars = is58 ? 32 : 48

  const paymentLabel: Record<string, string> = {
    cash: 'TUNAI',
    qris: 'QRIS',
    debit: 'DEBIT',
    credit: 'KREDIT',
  }

  const esc = new EscPosBuilder()
  esc.init()

  // Header
  esc.alignCenter()
  esc.bold(true)
  esc.text('FONDASI CREATIVE').newLine()
  esc.bold(false)
  esc.text(settings.storeName.toUpperCase()).newLine()
  if (settings.storeAddress) {
    esc.text(settings.storeAddress).newLine()
  }
  if (settings.storePhone) {
    esc.text(`Telp: ${settings.storePhone}`).newLine()
  }

  esc.line('-', maxChars)

  // Meta info
  esc.row('No: ' + transaction.invoiceNumber, '', maxChars)
  esc.row('Tgl:', formatDateTime(transaction.createdAt), maxChars)
  esc.row('Kasir:', transaction.cashierName, maxChars)

  esc.line('-', maxChars)

  // Items
  for (const item of transaction.items) {
    esc.bold(true)
    esc.alignLeft().text(item.productName).newLine()
    esc.bold(false)
    const qtyPrice = `${item.quantity} x ${formatRupiah(item.price)}`
    const subtotal = formatRupiah(item.subtotal)
    esc.row(qtyPrice, subtotal, maxChars)
  }

  esc.line('-', maxChars)

  // Calculation & Totals
  esc.row('Subtotal', formatRupiah(transaction.subtotal), maxChars)
  if (transaction.discount > 0) {
    esc.row('Diskon', `-${formatRupiah(transaction.discount)}`, maxChars)
  }
  if (transaction.tax > 0) {
    esc.row('Pajak', formatRupiah(transaction.tax), maxChars)
  }

  esc.line('=', maxChars)
  esc.bold(true)
  esc.row('TOTAL', formatRupiah(transaction.total), maxChars)
  esc.bold(false)
  esc.line('=', maxChars)

  esc.row(`Bayar (${paymentLabel[transaction.paymentMethod] ?? 'TUNAI'})`, formatRupiah(transaction.paidAmount), maxChars)
  esc.bold(true)
  esc.row('Kembali', formatRupiah(transaction.changeAmount), maxChars)
  esc.bold(false)

  esc.line('-', maxChars)

  // Footer
  esc.alignCenter()
  esc.bold(true)
  esc.text('TERIMA KASIH').newLine()
  esc.bold(false)
  esc.text('Barang yang dibeli tidak dapat ditukar').newLine()

  esc.feedAndCut()

  return esc.getBuffer()
}

async function sendBytesToCharacteristic(char: BluetoothRemoteGATTCharacteristic, data: Uint8Array): Promise<void> {
  const CHUNK_SIZE = 100 // Safe BLE chunk size for thermal printers
  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    const chunk = data.slice(i, i + CHUNK_SIZE)
    if (char.properties.writeWithoutResponse && char.writeValueWithoutResponse) {
      await char.writeValueWithoutResponse(chunk)
    } else {
      await char.writeValue(chunk)
    }
    // Small delay between Bluetooth BLE chunks
    await new Promise((r) => setTimeout(r, 25))
  }
}

export async function printDirectBluetoothReceipt(transaction: Transaction): Promise<void> {
  if (!state.characteristic || !state.device?.gatt?.connected) {
    // If not currently connected, trigger connection dialog
    await connectBluetoothPrinter()
  }

  if (!state.characteristic) {
    throw new Error('Printer Bluetooth belum terhubung.')
  }

  const bytes = buildEscPosReceipt(transaction)
  await sendBytesToCharacteristic(state.characteristic, bytes)
}

export async function printDirectBluetoothTest(): Promise<void> {
  const dummy: Transaction = {
    id: 'test-bt-' + Date.now(),
    invoiceNumber: 'INV-TEST-BT',
    items: [
      {
        id: '1',
        productId: '1',
        productName: 'Kopi Susu Gula Aren (Bluetooth Test)',
        barcode: '899001',
        price: 18000,
        quantity: 1,
        subtotal: 18000,
      },
    ],
    subtotal: 18000,
    discount: 0,
    tax: 0,
    total: 18000,
    paymentMethod: 'cash',
    paidAmount: 20000,
    changeAmount: 2000,
    status: 'completed',
    createdAt: new Date().toISOString(),
    cashierName: getSettings().cashierName || 'Kasir',
  }

  await printDirectBluetoothReceipt(dummy)
}
