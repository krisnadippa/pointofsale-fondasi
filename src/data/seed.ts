import type { Product, Category } from '@/types/product'
import type { StockMovement } from '@/types/inventory'

const now = () => new Date().toISOString()

export const SEED_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Beverages', description: 'Drinks and beverages', createdAt: now(), updatedAt: now() },
  { id: 'cat-2', name: 'Food', description: 'Food products', createdAt: now(), updatedAt: now() },
  { id: 'cat-3', name: 'Snacks', description: 'Chips and snacks', createdAt: now(), updatedAt: now() },
  { id: 'cat-4', name: 'Instant Food', description: 'Ready-to-cook products', createdAt: now(), updatedAt: now() },
  { id: 'cat-5', name: 'Personal Care', description: 'Hygiene and personal care', createdAt: now(), updatedAt: now() },
  { id: 'cat-6', name: 'Household', description: 'Household supplies', createdAt: now(), updatedAt: now() },
]

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-01', barcode: '8991234001230', sku: 'BEV-001',
    name: 'Coca Cola 390ml', categoryId: 'cat-1',
    purchasePrice: 5500, sellingPrice: 7500, stock: 48, minimumStock: 12,
    unit: 'Botol', isActive: true, createdAt: now(), updatedAt: now(),
  },
  {
    id: 'prod-02', barcode: '8991234001247', sku: 'BEV-002',
    name: 'Pepsi 390ml', categoryId: 'cat-1',
    purchasePrice: 5200, sellingPrice: 7000, stock: 36, minimumStock: 12,
    unit: 'Botol', isActive: true, createdAt: now(), updatedAt: now(),
  },
  {
    id: 'prod-03', barcode: '8991234001254', sku: 'BEV-003',
    name: 'Aqua 600ml', categoryId: 'cat-1',
    purchasePrice: 2500, sellingPrice: 4000, stock: 72, minimumStock: 24,
    unit: 'Botol', isActive: true, createdAt: now(), updatedAt: now(),
  },
  {
    id: 'prod-04', barcode: '8991234001261', sku: 'BEV-004',
    name: 'Teh Botol Sosro 450ml', categoryId: 'cat-1',
    purchasePrice: 4500, sellingPrice: 6500, stock: 8, minimumStock: 12,
    unit: 'Botol', isActive: true, createdAt: now(), updatedAt: now(),
  },
  {
    id: 'prod-05', barcode: '8991234001278', sku: 'BEV-005',
    name: 'Pocari Sweat 500ml', categoryId: 'cat-1',
    purchasePrice: 7500, sellingPrice: 10000, stock: 24, minimumStock: 10,
    unit: 'Botol', isActive: true, createdAt: now(), updatedAt: now(),
  },
  {
    id: 'prod-06', barcode: '8991234001285', sku: 'BEV-006',
    name: 'Minute Maid Pulpy Orange 350ml', categoryId: 'cat-1',
    purchasePrice: 5000, sellingPrice: 7000, stock: 0, minimumStock: 10,
    unit: 'Botol', isActive: true, createdAt: now(), updatedAt: now(),
  },
  {
    id: 'prod-07', barcode: '8991234002008', sku: 'INS-001',
    name: 'Indomie Goreng', categoryId: 'cat-4',
    purchasePrice: 2800, sellingPrice: 3500, stock: 120, minimumStock: 30,
    unit: 'Bungkus', isActive: true, createdAt: now(), updatedAt: now(),
  },
  {
    id: 'prod-08', barcode: '8991234002015', sku: 'INS-002',
    name: 'Indomie Soto', categoryId: 'cat-4',
    purchasePrice: 2800, sellingPrice: 3500, stock: 85, minimumStock: 30,
    unit: 'Bungkus', isActive: true, createdAt: now(), updatedAt: now(),
  },
  {
    id: 'prod-09', barcode: '8991234002022', sku: 'INS-003',
    name: 'Mie Sedaap Goreng', categoryId: 'cat-4',
    purchasePrice: 2600, sellingPrice: 3200, stock: 4, minimumStock: 30,
    unit: 'Bungkus', isActive: true, createdAt: now(), updatedAt: now(),
  },
  {
    id: 'prod-10', barcode: '8991234003001', sku: 'SNK-001',
    name: 'Chitato Original 68g', categoryId: 'cat-3',
    purchasePrice: 9000, sellingPrice: 12000, stock: 32, minimumStock: 10,
    unit: 'Pcs', isActive: true, createdAt: now(), updatedAt: now(),
  },
  {
    id: 'prod-11', barcode: '8991234003018', sku: 'SNK-002',
    name: 'Pringles Original 107g', categoryId: 'cat-3',
    purchasePrice: 28000, sellingPrice: 35000, stock: 18, minimumStock: 6,
    unit: 'Kaleng', isActive: true, createdAt: now(), updatedAt: now(),
  },
  {
    id: 'prod-12', barcode: '8991234003025', sku: 'SNK-003',
    name: 'Biskuit Roma Kelapa', categoryId: 'cat-3',
    purchasePrice: 6500, sellingPrice: 9000, stock: 42, minimumStock: 15,
    unit: 'Pcs', isActive: true, createdAt: now(), updatedAt: now(),
  },
  {
    id: 'prod-13', barcode: '8991234003032', sku: 'SNK-004',
    name: 'SilverQueen Cashew 62g', categoryId: 'cat-3',
    purchasePrice: 12000, sellingPrice: 15000, stock: 5, minimumStock: 10,
    unit: 'Pcs', isActive: true, createdAt: now(), updatedAt: now(),
  },
  {
    id: 'prod-14', barcode: '8991234004008', sku: 'FOD-001',
    name: 'Roti Tawar Serba 400g', categoryId: 'cat-2',
    purchasePrice: 13000, sellingPrice: 17000, stock: 15, minimumStock: 5,
    unit: 'Pcs', isActive: true, createdAt: now(), updatedAt: now(),
  },
  {
    id: 'prod-15', barcode: '8991234005001', sku: 'PER-001',
    name: 'Sabun Lifebuoy 110g', categoryId: 'cat-5',
    purchasePrice: 4500, sellingPrice: 6500, stock: 30, minimumStock: 10,
    unit: 'Pcs', isActive: true, createdAt: now(), updatedAt: now(),
  },
  {
    id: 'prod-16', barcode: '8991234005018', sku: 'PER-002',
    name: 'Shampo Clear 170ml', categoryId: 'cat-5',
    purchasePrice: 18000, sellingPrice: 24000, stock: 22, minimumStock: 8,
    unit: 'Botol', isActive: true, createdAt: now(), updatedAt: now(),
  },
  {
    id: 'prod-17', barcode: '8991234006001', sku: 'HHS-001',
    name: 'Sunlight Jeruk Nipis 400ml', categoryId: 'cat-6',
    purchasePrice: 11000, sellingPrice: 15000, stock: 18, minimumStock: 6,
    unit: 'Botol', isActive: true, createdAt: now(), updatedAt: now(),
  },
  {
    id: 'prod-18', barcode: '8991234006018', sku: 'HHS-002',
    name: 'Baygon Aerosol Lavender 600ml', categoryId: 'cat-6',
    purchasePrice: 32000, sellingPrice: 42000, stock: 10, minimumStock: 4,
    unit: 'Kaleng', isActive: true, createdAt: now(), updatedAt: now(),
  },
]

export const SEED_STOCK_MOVEMENTS: StockMovement[] = SEED_PRODUCTS.map((p) => ({
  id: `sm-init-${p.id}`,
  productId: p.id,
  productName: p.name,
  type: 'PURCHASE' as const,
  quantity: p.stock,
  previousStock: 0,
  newStock: p.stock,
  notes: 'Initial stock',
  createdAt: p.createdAt,
}))
