'use client'

import { useState, useCallback } from 'react'
import {
  getAllProducts,
  getAllCategories,
  createProduct,
  updateProduct,
  softDeleteProduct,
  searchProducts,
  ensureSeedData,
  resetData,
} from '@/services/product-service'
import type { Product, Category } from '@/types/product'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(() => {
    setIsLoading(true)
    ensureSeedData()
    setProducts(getAllProducts())
    setCategories(getAllCategories())
    setIsLoading(false)
  }, [])

  const search = useCallback((query: string, categoryId?: string) => {
    return searchProducts(query, categoryId)
  }, [])

  const addProduct = useCallback(
    (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>) => {
      const p = createProduct(data)
      setProducts(getAllProducts())
      return p
    },
    []
  )

  const editProduct = useCallback((id: string, data: Partial<Product>) => {
    const p = updateProduct(id, data)
    setProducts(getAllProducts())
    return p
  }, [])

  const deleteProduct = useCallback((id: string) => {
    softDeleteProduct(id)
    setProducts(getAllProducts())
  }, [])

  const reset = useCallback(() => {
    resetData()
    setProducts(getAllProducts())
    setCategories(getAllCategories())
  }, [])

  return {
    products,
    categories,
    isLoading,
    loadData,
    search,
    addProduct,
    editProduct,
    deleteProduct,
    reset,
  }
}
