import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Own Recovery - Your Journey, Your Pace',
  description: 'A supportive, AI-powered companion for your recovery journey. Whether you\'re thinking about change, actively using, or already in recovery, we\'re here to support you every step of the way.',
  keywords: ['recovery', 'sobriety', 'mental health', 'wellness', 'support', 'AI companion'],
  authors: [{ name: 'Own Recovery Team' }],
  openGraph: {
    title: 'Own Recovery - Your Journey, Your Pace',
    description: 'A supportive, AI-powered companion for your recovery journey.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Own Recovery - Your Journey, Your Pace',
    description: 'A supportive, AI-powered companion for your recovery journey.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
          {children}
        </div>
      </body>
    </html>
  )
}
