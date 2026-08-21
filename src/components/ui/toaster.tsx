'use client'

import { useState, useCallback, useRef } from 'react'
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from './toast'

interface ToastItem {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'success' | 'error'
}

// Global toast state
let addToastFn: ((toast: Omit<ToastItem, 'id'>) => void) | null = null

export function toast(item: Omit<ToastItem, 'id'>) {
  addToastFn?.(item)
}

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counter = useRef(0)

  const addToast = useCallback((item: Omit<ToastItem, 'id'>) => {
    counter.current += 1
    const id = String(counter.current)
    setToasts((prev) => [...prev, { ...item, id }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  // Register global fn
  addToastFn = addToast

  return (
    <ToastProvider>
      {toasts.map((t) => (
        <Toast key={t.id} variant={t.variant} open>
          <div className="flex-1 min-w-0">
            <ToastTitle>{t.title}</ToastTitle>
            {t.description && <ToastDescription>{t.description}</ToastDescription>}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
