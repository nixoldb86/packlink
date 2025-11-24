import { NextRequest, NextResponse } from 'next/server'
import { saveSolicitud, checkSolicitudToday, saveScrapingResults } from '@/lib/db'
import { validateEmail } from '@/lib/emailValidator'
import { runScrapingDirecto } from '@/lib/scraper'
import { createClient } from '@/lib/supabase/server'
import { getUserIP, getIPCoordinates } from '@/lib/utils/ip-geolocation'

// Evitar que Next.js intente pre-renderizar esta ruta durante el build
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Extraer datos del formulario
    const accion = formData.get('accion') as string
    const data = {
      email: formData.get('email') as string,
      pais: (formData.get('pais') as string) || 'España',
      ciudad: (formData.get('ciudad') as string) || '',
      accion: accion,
      tipoProducto: (formData.get('tipoProducto') as string) || 'general',
      modeloMarca: formData.get('modeloMarca') as string,
      estado: (formData.get('estado') as string) || 'buen_estado',
      accesorios: (formData.get('accesorios') as string) || '',
      urgencia: (formData.get('urgencia') as string) || null,
    }

    console.log('📋 [Submit Request Direct] Datos recibidos:', {
      email: data.email ? `${data.email.substring(0, 3)}***` : 'null',
      modeloMarca: data.modeloMarca || 'null',
    })

    // Validar email
    if (!data.email) {
      return NextResponse.json(
        { error: 'El email es obligatorio' },
        { status: 400 }
      )
    }

    const emailValidation = validateEmail(data.email)
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: emailValidation.error || 'El email no es válido' },
        { status: 400 }
      )
    }

    // Verificar límite diario
    const limiteDiario = parseInt(process.env.EVALUACIONES_LIMITE_DIARIO || '1', 10)
    const hasSolicitudToday = await checkSolicitudToday(data.email, limiteDiario)
    if (hasSolicitudToday) {
      const errorMessage = limiteDiario === 1 
        ? 'Solo se puede hacer una evaluación al día'
        : `Solo se pueden hacer ${limiteDiario} evaluaciones al día`
      return NextResponse.json(
        { error: errorMessage, errorCode: 'ONE_PER_DAY' },
        { status: 400 }
      )
    }

    // Validar datos requeridos
    if (!data.accion || !data.modeloMarca) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    // Obtener usuario autenticado (si existe)
    let userId: string | null = null
    try {
      const supabase = await createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (!authError && user) {
        userId = user.id
      }
    } catch (authErr) {
      console.log('ℹ️ [Submit Request Direct] Error al obtener usuario (continuando sin user_id):', authErr)
    }

    // Guardar en base de datos SQL
    const result = await saveSolicitud(data, [], userId)
    const resultAny = result as any
    const insertId = resultAny.insertId || resultAny.id || (Array.isArray(resultAny) ? resultAny[0]?.insertId : null)

    // Obtener idioma
    const languageParam = formData.get('language') as string
    const acceptLanguage = request.headers.get('accept-language') || ''
    const language: 'es' | 'en' = languageParam === 'en' || (acceptLanguage.includes('en') && !acceptLanguage.includes('es')) ? 'en' : 'es'

    // Obtener coordenadas de la IP del usuario
    console.log(`\n${'═'.repeat(80)}`)
    console.log(`🌍 [Submit Request Direct] OBTENIENDO COORDENADAS DE IP DEL USUARIO`)
    console.log(`${'═'.repeat(80)}`)
    const userIP = getUserIP(request)
    console.log(`📋 [Submit Request Direct] IP detectada: ${userIP || 'null'}`)
    let coordenadasIP = null
    if (userIP) {
      try {
        coordenadasIP = await getIPCoordinates(userIP)
        if (coordenadasIP) {
          console.log(`✅ [Submit Request Direct] Coordenadas de IP obtenidas exitosamente`)
          console.log(`📍 [Submit Request Direct] Latitud: ${coordenadasIP.lat}`)
          console.log(`📍 [Submit Request Direct] Longitud: ${coordenadasIP.lon}`)
        } else {
          console.warn(`⚠️ [Submit Request Direct] No se pudieron obtener coordenadas de IP`)
        }
      } catch (error) {
        console.error(`❌ [Submit Request Direct] Error al obtener coordenadas de IP:`, error)
      }
    } else {
      console.warn(`⚠️ [Submit Request Direct] No se pudo detectar la IP del usuario`)
    }
    console.log(`${'═'.repeat(80)}\n`)

    // Ejecutar scraping directo EN SEGUNDO PLANO
    if (insertId) {
      const ejecutarScrapingEnSegundoPlano = async () => {
        try {
          console.log(`\n${'='.repeat(100)}`)
          console.log(`🚀 [Background Direct] INICIANDO BÚSQUEDA DIRECTA EN SEGUNDO PLANO`)
          console.log(`${'='.repeat(100)}`)
          console.log(`📋 [Background Direct] Información de la solicitud:`)
          console.log(`   - ID de solicitud: ${insertId}`)
          console.log(`   - Email: ${data.email}`)
          console.log(`   - Producto: "${data.modeloMarca}"`)
          console.log(`   - Idioma: ${language}`)
          console.log(`${'='.repeat(100)}\n`)

          const categoria = 'general'
          const condicion = 'buen_estado'
          const paisDefault = data.pais || 'España'
          const ciudadDefault = data.ciudad || ''
          const ubicacion = ciudadDefault 
            ? `${paisDefault}/${ciudadDefault}`.toLowerCase()
            : paisDefault.toLowerCase()

          // Ejecutar búsqueda directa (sin filtros)
          const scrapingResult = await runScrapingDirecto({
            producto_text: data.modeloMarca,
            categoria: categoria,
            ubicacion: ubicacion,
            radio_km: 30,
            condicion_objetivo: condicion as any,
            idioma_busqueda: language,
            min_paginas_por_plataforma: 1,
            min_resultados_por_plataforma: 10,
            coordenadas_ip: coordenadasIP || undefined,
          })

          if (scrapingResult) {
            // Guardar resultados del scraping en la base de datos
            // Guardar todos los resultados sin filtrar en total_resultados_scrapping
            await saveScrapingResults(
              insertId,
              {
                producto_text: data.modeloMarca,
                categoria: categoria,
                ubicacion: ubicacion,
                radio_km: 30,
                condicion_objetivo: condicion,
              },
              {
                tablaCompradores: scrapingResult.tablaCompradores,
                tablaVendedores: [],
                jsonCompradores: null, // null para búsqueda directa (solo se guarda en total_resultados_scrapping)
                jsonVendedores: null,
                todasUrlsEncontradas: scrapingResult.todasUrlsEncontradas,
                totalAnunciosAnalizados: scrapingResult.tablaCompradores.length,
                totalAnunciosDescartados: 0,
                totalAnunciosOutliers: 0,
                totalResultadosScrapping: scrapingResult.totalResultadosScrapping, // Todos los resultados sin filtrar
                tipoBusqueda: 'directa', // Marcar como búsqueda directa
              }
            )
            console.log('✅ [Background Direct] Scraping directo ejecutado y guardado correctamente')
            console.log(`   - Compradores: ${scrapingResult.tablaCompradores.length} anuncios`)
          } else {
            console.warn('⚠️ [Background Direct] No se pudo ejecutar el scraping directo')
          }
        } catch (scrapingError) {
          console.error('❌ [Background Direct] Error en el proceso de scraping directo (no crítico):', scrapingError)
        }
      }

      // Ejecutar en segundo plano (sin await - fire and forget)
      ejecutarScrapingEnSegundoPlano().catch((error) => {
        console.error('❌ [Background Direct] Error no capturado en scraping directo:', error)
      })
    }

    // Responder inmediatamente al cliente
    return NextResponse.json(
      { 
        success: true, 
        message: 'Solicitud guardada correctamente',
        id: insertId || null
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error al procesar la solicitud directa:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}

