import { getItem, setItem } from './base'
import type { StockMovement } from '@/types/inventory'

export const STOCK_MOVEMENTS_KEY = 'pos_stock_movements'

export function getStockMovements(): StockMovement[] {
  return getItem<StockMovement[]>(STOCK_MOVEMENTS_KEY) ?? []
}

export function saveStockMovements(movements: StockMovement[]): void {
  setItem(STOCK_MOVEMENTS_KEY, movements)
}

export function addStockMovement(movement: StockMovement): void {
  const movements = getStockMovements()
  movements.unshift(movement)
  saveStockMovements(movements)
}

export function getStockMovementsByProduct(productId: string): StockMovement[] {
  return getStockMovements().filter((m) => m.productId === productId)
}
