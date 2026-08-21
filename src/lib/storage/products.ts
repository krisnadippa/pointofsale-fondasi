import { getItem, setItem } from './base'
import type { Product, Category } from '@/types/product'

export const PRODUCTS_KEY = 'pos_products'
export const CATEGORIES_KEY = 'pos_categories'

// ─── Products ───────────────────────────────────────────────────────────────

export function getProducts(): Product[] {
  return getItem<Product[]>(PRODUCTS_KEY) ?? []
}

export function saveProducts(products: Product[]): void {
  setItem(PRODUCTS_KEY, products)
}

export function getProductById(id: string): Product | undefined {
  return getProducts().find((p) => p.id === id)
}

export function getProductByBarcode(barcode: string): Product | undefined {
  return getProducts().find(
    (p) => p.barcode === barcode && p.isActive
  )
}

export function upsertProduct(product: Product): void {
  const products = getProducts()
  const idx = products.findIndex((p) => p.id === product.id)
  if (idx >= 0) {
    products[idx] = product
  } else {
    products.push(product)
  }
  saveProducts(products)
}

export function deleteProduct(id: string): void {
  const products = getProducts()
  const idx = products.findIndex((p) => p.id === id)
  if (idx >= 0) {
    products[idx] = { ...products[idx], isActive: false, updatedAt: new Date().toISOString() }
    saveProducts(products)
  }
}

export function updateProductStock(id: string, newStock: number): void {
  const products = getProducts()
  const idx = products.findIndex((p) => p.id === id)
  if (idx >= 0) {
    products[idx] = {
      ...products[idx],
      stock: newStock,
      updatedAt: new Date().toISOString(),
    }
    saveProducts(products)
  }
}

// ─── Categories ─────────────────────────────────────────────────────────────

export function getCategories(): Category[] {
  return getItem<Category[]>(CATEGORIES_KEY) ?? []
}

export function saveCategories(categories: Category[]): void {
  setItem(CATEGORIES_KEY, categories)
}

export function upsertCategory(category: Category): void {
  const cats = getCategories()
  const idx = cats.findIndex((c) => c.id === category.id)
  if (idx >= 0) {
    cats[idx] = category
  } else {
    cats.push(category)
  }
  saveCategories(cats)
}

export function deleteCategory(id: string): void {
  const cats = getCategories().filter((c) => c.id !== id)
  saveCategories(cats)
}
