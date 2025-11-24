import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPostgresConnection, getProductosNuevos } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Obtiene los detalles de una evaluación específica
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const scrapingId = parseInt(params.id, 10)
    if (isNaN(scrapingId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }

    // Obtener conexión a la base de datos
    const pool = await getPostgresConnection()
    
    // Obtener el scraping result y la solicitud asociada
    // Buscar por user_id si existe, o por email como fallback (para solicitudes antiguas)
    const query = `
      SELECT 
        sr.*,
        s.modelo_marca as producto_text,
        s.tipo_producto as categoria,
        s.estado as condicion_objetivo,
        s.accion,
        s.pais,
        s.ciudad,
        s.email,
        s.created_at as solicitud_created_at,
        COALESCE(sr.total_anuncios_analizados_filtrados, sr.total_anuncios_analizados, 0) as total_anuncios_analizados_filtrados
      FROM scraping_results sr
      INNER JOIN solicitudes s ON sr.solicitud_id = s.id
      WHERE sr.id = $1 AND (s.user_id = $2 OR (s.user_id IS NULL AND s.email = $3))
    `

    // Obtener el email del usuario autenticado para el fallback
    const userEmail = user.email || ''
    const result = await pool.query(query, [scrapingId, user.id, userEmail])
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Evaluación no encontrada' },
        { status: 404 }
      )
    }

    const row = result.rows[0]
    
    // Determinar qué fuente de datos usar según el tipo de búsqueda
    const tipoBusqueda = row.tipo_busqueda || 'completa'
    let jsonCompradores = row.json_compradores
    
    // Si es búsqueda directa, usar total_resultados_scrapping en lugar de json_compradores
    if (tipoBusqueda === 'directa' && row.total_resultados_scrapping) {
      jsonCompradores = row.total_resultados_scrapping
      console.log(`📋 [Evaluation API] Búsqueda directa detectada, usando total_resultados_scrapping`)
    }
    
    // Obtener productos nuevos de ciao.es
    const productosNuevos = await getProductosNuevos(scrapingId)
    
    // Formatear los datos
    const evaluacion = {
      id: row.id,
      solicitudId: row.solicitud_id,
      producto: row.producto_text,
      categoria: row.categoria,
      condicion: row.condicion_objetivo,
      accion: row.accion,
      ubicacion: `${row.ciudad || ''}, ${row.pais || ''}`.trim().replace(/^,\s*|,\s*$/g, ''),
      ciudad: row.ciudad,
      pais: row.pais,
      fecha: row.solicitud_created_at,
      scraping: {
        id: row.id,
        totalEncontrados: row.total_anuncios_encontrados || 0,
        totalAnalizados: row.total_anuncios_analizados_filtrados || row.total_anuncios_analizados || 0, // Usar total_anuncios_analizados_filtrados si existe
        totalDescartados: row.total_anuncios_descartados || 0,
        totalOutliers: row.total_anuncios_outliers || 0,
        totalFiltrados: row.total_anuncios_filtrados || 0,
        jsonCompradores: jsonCompradores, // Usa total_resultados_scrapping si es búsqueda directa
        jsonVendedores: row.json_vendedores,
        plataformasConsultadas: row.plataformas_consultadas || [],
        fecha: row.created_at,
        tipoBusqueda: tipoBusqueda, // Incluir tipo de búsqueda
        productosNuevos: productosNuevos || [], // Productos nuevos de ciao.es
      },
    }

    return NextResponse.json({ evaluacion })
  } catch (error) {
    console.error('Error obteniendo detalles de evaluación:', error)
    return NextResponse.json(
      { error: 'Error al obtener detalles de evaluación' },
      { status: 500 }
    )
  }
}

