import type { Metadata } from 'next'
import { AppShell } from '@/components/layout/app-shell'
import { POSLayout } from '@/components/pos/pos-layout'

export const metadata: Metadata = { title: 'Point of Sale' }

export default function POSPage() {
  return (
    <AppShell>
      <POSLayout />
    </AppShell>
  )
}
