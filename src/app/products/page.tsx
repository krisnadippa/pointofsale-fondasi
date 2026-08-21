import type { Metadata } from 'next'
import { AppShell } from '@/components/layout/app-shell'
import { Suspense } from 'react'
import { ProductTable } from '@/components/products/product-table'

export const metadata: Metadata = { title: 'Products' }

export default function ProductsPage() {
  return (
    <AppShell>
      <Suspense>
        <ProductTable />
      </Suspense>
    </AppShell>
  )
}
