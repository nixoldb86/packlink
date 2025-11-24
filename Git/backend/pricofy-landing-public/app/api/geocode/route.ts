import { NextRequest, NextResponse } from 'next/server'
import { waitForRateLimit } from '@/lib/geocoding-rate-limiter'

/**
 * API route para geocodificar una ubicación
 * POST /api/geocode
 * Body: { location: string }
 * 
 * NOTA: Nominatim tiene rate limiting estricto (1 petición/segundo)
 * y NO permite usar su API para autocompletar.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { location } = body

    if (!location || !location.trim()) {
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      )
    }

    // Esperar para cumplir con el rate limiting de Nominatim (1 petición/segundo)
    await waitForRateLimit()

    // Usar Nominatim API (OpenStreetMap) - gratuito, sin API key
    const encodedLocation = encodeURIComponent(location.trim())
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedLocation}&format=json&limit=1&addressdetails=1`
    
    // Crear AbortController para controlar el timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos de timeout
    
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Pricofy/1.0 (https://pricofy.com; contact@pricofy.com)' // User-Agent más descriptivo requerido por Nominatim
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        console.error(`Error en geocodificación: ${response.status}`)
        return NextResponse.json(
          { error: 'Error geocodificando ubicación' },
          { status: response.status }
        )
      }

      const data = await response.json()
      
      if (data && data.length > 0) {
        const result = data[0]
        return NextResponse.json({
          success: true,
          coordinates: {
            lat: parseFloat(result.lat),
            lon: parseFloat(result.lon)
          },
          display_name: result.display_name
        })
      }

      return NextResponse.json({
        success: false,
        coordinates: null
      })
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      
      // Manejar errores de timeout o conexión
      if (fetchError.name === 'AbortError' || 
          fetchError.code === 'UND_ERR_CONNECT_TIMEOUT' ||
          fetchError.code === 'ECONNREFUSED' ||
          fetchError.message?.includes('fetch failed')) {
        console.error('Error de conexión con Nominatim:', fetchError.message || fetchError.code)
        return NextResponse.json(
          { 
            error: 'No se pudo conectar con el servicio de geocodificación. Por favor, intenta de nuevo más tarde.',
            success: false,
            coordinates: null
          },
          { status: 503 } // Service Unavailable
        )
      }
      
      throw fetchError
    }
  } catch (error: any) {
    console.error('Error geocodificando ubicación:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Error desconocido',
        success: false,
        coordinates: null
      },
      { status: 500 }
    )
  }
}

