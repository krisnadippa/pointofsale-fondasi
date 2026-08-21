/**
 * SSR-safe localStorage wrapper.
 * All operations are no-ops on the server.
 */

const isBrowser = typeof window !== 'undefined'

export function getItem<T>(key: string): T | null {
  if (!isBrowser) return null
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function setItem<T>(key: string, value: T): void {
  if (!isBrowser) return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // quota exceeded or private browsing — fail silently
  }
}

export function removeItem(key: string): void {
  if (!isBrowser) return
  try {
    window.localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

export function clearAll(): void {
  if (!isBrowser) return
  try {
    window.localStorage.clear()
  } catch {
    // ignore
  }
}
