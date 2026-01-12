import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import './globals.css'

const manrope = Manrope({ subsets: ['latin'], variable: '--font-sans' })

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
      <body className={`${manrope.className} bg-midnight text-slate-100 antialiased`}>
        <div className="relative min-h-screen overflow-hidden">
          <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(circle_at_20%_20%,rgba(111,126,255,0.25),transparent_45%),radial-gradient(circle_at_80%_15%,rgba(60,242,255,0.18),transparent_40%),radial-gradient(circle_at_50%_85%,rgba(121,58,255,0.22),transparent_45%)]" />
          <div className="relative z-10">{children}</div>
        </div>
      </body>
    </html>
  )
}
