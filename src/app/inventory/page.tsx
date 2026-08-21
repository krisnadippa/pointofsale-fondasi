import type { Metadata } from 'next'
import { AppShell } from '@/components/layout/app-shell'
import { InventoryTable } from '@/components/inventory/inventory-table'

export const metadata: Metadata = { title: 'Inventory' }

export default function InventoryPage() {
  return (
    <AppShell>
      <InventoryTable />
    </AppShell>
  )
}
