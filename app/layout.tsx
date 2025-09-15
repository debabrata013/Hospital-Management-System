import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/hooks/useAuth'
import './globals.css'
import ExtensionErrorShield from './ExtensionErrorShield'

export const metadata: Metadata = {
  title: ' NMSC Hospital',
  description: 'Hospital Management System built with Next.js',
  icons: {
    icon: '/logo.ico', // ✅ your hospital logo
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <AuthProvider>
          <ExtensionErrorShield />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
