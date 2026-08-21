import { getItem, setItem, removeItem } from './base'
import type { CartItem } from '@/types/transaction'

export const CART_KEY = 'pos_cart'

export function getCart(): CartItem[] {
  return getItem<CartItem[]>(CART_KEY) ?? []
}

export function saveCart(items: CartItem[]): void {
  setItem(CART_KEY, items)
}

export function clearCart(): void {
  removeItem(CART_KEY)
}
