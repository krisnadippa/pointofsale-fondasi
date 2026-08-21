export type PaymentMethod = 'cash' | 'qris' | 'debit' | 'credit'

export interface CartItem {
  productId: string
  productName: string
  barcode: string
  price: number
  quantity: number
  subtotal: number
}

export interface TransactionItem {
  id: string
  productId: string
  productName: string
  barcode: string
  price: number
  quantity: number
  subtotal: number
}

export interface Transaction {
  id: string
  invoiceNumber: string
  cashierName: string
  items: TransactionItem[]
  subtotal: number
  discount: number
  tax: number
  total: number
  paymentMethod: PaymentMethod
  paidAmount: number
  changeAmount: number
  status: 'completed' | 'voided'
  createdAt: string
}
