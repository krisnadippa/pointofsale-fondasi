export type StockMovementType = 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'RETURN'

export interface StockMovement {
  id: string
  productId: string
  productName: string
  type: StockMovementType
  quantity: number
  previousStock: number
  newStock: number
  referenceId?: string
  notes?: string
  createdAt: string
}
