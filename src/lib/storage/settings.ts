import { getItem, setItem } from './base'
import type { StoreSettings } from '@/types/settings'
import { DEFAULT_SETTINGS } from '@/types/settings'

export const SETTINGS_KEY = 'pos_settings'

export function getSettings(): StoreSettings {
  return getItem<StoreSettings>(SETTINGS_KEY) ?? DEFAULT_SETTINGS
}

export function saveSettings(settings: StoreSettings): void {
  setItem(SETTINGS_KEY, settings)
}

export function getSetting<K extends keyof StoreSettings>(key: K): StoreSettings[K] {
  return getSettings()[key]
}
