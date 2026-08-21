'use client'

import { create } from 'zustand'
import type { CartItem } from '@/types/transaction'
import { getCart, saveCart, clearCart as storageClearCart } from '@/lib/storage/cart'

interface CartStore {
  items: CartItem[]
  isHydrated: boolean
  hydrate: () => void
  addItem: (item: Omit<CartItem, 'subtotal'>) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isHydrated: false,

  hydrate: () => {
    const items = getCart()
    set({ items, isHydrated: true })
  },

  addItem: (item) => {
    const { items } = get()
    const existing = items.find((i) => i.productId === item.productId)
    let updated: CartItem[]
    if (existing) {
      updated = items.map((i) =>
        i.productId === item.productId
          ? {
              ...i,
              quantity: i.quantity + item.quantity,
              subtotal: (i.quantity + item.quantity) * i.price,
            }
          : i
      )
    } else {
      updated = [
        ...items,
        { ...item, subtotal: item.quantity * item.price },
      ]
    }
    set({ items: updated })
    saveCart(updated)
  },

  updateQuantity: (productId, quantity) => {
    const { items } = get()
    if (quantity <= 0) {
      const updated = items.filter((i) => i.productId !== productId)
      set({ items: updated })
      saveCart(updated)
      return
    }
    const updated = items.map((i) =>
      i.productId === productId
        ? { ...i, quantity, subtotal: quantity * i.price }
        : i
    )
    set({ items: updated })
    saveCart(updated)
  },

  removeItem: (productId) => {
    const updated = get().items.filter((i) => i.productId !== productId)
    set({ items: updated })
    saveCart(updated)
  },

  clearCart: () => {
    set({ items: [] })
    storageClearCart()
  },
}))
