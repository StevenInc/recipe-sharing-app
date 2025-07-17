import './globals.css'
import type { Metadata } from 'next'
import Header from '@/components/header'

export const metadata: Metadata = {
  title: 'RecipeShare',
  description: 'A modern recipe sharing platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Header />
        {children}
      </body>
    </html>
  )
}
