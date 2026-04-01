import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Snow Plow Services | Toronto Snow Removal & De-Icing',
  description:
    'Professional residential & commercial snow removal in Toronto & the GTA. Seasonal contracts, salting, and de-icing. Get your free quote today.',
  keywords:
    'snow removal, snow plowing, snow shoveling, snow blowing, salting, de-icing, Toronto, GTA, residential snow removal, commercial snow removal, seasonal contracts',
  openGraph: {
    title: 'Snow Plow Services | Toronto Snow Removal & De-Icing',
    description:
      'Professional residential & commercial snow removal in Toronto & the GTA. Seasonal contracts, salting, and de-icing. Get your free quote today.',
    siteName: 'Snow Plow Services',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
        <div className="flex min-h-full flex-col">
          <Navbar />
          <main className="flex-1 bg-white dark:bg-gray-900">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
