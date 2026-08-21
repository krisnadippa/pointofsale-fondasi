import { nanoid } from 'nanoid'
import type { CartItem, Transaction } from '@/types/transaction'
import { addTransaction, generateInvoiceNumber } from '@/lib/storage/transactions'
import { deductStock } from './product-service'
import { recordSaleMovements } from './inventory-service'
import { getSettings } from '@/lib/storage/settings'

export interface CheckoutInput {
  items: CartItem[]
  discount: number
  paymentMethod: Transaction['paymentMethod']
  paidAmount: number
}

export interface CheckoutResult {
  transaction: Transaction
  change: number
}

export function calculateTotals(items: CartItem[], discount = 0) {
  const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0)
  const settings = getSettings()
  const tax = Math.round(subtotal * (settings.taxRate / 100))
  const total = Math.max(0, subtotal - discount + tax)
  return { subtotal, tax, total }
}

export function processCheckout(input: CheckoutInput): CheckoutResult {
  const { items, discount, paymentMethod, paidAmount } = input
  const { subtotal, tax, total } = calculateTotals(items, discount)

  if (paymentMethod === 'cash' && paidAmount < total) {
    throw new Error('INSUFFICIENT_PAYMENT')
  }

  const change = paymentMethod === 'cash' ? paidAmount - total : 0
  const settings = getSettings()
  const invoiceNumber = generateInvoiceNumber()

  const transactionItems = items.map((item) => ({
    id: nanoid(),
    productId: item.productId,
    productName: item.productName,
    barcode: item.barcode,
    price: item.price,
    quantity: item.quantity,
    subtotal: item.subtotal,
  }))

  const transaction: Transaction = {
    id: nanoid(),
    invoiceNumber,
    cashierName: settings.cashierName,
    items: transactionItems,
    subtotal,
    discount,
    tax,
    total,
    paymentMethod,
    paidAmount,
    changeAmount: change,
    status: 'completed',
    createdAt: new Date().toISOString(),
  }

  // Persist transaction
  addTransaction(transaction)

  // Deduct stock and record movements
  for (const item of items) {
    deductStock(item.productId, item.quantity)
  }
  recordSaleMovements(transaction)

  return { transaction, change }
}
