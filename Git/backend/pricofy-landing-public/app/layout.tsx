import type { Metadata } from 'next'
import { Poppins, Great_Vibes } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
})

const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-great-vibes',
})

export const metadata: Metadata = {
  title: 'Pricofy - Optimiza tus Precios',
  description: 'La solución inteligente para gestión de precios y estrategias de pricing de segunda mano',
  icons: {
    icon: '/images/solo_logo_sin_Fondo.png',
    apple: '/images/solo_logo_sin_Fondo.png',
    shortcut: '/images/solo_logo_sin_Fondo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${poppins.variable} ${greatVibes.variable}`}>
      <body className={poppins.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
