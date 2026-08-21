'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  ScanBarcode,
  Search,
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  Package,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { BarcodeScanner } from '@/components/barcode/barcode-scanner'
import { CheckoutModal } from './checkout-modal'
import { ProductNotFoundDialog } from './product-not-found-dialog'
import { TransactionSuccess } from './transaction-success'
import { useCartStore } from '@/hooks/use-cart'
import { formatRupiah } from '@/lib/formatters/currency'
import { findByBarcode, searchProducts, ensureSeedData } from '@/services/product-service'
import { toast } from '@/components/ui/toaster'
import type { Product } from '@/types/product'
import type { Transaction } from '@/types/transaction'
import { getActiveProducts } from '@/services/product-service'
import { useRouter } from 'next/navigation'

export function POSLayout() {
  const router = useRouter()
  const { items, addItem, updateQuantity, removeItem, clearCart, hydrate } = useCartStore()
  const [scannerOpen, setScannerOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [notFoundBarcode, setNotFoundBarcode] = useState<string | null>(null)
  const [successTransaction, setSuccessTransaction] = useState<Transaction | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    ensureSeedData()
    hydrate()
    const all = getActiveProducts()
    setProducts(all)
    setFilteredProducts(all.slice(0, 20))
  }, [hydrate])

  // Search handler (also handles USB scanner input via Enter)
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value)
      if (!value.trim()) {
        setFilteredProducts(products.slice(0, 20))
        return
      }
      setFilteredProducts(searchProducts(value))
    },
    [products]
  )

  // USB scanner: barcode typically ends with Enter
  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && searchQuery.trim()) {
        const product = findByBarcode(searchQuery.trim())
        if (product) {
          addItem({ productId: product.id, productName: product.name, barcode: product.barcode, price: product.sellingPrice, quantity: 1 })
          toast({ title: `${product.name} added`, variant: 'success' })
          setSearchQuery('')
          setFilteredProducts(products.slice(0, 20))
          searchRef.current?.select()
        } else {
          setNotFoundBarcode(searchQuery.trim())
        }
      }
    },
    [searchQuery, addItem, products]
  )

  const handleBarcodeScan = useCallback(
    (barcode: string) => {
      setScannerOpen(false)
      const product = findByBarcode(barcode)
      if (product) {
        addItem({ productId: product.id, productName: product.name, barcode: product.barcode, price: product.sellingPrice, quantity: 1 })
        toast({ title: `${product.name} added to cart`, variant: 'success' })
      } else {
        setNotFoundBarcode(barcode)
      }
    },
    [addItem]
  )

  const handleProductClick = useCallback(
    (product: Product) => {
      addItem({ productId: product.id, productName: product.name, barcode: product.barcode, price: product.sellingPrice, quantity: 1 })
      toast({ title: `${product.name} added`, variant: 'success' })
    },
    [addItem]
  )

  const subtotal = items.reduce((s, i) => s + i.subtotal, 0)

  return (
    <>
      <BarcodeScanner
        isOpen={scannerOpen}
        onDetected={handleBarcodeScan}
        onClose={() => setScannerOpen(false)}
      />

      {notFoundBarcode && (
        <ProductNotFoundDialog
          barcode={notFoundBarcode}
          onClose={() => setNotFoundBarcode(null)}
          onScanAgain={() => { setNotFoundBarcode(null); setScannerOpen(true) }}
          onAddProduct={() => {
            setNotFoundBarcode(null)
            router.push(`/products?barcode=${notFoundBarcode}`)
          }}
        />
      )}

      {checkoutOpen && (
        <CheckoutModal
          items={items}
          subtotal={subtotal}
          onClose={() => setCheckoutOpen(false)}
          onSuccess={(tx) => {
            setCheckoutOpen(false)
            clearCart()
            setSuccessTransaction(tx)
          }}
        />
      )}

      {successTransaction && (
        <TransactionSuccess
          transaction={successTransaction}
          onNewTransaction={() => {
            setSuccessTransaction(null)
            searchRef.current?.focus()
          }}
          onClose={() => setSuccessTransaction(null)}
        />
      )}

      {/* Desktop layout */}
      <div className="flex h-[calc(100vh-var(--header-height))] overflow-hidden">
        {/* Left panel */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden border-r border-[hsl(var(--border))]">
          {/* Search + scan bar */}
          <div className="flex gap-2 p-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
              <Input
                ref={searchRef}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search product or scan barcode..."
                className="pl-8"
                autoComplete="off"
                id="pos-search"
              />
            </div>
            <Button
              variant="outline"
              className="gap-2 shrink-0"
              onClick={() => setScannerOpen(true)}
              aria-label="Open barcode scanner"
            >
              <ScanBarcode size={16} />
              <span className="hidden sm:inline">Scan</span>
            </Button>
          </div>

          {/* Product grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 gap-2">
                <Package size={32} className="text-[hsl(var(--muted-foreground))] opacity-40" />
                <p className="text-sm text-[hsl(var(--muted-foreground))]">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    disabled={product.stock === 0}
                    className="text-left rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 hover:bg-[hsl(var(--accent))] hover:border-[hsl(var(--primary))] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed group"
                    aria-label={`Add ${product.name} to cart`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-2">
                      <div className="p-1.5 rounded-[4px] bg-[hsl(var(--muted))] group-hover:bg-[hsl(221,83%,95%)] transition-colors">
                        <Package size={14} className="text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))]" />
                      </div>
                      {product.stock === 0 ? (
                        <Badge variant="danger" className="text-[10px]">Out</Badge>
                      ) : product.stock <= product.minimumStock ? (
                        <Badge variant="warning" className="text-[10px]">{product.stock}</Badge>
                      ) : null}
                    </div>
                    <p className="text-sm font-medium leading-tight line-clamp-2 mb-1">{product.name}</p>
                    <p className="text-sm font-semibold text-[hsl(var(--primary))]">{formatRupiah(product.sellingPrice)}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right panel — Cart */}
        <div className="hidden lg:flex flex-col w-80 xl:w-96 bg-[hsl(var(--card))]">
          {/* Cart header */}
          <div className="flex items-center gap-2 px-5 py-4 border-b border-[hsl(var(--border))]">
            <ShoppingCart size={16} />
            <span className="text-sm font-semibold">Current Order</span>
            {items.length > 0 && (
              <Badge variant="default" className="ml-auto">{items.length}</Badge>
            )}
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-[hsl(var(--muted-foreground))]">
                <ShoppingCart size={32} className="opacity-30" />
                <p className="text-sm">Cart is empty</p>
                <p className="text-xs">Scan or select a product</p>
              </div>
            ) : (
              <div className="divide-y divide-[hsl(var(--border))]">
                {items.map((item) => (
                  <div key={item.productId} className="px-5 py-3 cart-item-enter">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.productName}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{formatRupiah(item.price)} / item</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-1 rounded hover:bg-[hsl(var(--destructive))] hover:text-white transition-colors text-[hsl(var(--muted-foreground))]"
                        aria-label={`Remove ${item.productName}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-sm font-semibold">{formatRupiah(item.subtotal)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart footer */}
          <div className="border-t border-[hsl(var(--border))] p-5 space-y-3">
            <div className="flex justify-between text-sm text-[hsl(var(--muted-foreground))]">
              <span>Subtotal</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span className="text-[hsl(var(--primary))]">{formatRupiah(subtotal)}</span>
            </div>
            <Button
              className="w-full gap-2"
              disabled={items.length === 0}
              onClick={() => setCheckoutOpen(true)}
              size="lg"
              id="pos-checkout"
            >
              Checkout
              <ChevronRight size={16} />
            </Button>
            {items.length > 0 && (
              <button
                onClick={() => clearCart()}
                className="w-full text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] transition-colors"
              >
                Clear cart
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile bottom cart bar */}
      {items.length > 0 && (
        <div className="lg:hidden fixed bottom-16 left-0 right-0 z-20 bg-[hsl(var(--card))] border-t border-[hsl(var(--border))] px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{items.length} item{items.length > 1 ? 's' : ''}</p>
            <p className="text-sm font-semibold">{formatRupiah(subtotal)}</p>
          </div>
          <Button onClick={() => setCheckoutOpen(true)} className="gap-2">
            <ShoppingCart size={16} />
            Checkout
          </Button>
        </div>
      )}
    </>
  )
}
