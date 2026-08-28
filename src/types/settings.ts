export interface StoreSettings {
  storeName: string
  storeAddress: string
  storePhone: string
  currency: string
  receiptWidth: '58mm' | '80mm'
  printMethod: 'browser' | 'bluetooth'
  taxRate: number
  defaultDiscount: number
  cashierName: string
}

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Modern POS Store',
  storeAddress: 'Jl. Contoh No. 1, Jakarta',
  storePhone: '021-12345678',
  currency: 'IDR',
  receiptWidth: '58mm',
  printMethod: 'browser',
  taxRate: 0,
  defaultDiscount: 0,
  cashierName: 'Kasir',
}
