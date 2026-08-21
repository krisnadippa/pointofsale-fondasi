import { nanoid } from 'nanoid'
import type { Transaction } from '@/types/transaction'
import type { StockMovement } from '@/types/inventory'
import { addStockMovement } from '@/lib/storage/inventory'
import { getProducts } from '@/lib/storage/products'

export function recordSaleMovements(transaction: Transaction): void {
  const products = getProducts()
  for (const item of transaction.items) {
    const product = products.find((p) => p.id === item.productId)
    if (!product) continue
    const movement: StockMovement = {
      id: nanoid(),
      productId: item.productId,
      productName: item.productName,
      type: 'SALE',
      quantity: -item.quantity,
      previousStock: product.stock + item.quantity,
      newStock: product.stock,
      referenceId: transaction.id,
      notes: `Sale: ${transaction.invoiceNumber}`,
      createdAt: transaction.createdAt,
    }
    addStockMovement(movement)
  }
}

export function recordAdjustment(
  productId: string,
  productName: string,
  previousStock: number,
  newStock: number,
  notes?: string
): void {
  const movement: StockMovement = {
    id: nanoid(),
    productId,
    productName,
    type: 'ADJUSTMENT',
    quantity: newStock - previousStock,
    previousStock,
    newStock,
    notes,
    createdAt: new Date().toISOString(),
  }
  addStockMovement(movement)
}

export function getLowStockProducts() {
  const products = getProducts()
  return products.filter(
    (p) => p.isActive && p.stock <= p.minimumStock
  )
}

export function getOutOfStockProducts() {
  const products = getProducts()
  return products.filter((p) => p.isActive && p.stock === 0)
}
