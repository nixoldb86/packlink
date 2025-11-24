// API endpoint para ejecutar el scraping
import { NextRequest, NextResponse } from 'next/server'
import { ScrapingProcessor } from '@/lib/scraper/processor'
import type { ScrapingInputs } from '@/lib/scraper/types'
import { getUserIP, getIPCoordinates } from '@/lib/utils/ip-geolocation'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Configuración desde variables de entorno (.env.local)
    // Estas variables se configuran únicamente en .env.local y no se pueden sobrescribir desde el body
    const minPaginasPorPlataforma = parseInt(process.env.SCRAPING_MIN_PAGINAS_POR_PLATAFORMA || '1', 10)
    const minResultadosPorPlataforma = parseInt(process.env.SCRAPING_MIN_RESULTADOS_POR_PLATAFORMA || '10', 10)
    
    // Validar inputs requeridos
    const inputs: ScrapingInputs = {
      producto_text: body.producto_text || '',
      categoria: body.categoria || 'general',
      ubicacion: body.ubicacion || 'españa/madrid',
      radio_km: body.radio_km || 30,
      condicion_objetivo: body.condicion_objetivo || 'buen_estado',
      idioma_busqueda: body.idioma_busqueda || 'es',
      min_paginas_por_plataforma: minPaginasPorPlataforma,
      min_resultados_por_plataforma: minResultadosPorPlataforma,
    }

    // Validaciones básicas
    if (!inputs.producto_text) {
      return NextResponse.json(
        { error: 'producto_text es requerido' },
        { status: 400 }
      )
    }

    // Obtener coordenadas de la IP del usuario
    const userIP = getUserIP(request)
    let coordenadasIP = null
    if (userIP) {
      try {
        coordenadasIP = await getIPCoordinates(userIP)
        console.log(`📍 [API Scrape] Coordenadas de IP obtenidas: ${coordenadasIP?.lat}, ${coordenadasIP?.lon}`)
      } catch (error) {
        console.warn(`⚠️ [API Scrape] Error al obtener coordenadas de IP:`, error)
      }
    }

    // Añadir coordenadas de IP a los inputs
    if (coordenadasIP) {
      inputs.coordenadas_ip = coordenadasIP
    }

    const inicioTotal = Date.now()
    console.log('\n' + '='.repeat(60))
    console.log('🚀 [API] Iniciando scraping')
    console.log('='.repeat(60))
    console.log('📋 [API] Inputs recibidos:')
    console.log(`   - Producto: "${inputs.producto_text}"`)
    console.log(`   - Categoría: "${inputs.categoria}"`)
    console.log(`   - Ubicación: "${inputs.ubicacion}"`)
    console.log(`   - Radio: ${inputs.radio_km}km`)
    console.log(`   - Condición objetivo: ${inputs.condicion_objetivo}`)
    console.log(`   - Idioma: ${inputs.idioma_busqueda}`)
    console.log(`   - Min páginas: ${inputs.min_paginas_por_plataforma}`)
    console.log(`   - Min resultados: ${inputs.min_resultados_por_plataforma}`)
    console.log('='.repeat(60) + '\n')

    // Procesar scraping
    const processor = new ScrapingProcessor()
    const resultados = await processor.procesar(inputs)

    const tiempoTotal = Date.now() - inicioTotal
    console.log('\n' + '='.repeat(60))
    console.log('✅ [API] Scraping completado exitosamente')
    console.log('='.repeat(60))
    console.log(`⏱️  [API] Tiempo total: ${tiempoTotal}ms (${(tiempoTotal / 1000).toFixed(2)}s)`)
    console.log('📊 [API] Resultados finales:')
    console.log(`   - JSON Compradores: ${resultados.jsonCompradores.compradores.length} items`)
    console.log(`   - JSON Vendedores: ${resultados.jsonVendedores.vendedores.length} items`)
    console.log(`   - Tabla Compradores: ${resultados.tablaCompradores.length} filas`)
    console.log(`   - Tabla Vendedores: ${resultados.tablaVendedores.length} filas`)
    console.log('='.repeat(60) + '\n')

    // Retornar solo los JSONs (según especificación)
    return NextResponse.json({
      compradores: resultados.jsonCompradores,
      vendedores: resultados.jsonVendedores,
    })

  } catch (error) {
    console.error('❌ Error en scraping:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    
    return NextResponse.json(
      { 
        error: 'Error al procesar el scraping',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}

