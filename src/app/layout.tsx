import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'TradeGuard AI - Your AI-Powered Trading Guardian',
  description:
    'Master emotional trading with AI-powered insights. Real-time compliance checking, revenge score tracking, and smart execution delays to keep you disciplined.',
  keywords: [
    'AI trading',
    'emotional trading',
    'compliance',
    'trading psychology',
    'forex',
    'stocks',
    'MetaTrader',
  ],
  authors: [{ name: 'TradeGuard AI' }],
  creator: 'TradeGuard AI',
  publisher: 'TradeGuard AI',
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://tradeguard.example.com',
    siteName: 'TradeGuard AI',
    title: 'TradeGuard AI - Your AI-Powered Trading Guardian',
    description:
      'Master emotional trading with AI-powered insights. Real-time compliance checking, revenge score tracking, and smart execution delays.',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tradeguard.example.com'}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'TradeGuard AI',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TradeGuard AI',
    description: 'Master emotional trading with AI-powered insights',
    creator: '@tradeguardai',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#0B5345" />
      </head>
      <body className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
