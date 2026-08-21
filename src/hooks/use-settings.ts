'use client'

import { useState, useCallback } from 'react'
import { getSettings, saveSettings } from '@/lib/storage/settings'
import type { StoreSettings } from '@/types/settings'

export function useSettings() {
  const [settings, setSettings] = useState<StoreSettings | null>(null)

  const loadSettings = useCallback(() => {
    setSettings(getSettings())
  }, [])

  const updateSettings = useCallback((updates: Partial<StoreSettings>) => {
    const current = getSettings()
    const updated = { ...current, ...updates }
    saveSettings(updated)
    setSettings(updated)
  }, [])

  return { settings, loadSettings, updateSettings }
}
