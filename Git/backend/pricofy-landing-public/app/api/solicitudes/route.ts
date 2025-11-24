import { NextResponse } from 'next/server'
import { getAllSolicitudes } from '@/lib/db'

// Evitar que Next.js intente pre-renderizar esta ruta durante el build
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    console.log('🔍 Variables de entorno DB:', {
      hasHost: !!process.env.DB_HOST || !!process.env.POSTGRES_HOST,
      hasPort: !!process.env.DB_PORT || !!process.env.POSTGRES_PORT,
      hasUser: !!process.env.DB_USER || !!process.env.POSTGRES_USER,
      hasPassword: !!process.env.DB_PASSWORD || !!process.env.POSTGRES_PASSWORD,
      hasDatabase: !!process.env.DB_NAME || !!process.env.POSTGRES_DB,
      ssl: process.env.DB_SSL
    })
    
    const solicitudes = await getAllSolicitudes()
    // Asegurar que solicitudes es un array
    const solicitudesArray = Array.isArray(solicitudes) ? solicitudes : []
    
    return NextResponse.json(
      { 
        success: true, 
        data: solicitudesArray,
        count: solicitudesArray.length
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Error al obtener las solicitudes:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error code:', (error as any).code)
    }
    return NextResponse.json(
      { 
        error: 'Error al obtener las solicitudes',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
      { status: 500 }
    )
  }
}
