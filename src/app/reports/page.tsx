import type { Metadata } from 'next'
import { AppShell } from '@/components/layout/app-shell'
import { ReportsClient } from '@/components/reports/reports-client'

export const metadata: Metadata = { title: 'Reports' }

export default function ReportsPage() {
  return (
    <AppShell>
      <ReportsClient />
    </AppShell>
  )
}
