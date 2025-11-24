// Scraper para Wallapop usando la API REST (más rápido y compatible con Vercel)
import { ScrapingInputs, AnuncioRaw, PlataformaScraper } from './types'
import { geocodificarConCache } from './geocoding'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export class WallapopScraper implements PlataformaScraper {
  nombre = 'wallapop'

  /**
   * Busca productos en Wallapop usando la API REST
   */
  async buscar(inputs: ScrapingInputs): Promise<AnuncioRaw[]> {
    console.log(`\n${'═'.repeat(80)}`)
    console.log(`🕷️ [Wallapop] INICIANDO BÚSQUEDA EN WALLAPOP`)
    console.log(`${'═'.repeat(80)}`)
    console.log(`📋 [Wallapop] Parámetros de búsqueda:`)
    console.log(`   - Producto: "${inputs.producto_text}"`)
    console.log(`   - Ubicación: "${inputs.ubicacion}"`)
    console.log(`   - Radio: ${inputs.radio_km}km`)
    console.log(`${'═'.repeat(80)}\n`)
    
    const anuncios: AnuncioRaw[] = []

    try {
      // Geocodificar ubicación
      console.log(`📍 [Wallapop] Paso 1: Geocodificando ubicación: "${inputs.ubicacion}"`)
      const tiempoInicioGeocod = Date.now()
      let coordenadas = await geocodificarConCache(inputs.ubicacion)
      const tiempoGeocod = Date.now() - tiempoInicioGeocod
      
      // Fallback a coordenadas de Madrid si la geocodificación falla
      if (!coordenadas) {
        console.warn(`⚠️ [Wallapop] No se pudo geocodificar: ${inputs.ubicacion}`)
        console.warn(`⚠️ [Wallapop] Usando coordenadas fallback (Madrid) para continuar`)
        coordenadas = {
          lat: 40.4168,
          lon: -3.7038,
          ciudad: 'madrid',
          pais: 'españa',
        }
      }
      
      console.log(`✅ [Wallapop] Geocodificación completada en ${tiempoGeocod}ms`)
      console.log(`   📍 Coordenadas: ${coordenadas.lat}, ${coordenadas.lon}`)
      console.log(`   📍 Ciudad: ${coordenadas.ciudad}, País: ${coordenadas.pais}`)

      // Obtener coordenadas de la IP del usuario (si están disponibles)
      console.log(`\n${'═'.repeat(80)}`)
      console.log(`📍 [Wallapop] VERIFICANDO COORDENADAS DE IP`)
      console.log(`${'═'.repeat(80)}`)
      const coordenadasIP = inputs.coordenadas_ip || null
      const lat = coordenadasIP?.lat || 40.4259419
      const lon = coordenadasIP?.lon || -3.5654669
      
      if (coordenadasIP) {
        console.log(`✅ [Wallapop] Coordenadas de IP disponibles`)
        console.log(`📍 [Wallapop] Latitud: ${lat}`)
        console.log(`📍 [Wallapop] Longitud: ${lon}`)
        console.log(`📍 [Wallapop] Origen: IP del usuario`)
      } else {
        console.log(`⚠️ [Wallapop] No hay coordenadas de IP disponibles, usando coordenadas por defecto`)
        console.log(`📍 [Wallapop] Latitud: ${lat} (Madrid por defecto)`)
        console.log(`📍 [Wallapop] Longitud: ${lon} (Madrid por defecto)`)
        console.log(`📍 [Wallapop] Origen: Coordenadas por defecto`)
      }
      console.log(`${'═'.repeat(80)}\n`)

      // Construir URL de la API de Wallapop
      console.log(`\n🔗 [Wallapop] Paso 2: Construyendo URL de la API...`)
      const keywords = encodeURIComponent(inputs.producto_text.trim())
      //const wallapopApiUrl = `https://api.wallapop.com/api/v3/search?source=search_box&keywords=${keywords}&order_by=price_low_to_high`
      const wallapopApiUrl = `https://api.wallapop.com/api/v3/search?source=search_box&keywords=${keywords}&order_by=most_relevance&latitude=${lat}&longitude=${lon}&distance_in_km=300`

      console.log(`   🔗 URL base: ${wallapopApiUrl}`)
      console.log(`   📊 Parámetros:`)
      console.log(`      - Keywords: "${inputs.producto_text}" (encoded: "${keywords}")`)
      console.log(`      - Order by: most_relevance`)
      console.log(`      - Source: search_box`)

      // Verificar si ScraperAPI está configurado
      console.log(`\n🔐 [Wallapop] Paso 3: Verificando configuración de ScraperAPI...`)
      const scraperApiKey = process.env.SCRAPERAPI_KEY
      const useScraperAPI = !!scraperApiKey
      console.log(`   ${useScraperAPI ? '✅' : '❌'} ScraperAPI: ${useScraperAPI ? 'CONFIGURADO' : 'NO CONFIGURADO'}`)
      if (useScraperAPI) {
        console.log(`   🔑 API Key: ${scraperApiKey?.substring(0, 10)}...${scraperApiKey?.substring(scraperApiKey.length - 4)}`)
      }

      // Construir URL final (a través de ScraperAPI si está configurado, o directo)
      console.log(`\n🔗 [Wallapop] Paso 4: Construyendo URL final y headers...`)
      let apiUrl: string
      let headers: Record<string, string> = {}

      if (useScraperAPI) {
        // Usar ScraperAPI para evitar bloqueos
        // ScraperAPI es un servicio de proxy que ayuda a evitar bloqueos de IP desde Vercel
        // Wallapop puede bloquear peticiones desde IPs de Vercel, por eso usamos un proxy
        const encodedUrl = encodeURIComponent(wallapopApiUrl)
        apiUrl = `https://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodedUrl}&country_code=es`
        console.log(`🔐 [Wallapop] Usando ScraperAPI para evitar bloqueos de IP`)
        console.log(`   ℹ️  Razón: Wallapop puede bloquear peticiones desde IPs de Vercel`)
        console.log(`   ℹ️  ScraperAPI actúa como proxy para evitar estos bloqueos`)
        console.log(`🌍 [Wallapop] País configurado: ES (España)`)
        // ScraperAPI maneja los headers automáticamente, no necesitamos enviarlos
      } else {
        // Fallback a fetch directo (puede fallar en Vercel)
        apiUrl = wallapopApiUrl
        console.log(`⚠️ [Wallapop] SCRAPERAPI_KEY no configurada, usando fetch directo`)
        console.log(`   ⚠️  ADVERTENCIA: Esto puede fallar en Vercel si Wallapop bloquea las IPs`)
        console.log(`   💡 SOLUCIÓN: Configura SCRAPERAPI_KEY en tus variables de entorno`)
        
        // Headers para la petición API
        headers = {
          'Accept': 'application/json, text/plain, */*',
          'Connection': 'keep-alive',
          'Origin': 'https://es.wallapop.com',
          'Referer': 'https://es.wallapop.com/',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-site',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
          'accept-language': 'es,es-ES;q=0.9',
          'deviceos': '0',
          'mpid': '-7642576994878701018',
          'sec-ch-ua': '"Google Chrome";v="141", "Not?A_Brand";v="8"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'x-appversion': '812940',
          'x-deviceos': '0',
        }
      }

      // Timeout: más largo si usamos ScraperAPI (puede ser más lento), más corto si es directo
      const timeoutMs = useScraperAPI ? 15000 : 5000
      
      // Generar comando curl para logs
      let curlCommand = ''
      if (useScraperAPI) {
        // Curl para ScraperAPI
        const headersForCurl = Object.entries(headers).map(([k, v]) => `  -H '${k}: ${v}'`).join(' \\\n')
        curlCommand = `curl -X GET '${apiUrl}'`
      } else {
        // Curl directo a Wallapop
        const headersForCurl = Object.entries(headers)
          .map(([k, v]) => `  -H '${k}: ${v}'`)
          .join(' \\\n')
        curlCommand = `curl -X GET '${apiUrl}' \\\n${headersForCurl}`
      }
      
      console.log(`🌐 [Wallapop] Realizando petición a la API...`)
      console.log(`🔗 [Wallapop] URL: ${apiUrl.substring(0, 100)}...`)
      console.log(`⏱️ [Wallapop] Timeout configurado: ${timeoutMs}ms`)
      console.log(`\n📋 [Wallapop] Comando curl equivalente:`)
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
      console.log(curlCommand)
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)
      const startTime = Date.now()
      
      // Verificar si estamos en Vercel
      const isVercelEnv = process.env.VERCEL === '1' || process.env.VERCEL === 'true'
      console.log(`🌍 [Wallapop] Entorno: ${isVercelEnv ? 'Vercel' : 'Local'}`)
      
      // Función wrapper que garantiza que el timeout se ejecute
      const fetchWithTimeout = async (url: string, timeout: number, useProxy: boolean): Promise<Response> => {
        return new Promise(async (resolve, reject) => {
          // Crear AbortController
          const abortController = new AbortController()
          
          // Configurar timeout que SIEMPRE se ejecutará
          const timeoutId = setTimeout(() => {
            const elapsed = Date.now() - startTime
            console.error(`⏰ [Wallapop] ⚠️ TIMEOUT TRIGGERED después de ${elapsed}ms (límite: ${timeout}ms)`)
            console.error(`⏰ [Wallapop] Abortando fetch...`)
            abortController.abort()
            const errorMsg = useProxy
              ? `Timeout: La petición a través de ScraperAPI excedió ${timeout}ms`
              : `Timeout: La petición excedió ${timeout}ms - Posible bloqueo de Wallapop desde Vercel`
            reject(new Error(errorMsg))
          }, timeout)
          
          // Log periódico para verificar que el código sigue ejecutándose
          const progressInterval = setInterval(() => {
            const elapsed = Date.now() - startTime
            if (elapsed < timeout + 1000) {
              const proxyInfo = useProxy ? ' (vía ScraperAPI)' : ''
              console.log(`⏳ [Wallapop] Heartbeat${proxyInfo} - Esperando respuesta... (${elapsed}ms / ${timeout}ms)`)
            } else {
              clearInterval(progressInterval)
            }
          }, 2000) // Log cada 2 segundos
          
          const proxyInfo = useProxy ? ' vía ScraperAPI' : ' directo'
          if (useProxy) {
            console.log(`📡 [Wallapop] Iniciando fetch${proxyInfo} con timeout de ${timeout}ms...`)
            console.log(`   ℹ️  ScraperAPI se usa para evitar bloqueos de IP desde Vercel`)
            console.log(`   ℹ️  Si no tienes SCRAPERAPI_KEY configurada, se usará fetch directo (puede fallar)`)
          } else {
            console.log(`📡 [Wallapop] Iniciando fetch${proxyInfo} con timeout de ${timeout}ms...`)
            console.log(`   ℹ️  Fetch directo a Wallapop (sin proxy)`)
          }
          
          try {
            // Preparar opciones de fetch
            const fetchOptions: RequestInit = {
              method: 'GET',
              signal: abortController.signal,
            }
            
            // Solo agregar headers si NO usamos ScraperAPI (ScraperAPI los maneja automáticamente)
            if (!useProxy && Object.keys(headers).length > 0) {
              fetchOptions.headers = headers
            }
            
            // Ejecutar fetch
            const response = await fetch(url, fetchOptions)
            
            // Limpiar timeouts e intervals
            clearTimeout(timeoutId)
            clearInterval(progressInterval)
            
            const fetchTime = Date.now() - startTime
            console.log(`✅ [Wallapop] Respuesta recibida en ${fetchTime}ms`)
            
            // Verificar si ScraperAPI retornó un error
            if (useProxy && !response.ok) {
              try {
                const errorText = await response.text()
                console.error(`❌ [Wallapop] ScraperAPI retornó error ${response.status}: ${errorText.substring(0, 200)}`)
                if (errorText.includes('account') || errorText.includes('quota') || errorText.includes('limit')) {
                  console.error(`❌ [Wallapop] ⚠️ Posible problema con la cuenta de ScraperAPI (quota agotada o API key inválida)`)
                  console.error(`❌ [Wallapop] Verifica tu cuenta en https://www.scraperapi.com/dashboard`)
                }
              } catch (parseError) {
                // Si no se puede parsear el error, continuar
                console.error(`❌ [Wallapop] Error HTTP ${response.status} de ScraperAPI`)
              }
            }
            
            resolve(response)
          } catch (error) {
            // Limpiar timeouts e intervals
            clearTimeout(timeoutId)
            clearInterval(progressInterval)
            
            const fetchTime = Date.now() - startTime
            
            if (error instanceof Error) {
              if (error.name === 'AbortError' || error.message.includes('aborted') || error.message.includes('Timeout')) {
                console.error(`❌ [Wallapop] TIMEOUT después de ${fetchTime}ms: La petición fue abortada`)
                if (useProxy) {
                  console.error(`❌ [Wallapop] ⚠️ ScraperAPI está tardando demasiado o hay un problema de conexión`)
                } else {
                  console.error(`❌ [Wallapop] ⚠️ DIAGNÓSTICO: Wallapop probablemente está bloqueando peticiones desde Vercel`)
                  console.error(`❌ [Wallapop] SOLUCIÓN: Configura SCRAPERAPI_KEY para usar proxy`)
                }
              } else {
                console.error(`❌ [Wallapop] Error de red después de ${fetchTime}ms:`, error.message)
                console.error(`❌ [Wallapop] Error name: ${error.name}`)
                if ('cause' in error && error.cause) {
                  console.error(`❌ [Wallapop] Error cause:`, error.cause)
                }
              }
            } else {
              console.error(`❌ [Wallapop] Error no identificado después de ${fetchTime}ms:`, error)
            }
            reject(error)
          }
        })
      }
      
      let response: Response
      try {
        // Usar el wrapper con timeout garantizado
        response = await fetchWithTimeout(apiUrl, timeoutMs, useScraperAPI)
      } catch (error) {
        // Si falla, retornar array vacío en lugar de lanzar error
        // Esto permite que el scraping continúe con otras plataformas
        console.error(`❌ [Wallapop] No se pudo obtener respuesta de Wallapop`)
        console.error(`⚠️ [Wallapop] Continuando sin resultados de Wallapop...`)
        return anuncios // Retornar array vacío para no bloquear el proceso
      }

      // Obtener el texto de la respuesta antes de verificar el status
      // Esto es necesario porque el body solo se puede leer una vez
      const responseText = await response.text()

      if (!response.ok) {
        console.warn(`⚠️ [Wallapop] Error HTTP ${response.status}: ${response.statusText}`)
        // Guardar respuesta de error también
        try {
          const logDir = join(process.cwd(), 'logs')
          if (!existsSync(logDir)) {
            await mkdir(logDir, { recursive: true })
          }
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
          const filename = `wallapop-error-${timestamp}.json`
          const filePath = join(logDir, filename)
          await writeFile(filePath, JSON.stringify({
            status: response.status,
            statusText: response.statusText,
            url: apiUrl,
            error: responseText,
            timestamp: new Date().toISOString()
          }, null, 2), 'utf-8')
          console.log(`💾 [Wallapop] Respuesta de error guardada en: ${filePath}`)
        } catch (logError) {
          console.error(`❌ [Wallapop] Error guardando respuesta de error:`, logError)
        }
        return anuncios
      }

      console.log(`✅ [Wallapop] Parseando respuesta JSON...`)
      let data: any
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error(`❌ [Wallapop] Error parseando JSON:`, parseError)
        // Guardar el texto sin parsear
        try {
          const logDir = join(process.cwd(), 'logs')
          if (!existsSync(logDir)) {
            await mkdir(logDir, { recursive: true })
          }
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
          const filename = `wallapop-parse-error-${timestamp}.txt`
          const filePath = join(logDir, filename)
          await writeFile(filePath, responseText, 'utf-8')
          console.log(`💾 [Wallapop] Respuesta sin parsear guardada en: ${filePath}`)
        } catch (logError) {
          console.error(`❌ [Wallapop] Error guardando respuesta sin parsear:`, logError)
        }
        return anuncios
      }
      
      // Guardar la respuesta JSON en logs
      try {
        const logDir = join(process.cwd(), 'logs')
        if (!existsSync(logDir)) {
          await mkdir(logDir, { recursive: true })
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const productoSanitizado = inputs.producto_text.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)
        const filename = `wallapop-response-${productoSanitizado}-${timestamp}.json`
        const filePath = join(logDir, filename)
        await writeFile(filePath, JSON.stringify({
          url: apiUrl,
          timestamp: new Date().toISOString(),
          producto: inputs.producto_text,
          ubicacion: inputs.ubicacion,
          response: data
        }, null, 2), 'utf-8')
        console.log(`💾 [Wallapop] Respuesta guardada en: ${filePath}`)
      } catch (logError) {
        console.error(`❌ [Wallapop] Error guardando respuesta en logs:`, logError)
        // Continuar aunque falle el logging
      }
      
      // Extraer items de la primera página
      console.log(`\n📊 [Wallapop] Paso 6: Procesando respuesta de la primera página...`)
      // La estructura real es: data.section.payload.items
      let todosItems = data?.data?.section?.payload?.items || data?.data?.items || data?.items || []
      console.log(`   ✅ Items extraídos: ${todosItems.length}`)
      if (todosItems.length > 0) {
        console.log(`   📋 Primeros 3 items (estructura completa):`)
        todosItems.slice(0, 3).forEach((item: any, i: number) => {
          const titulo = item.title || item.name || item.product_name || item.label || 'Sin título'
          const precio = item.price?.amount || item.price || 'Sin precio'
          console.log(`      ${i + 1}. Título: "${titulo}" - Precio: ${precio}€`)
          // Mostrar campos adicionales que puedan contener información de marca
          if (item.brand || item.manufacturer || item.category || item.subcategory) {
            console.log(`         📌 Campos adicionales:`)
            if (item.brand) console.log(`            - brand: "${item.brand}"`)
            if (item.manufacturer) console.log(`            - manufacturer: "${item.manufacturer}"`)
            if (item.category) console.log(`            - category: "${item.category}"`)
            if (item.subcategory) console.log(`            - subcategory: "${item.subcategory}"`)
          }
        })
      }
      
      // Obtener next_page para paginación
      let nextPage = data?.meta?.next_page
      const maxPages = parseInt(process.env.WALLAPOP_MAX_PAGES || '10', 10)
      let paginaActual = 1
      
      // Hacer llamadas adicionales si hay next_page y no hemos alcanzado el máximo
      // IMPORTANTE: Verificar paginaActual ANTES de incrementar para evitar bucles infinitos
      while (nextPage && paginaActual < maxPages) {
        paginaActual++
        console.log(`\n📄 [Wallapop] Obteniendo página ${paginaActual}/${maxPages}...`)
        
        // Verificación de seguridad: si por alguna razón excedemos el límite, salir inmediatamente
        if (paginaActual > maxPages) {
          console.log(`🛑 [Wallapop] Límite de páginas excedido (${paginaActual} > ${maxPages}), deteniendo paginación`)
          break
        }
        
        try {
          // Construir URL para la siguiente página
          // Usar coordenadas de IP si están disponibles, sino usar coordenadas de ubicación
          const latPagina = coordenadasIP?.lat || coordenadas.lat
          const lonPagina = coordenadasIP?.lon || coordenadas.lon
          let nextPageUrl = `https://api.wallapop.com/api/v3/search?next_page=${encodeURIComponent(nextPage)}&source=deep_link&latitude=${latPagina}&longitude=${lonPagina}&distance_in_km=300`
          
          // Si usamos ScraperAPI, construir URL a través del proxy
          if (useScraperAPI && scraperApiKey) {
            const encodedNextUrl = encodeURIComponent(nextPageUrl)
            nextPageUrl = `https://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodedNextUrl}&country_code=es`
          }
          
          // Generar comando curl para esta página
          let nextCurlCommand = ''
          if (useScraperAPI) {
            nextCurlCommand = `curl -X GET '${nextPageUrl}'`
          } else {
            const headersForCurl = Object.entries(headers)
              .map(([k, v]) => `  -H '${k}: ${v}'`)
              .join(' \\\n')
            nextCurlCommand = `curl -X GET '${nextPageUrl}' \\\n${headersForCurl}`
          }
          
          console.log(`🔍 [Wallapop] Consultando página ${paginaActual}: ${nextPageUrl.substring(0, 100)}...`)
          console.log(`\n📋 [Wallapop] Comando curl para página ${paginaActual}:`)
          console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
          console.log(nextCurlCommand)
          console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)
          
          // Timeout de 10 segundos para cada petición (aumentado para Vercel)
          const nextTimeoutMs = 10000
          const nextStartTime = Date.now()
          
          // Crear AbortController para poder cancelar el fetch si hay timeout
          const nextAbortController = new AbortController()
          let nextTimeoutId: NodeJS.Timeout | null = null
          
          // Preparar opciones de fetch para la siguiente página
          const nextFetchOptions: RequestInit = {
            method: 'GET',
            signal: nextAbortController.signal,
          }
          
          // Solo agregar headers si NO usamos ScraperAPI
          if (!useScraperAPI && Object.keys(headers).length > 0) {
            nextFetchOptions.headers = headers
          }
          
          // Configurar timeout que cancela el fetch
          nextTimeoutId = setTimeout(() => {
            const elapsed = Date.now() - nextStartTime
            console.error(`⏰ [Wallapop] Timeout en página ${paginaActual} después de ${elapsed}ms (límite: ${nextTimeoutMs}ms)`)
            console.error(`🛑 [Wallapop] Cancelando fetch de página ${paginaActual}...`)
            nextAbortController.abort()
          }, nextTimeoutMs)
          
          let nextResponse: Response
          try {
            nextResponse = await fetch(nextPageUrl, nextFetchOptions)
            
            // Limpiar timeout si la petición fue exitosa
            if (nextTimeoutId) {
              clearTimeout(nextTimeoutId)
              nextTimeoutId = null
            }
            
            const nextFetchTime = Date.now() - nextStartTime
            console.log(`⏱️ [Wallapop] Página ${paginaActual} recibida en ${nextFetchTime}ms`)
          } catch (nextError) {
            // Limpiar timeout si hay error
            if (nextTimeoutId) {
              clearTimeout(nextTimeoutId)
              nextTimeoutId = null
            }
            
            const nextFetchTime = Date.now() - nextStartTime
            if (nextError instanceof Error && (nextError.name === 'AbortError' || nextError.message.includes('Timeout') || nextError.message.includes('aborted'))) {
              console.error(`❌ [Wallapop] Timeout en página ${paginaActual} después de ${nextFetchTime}ms`)
              console.error(`🛑 [Wallapop] Deteniendo paginación debido al timeout`)
            } else {
              console.error(`❌ [Wallapop] Error en página ${paginaActual} después de ${nextFetchTime}ms:`, nextError)
              console.error(`🛑 [Wallapop] Deteniendo paginación debido al error`)
            }
            // Limpiar nextPage para evitar que el bucle continúe
            nextPage = null
            throw nextError
          }
          
          // Obtener el texto de la respuesta antes de verificar el status
          const nextResponseText = await nextResponse.text()

          if (!nextResponse.ok) {
            console.warn(`⚠️ [Wallapop] Error HTTP ${nextResponse.status} en página ${paginaActual}: ${nextResponse.statusText}`)
            console.warn(`🛑 [Wallapop] Deteniendo paginación debido al error HTTP`)
            // Guardar respuesta de error
            try {
              const logDir = join(process.cwd(), 'logs')
              if (!existsSync(logDir)) {
                await mkdir(logDir, { recursive: true })
              }
              const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
              const filename = `wallapop-error-page${paginaActual}-${timestamp}.json`
              const filePath = join(logDir, filename)
              await writeFile(filePath, JSON.stringify({
                status: nextResponse.status,
                statusText: nextResponse.statusText,
                url: nextPageUrl,
                pagina: paginaActual,
                error: nextResponseText,
                timestamp: new Date().toISOString()
              }, null, 2), 'utf-8')
              console.log(`💾 [Wallapop] Respuesta de error (página ${paginaActual}) guardada en: ${filePath}`)
            } catch (logError) {
              console.error(`❌ [Wallapop] Error guardando respuesta de error:`, logError)
            }
            // Limpiar nextPage para evitar que el bucle continúe
            nextPage = null
            break // Salir del bucle si hay error
          }
          
          let nextData: any
          try {
            nextData = JSON.parse(nextResponseText)
          } catch (parseError) {
            console.error(`❌ [Wallapop] Error parseando JSON de página ${paginaActual}:`, parseError)
            // Guardar el texto sin parsear
            try {
              const logDir = join(process.cwd(), 'logs')
              if (!existsSync(logDir)) {
                await mkdir(logDir, { recursive: true })
              }
              const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
              const filename = `wallapop-parse-error-page${paginaActual}-${timestamp}.txt`
              const filePath = join(logDir, filename)
              await writeFile(filePath, nextResponseText, 'utf-8')
              console.log(`💾 [Wallapop] Respuesta sin parsear (página ${paginaActual}) guardada en: ${filePath}`)
            } catch (logError) {
              console.error(`❌ [Wallapop] Error guardando respuesta sin parsear:`, logError)
            }
            nextPage = null
            break
          }
          
          // Guardar la respuesta JSON de la página adicional
          try {
            const logDir = join(process.cwd(), 'logs')
            if (!existsSync(logDir)) {
              await mkdir(logDir, { recursive: true })
            }
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
            const productoSanitizado = inputs.producto_text.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)
            const filename = `wallapop-response-${productoSanitizado}-page${paginaActual}-${timestamp}.json`
            const filePath = join(logDir, filename)
            await writeFile(filePath, JSON.stringify({
              url: nextPageUrl,
              timestamp: new Date().toISOString(),
              producto: inputs.producto_text,
              ubicacion: inputs.ubicacion,
              pagina: paginaActual,
              response: nextData
            }, null, 2), 'utf-8')
            console.log(`💾 [Wallapop] Respuesta de página ${paginaActual} guardada en: ${filePath}`)
          } catch (logError) {
            console.error(`❌ [Wallapop] Error guardando respuesta de página ${paginaActual} en logs:`, logError)
            // Continuar aunque falle el logging
          }
          
          // Extraer items de esta página
          const itemsPagina = nextData?.data?.section?.payload?.items || nextData?.data?.items || nextData?.items || []
          console.log(`📊 [Wallapop] Página ${paginaActual}: ${itemsPagina.length} items`)
          
          // Agregar items a la lista total
          todosItems = [...todosItems, ...itemsPagina]
          console.log(`📊 [Wallapop] Total acumulado: ${todosItems.length} items`)
          
          // Obtener next_page para la siguiente iteración
          nextPage = nextData?.meta?.next_page
          
          if (!nextPage) {
            console.log(`✅ [Wallapop] No hay más páginas disponibles`)
            break
          }
          
          // Verificación adicional: si llegamos al máximo de páginas, salir
          if (paginaActual >= maxPages) {
            console.log(`✅ [Wallapop] Límite de páginas alcanzado (${maxPages})`)
            nextPage = null // Limpiar para asegurar que el bucle termine
            break
          }
        } catch (error) {
          console.error(`❌ [Wallapop] Error obteniendo página ${paginaActual}:`, error)
          if (error instanceof Error && error.name === 'AbortError') {
            console.error(`❌ [Wallapop] Timeout en página ${paginaActual}`)
          }
          // IMPORTANTE: Limpiar nextPage para evitar bucle infinito
          nextPage = null
          console.log(`🛑 [Wallapop] Deteniendo paginación debido al error`)
          break // Salir del bucle si hay error
        }
      }
      
      console.log(`\n✅ [Wallapop] Paginación completada: ${paginaActual} páginas consultadas, ${todosItems.length} items totales`)
      
      const items = todosItems

      if (items.length === 0) {
        console.warn(`⚠️ [Wallapop] No se encontraron resultados en la API`)
        return anuncios
      }

      // Procesar cada item
      for (const item of items) {
        try {
          // Extraer título: intentar múltiples campos posibles
          // La API de Wallapop puede tener el título en diferentes campos
          const titulo = item.title || item.name || item.product_name || item.label || ''
          
          // Extraer descripción: intentar múltiples campos posibles
          const descripcion = item.description || item.desc || item.details || ''
          
          // Extraer precio: puede estar en price.amount o directamente en price
          const precioAmount = item.price?.amount || item.price || 0
          const moneda = item.price?.currency || 'EUR'
          
          // Extraer web_slug para construir la URL
          const webSlug = item.web_slug || item.slug || item.id?.toString() || ''
          
          // Extraer ciudad: puede estar en location.city o directamente en city
          const ciudad = item.location?.city || item.city || ''
          
          // Extraer country_code: puede estar en location.country_code o directamente en country_code
          const countryCode = item.location?.country_code || item.country_code || ''
          
          // Extraer timestamp de creación
          const createdAt = item.created_at || item.createdAt || item.date // Timestamp en milisegundos
          
          // Construir URL del anuncio
          const urlAnuncio = webSlug 
            ? `https://es.wallapop.com/item/${webSlug}`
            : null

          if (!titulo || !urlAnuncio) {
            console.warn(`⚠️ [Wallapop] Item sin título o URL válida, omitiendo`)
            if (anuncios.length < 3) {
              console.warn(`   📋 Item omitido:`, {
                title: item.title,
                name: item.name,
                product_name: item.product_name,
                label: item.label,
                web_slug: item.web_slug,
                slug: item.slug,
                id: item.id,
              })
            }
            continue
          }

          // Convertir precio a número si es string
          let precioEur = 0
          if (typeof precioAmount === 'number') {
            precioEur = precioAmount
          } else if (typeof precioAmount === 'string') {
            precioEur = parseFloat(precioAmount.replace(/[^\d.,]/g, '').replace(',', '.')) || 0
          }

          // El estado se infiere después del filtrado en el processor
          // Por ahora, dejamos undefined para que se infiera más tarde
          const estadoInferido: string | undefined = undefined

          // Convertir timestamp a fecha legible (opcional)
          let fechaPublicacion: string | undefined = undefined
          if (createdAt && typeof createdAt === 'number') {
            try {
              const fecha = new Date(createdAt)
              fechaPublicacion = fecha.toISOString().split('T')[0] // Formato YYYY-MM-DD
            } catch {
              // Si falla la conversión, ignorar
            }
          }

          // Si hay información de marca en campos adicionales, agregarla al título o descripción
          // Esto ayuda cuando el título no menciona la marca explícitamente
          let tituloFinal = titulo.trim()
          let descripcionFinal = descripcion.trim()
          
          // Si hay campo "brand" o "manufacturer", agregarlo a la descripción si no está en el título
          const marca = item.brand || item.manufacturer || item.brand_name
          if (marca && typeof marca === 'string') {
            const marcaNormalizada = marca.toLowerCase().trim()
            const tituloNormalizado = tituloFinal.toLowerCase()
            
            // Si la marca no está en el título, agregarla a la descripción para mejorar el matching
            if (!tituloNormalizado.includes(marcaNormalizada)) {
              descripcionFinal = descripcionFinal 
                ? `${descripcionFinal} ${marca}`.trim()
                : marca
            }
          }
          
          // Extraer campos adicionales del item
          // images es un array, obtener el 'small' del primer elemento
          const productImage = (Array.isArray(item.images) && item.images.length > 0)
            ? (item.images[0]?.urls?.small || item.images[0]?.small || null)
            : (item.images?.urls?.small || item.images?.small || item.image?.small || null)
          const isShippable = item.shipping?.item_is_shippable ?? item.is_shippable ?? null
          const isTopProfile = item.is_top_profile?.flag ?? item.is_top_profile ?? null
          const userId = item.user_id?.toString() || item.user?.id?.toString() || null
          
          anuncios.push({
            plataforma: 'wallapop',
            titulo: tituloFinal,
            precio: precioEur,
            precio_eur: precioEur,
            moneda_original: moneda,
            descripcion: descripcionFinal || undefined,
            estado_inferido: estadoInferido || undefined,
            ciudad_o_zona: ciudad || undefined,
            url_anuncio: urlAnuncio,
            fecha_publicacion: fechaPublicacion,
            verificado_tarjeta: false,
            id_anuncio: item.id?.toString() || undefined,
            product_image: productImage,
            is_shippable: isShippable,
            is_top_profile: isTopProfile,
            user_id: userId,
            country_code: countryCode || undefined,
          })
        } catch (error) {
          console.error(`❌ [Wallapop] Error procesando item:`, error)
        }
      }

      console.log(`✅ [Wallapop] Búsqueda completada: ${anuncios.length} anuncios procesados de ${items.length} items`)

    } catch (error) {
      console.error(`❌ [Wallapop] Error durante el scraping:`, error)
      if (error instanceof Error) {
        console.error(`❌ [Wallapop] Error name: ${error.name}`)
        console.error(`❌ [Wallapop] Error message: ${error.message}`)
        if (error.stack) {
          console.error(`❌ [Wallapop] Error stack: ${error.stack.substring(0, 500)}`)
        }
        if (error.name === 'AbortError') {
          console.error(`❌ [Wallapop] Timeout: La petición fue abortada`)
        } else if (error.message.includes('fetch')) {
          console.error(`❌ [Wallapop] Error de red al conectar con la API de Wallapop`)
        }
      }
    }

    return anuncios
  }

  /**
   * Obtiene el detalle de un anuncio individual usando la API
   * (Ya no es necesario con la API, pero mantenemos la interfaz)
   */
  async obtenerDetalleAnuncio(url: string, numeroAnuncio?: number, totalAnuncios?: number): Promise<Partial<AnuncioRaw> | null> {
    // Con la API, ya tenemos toda la información en el método buscar()
    // Este método se mantiene por compatibilidad pero retorna null
    // ya que no necesitamos hacer scraping adicional
    // No mostramos log porque el processor ya no debería llamar a este método para Wallapop
    return null
  }
}
