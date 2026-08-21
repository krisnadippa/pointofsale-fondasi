import { nanoid } from 'nanoid'
import type { Product, Category } from '@/types/product'
import {
  getProducts,
  getCategories,
  upsertProduct,
  upsertCategory,
  deleteProduct as storageDeleteProduct,
  deleteCategory,
  getProductByBarcode as storageGetByBarcode,
  updateProductStock,
} from '@/lib/storage/products'
import { SEED_PRODUCTS, SEED_CATEGORIES } from '@/data/seed'
import { saveCategories, saveProducts } from '@/lib/storage/products'
import { getItem, setItem } from '@/lib/storage/base'

const SEEDED_KEY = 'pos_seeded'

// ─── Seeding ─────────────────────────────────────────────────────────────────

export function ensureSeedData(): void {
  const seeded = getItem<boolean>(SEEDED_KEY)
  if (seeded) return
  saveCategories(SEED_CATEGORIES)
  saveProducts(SEED_PRODUCTS)
  setItem(SEEDED_KEY, true)
}

export function resetData(): void {
  saveCategories(SEED_CATEGORIES)
  saveProducts(SEED_PRODUCTS)
  setItem(SEEDED_KEY, true)
}

// ─── Products ─────────────────────────────────────────────────────────────────

export function getAllProducts(): Product[] {
  return getProducts()
}

export function getActiveProducts(): Product[] {
  return getProducts().filter((p) => p.isActive)
}

export function searchProducts(query: string, categoryId?: string): Product[] {
  const q = query.toLowerCase().trim()
  return getActiveProducts().filter((p) => {
    const matchesQuery =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.barcode.includes(q) ||
      p.sku.toLowerCase().includes(q)
    const matchesCategory = !categoryId || p.categoryId === categoryId
    return matchesQuery && matchesCategory
  })
}

export function findByBarcode(barcode: string): Product | undefined {
  return storageGetByBarcode(barcode)
}

export function createProduct(
  data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>
): Product {
  const product: Product = {
    ...data,
    id: `prod-${nanoid(8)}`,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  upsertProduct(product)
  return product
}

export function updateProduct(id: string, data: Partial<Product>): Product | null {
  const products = getProducts()
  const existing = products.find((p) => p.id === id)
  if (!existing) return null
  const updated: Product = {
    ...existing,
    ...data,
    id,
    updatedAt: new Date().toISOString(),
  }
  upsertProduct(updated)
  return updated
}

export function softDeleteProduct(id: string): void {
  storageDeleteProduct(id)
}

export function deductStock(productId: string, quantity: number): void {
  const products = getProducts()
  const p = products.find((x) => x.id === productId)
  if (!p) return
  const newStock = Math.max(0, p.stock - quantity)
  updateProductStock(productId, newStock)
}

export function adjustStock(productId: string, newStock: number): void {
  updateProductStock(productId, newStock)
}

// ─── Categories ───────────────────────────────────────────────────────────────

export function getAllCategories(): Category[] {
  return getCategories()
}

export function createCategory(name: string, description?: string): Category {
  const cat: Category = {
    id: `cat-${nanoid(8)}`,
    name,
    description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  upsertCategory(cat)
  return cat
}

export function updateCategory(id: string, name: string, description?: string): Category | null {
  const cats = getCategories()
  const existing = cats.find((c) => c.id === id)
  if (!existing) return null
  const updated: Category = { ...existing, name, description, updatedAt: new Date().toISOString() }
  upsertCategory(updated)
  return updated
}

export function deleteCategoryById(id: string): void {
  deleteCategory(id)
}
