'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { X, SwitchCamera, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void
  onClose: () => void
  isOpen: boolean
}

type ScannerStatus = 'loading' | 'scanning' | 'detected' | 'error'

export function BarcodeScanner({ onDetected, onClose, isOpen }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const controlsRef = useRef<{ stop: () => void } | null>(null)
  const lastScanRef = useRef<{ code: string; time: number } | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [status, setStatus] = useState<ScannerStatus>('loading')
  const [detectedCode, setDetectedCode] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string | undefined>(undefined)

  const stopScanner = useCallback(() => {
    controlsRef.current?.stop()
    controlsRef.current = null
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  const startScanner = useCallback(async (deviceId?: string) => {
    if (!videoRef.current) return
    setStatus('loading')
    setErrorMessage('')

    try {
      const reader = new BrowserMultiFormatReader()
      readerRef.current = reader

      const devices = await BrowserMultiFormatReader.listVideoInputDevices()
      setCameras(devices)

      // Prefer back camera
      let targetDeviceId = deviceId
      if (!targetDeviceId) {
        const backCamera = devices.find(
          (d) =>
            d.label.toLowerCase().includes('back') ||
            d.label.toLowerCase().includes('rear') ||
            d.label.toLowerCase().includes('environment')
        )
        targetDeviceId = backCamera?.deviceId ?? devices[devices.length - 1]?.deviceId
        setSelectedCamera(targetDeviceId)
      }

      const controls = await reader.decodeFromVideoDevice(
        targetDeviceId,
        videoRef.current,
        (result, err, c) => {
          if (result) {
            const code = result.getText()
            const now = Date.now()
            // Debounce: ignore same code within 1.5s
            if (
              lastScanRef.current?.code === code &&
              now - lastScanRef.current.time < 1500
            ) return

            lastScanRef.current = { code, time: now }
            setDetectedCode(code)
            setStatus('detected')

            // Stop scanning after success
            setTimeout(() => {
              c.stop()
              controlsRef.current = null
              onDetected(code)
            }, 600)
          }
          if (err && err.name !== 'NotFoundException') {
            // Real error (not just "no barcode found in frame" which is normal)
            console.warn('Scanner error:', err)
          }
        }
      )

      controlsRef.current = controls as unknown as { stop: () => void }

      // Capture stream for cleanup
      if (videoRef.current.srcObject instanceof MediaStream) {
        streamRef.current = videoRef.current.srcObject
      }

      setStatus('scanning')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      if (msg.includes('Permission') || msg.includes('permission') || msg.includes('NotAllowed')) {
        setErrorMessage('Camera permission denied. Please allow camera access and try again.')
      } else if (msg.includes('NotFound') || msg.includes('device')) {
        setErrorMessage('No camera found on this device.')
      } else {
        setErrorMessage('Unable to access camera. Please try again.')
      }
      setStatus('error')
    }
  }, [onDetected])

  // Start/stop based on isOpen
  useEffect(() => {
    if (isOpen) {
      startScanner(selectedCamera)
    } else {
      stopScanner()
      setStatus('loading')
      setDetectedCode('')
    }
    return () => stopScanner()
  }, [isOpen]) // intentionally only on isOpen change

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const switchCamera = () => {
    stopScanner()
    const idx = cameras.findIndex((c) => c.deviceId === selectedCamera)
    const next = cameras[(idx + 1) % cameras.length]
    setSelectedCamera(next?.deviceId)
    setTimeout(() => startScanner(next?.deviceId), 300)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4">
      <div className="relative w-full max-w-sm bg-[hsl(var(--card))] rounded-[var(--radius)] border border-[hsl(var(--border))] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border))]">
          <span className="text-sm font-semibold">Scan Barcode</span>
          <button
            onClick={onClose}
            className="p-1 rounded-[var(--radius)] hover:bg-[hsl(var(--accent))] transition-colors"
            aria-label="Close scanner"
          >
            <X size={16} />
          </button>
        </div>

        {/* Camera viewport */}
        <div className="relative bg-black overflow-hidden" style={{ aspectRatio: '4/3' }}>
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
          />

          {/* Loading skeleton */}
          {status === 'loading' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[hsl(220,14%,12%)] gap-3">
              <Loader2 size={28} className="text-[hsl(var(--muted-foreground))] animate-spin" />
              <span className="text-sm text-[hsl(var(--muted-foreground))]">Preparing camera...</span>
            </div>
          )}

          {/* Error state */}
          {status === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[hsl(220,14%,12%)] gap-3 px-6 text-center">
              <AlertCircle size={28} className="text-[hsl(var(--destructive))]" />
              <span className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{errorMessage}</span>
              <Button size="sm" variant="outline" onClick={() => startScanner(selectedCamera)}>
                Try Again
              </Button>
            </div>
          )}

          {/* Scanning overlay */}
          {(status === 'scanning' || status === 'detected') && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Corner brackets scan area */}
              <div
                className={cn(
                  'absolute inset-0 flex items-center justify-center transition-all duration-300',
                )}
              >
                <div
                  className={cn(
                    'relative w-48 h-32 transition-all duration-300',
                    status === 'detected' && 'success-pulse'
                  )}
                >
                  {/* Corner borders */}
                  <div className={cn(
                    'absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 rounded-tl-sm transition-colors',
                    status === 'detected' ? 'border-green-400' : 'border-white'
                  )} />
                  <div className={cn(
                    'absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 rounded-tr-sm transition-colors',
                    status === 'detected' ? 'border-green-400' : 'border-white'
                  )} />
                  <div className={cn(
                    'absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 rounded-bl-sm transition-colors',
                    status === 'detected' ? 'border-green-400' : 'border-white'
                  )} />
                  <div className={cn(
                    'absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 rounded-br-sm transition-colors',
                    status === 'detected' ? 'border-green-400' : 'border-white'
                  )} />

                  {/* Scan line */}
                  {status === 'scanning' && (
                    <div className="absolute left-1 right-1 scan-line">
                      <div className="h-0.5 bg-[hsl(var(--primary))] opacity-80 rounded-full shadow-[0_0_6px_hsl(var(--primary))]" />
                    </div>
                  )}

                  {/* Success icon */}
                  {status === 'detected' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CheckCircle2 size={36} className="text-green-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 space-y-2">
          {status === 'scanning' && (
            <p className="text-xs text-center text-[hsl(var(--muted-foreground))]">
              Align barcode inside the frame
            </p>
          )}
          {status === 'detected' && (
            <div className="text-center">
              <p className="text-xs text-green-600 font-medium">Barcode detected</p>
              <p className="text-sm font-mono font-semibold mt-0.5">{detectedCode}</p>
            </div>
          )}

          {cameras.length > 1 && status === 'scanning' && (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={switchCamera}
            >
              <SwitchCamera size={14} />
              Switch Camera
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
