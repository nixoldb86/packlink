import { NextResponse } from 'next/server'
import { getAllContactos } from '@/lib/db'

// Evitar que Next.js intente pre-renderizar esta ruta durante el build
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const contactos = await getAllContactos()
    // Asegurar que contactos es un array
    const contactosArray = Array.isArray(contactos) ? contactos : []
    return NextResponse.json(
      {
        success: true,
        data: contactosArray,
        count: contactosArray.length
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching contactos:', error)
    return NextResponse.json(
      { error: 'Error al obtener los contactos' },
      { status: 500 }
    )
  }
}

