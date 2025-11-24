import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPostgresConnection } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Obtiene todas las evaluaciones del usuario autenticado
 */
export async function GET(request: NextRequest) {
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

    // Obtener conexión a la base de datos
    const pool = await getPostgresConnection()
    
    // Obtener todas las solicitudes del usuario
    // Buscar por user_id si existe, o por email como fallback (para solicitudes antiguas)
    const solicitudesQuery = `
      SELECT 
        s.id,
        s.email,
        s.accion,
        s.modelo_marca as producto_text,
        s.tipo_producto as categoria,
        s.estado as condicion_objetivo,
        s.pais,
        s.ciudad,
        s.created_at,
        sr.id as scraping_result_id,
        sr.total_anuncios_analizados,
        sr.total_anuncios_descartados,
        sr.total_anuncios_outliers,
        sr.total_anuncios_filtrados,
        sr.json_compradores,
        sr.json_vendedores,
        sr.plataformas_consultadas,
        sr.tipo_busqueda,
        sr.total_resultados_scrapping,
        sr.created_at as scraping_created_at
      FROM solicitudes s
      LEFT JOIN scraping_results sr ON s.id = sr.solicitud_id
      WHERE (s.user_id = $1 OR (s.user_id IS NULL AND s.email = $2))
      ORDER BY s.created_at DESC
    `

    // Obtener el email del usuario autenticado para el fallback
    const userEmail = user.email || ''
    const solicitudesResult = await pool.query(solicitudesQuery, [user.id, userEmail])
    const solicitudes = solicitudesResult.rows

    // Formatear los datos para el frontend
    const evaluaciones = solicitudes.map((row: any) => {
      const compradores = row.json_compradores?.compradores || []
      
      return {
        id: row.id,
        producto: row.producto_text,
        categoria: row.categoria,
        condicion: row.condicion_objetivo,
        accion: row.accion,
        ubicacion: `${row.ciudad || ''}, ${row.pais || ''}`.trim().replace(/^,\s*|,\s*$/g, ''),
        ciudad: row.ciudad,
        pais: row.pais,
        fecha: row.created_at,
        scraping: row.scraping_result_id ? {
          id: row.scraping_result_id,
          totalAnalizados: row.total_anuncios_analizados || 0,
          totalDescartados: row.total_anuncios_descartados || 0,
          totalOutliers: row.total_anuncios_outliers || 0,
          totalFiltrados: row.total_anuncios_filtrados || 0,
          plataformasConsultadas: row.plataformas_consultadas || [],
          fecha: row.scraping_created_at,
          jsonCompradores: row.json_compradores || null,
          jsonVendedores: row.json_vendedores || null,
          tipoBusqueda: row.tipo_busqueda || 'completa',
          totalResultadosScrapping: row.total_resultados_scrapping || null,
        } : null,
      }
    })

    return NextResponse.json({ evaluaciones })
  } catch (error) {
    console.error('Error obteniendo evaluaciones:', error)
    return NextResponse.json(
      { error: 'Error al obtener evaluaciones' },
      { status: 500 }
    )
  }
}

