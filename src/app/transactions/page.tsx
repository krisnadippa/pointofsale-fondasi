import type { Metadata } from 'next'
import { AppShell } from '@/components/layout/app-shell'
import { TransactionTable } from '@/components/transactions/transaction-table'

export const metadata: Metadata = { title: 'Transactions' }

export default function TransactionsPage() {
  return (
    <AppShell>
      <TransactionTable />
    </AppShell>
  )
}
