// Archivo: components/Providers.tsx (VERSIÓN PARA FORK PÚBLICO)
// Reemplaza el archivo original con este contenido

'use client'

import { LanguageProvider } from '@/contexts/LanguageContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  )
}


