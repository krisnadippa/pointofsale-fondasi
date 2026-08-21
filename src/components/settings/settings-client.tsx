'use client'

import { useState, useEffect } from 'react'
import { Save, RotateCcw, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getSettings, saveSettings } from '@/lib/storage/settings'
import { resetData } from '@/services/product-service'
import { saveStockMovements } from '@/lib/storage/inventory'
import { saveTransactions } from '@/lib/storage/transactions'
import { clearAll } from '@/lib/storage/base'
import { toast } from '@/components/ui/toaster'
import { DEFAULT_SETTINGS, type StoreSettings } from '@/types/settings'

export function SettingsClient() {
  const [form, setForm] = useState<StoreSettings>(DEFAULT_SETTINGS)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    setForm(getSettings())
  }, [])

  const handleSave = async () => {
    setSaving(true)
    saveSettings(form)
    toast({ title: 'Settings saved', variant: 'success' })
    setSaving(false)
  }

  const handleResetData = async () => {
    if (!confirm('This will reset all products and categories to demo data. Transactions will be cleared. Continue?')) return
    setResetting(true)
    clearAll()
    resetData()
    toast({ title: 'Data reset to demo defaults', variant: 'success' })
    setResetting(false)
  }

  const field = (
    id: keyof StoreSettings,
    label: string,
    type = 'text',
    placeholder = ''
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={`set-${id}`}>{label}</Label>
      <Input
        id={`set-${id}`}
        type={type}
        value={String(form[id])}
        onChange={(e) => setForm((f) => ({ ...f, [id]: type === 'number' ? Number(e.target.value) : e.target.value }))}
        placeholder={placeholder}
      />
    </div>
  )

  return (
    <div className="p-5 lg:p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold">Settings</h1>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Store configuration and preferences</p>
      </div>

      {/* Store info */}
      <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 space-y-4">
        <h2 className="text-sm font-semibold border-b border-[hsl(var(--border))] pb-3">Store Information</h2>
        {field('storeName', 'Store Name', 'text', 'e.g. Toko Saya')}
        {field('storeAddress', 'Address', 'text', 'Store address')}
        {field('storePhone', 'Phone', 'text', 'Phone number')}
        {field('cashierName', 'Default Cashier Name', 'text', 'e.g. Kasir')}
      </div>

      {/* Receipt & billing */}
      <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 space-y-4">
        <h2 className="text-sm font-semibold border-b border-[hsl(var(--border))] pb-3">Receipt & Billing</h2>
        <div className="space-y-1.5">
          <Label htmlFor="set-receiptWidth">Receipt Width</Label>
          <Select value={form.receiptWidth} onValueChange={(v) => setForm((f) => ({ ...f, receiptWidth: v as '58mm' | '80mm' }))}>
            <SelectTrigger id="set-receiptWidth"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="58mm">58mm</SelectItem>
              <SelectItem value="80mm">80mm</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {field('taxRate', 'Tax Rate (%)', 'number', '0')}
        {field('defaultDiscount', 'Default Discount (Rp)', 'number', '0')}
      </div>

      <Button onClick={handleSave} disabled={saving} className="gap-2" id="save-settings">
        <Save size={15} />
        {saving ? 'Saving...' : 'Save Settings'}
      </Button>

      {/* Danger zone */}
      <div className="rounded-[var(--radius)] border border-[hsl(0,72%,85%)] bg-[hsl(0,72%,98%)] p-5 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-[hsl(var(--destructive))]" />
          <h2 className="text-sm font-semibold text-[hsl(var(--destructive))]">Danger Zone</h2>
        </div>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Resetting data will clear all transactions, stock movements, and restore demo products. This cannot be undone.
        </p>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleResetData}
          disabled={resetting}
          className="gap-2"
          id="reset-data"
        >
          <RotateCcw size={14} />
          {resetting ? 'Resetting...' : 'Reset to Demo Data'}
        </Button>
      </div>
    </div>
  )
}
