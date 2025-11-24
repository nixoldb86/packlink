import { NextResponse } from 'next/server'

/**
 * API route para obtener el límite diario de evaluaciones
 * Esta ruta expone la variable de entorno EVALUACIONES_LIMITE_DIARIO al cliente
 */
export async function GET() {
  try {
    // Obtener el límite diario desde variables de entorno (por defecto 1)
    const limiteDiario = parseInt(process.env.EVALUACIONES_LIMITE_DIARIO || '1', 10)
    
    return NextResponse.json({ 
      limiteDiario 
    })
  } catch (error) {
    console.error('Error al obtener límite diario:', error)
    return NextResponse.json(
      { limiteDiario: 1 }, // Valor por defecto en caso de error
      { status: 200 }
    )
  }
}

