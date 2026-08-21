import type { Metadata } from 'next'
import { AppShell } from '@/components/layout/app-shell'
import { CategoryList } from '@/components/categories/category-list'

export const metadata: Metadata = { title: 'Categories' }

export default function CategoriesPage() {
  return (
    <AppShell>
      <CategoryList />
    </AppShell>
  )
}
