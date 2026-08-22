import type { Metadata, Viewport } from 'next'
import './globals.css'
import { PWARegister } from '@/components/pwa/pwa-register'

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: {
    default: 'POS Fondasi — Point of Sale',
    template: '%s | POS Fondasi',
  },
  description:
    'Professional Point of Sale system for supermarkets, minimarkets, and retail stores.',
  applicationName: 'POS Fondasi',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'POS Fondasi',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/images/fondasi1.png',
    shortcut: '/images/fondasi1.png',
    apple: '/icons/apple-touch-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="h-full bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        <PWARegister />
        {children}
      </body>
    </html>
  )
}

