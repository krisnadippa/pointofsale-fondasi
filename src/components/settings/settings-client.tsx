'use client'

import { useState, useEffect } from 'react'
import { Save, RotateCcw, AlertTriangle, Printer, Bluetooth, Check, RefreshCw } from 'lucide-react'
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
import {
  isBluetoothSupported,
  getConnectedBluetoothDevice,
  connectBluetoothPrinter,
  disconnectBluetoothPrinter,
  printDirectBluetoothTest,
} from '@/services/printing/bluetooth-print-service'

export function SettingsClient() {
  const [form, setForm] = useState<StoreSettings>(DEFAULT_SETTINGS)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [btDevice, setBtDevice] = useState<string | null>(null)
  const [btConnecting, setBtConnecting] = useState(false)
  const [btSupported, setBtSupported] = useState(true)

  useEffect(() => {
    setForm(getSettings())
    setBtSupported(isBluetoothSupported())
    setBtDevice(getConnectedBluetoothDevice())
  }, [])

  const handleConnectBt = async () => {
    setBtConnecting(true)
    try {
      const name = await connectBluetoothPrinter()
      setBtDevice(name)
      const updated = { ...form, printMethod: 'bluetooth' as const }
      setForm(updated)
      saveSettings(updated)
      toast({ title: `Terhubung ke ${name}`, description: 'Mode cetak otomatis diset ke Bluetooth', variant: 'success' })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast({ title: 'Gagal koneksi Bluetooth', description: msg, variant: 'error' })
    } finally {
      setBtConnecting(false)
    }
  }

  const handleDisconnectBt = async () => {
    await disconnectBluetoothPrinter()
    setBtDevice(null)
    toast({ title: 'Bluetooth printer terputus' })
  }

  const handleTestBt = async () => {
    try {
      await printDirectBluetoothTest()
      toast({ title: 'Test print Bluetooth terkirim', variant: 'success' })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast({ title: 'Gagal cetak Bluetooth', description: msg, variant: 'error' })
    }
  }

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
        value={String(form[id] ?? '')}
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

      {/* Receipt & printer settings */}
      <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
          <div>
            <h2 className="text-sm font-semibold">Receipt & Printer Settings</h2>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Pengaturan printer thermal struk kasir</p>
          </div>
        </div>

        {/* Print Method */}
        <div className="space-y-1.5">
          <Label htmlFor="set-printMethod">Metode Cetak Struk (Print Method)</Label>
          <Select value={form.printMethod || 'browser'} onValueChange={(v) => setForm((f) => ({ ...f, printMethod: v as 'browser' | 'bluetooth' }))}>
            <SelectTrigger id="set-printMethod"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="bluetooth">⚡ Cetak Langsung Bluetooth (Sangat Cepat & Tanpa Dialog Print)</SelectItem>
              <SelectItem value="browser">🖨️ Cetak via Browser (Kabel USB / Driver Windows)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bluetooth Device Box */}
        {form.printMethod === 'bluetooth' && (
          <div className="rounded-lg border border-[hsl(var(--primary)/30)] bg-[hsl(var(--primary)/5)] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bluetooth size={18} className="text-[hsl(var(--primary))]" />
                <span className="text-xs font-semibold">Koneksi Bluetooth Thermal (HP / Laptop)</span>
              </div>
              {btDevice ? (
                <span className="flex items-center gap-1 text-[11px] text-green-600 font-medium">
                  <Check size={13} /> Terhubung: {btDevice}
                </span>
              ) : (
                <span className="text-[11px] text-[hsl(var(--muted-foreground))]">Belum Terhubung</span>
              )}
            </div>

            {!btSupported && (
              <p className="text-xs text-amber-600">
                Browser ini belum mendukung Web Bluetooth. Gunakan browser Google Chrome di Android atau Windows.
              </p>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              {!btDevice ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleConnectBt}
                  disabled={btConnecting || !btSupported}
                  className="gap-2 text-xs"
                >
                  <Bluetooth size={14} />
                  {btConnecting ? 'Mencari Perangkat...' : 'Hubungkan Printer Bluetooth (Scan)'}
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleTestBt}
                    className="gap-2 text-xs"
                  >
                    <Printer size={14} />
                    Test Print Bluetooth Langsung
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleDisconnectBt}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    Putuskan
                  </Button>
                </>
              )}
            </div>
            <p className="text-[11px] text-[hsl(var(--muted-foreground))] leading-relaxed">
              * Mode Bluetooth mengirim perintah ESC/POS langsung ke printer thermal Gprinter/RPP02N dalam 1 detik tanpa popup dialog browser.
            </p>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="set-receiptWidth">Paper Width (Ukuran Kertas Thermal)</Label>
          <Select value={form.receiptWidth} onValueChange={(v) => setForm((f) => ({ ...f, receiptWidth: v as '58mm' | '80mm' }))}>
            <SelectTrigger id="set-receiptWidth"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="58mm">58mm (Printer Mini / Portable Bluetooth)</SelectItem>
              <SelectItem value="80mm">80mm (Printer Thermal Desktop / Kasir Standar)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {field('taxRate', 'Tax Rate (%)', 'number', '0')}
        {field('defaultDiscount', 'Default Discount (Rp)', 'number', '0')}

        <div className="pt-2 flex flex-wrap gap-2 items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              saveSettings(form)
              import('@/services/printing/print-service').then((m) => m.printTestReceipt())
            }}
            className="gap-2 text-xs"
            id="test-print-receipt"
          >
            <Printer size={14} />
            Test Print Receipt (Uji Cetak Struk)
          </Button>
        </div>
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
