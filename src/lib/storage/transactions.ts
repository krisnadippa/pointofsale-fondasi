import { getItem, setItem } from './base'
import type { Transaction } from '@/types/transaction'
import { format } from 'date-fns'

export const TRANSACTIONS_KEY = 'pos_transactions'
export const INVOICE_COUNTER_KEY = 'pos_invoice_counter'

// ─── Invoice Number ──────────────────────────────────────────────────────────

export function generateInvoiceNumber(): string {
  const today = format(new Date(), 'yyyyMMdd')
  const counterKey = `${INVOICE_COUNTER_KEY}_${today}`
  const current = getItem<number>(counterKey) ?? 0
  const next = current + 1
  setItem(counterKey, next)
  return `INV-${today}-${String(next).padStart(4, '0')}`
}

// ─── Transactions ────────────────────────────────────────────────────────────

export function getTransactions(): Transaction[] {
  return getItem<Transaction[]>(TRANSACTIONS_KEY) ?? []
}

export function saveTransactions(transactions: Transaction[]): void {
  setItem(TRANSACTIONS_KEY, transactions)
}

export function addTransaction(transaction: Transaction): void {
  const transactions = getTransactions()
  transactions.unshift(transaction) // newest first
  saveTransactions(transactions)
}

export function getTransactionById(id: string): Transaction | undefined {
  return getTransactions().find((t) => t.id === id)
}

export function getTransactionsByDateRange(from: Date, to: Date): Transaction[] {
  return getTransactions().filter((t) => {
    const d = new Date(t.createdAt)
    return d >= from && d <= to
  })
}

export function getTodayTransactions(): Transaction[] {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(start.getTime() + 86400000)
  return getTransactionsByDateRange(start, end)
}
