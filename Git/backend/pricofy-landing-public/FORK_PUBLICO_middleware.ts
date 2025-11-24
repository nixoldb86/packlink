// Archivo: middleware.ts (VERSIÓN PARA FORK PÚBLICO)
// Reemplaza el archivo original con este contenido

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Sin protección, solo permitir acceso
  return NextResponse.next()
}

// Sin rutas protegidas
export const config = {
  matcher: [],
}


