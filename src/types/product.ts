export interface Category {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  barcode: string
  sku: string
  name: string
  categoryId: string
  purchasePrice: number
  sellingPrice: number
  stock: number
  minimumStock: number
  unit: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type ProductStatus = 'in-stock' | 'low-stock' | 'out-of-stock'

export function getProductStatus(product: Product): ProductStatus {
  if (product.stock === 0) return 'out-of-stock'
  if (product.stock <= product.minimumStock) return 'low-stock'
  return 'in-stock'
}
