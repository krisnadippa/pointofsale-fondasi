'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Tags } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { getAllCategories, createCategory, updateCategory } from '@/services/product-service'
import { deleteCategory } from '@/lib/storage/products'
import { getProducts } from '@/lib/storage/products'
import { toast } from '@/components/ui/toaster'
import { formatDate } from '@/lib/formatters/date'
import type { Category } from '@/types/product'
import { ensureSeedData } from '@/services/product-service'

export function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editCat, setEditCat] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(() => {
    ensureSeedData()
    setCategories(getAllCategories())
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const productCountByCategory = (catId: string) =>
    getProducts().filter((p) => p.categoryId === catId && p.isActive).length

  const openAdd = () => { setEditCat(null); setName(''); setDescription(''); setFormOpen(true) }
  const openEdit = (c: Category) => { setEditCat(c); setName(c.name); setDescription(c.description ?? ''); setFormOpen(true) }

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    if (editCat) {
      updateCategory(editCat.id, name.trim(), description.trim() || undefined)
      toast({ title: 'Category updated', variant: 'success' })
    } else {
      createCategory(name.trim(), description.trim() || undefined)
      toast({ title: 'Category added', variant: 'success' })
    }
    setSaving(false)
    setFormOpen(false)
    loadData()
  }

  const handleDelete = (c: Category) => {
    if (productCountByCategory(c.id) > 0) {
      toast({ title: 'Cannot delete', description: 'Category has active products', variant: 'error' })
      return
    }
    if (confirm(`Delete "${c.name}"?`)) {
      deleteCategory(c.id)
      toast({ title: 'Category deleted', variant: 'success' })
      loadData()
    }
  }

  return (
    <div className="p-5 lg:p-6 space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Categories</h1>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Manage product categories</p>
        </div>
        <Button size="sm" onClick={openAdd} className="gap-2">
          <Plus size={14} /> Add Category
        </Button>
      </div>

      {/* Inline form */}
      {formOpen && (
        <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 space-y-4">
          <h3 className="text-sm font-semibold">{editCat ? 'Edit Category' : 'New Category'}</h3>
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">Name</Label>
            <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Beverages" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cat-desc">Description (optional)</Label>
            <Input id="cat-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Category description" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setFormOpen(false)} size="sm">Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !name.trim()} size="sm" id="save-category">
              {saving ? 'Saving...' : editCat ? 'Update' : 'Add'}
            </Button>
          </div>
        </div>
      )}

      {/* Category list */}
      <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-2">
            <Tags size={32} className="text-[hsl(var(--muted-foreground))] opacity-40" />
            <p className="text-sm text-[hsl(var(--muted-foreground))]">No categories yet</p>
          </div>
        ) : (
          <div className="divide-y divide-[hsl(var(--border))]">
            {categories.map((c) => {
              const count = productCountByCategory(c.id)
              return (
                <div key={c.id} className="flex items-center justify-between px-5 py-4 hover:bg-[hsl(var(--muted))] transition-colors">
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                      {c.description ? `${c.description} · ` : ''}{count} product{count !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(c)} aria-label={`Edit ${c.name}`}>
                      <Pencil size={13} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(c)}
                      className="hover:text-[hsl(var(--destructive))]"
                      aria-label={`Delete ${c.name}`}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
