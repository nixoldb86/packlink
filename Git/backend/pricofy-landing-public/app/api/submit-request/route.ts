import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { saveSolicitud, checkSolicitudToday, saveScrapingResults, getScrapingResultBySolicitudId, updateSolicitudTipoProducto, saveProductosNuevos } from '@/lib/db'
import { validateEmail } from '@/lib/emailValidator'
import { uploadFileToS3, isCloudStorageConfigured } from '@/lib/storage'
import { sendEvaluationConfirmationEmail, sendPDFReportEmail, type EvaluationData } from '@/lib/email'
import { runScraping, scrapeCiaoProductosNuevos } from '@/lib/scraper'
import { generarPDFReporte } from '@/lib/pdf-generator'
import { setupLogger, uploadLogsToCloud } from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'
import { determinarCategoriaProducto, generateSearchVariants } from '@/lib/chatgpt'
import { getUserIP, getIPCoordinates } from '@/lib/utils/ip-geolocation'

// Evitar que Next.js intente pre-renderizar esta ruta durante el build
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Función para guardar en base de datos SQL
async function saveToDatabase(data: any, photoPaths: string[], userId: string | null = null) {
  // Usa la función de lib/db.ts que deberá configurar según tu base de datos
  return await saveSolicitud(data, photoPaths, userId)
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Extraer datos del formulario
    const accion = formData.get('accion') as string
    const data = {
      email: formData.get('email') as string,
      // Valores por defecto para campos que ya no se solicitan en el formulario
      pais: (formData.get('pais') as string) || 'España',
      ciudad: (formData.get('ciudad') as string) || '',
      accion: accion,
      tipoProducto: (formData.get('tipoProducto') as string) || 'general',
      modeloMarca: formData.get('modeloMarca') as string,
      estado: (formData.get('estado') as string) || 'buen_estado',
      accesorios: (formData.get('accesorios') as string) || '',
      urgencia: (formData.get('urgencia') as string) || null,
    }

    // Log de datos recibidos para debugging
    console.log('📋 [Submit Request] Datos recibidos:', {
      email: data.email ? `${data.email.substring(0, 3)}***` : 'null',
      pais: data.pais || 'null',
      ciudad: data.ciudad || 'null',
      accion: data.accion || 'null',
      tipoProducto: data.tipoProducto || 'null',
      modeloMarca: data.modeloMarca || 'null',
      estado: data.estado || 'null',
      urgencia: data.urgencia || 'null',
      tieneAccesorios: !!data.accesorios,
    })

    // Validar email
    if (!data.email) {
      console.error('❌ [Submit Request] Email faltante')
      return NextResponse.json(
        { error: 'El email es obligatorio' },
        { status: 400 }
      )
    }

    const emailValidation = validateEmail(data.email)
    if (!emailValidation.valid) {
      console.error(`❌ [Submit Request] Email inválido: ${emailValidation.error}`)
      return NextResponse.json(
        { error: emailValidation.error || 'El email no es válido' },
        { status: 400 }
      )
    }

    // Verificar si ya existe una solicitud de este email hoy
    // Obtener el límite diario desde variables de entorno (por defecto 1)
    const limiteDiario = parseInt(process.env.EVALUACIONES_LIMITE_DIARIO || '1', 10)
    const hasSolicitudToday = await checkSolicitudToday(data.email, limiteDiario)
    if (hasSolicitudToday) {
      console.warn(`⚠️ [Submit Request] Email ${data.email.substring(0, 3)}*** ha alcanzado el límite diario de ${limiteDiario} evaluación(es)`)
      const errorMessage = limiteDiario === 1 
        ? 'Solo se puede hacer una evaluación al día'
        : `Solo se pueden hacer ${limiteDiario} evaluaciones al día`
      return NextResponse.json(
        { error: errorMessage, errorCode: 'ONE_PER_DAY' },
        { status: 400 }
      )
    }

    // Validar datos requeridos (solo los campos que realmente se solicitan en el formulario)
    const camposFaltantes: string[] = []
    if (!data.accion) camposFaltantes.push('accion')
    if (!data.modeloMarca) camposFaltantes.push('modeloMarca')

    if (camposFaltantes.length > 0) {
      console.error(`❌ [Submit Request] Faltan campos obligatorios: ${camposFaltantes.join(', ')}`)
      return NextResponse.json(
        { error: 'Faltan campos obligatorios', camposFaltantes },
        { status: 400 }
      )
    }

    // Si quiere vender, las fotos son obligatorias
    if (data.accion === 'quiero vender un producto') {
      const fotos = formData.getAll('fotos')
      const tieneFotos = fotos.length > 0 && fotos[0] instanceof File && fotos[0].size > 0
      if (!tieneFotos) {
        console.error(`❌ [Submit Request] Fotos faltantes para vender. Fotos recibidas: ${fotos.length}, tamaño: ${fotos[0] instanceof File ? fotos[0].size : 'N/A'}`)
        return NextResponse.json(
          { error: 'Las fotos son obligatorias para vender' },
          { status: 400 }
        )
      }
    }

    console.log('✅ [Submit Request] Validaciones pasadas, procesando solicitud...')

    // Obtener usuario autenticado (si existe)
    let userId: string | null = null
    try {
      const supabase = await createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (!authError && user) {
        userId = user.id
        console.log(`✅ [Submit Request] Usuario autenticado: ${user.id.substring(0, 8)}...`)
      } else {
        console.log('ℹ️ [Submit Request] Usuario no autenticado, guardando sin user_id')
      }
    } catch (authErr) {
      console.log('ℹ️ [Submit Request] Error al obtener usuario (continuando sin user_id):', authErr)
    }

    // Procesar fotos
    const photoPaths: string[] = []
    const fotos = formData.getAll('fotos')
    const useCloudStorage = isCloudStorageConfigured()
    
    if (fotos.length > 0 && fotos[0] instanceof File) {
      for (const file of fotos) {
        if (file instanceof File && file.size > 0) {
          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)
          
          // Generar nombre único para el archivo
          const timestamp = Date.now()
          const randomStr = Math.random().toString(36).substring(2, 15)
          const extension = file.name.split('.').pop()
          const filename = `${timestamp}-${randomStr}.${extension}`
          
          if (useCloudStorage) {
            // Subir a S3/Backblaze B2
            try {
              const contentType = file.type || 'image/jpeg'
              const publicUrl = await uploadFileToS3(buffer, filename, contentType)
              photoPaths.push(publicUrl)
            } catch (error) {
              console.error('Error uploading to cloud storage:', error)
              // Fallback a almacenamiento local si falla
              const uploadDir = join(process.cwd(), 'public', 'uploads')
              if (!existsSync(uploadDir)) {
                mkdirSync(uploadDir, { recursive: true })
              }
              const filepath = join(uploadDir, filename)
              await writeFile(filepath, buffer)
              photoPaths.push(`/uploads/${filename}`)
            }
          } else {
            // Almacenamiento local (desarrollo)
            const uploadDir = join(process.cwd(), 'public', 'uploads')
            if (!existsSync(uploadDir)) {
              mkdirSync(uploadDir, { recursive: true })
            }
            const filepath = join(uploadDir, filename)
            await writeFile(filepath, buffer)
            photoPaths.push(`/uploads/${filename}`)
          }
        }
      }
    }

    // Guardar en base de datos SQL
    const result = await saveToDatabase(data, photoPaths, userId)

    // Extraer el ID del resultado (PostgreSQL retorna rows[0].id)
    const resultAny = result as any
    const insertId = resultAny.insertId || resultAny.id || (Array.isArray(resultAny) ? resultAny[0]?.insertId : null)

    // Obtener idioma del formulario o detectar desde headers (necesario para el scraping en segundo plano)
    const languageParam = formData.get('language') as string
    const acceptLanguage = request.headers.get('accept-language') || ''
    const language: 'es' | 'en' = languageParam === 'en' || (acceptLanguage.includes('en') && !acceptLanguage.includes('es')) ? 'en' : 'es'

    // Preparar datos para el email de confirmación
    const evaluationData: EvaluationData = {
      accion: data.accion,
      tipoProducto: data.tipoProducto,
      modeloMarca: data.modeloMarca,
      estado: data.estado,
      pais: data.pais,
      ciudad: data.ciudad,
      urgencia: data.urgencia,
      accesorios: data.accesorios,
    }
    
    // Enviar email de confirmación (no bloquea el flujo si falla)
    try {
      await sendEvaluationConfirmationEmail(data.email, evaluationData, language)
    } catch (emailError) {
      console.error('Error enviando email de confirmación (no crítico):', emailError)
      // No bloqueamos el flujo si falla el email
    }

    // Determinar categoría del producto usando ChatGPT (en segundo plano, no bloquea)
    if (insertId) {
      // Capturar idioma antes de entrar en la función asíncrona
      const acceptLanguage = request.headers.get('accept-language') || ''
      const idioma = acceptLanguage.includes('en') && !acceptLanguage.includes('es') ? 'en' : 'es'
      
      const determinarCategoriaEnSegundoPlano = async () => {
        try {
          console.log(`\n🤖 [Categoría] Determinando categoría para producto: "${data.modeloMarca}"`)
          
          // Generar variantes para obtener una mejor descripción del producto
          const variantesResult = await generateSearchVariants(data.modeloMarca, idioma)
          let nombreProductoParaCategoria = data.modeloMarca
          
          // Usar la primera variante si está disponible, sino usar el nombre original
          if (variantesResult.success && variantesResult.variants && variantesResult.variants.length > 0) {
            nombreProductoParaCategoria = variantesResult.variants[0]
            console.log(`   📝 Usando variante para categoría: "${nombreProductoParaCategoria}"`)
          } else {
            console.log(`   📝 Usando nombre original para categoría: "${nombreProductoParaCategoria}"`)
          }
          
          // Determinar categoría con ChatGPT
          const categoriaResult = await determinarCategoriaProducto(nombreProductoParaCategoria)
          
          if (categoriaResult.success && categoriaResult.categoria) {
            // Actualizar el campo tipo_producto en la base de datos
            await updateSolicitudTipoProducto(insertId, categoriaResult.categoria)
            console.log(`✅ [Categoría] Categoría actualizada a: "${categoriaResult.categoria}"`)
          } else {
            console.warn(`⚠️ [Categoría] No se pudo determinar categoría: ${categoriaResult.error || 'Error desconocido'}`)
          }
        } catch (error) {
          console.error('❌ [Categoría] Error determinando categoría (no crítico):', error)
          // No bloqueamos el flujo si falla la determinación de categoría
        }
      }
      
      // Ejecutar en segundo plano sin await (no bloquea la respuesta)
      determinarCategoriaEnSegundoPlano()
    }

    // Obtener coordenadas de la IP del usuario (antes de ejecutar scraping en segundo plano)
    const userIP = getUserIP(request)
    let coordenadasIP = null
    if (userIP) {
      try {
        coordenadasIP = await getIPCoordinates(userIP)
        console.log(`📍 [Submit Request] Coordenadas de IP obtenidas: ${coordenadasIP?.lat}, ${coordenadasIP?.lon}`)
      } catch (error) {
        console.warn(`⚠️ [Submit Request] Error al obtener coordenadas de IP:`, error)
      }
    }

        // Ejecutar scraping automático EN SEGUNDO PLANO (no bloquea la respuesta)
        if (insertId) {
          // Capturar coordenadasIP en el closure
          const coordenadasIPParaScraping = coordenadasIP
          
          // Función asíncrona que se ejecuta en segundo plano
          const ejecutarScrapingEnSegundoPlano = async () => {
            // Capturar tiempo de inicio desde que se reciben los inputs del formulario
            const tiempoInicioFormulario = Date.now()
            
            try {
              // Inicializar logger para capturar todos los logs
              await setupLogger()
              console.log(`\n${'='.repeat(100)}`)
              console.log(`🚀 [Background] INICIANDO SCRAPING AUTOMÁTICO EN SEGUNDO PLANO`)
              console.log(`${'='.repeat(100)}`)
              console.log(`📋 [Background] Información de la solicitud:`)
              console.log(`   - ID de solicitud: ${insertId}`)
              console.log(`   - Email: ${data.email}`)
              console.log(`   - Acción: ${data.accion}`)
              console.log(`   - Producto: "${data.modeloMarca}"`)
              // Determinar idioma de búsqueda
              const acceptLanguage = request.headers.get('accept-language') || ''
              const idioma = acceptLanguage.includes('en') && !acceptLanguage.includes('es') ? 'en' : 'es'
              console.log(`   - Idioma: ${idioma}`)
              console.log(`⏱️ [Background] Tiempo de inicio del proceso completo: ${new Date(tiempoInicioFormulario).toISOString()}`)
              console.log(`${'='.repeat(100)}\n`)
        
        // Categoría por defecto (ya no se solicita en el formulario)
        const categoria = 'general'
        
        // Condición por defecto (ya no se solicita en el formulario)
        const condicion = 'buen_estado'
        
        // Construir ubicación (formato: "país/ciudad") - usar valores por defecto
        const paisDefault = data.pais || 'España'
        const ciudadDefault = data.ciudad || ''
        const ubicacion = ciudadDefault 
          ? `${paisDefault}/${ciudadDefault}`.toLowerCase()
          : paisDefault.toLowerCase()
        
        // Ejecutar scraping
        // Configuración desde variables de entorno (.env.local)
        const minPaginasPorPlataforma = parseInt(process.env.SCRAPING_MIN_PAGINAS_POR_PLATAFORMA || '1', 10)
        const minResultadosPorPlataforma = parseInt(process.env.SCRAPING_MIN_RESULTADOS_POR_PLATAFORMA || '10', 10)
        
        const scrapingResult = await runScraping({
          producto_text: data.modeloMarca,
          categoria: categoria,
          ubicacion: ubicacion,
          radio_km: 30, // Radio por defecto
          condicion_objetivo: condicion as any,
          idioma_busqueda: idioma,
          min_paginas_por_plataforma: minPaginasPorPlataforma,
          min_resultados_por_plataforma: minResultadosPorPlataforma,
          coordenadas_ip: coordenadasIPParaScraping || undefined,
        })

        if (scrapingResult) {
          // Guardar resultados del scraping en la base de datos
          const scrapingSaveResult = await saveScrapingResults(
            insertId,
            {
              producto_text: data.modeloMarca,
              categoria: categoria,
              ubicacion: ubicacion,
              radio_km: 30,
              condicion_objetivo: condicion,
            },
            {
              ...scrapingResult,
              totalResultadosScrapping: scrapingResult.totalResultadosScrapping, // Todos los resultados sin filtrar (antes del análisis inteligente)
              tipoBusqueda: 'completa', // Marcar como búsqueda completa (con varita mágica)
            }
          )
          console.log('✅ Scraping ejecutado y guardado correctamente')
          console.log(`   - Compradores: ${scrapingResult.jsonCompradores?.compradores?.length || 0} anuncios`)
          console.log(`   - Vendedores: ${scrapingResult.jsonVendedores?.vendedores?.length || 0} precios`)

          // Obtener productos nuevos de ciao.es (solo para búsquedas completas)
          if (scrapingSaveResult?.insertId) {
            try {
              console.log('\n🛒 [Ciao] Obteniendo productos nuevos de ciao.es...')
              const productosNuevos = await scrapeCiaoProductosNuevos(data.modeloMarca)
              
              if (productosNuevos.length > 0) {
                console.log(`✅ [Ciao] ${productosNuevos.length} productos nuevos obtenidos`)
                
                // Guardar productos nuevos en la base de datos
                await saveProductosNuevos(
                  scrapingSaveResult.insertId,
                  data.modeloMarca,
                  productosNuevos.map(p => ({
                    title: p.title,
                    description: p.description,
                    price: p.price,
                    currency: p.currency,
                    offerUrl: p.offerUrl,
                    images: p.images
                  }))
                )
              } else {
                console.log('ℹ️ [Ciao] No se encontraron productos nuevos')
              }
            } catch (error) {
              console.error('❌ [Ciao] Error al obtener productos nuevos:', error)
              // No interrumpir el flujo principal si falla ciao.es
            }
          }

          // Generar PDF del reporte
          try {
            console.log('\n📄 [PDF] Generando PDF del reporte...')
            
            // Obtener datos completos del scraping
            const scrapingData = await getScrapingResultBySolicitudId(insertId)
            
            if (scrapingData) {
              // Parsear json_compradores
              const jsonCompradoresParsed = typeof scrapingData.json_compradores === 'string' 
                ? JSON.parse(scrapingData.json_compradores) 
                : scrapingData.json_compradores
              
              // Verificar qué anuncios están en json_compradores antes de generar el PDF
              console.log(`\n📋 [PDF] Verificando anuncios en json_compradores antes de generar PDF...`)
              if (jsonCompradoresParsed?.compradores && jsonCompradoresParsed.compradores.length > 0) {
                console.log(`   ✅ Total anuncios en json_compradores: ${jsonCompradoresParsed.compradores.length}`)
                console.log(`   📋 Lista completa de anuncios que se incluirán en el PDF:`)
                jsonCompradoresParsed.compradores.forEach((comprador: any, index: number) => {
                  console.log(`      ${index + 1}. "${comprador.titulo || comprador.plataforma || 'Sin título'}" - ${comprador.precio_eur || 'Sin precio'}€`)
                  console.log(`         URL: ${comprador.url_anuncio || 'Sin URL'}`)
                  if (comprador.url_anuncio && comprador.url_anuncio.includes('1137269699')) {
                    console.log(`         ⭐ ESTE ES EL ANUNCIO BUSCADO (ID: 1137269699)`)
                  }
                })
                
                // Buscar específicamente el anuncio con ID 1137269699
                const anuncioBuscado = jsonCompradoresParsed.compradores.find((c: any) => 
                  c.url_anuncio && c.url_anuncio.includes('1137269699')
                )
                if (anuncioBuscado) {
                  console.log(`\n   ✅ ANUNCIO ENCONTRADO EN json_compradores:`)
                  console.log(`      Título: "${anuncioBuscado.titulo || 'Sin título'}"`)
                  console.log(`      Precio: ${anuncioBuscado.precio_eur}€`)
                  console.log(`      URL: ${anuncioBuscado.url_anuncio}`)
                  console.log(`      Plataforma: ${anuncioBuscado.plataforma || 'N/A'}`)
                } else {
                  console.log(`\n   ❌ ANUNCIO NO ENCONTRADO en json_compradores (URL con ID 1137269699)`)
                  console.log(`   🔍 Buscando en todas las URLs...`)
                  const todasUrls = scrapingData.todas_urls_encontradas || []
                  const urlEncontrada = todasUrls.find((url: string) => url.includes('1137269699'))
                  if (urlEncontrada) {
                    console.log(`   ⚠️  URL encontrada en todas_urls_encontradas pero NO en json_compradores`)
                    console.log(`      URL: ${urlEncontrada}`)
                  } else {
                    console.log(`   ❌ URL tampoco está en todas_urls_encontradas`)
                  }
                }
              } else {
                console.log(`   ⚠️  json_compradores está vacío o no tiene la estructura esperada`)
              }
              
              // Preparar datos para el PDF
              const pdfData = {
                id: scrapingData.id,
                solicitud_id: scrapingData.solicitud_id,
                producto_text: scrapingData.producto_text,
                categoria: scrapingData.categoria,
                ubicacion: scrapingData.ubicacion,
                radio_km: scrapingData.radio_km,
                condicion_objetivo: scrapingData.condicion_objetivo,
                json_compradores: jsonCompradoresParsed,
                tabla_compradores: typeof scrapingData.tabla_compradores === 'string'
                  ? JSON.parse(scrapingData.tabla_compradores)
                  : scrapingData.tabla_compradores,
                todas_urls_encontradas: scrapingData.todas_urls_encontradas || [],
                total_anuncios_encontrados: scrapingData.total_anuncios_encontrados || 0,
                total_anuncios_filtrados: scrapingData.total_anuncios_filtrados || 0,
                plataformas_consultadas: scrapingData.plataformas_consultadas || [],
                created_at: scrapingData.created_at,
                email: scrapingData.email,
                pais: scrapingData.pais,
                ciudad: scrapingData.ciudad,
                modelo_marca: scrapingData.modelo_marca,
                tipo_producto: scrapingData.tipo_producto,
                estado: scrapingData.estado,
              }

              // Generar nombre único para el PDF
              const timestamp = Date.now()
              const randomStr = Math.random().toString(36).substring(2, 15)
              const pdfFilename = `reporte-${timestamp}-${randomStr}.pdf`
              
              // Ruta temporal local
              const pdfPath = join(process.cwd(), 'public', 'uploads', pdfFilename)
              
              // Asegurar que el directorio existe
              const uploadDir = join(process.cwd(), 'public', 'uploads')
              if (!existsSync(uploadDir)) {
                mkdirSync(uploadDir, { recursive: true })
              }

              // Generar PDF
              await generarPDFReporte(pdfData, pdfPath)
              console.log(`✅ PDF generado: ${pdfFilename}`)

              // Enviar PDF por email al cliente
              try {
                console.log(`📧 [Background] Enviando PDF por email a: ${scrapingData.email}`)
                await sendPDFReportEmail(scrapingData.email, pdfPath, idioma as 'es' | 'en')
                console.log(`✅ [Background] PDF enviado por email correctamente`)
              } catch (emailError) {
                console.error('⚠️ [Background] Error enviando PDF por email (no crítico):', emailError)
                // Continuar aunque falle el email
              }

              // Subir PDF a Backblaze si está configurado
              const useCloudStorage = isCloudStorageConfigured()
              if (useCloudStorage) {
                try {
                  const pdfBuffer = await readFile(pdfPath)
                  const pdfUrl = await uploadFileToS3(pdfBuffer, pdfFilename, 'application/pdf')
                  console.log(`✅ PDF subido a Backblaze: ${pdfUrl}`)
                  
                  // Opcional: Eliminar archivo local después de subir
                  // await unlink(pdfPath)
                } catch (uploadError) {
                  console.error('⚠️ Error subiendo PDF a Backblaze:', uploadError)
                  // Continuar con el archivo local
                }
              }
            } else {
              console.warn('⚠️ No se pudieron obtener los datos del scraping para generar el PDF')
            }
          } catch (pdfError) {
            console.error('❌ [Background] Error generando PDF (no crítico):', pdfError)
            // No bloqueamos el flujo si falla la generación del PDF
          }
        } else {
          console.warn('⚠️ [Background] No se pudo ejecutar el scraping')
          // No bloqueamos el flujo - la solicitud ya está guardada
        }
        } catch (scrapingError) {
          console.error('❌ [Background] Error en el proceso de scraping automático (no crítico):', scrapingError)
          // No bloqueamos el flujo - la solicitud ya está guardada
        } finally {
          // Subir logs a Backblaze B2 en Vercel
          try {
            const logUrl = await uploadLogsToCloud()
            if (logUrl) {
              console.log(`📤 [Background] Logs completos disponibles en: ${logUrl}`)
            }
          } catch (logError) {
            console.error('⚠️ [Background] Error subiendo logs (no crítico):', logError)
          }
        }
      }

      // Ejecutar en segundo plano (sin await - fire and forget)
      ejecutarScrapingEnSegundoPlano().catch((error) => {
        console.error('❌ [Background] Error no capturado en scraping en segundo plano:', error)
      })
    }

    // Responder inmediatamente al cliente (sin esperar el scraping)
    return NextResponse.json(
      { 
        success: true, 
        message: 'Solicitud guardada correctamente',
        id: insertId || null
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error al procesar la solicitud:', error)
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
