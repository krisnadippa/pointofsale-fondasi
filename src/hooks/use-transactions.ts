'use client'

import { useState, useCallback } from 'react'
import {
  getTransactions,
  getTransactionById,
  getTodayTransactions,
} from '@/lib/storage/transactions'
import type { Transaction } from '@/types/transaction'

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadTransactions = useCallback(() => {
    setIsLoading(true)
    setTransactions(getTransactions())
    setIsLoading(false)
  }, [])

  const getById = useCallback((id: string) => {
    return getTransactionById(id)
  }, [])

  const getToday = useCallback(() => {
    return getTodayTransactions()
  }, [])

  return {
    transactions,
    isLoading,
    loadTransactions,
    getById,
    getToday,
  }
}
