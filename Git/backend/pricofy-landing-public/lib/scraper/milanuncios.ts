// Scraper para Milanuncios usando extracción de JSON desde HTML
import { ScrapingInputs, AnuncioRaw, PlataformaScraper } from './types'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export class MilanunciosScraper implements PlataformaScraper {
  nombre = 'milanuncios'

  /**
   * Mapea los estados de Milanuncios a los estados internos del sistema
   */
  private mapearEstadoMilanuncios(estadoMilanuncios: string | null | undefined): string | null {
    if (!estadoMilanuncios) return null

    const estadoNormalizado = estadoMilanuncios.trim()
    
    const mapeoEstados: Record<string, string> = {
      'sin estrenar': 'Nuevo',
      'prácticamente nuevo': 'Como nuevo',
      'practicamente nuevo': 'Como nuevo', // Sin tilde
      'en buen estado': 'Buen estado',
      'aceptable': 'Usado',
      'mejorable': 'Necesita reparación',
    }

    // Buscar coincidencia exacta (case-insensitive)
    const estadoLower = estadoNormalizado.toLowerCase()
    if (mapeoEstados[estadoLower]) {
      return mapeoEstados[estadoLower]
    }

    // Si no hay mapeo, devolver el estado original
    return estadoNormalizado
  }

  /**
   * Genera headers aleatorios para simular diferentes navegadores y sesiones
   * Esto ayuda a evitar la detección de bots
   */
  private generarHeadersAleatorios(): Record<string, string> {
    // User-Agents de diferentes versiones de Chrome en múltiples sistemas operativos
    const userAgents = [
      // macOS - Chrome 141-138
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
      // Windows - Chrome 141-138
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
      // Linux - Chrome 141-138
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Ubuntu; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
      // macOS - Safari (algunas variaciones)
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
      // Windows - Edge (algunas variaciones)
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0',
    ]
    
    // Versiones de Chrome para sec-ch-ua (muchas más opciones)
    const chromeVersions = [
      { major: '141', minor: '0', brand: 'Google Chrome' },
      { major: '140', minor: '0', brand: 'Google Chrome' },
      { major: '139', minor: '0', brand: 'Google Chrome' },
      { major: '138', minor: '0', brand: 'Google Chrome' },
      { major: '141', minor: '0', brand: 'Chromium' },
      { major: '140', minor: '0', brand: 'Chromium' },
      { major: '141', minor: '0', brand: 'Not_A Brand' },
      { major: '140', minor: '0', brand: 'Not_A Brand' },
    ]
    
    // Plataformas con más variaciones
    const platforms = [
      { name: 'macOS', value: '"macOS"' },
      { name: 'Windows', value: '"Windows"' },
      { name: 'Linux', value: '"Linux"' },
      { name: 'Windows', value: '"Windows"' },
      { name: 'macOS', value: '"macOS"' },
    ]
    
    // Variaciones de Accept-Language (muchas más opciones)
    const acceptLanguages = [
      'es-ES,es;q=0.9,en;q=0.8',
      'es-ES,es;q=0.9',
      'es,en-US;q=0.9,en;q=0.8',
      'es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7',
      'es-ES,es;q=0.9,en;q=0.8,fr;q=0.7',
      'es,es-ES;q=0.9,en;q=0.8',
      'es-ES,es;q=0.9,ca;q=0.8,en;q=0.7',
      'es-ES,es;q=0.9,en-US;q=0.8',
      'es,en;q=0.9',
      'es-ES,es;q=0.95,en;q=0.8',
      'es-ES,es;q=0.9,en;q=0.8,pt;q=0.7',
      'es,es-ES;q=0.9,en-US;q=0.8,en;q=0.7',
    ]
    
    // Variaciones de Accept (diferentes órdenes y valores)
    const accepts = [
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    ]
    
    // Variaciones de Accept-Encoding
    const acceptEncodings = [
      'gzip, deflate, br',
      'gzip, deflate, br, zstd',
      'gzip, deflate',
      'gzip, br',
      'gzip, deflate, br, compress',
    ]
    
    // Variaciones de Cache-Control
    const cacheControls = [
      'max-age=0',
      'no-cache',
      'max-age=0, no-cache',
      'no-cache, no-store',
      'max-age=0, no-cache, no-store',
    ]
    
    // Seleccionar valores aleatorios
    const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)]
    const chromeVersion = chromeVersions[Math.floor(Math.random() * chromeVersions.length)]
    const platform = platforms[Math.floor(Math.random() * platforms.length)]
    const acceptLanguage = acceptLanguages[Math.floor(Math.random() * acceptLanguages.length)]
    const accept = accepts[Math.floor(Math.random() * accepts.length)]
    const acceptEncoding = acceptEncodings[Math.floor(Math.random() * acceptEncodings.length)]
    const cacheControl = cacheControls[Math.floor(Math.random() * cacheControls.length)]
    
    // Generar sec-ch-ua con variaciones (a veces incluir más o menos información)
    const secChUaVariations = [
      `"${chromeVersion.brand}";v="${chromeVersion.major}", "Not?A_Brand";v="8", "Chromium";v="${chromeVersion.major}"`,
      `"${chromeVersion.brand}";v="${chromeVersion.major}", "Not_A Brand";v="8", "Chromium";v="${chromeVersion.major}"`,
      `"${chromeVersion.brand}";v="${chromeVersion.major}.${chromeVersion.minor}", "Not?A_Brand";v="8", "Chromium";v="${chromeVersion.major}"`,
      `"${chromeVersion.brand}";v="${chromeVersion.major}", "Chromium";v="${chromeVersion.major}", "Not?A_Brand";v="8"`,
    ]
    const secChUa = secChUaVariations[Math.floor(Math.random() * secChUaVariations.length)]
    
    // Generar sec-fetch-site con variaciones (a veces same-origin, a veces none)
    const secFetchSites = ['same-origin', 'none', 'same-origin']
    const secFetchSite = secFetchSites[Math.floor(Math.random() * secFetchSites.length)]
    
    // A veces incluir o no algunos headers opcionales
    const headers: Record<string, string> = {
      'Accept': accept,
      'Accept-Language': acceptLanguage,
      'Accept-Encoding': acceptEncoding,
      'Referer': 'https://www.milanuncios.com/',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': userAgent,
      'sec-ch-ua': secChUa,
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': platform.value,
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': secFetchSite,
      'sec-fetch-user': '?1',
      'Cache-Control': cacheControl,
      'Connection': 'keep-alive',
    }
    
    // A veces incluir DNT, a veces no (70% de probabilidad)
    if (Math.random() > 0.3) {
      headers['DNT'] = '1'
    }
    
    // A veces incluir Pragma (30% de probabilidad)
    if (Math.random() > 0.7) {
      headers['Pragma'] = 'no-cache'
    }
    
    return headers
  }

  /**
   * Guarda el HTML recibido en un archivo para debug
   * Incluye el comando curl al principio del archivo
   */
  private async guardarHTML(html: string, producto: string, pagina: number, url: string, curlCommand: string): Promise<void> {
    try {
      // Crear directorio si no existe
      const htmlDir = join(process.cwd(), 'logs', 'HTMLsMilanuncion')
      if (!existsSync(htmlDir)) {
        await mkdir(htmlDir, { recursive: true })
      }

      // Crear nombre de archivo descriptivo
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').split('.')[0]
      const productoSanitizado = producto.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)
      const filename = `milanuncios_${productoSanitizado}_pag${pagina}_${timestamp}.html`
      const filepath = join(htmlDir, filename)

      // Preparar contenido: curl al principio, luego el HTML
      const contenido = `<!-- 
Comando curl usado para obtener esta respuesta:
${curlCommand}
-->

${html}`

      // Guardar HTML con curl al principio
      await writeFile(filepath, contenido, 'utf-8')
      console.log(`💾 [Milanuncios] HTML guardado en: ${filepath}`)
    } catch (error) {
      // No fallar si no se puede guardar el HTML
      console.warn(`⚠️ [Milanuncios] No se pudo guardar el HTML para debug:`, error)
    }
  }

  /**
   * Extrae el JSON de window.__INITIAL_CONTEXT_VALUE__ o window.__INITIAL_PROPS__ del HTML
   * Usa un enfoque que cuenta llaves balanceadas para extraer el JSON completo
   */
  private extraerJSONDelHTML(html: string): any {
    try {
      // Función auxiliar para extraer JSON balanceado desde una posición
      const extraerJSONBalanceado = (texto: string, inicio: number): string | null => {
        let pos = inicio
        let nivel = 0
        let dentroString = false
        let escape = false
        let comilla = ''
        
        // Buscar la primera llave de apertura
        while (pos < texto.length && texto[pos] !== '{') {
          pos++
        }
        
        if (pos >= texto.length) return null
        
        const inicioJSON = pos
        nivel = 1
        pos++
        
        while (pos < texto.length && nivel > 0) {
          const char = texto[pos]
          
          if (escape) {
            escape = false
            pos++
            continue
          }
          
          if (char === '\\') {
            escape = true
            pos++
            continue
          }
          
          if (!dentroString) {
            if (char === '{') {
              nivel++
            } else if (char === '}') {
              nivel--
            } else if (char === '"' || char === "'") {
              dentroString = true
              comilla = char
            }
          } else {
            if (char === comilla) {
              dentroString = false
              comilla = ''
            }
          }
          
          pos++
        }
        
        if (nivel === 0) {
          return texto.substring(inicioJSON, pos)
        }
        
        return null
      }

      // Buscar window.__INITIAL_PROPS__ (usado en TODAS las páginas, incluyendo la primera)
      // Usar regex para permitir espacios opcionales entre window. y __INITIAL_PROPS__
      const propsRegex = /window\s*\.\s*__INITIAL_PROPS__/i
      const propsMatch = html.match(propsRegex)
      
      if (propsMatch) {
        const propsParseIndex = propsMatch.index!
        console.log(`🔍 [Milanuncios] Encontrado __INITIAL_PROPS__ en posición ${propsParseIndex}`)
        
        // Intentar con JSON.parse primero (formato: window.__INITIAL_PROPS__ = JSON.parse("..."))
        // Necesitamos capturar todo el contenido entre las comillas, incluso con saltos de línea
        // Buscar desde la posición encontrada
        const htmlDesdeProps = html.substring(propsParseIndex)
        
        // Buscar el inicio de JSON.parse(" o JSON.parse(' (permitir espacios)
        const parseRegex = /JSON\s*\.\s*parse\s*\(/i
        const parseMatch = htmlDesdeProps.match(parseRegex)
        
        if (parseMatch) {
          const parseStart = parseMatch.index!
          const parseEnd = parseMatch.index! + parseMatch[0].length
          
          // Buscar la comilla de apertura después de JSON.parse(
          let pos = parseEnd
          // Saltar espacios en blanco
          while (pos < htmlDesdeProps.length && /\s/.test(htmlDesdeProps[pos])) {
            pos++
          }
          
          if (pos >= htmlDesdeProps.length) {
            console.log(`⚠️ [Milanuncios] No se encontró comilla después de JSON.parse(`)
          } else {
            const comillaInicio = htmlDesdeProps[pos]
            if (comillaInicio !== '"' && comillaInicio !== "'") {
              console.log(`⚠️ [Milanuncios] Carácter inesperado después de JSON.parse(: "${comillaInicio}" (esperaba " o ')`)
            } else {
              const inicioContenido = pos + 1
              
              // Buscar la comilla de cierre balanceada (respetando escapes)
              let dentroString = true
              let escape = false
              let posActual = inicioContenido
              
              while (posActual < htmlDesdeProps.length && dentroString) {
                const char = htmlDesdeProps[posActual]
                
                if (escape) {
                  escape = false
                } else if (char === '\\') {
                  escape = true
                } else if (char === comillaInicio) {
                  dentroString = false
                  break
                }
                posActual++
              }
              
              if (!dentroString) {
                // Extraer el contenido escapado
                const escaped = htmlDesdeProps.substring(inicioContenido, posActual)
                console.log(`📊 [Milanuncios] JSON escapado extraído: ${escaped.length} caracteres`)
                
                try {
                  // El contenido dentro de JSON.parse("...") está escapado como string de JavaScript
                  // Necesitamos desescaparlo correctamente antes de parsearlo como JSON
                  // El string escapado puede contener: \", \\, \n, \r, \t, \uXXXX, etc.
                  
                  // Función para desescapar un string de JavaScript de forma segura
                  const desescaparStringJS = (str: string): string => {
                    let result = ''
                    let i = 0
                    while (i < str.length) {
                      if (str[i] === '\\' && i + 1 < str.length) {
                        const next = str[i + 1]
                        switch (next) {
                          case '"':
                            result += '"'
                            i += 2
                            break
                          case '\\':
                            result += '\\'
                            i += 2
                            break
                          case 'n':
                            result += '\n'
                            i += 2
                            break
                          case 'r':
                            result += '\r'
                            i += 2
                            break
                          case 't':
                            result += '\t'
                            i += 2
                            break
                          case 'u':
                            // Unicode escape: \uXXXX
                            if (i + 5 < str.length) {
                              const hex = str.substring(i + 2, i + 6)
                              try {
                                result += String.fromCharCode(parseInt(hex, 16))
                                i += 6
                              } catch {
                                result += '\\u' + hex
                                i += 6
                              }
                            } else {
                              result += str[i]
                              i++
                            }
                            break
                          default:
                            result += str[i]
                            i++
                        }
                      } else {
                        result += str[i]
                        i++
                      }
                    }
                    return result
                  }
                  
                  // Desescapar el string de JavaScript
                  const unescaped = desescaparStringJS(escaped)
                  
                  // Ahora parsear el JSON desescapado
                  const parsed = JSON.parse(unescaped)
                  console.log(`✅ [Milanuncios] JSON extraído correctamente desde __INITIAL_PROPS__ (JSON.parse)`)
                  return parsed
                } catch (parseError) {
                  console.error(`❌ [Milanuncios] Error parseando __INITIAL_PROPS__ (JSON.parse):`, parseError)
                  if (parseError instanceof Error) {
                    console.error(`❌ [Milanuncios] Error message: ${parseError.message}`)
                    // Mostrar dónde falló el parseo
                    if (parseError.message.includes('position')) {
                      const match = parseError.message.match(/position (\d+)/)
                      if (match) {
                        const errorPos = parseInt(match[1])
                        const start = Math.max(0, errorPos - 50)
                        const end = Math.min(escaped.length, errorPos + 50)
                        console.error(`❌ [Milanuncios] Contexto del error (posición ${errorPos}): ...${escaped.substring(start, end)}...`)
                      }
                    }
                  }
                  // Mostrar fragmento del JSON escapado para debug
                  console.log(`🔍 [Milanuncios] Fragmento del JSON escapado (primeros 500 chars): ${escaped.substring(0, 500)}...`)
                }
              } else {
                console.log(`⚠️ [Milanuncios] No se encontró comilla de cierre balanceada`)
              }
            }
          }
        }
        
        // Si no funciona con JSON.parse, intentar extraer directamente (formato: window.__INITIAL_PROPS__ = {...})
        const jsonStr = extraerJSONBalanceado(html, propsParseIndex)
        if (jsonStr) {
          try {
            const parsed = JSON.parse(jsonStr)
            console.log(`✅ [Milanuncios] JSON extraído correctamente desde __INITIAL_PROPS__ (directo)`)
            return parsed
          } catch (parseError) {
            console.error(`❌ [Milanuncios] Error parseando __INITIAL_PROPS__ (directo):`, parseError)
            if (parseError instanceof Error) {
              console.error(`❌ [Milanuncios] Error message: ${parseError.message}`)
            }
            console.log(`🔍 [Milanuncios] Fragmento del JSON (primeros 500 chars): ${jsonStr.substring(0, 500)}...`)
          }
        } else {
          console.log(`🔍 [Milanuncios] Encontrado __INITIAL_PROPS__ pero no se pudo extraer JSON balanceado`)
        }
      }

      // Debug: mostrar información si no se encontró nada
      if (!propsMatch) {
        console.log(`🔍 [Milanuncios] No se encontró __INITIAL_PROPS__ en el HTML`)
        // Buscar cualquier referencia a window.__INITIAL para debug
        const anyInitial = html.match(/window\s*\.\s*__INITIAL[^\s=]*/gi)
        if (anyInitial) {
          console.log(`🔍 [Milanuncios] Variables encontradas que empiezan con __INITIAL: ${anyInitial.join(', ')}`)
        }
      }

      return null
    } catch (error) {
      console.error(`❌ [Milanuncios] Error extrayendo JSON del HTML:`, error)
      if (error instanceof Error) {
        console.error(`❌ [Milanuncios] Error message: ${error.message}`)
        console.error(`❌ [Milanuncios] Error stack: ${error.stack?.substring(0, 300)}`)
      }
      return null
    }
  }

  /**
   * Construye la URL de búsqueda para la primera página
   */
  private construirURLPrimeraPagina(producto: string, lat: number, lon: number): string {
    const productoEncoded = encodeURIComponent(producto)
    return `https://www.milanuncios.com/anuncios/?s=${productoEncoded}&latitude=${lat}&longitude=${lon}&distance=300000&orden=relevance&fromSearch=1&fromSuggester=0&suggestionUsed=0&hitOrigin=listing&recentSearchShowed=0&recentSearchUsed=0`
  }

  /**
   * Construye la URL de búsqueda para páginas siguientes
   */
  private construirURLPaginaSiguiente(producto: string, nextToken: string, pagina: number, lat: number, lon: number): string {
    const productoEncoded = encodeURIComponent(producto)
    return `https://www.milanuncios.com/anuncios/?fromSearch=1&fromSuggester=0&hitOrigin=listing&latitude=${lat}&longitude=${lon}&distance=300000&orden=relevance&recentSearchShowed=0&recentSearchUsed=0&s=${productoEncoded}&suggestionUsed=0&nextToken=${encodeURIComponent(nextToken)}&pagina=${pagina}`
  }

  /**
   * Extrae y mapea los anuncios desde el JSON de Milanuncios
   */
  private mapearAnuncios(data: any, producto: string): AnuncioRaw[] {
    const anuncios: AnuncioRaw[] = []

    try {
      // Extraer la lista de anuncios
      const ads = data?.adListPagination?.adList?.ads || []

      if (!Array.isArray(ads) || ads.length === 0) {
        console.log(`⚠️ [Milanuncios] No se encontraron anuncios en la respuesta`)
        return anuncios
      }

      console.log(`📊 [Milanuncios] Procesando ${ads.length} anuncios...`)

      for (const ad of ads) {
        try {
          // Mapear campos según especificaciones
          const ciudad = ad?.city?.name || ad?.location?.city?.name || null
          const descripcion = ad?.description || null
          
          // Imagen: tomar el primer elemento y añadir https:// y ?rule=detail_640x480
          let imagen: string | null = null
          if (Array.isArray(ad?.images) && ad.images.length > 0) {
            const primeraImagen = ad.images[0]
            if (typeof primeraImagen === 'string') {
              // Si ya tiene https://, no añadirlo de nuevo
              if (primeraImagen.startsWith('http://') || primeraImagen.startsWith('https://')) {
                imagen = `${primeraImagen}?rule=detail_640x480`
              } else {
                imagen = `https://${primeraImagen}?rule=detail_640x480`
              }
            }
          }

          const fechaPublicacion = ad?.publishDate || null
          
          // URL: añadir https://www.milanuncios.com/ si no lo tiene
          let urlAnuncio = ad?.url || null
          if (urlAnuncio && !urlAnuncio.startsWith('http://') && !urlAnuncio.startsWith('https://')) {
            urlAnuncio = `https://www.milanuncios.com${urlAnuncio}`
          }

          const userId = ad?.userId?.toString() || null
          
          // is_shippable: true si existe shippingType, false si no
          const isShippable = ad?.shippingType ? true : false

          const titulo = ad?.title || null
          
          // Precio: extraer de price.cashPrice.value
          const precio = ad?.price?.cashPrice?.value || null

          // Estado: extraer de tags[].text (puede ser array)
          let estado: string | null = null
          if (Array.isArray(ad?.tags) && ad.tags.length > 0) {
            // Buscar el tag con type "estado del producto"
            const estadoTag = ad.tags.find((tag: any) => tag?.type === 'estado del producto')
            if (estadoTag?.text) {
              estado = estadoTag.text
            } else if (ad.tags[0]?.text) {
              // Si no hay tag de estado, tomar el primero
              estado = ad.tags[0].text
            }
          }

          // Mapear el estado de Milanuncios al estado interno
          estado = this.mapearEstadoMilanuncios(estado)

          // is_top_profile: usar isVipContent
          const isTopProfile = ad?.isVipContent || false

          // Validar que tenemos los campos mínimos
          if (!titulo || precio === null) {
            console.warn(`⚠️ [Milanuncios] Anuncio sin título o precio, omitiendo:`, ad?.id)
            continue
          }

          // Convertir precio a número
          const precioEur = typeof precio === 'number' ? precio : parseFloat(precio?.toString() || '0') || 0

          const anuncio: AnuncioRaw = {
            plataforma: 'milanuncios',
            titulo: titulo,
            precio: precioEur,
            precio_eur: precioEur,
            moneda_original: 'EUR',
            estado_declarado: estado || undefined,
            ciudad_o_zona: ciudad || undefined,
            url_anuncio: urlAnuncio || `https://www.milanuncios.com/anuncios/?s=${encodeURIComponent(producto)}`,
            fecha_publicacion: fechaPublicacion || undefined,
            descripcion: descripcion || undefined,
            id_anuncio: ad?.id?.toString() || undefined,
            product_image: imagen || null,
            is_shippable: isShippable,
            is_top_profile: isTopProfile,
            user_id: userId || null,
          }

          anuncios.push(anuncio)
        } catch (error) {
          console.error(`❌ [Milanuncios] Error procesando anuncio:`, error)
          continue
        }
      }

      console.log(`✅ [Milanuncios] ${anuncios.length} anuncios mapeados correctamente`)
    } catch (error) {
      console.error(`❌ [Milanuncios] Error mapeando anuncios:`, error)
    }

    return anuncios
  }

  /**
   * Busca productos en Milanuncios
   */
  async buscar(inputs: ScrapingInputs): Promise<AnuncioRaw[]> {
    console.log(`\n${'═'.repeat(80)}`)
    console.log(`🕷️ [Milanuncios] INICIANDO BÚSQUEDA EN MILANUNCIOS`)
    console.log(`${'═'.repeat(80)}`)
    console.log(`📋 [Milanuncios] Parámetros de búsqueda:`)
    console.log(`   - Producto: "${inputs.producto_text}"`)
    console.log(`   - Ubicación: "${inputs.ubicacion}"`)
    console.log(`   - Radio: ${inputs.radio_km}km`)
    console.log(`${'═'.repeat(80)}\n`)

    const anuncios: AnuncioRaw[] = []

    try {
      const producto = inputs.producto_text
      const maxPages = parseInt(process.env.MILANUNCIOS_MAX_PAGES || '10', 10)

      // Generar headers aleatorios para simular diferentes navegadores y sesiones
      // Esto ayuda a evitar la detección de bots variando el fingerprint de cada petición
      const headers = this.generarHeadersAleatorios()
      console.log(`🔀 [Milanuncios] Headers aleatorios generados para simular navegador diferente`)

      // Verificar si ScraperAPI está configurado
      console.log(`\n🔐 [Milanuncios] Paso 1: Verificando configuración de ScraperAPI...`)
      const scraperApiKey = process.env.SCRAPERAPI_KEY
      const useScraperAPI = !!scraperApiKey
      console.log(`   ${useScraperAPI ? '✅' : '❌'} ScraperAPI: ${useScraperAPI ? 'CONFIGURADO' : 'NO CONFIGURADO'}`)
      if (useScraperAPI) {
        console.log(`   🔑 API Key: ${scraperApiKey?.substring(0, 10)}...${scraperApiKey?.substring(scraperApiKey.length - 4)}`)
      }

      // Obtener coordenadas de la IP del usuario (si están disponibles)
      console.log(`\n${'═'.repeat(80)}`)
      console.log(`📍 [Milanuncios] VERIFICANDO COORDENADAS DE IP`)
      console.log(`${'═'.repeat(80)}`)
      const coordenadasIP = inputs.coordenadas_ip || null
      const lat = coordenadasIP?.lat || 40.4260459
      const lon = coordenadasIP?.lon || -3.5651646
      
      if (coordenadasIP) {
        console.log(`✅ [Milanuncios] Coordenadas de IP disponibles`)
        console.log(`📍 [Milanuncios] Latitud: ${lat}`)
        console.log(`📍 [Milanuncios] Longitud: ${lon}`)
        console.log(`📍 [Milanuncios] Origen: IP del usuario`)
      } else {
        console.log(`⚠️ [Milanuncios] No hay coordenadas de IP disponibles, usando coordenadas por defecto`)
        console.log(`📍 [Milanuncios] Latitud: ${lat} (Madrid por defecto)`)
        console.log(`📍 [Milanuncios] Longitud: ${lon} (Madrid por defecto)`)
        console.log(`📍 [Milanuncios] Origen: Coordenadas por defecto`)
      }
      console.log(`📍 [Milanuncios] Distancia: 300000 (300km)`)
      console.log(`${'═'.repeat(80)}\n`)

      // Construir URL de la primera página
      console.log(`\n🔗 [Milanuncios] Paso 2: Construyendo URL de la primera página...`)
      const urlPrimeraPagina = this.construirURLPrimeraPagina(producto, lat, lon)
      console.log(`   🔗 URL base: ${urlPrimeraPagina}`)
      console.log(`   📊 Parámetros:`)
      console.log(`      - Producto: "${producto}" (encoded: "${encodeURIComponent(producto)}")`)
      console.log(`      - Latitud: ${lat}`)
      console.log(`      - Longitud: ${lon}`)
      console.log(`      - Distancia: 300000 (300km)`)

      // Construir URL final (a través de ScraperAPI si está configurado, o directo)
      console.log(`\n🔗 [Milanuncios] Paso 3: Construyendo URL final y headers...`)
      let apiUrl: string
      let headersFinal: Record<string, string> = {}

      if (useScraperAPI) {
        // Usar ScraperAPI para evitar bloqueos
        // ScraperAPI es un servicio de proxy que ayuda a evitar bloqueos de IP desde Vercel
        // Milanuncios puede bloquear peticiones desde IPs de Vercel, por eso usamos un proxy
        const encodedUrl = encodeURIComponent(urlPrimeraPagina)
        apiUrl = `https://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodedUrl}&country_code=es`
        console.log(`🔐 [Milanuncios] Usando ScraperAPI para evitar bloqueos de IP`)
        console.log(`   ℹ️  Razón: Milanuncios puede bloquear peticiones desde IPs de Vercel`)
        console.log(`   ℹ️  ScraperAPI actúa como proxy para evitar estos bloqueos`)
        console.log(`🌍 [Milanuncios] País configurado: ES (España)`)
        // ScraperAPI maneja los headers automáticamente, no necesitamos enviarlos
      } else {
        // Fallback a fetch directo (puede fallar en Vercel)
        apiUrl = urlPrimeraPagina
        console.log(`⚠️ [Milanuncios] SCRAPERAPI_KEY no configurada, usando fetch directo`)
        console.log(`   ⚠️  ADVERTENCIA: Esto puede fallar en Vercel si Milanuncios bloquea las IPs`)
        console.log(`   ⚠️  RAZÓN: Aunque el curl funciona en tu ordenador, el scraper puede fallar porque:`)
        console.log(`      - Las IPs de Vercel pueden estar bloqueadas por Milanuncios`)
        console.log(`      - Node.js tiene un TLS fingerprint diferente al de un navegador real`)
        console.log(`      - Falta de cookies/sesión que un navegador real tiene`)
        console.log(`      - Detección avanzada de bots que identifica peticiones automatizadas`)
        console.log(`   💡 SOLUCIÓN: Configura SCRAPERAPI_KEY en tus variables de entorno`)
        console.log(`      ScraperAPI actúa como proxy y simula un navegador real, evitando estos problemas`)
        
        // Headers para la petición
        headersFinal = headers
      }

      // Timeout: más largo si usamos ScraperAPI (puede ser más lento), más corto si es directo
      const timeoutMs = useScraperAPI ? 15000 : 5000
      
      // Generar comando curl para logs
      let curlCommand = ''
      if (useScraperAPI) {
        // Curl para ScraperAPI
        curlCommand = `curl -X GET '${apiUrl}'`
      } else {
        // Curl directo a Milanuncios
        const headersForCurl = Object.entries(headersFinal)
          .map(([k, v]) => `  -H '${k}: ${v}'`)
          .join(' \\\n')
        curlCommand = `curl -X GET '${apiUrl}' \\\n${headersForCurl}`
      }
      
      console.log(`🌐 [Milanuncios] Realizando petición a la primera página...`)
      console.log(`🔗 [Milanuncios] URL: ${apiUrl.substring(0, 100)}...`)
      console.log(`⏱️ [Milanuncios] Timeout configurado: ${timeoutMs}ms`)
      console.log(`\n📋 [Milanuncios] Comando curl equivalente:`)
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
      console.log(curlCommand)
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)
      const startTime = Date.now()
      
      // Verificar si estamos en Vercel
      const isVercelEnv = process.env.VERCEL === '1' || process.env.VERCEL === 'true'
      console.log(`🌍 [Milanuncios] Entorno: ${isVercelEnv ? 'Vercel' : 'Local'}`)
      
      // Función wrapper que garantiza que el timeout se ejecute
      const fetchWithTimeout = async (url: string, timeout: number, useProxy: boolean): Promise<Response> => {
        return new Promise(async (resolve, reject) => {
          // Crear AbortController
          const abortController = new AbortController()
          
          // Configurar timeout que SIEMPRE se ejecutará
          const timeoutId = setTimeout(() => {
            const elapsed = Date.now() - startTime
            console.error(`⏰ [Milanuncios] ⚠️ TIMEOUT TRIGGERED después de ${elapsed}ms (límite: ${timeout}ms)`)
            console.error(`⏰ [Milanuncios] Abortando fetch...`)
            abortController.abort()
            const errorMsg = useProxy
              ? `Timeout: La petición a través de ScraperAPI excedió ${timeout}ms`
              : `Timeout: La petición excedió ${timeout}ms - Posible bloqueo de Milanuncios desde Vercel`
            reject(new Error(errorMsg))
          }, timeout)
          
          // Log periódico para verificar que el código sigue ejecutándose
          const progressInterval = setInterval(() => {
            const elapsed = Date.now() - startTime
            if (elapsed < timeout + 1000) {
              const proxyInfo = useProxy ? ' (vía ScraperAPI)' : ''
              console.log(`⏳ [Milanuncios] Heartbeat${proxyInfo} - Esperando respuesta... (${elapsed}ms / ${timeout}ms)`)
            } else {
              clearInterval(progressInterval)
            }
          }, 2000) // Log cada 2 segundos
          
          const proxyInfo = useProxy ? ' vía ScraperAPI' : ' directo'
          if (useProxy) {
            console.log(`📡 [Milanuncios] Iniciando fetch${proxyInfo} con timeout de ${timeout}ms...`)
            console.log(`   ℹ️  ScraperAPI se usa para evitar bloqueos de IP desde Vercel`)
            console.log(`   ℹ️  Si no tienes SCRAPERAPI_KEY configurada, se usará fetch directo (puede fallar)`)
          } else {
            console.log(`📡 [Milanuncios] Iniciando fetch${proxyInfo} con timeout de ${timeout}ms...`)
            console.log(`   ℹ️  Fetch directo a Milanuncios (sin proxy)`)
          }
          
          try {
            // Preparar opciones de fetch
            const fetchOptions: RequestInit = {
              method: 'GET',
              signal: abortController.signal,
              redirect: 'follow', // Seguir redirecciones (comportamiento por defecto)
            }
            
            // Solo agregar headers si NO usamos ScraperAPI (ScraperAPI los maneja automáticamente)
            if (!useProxy && Object.keys(headersFinal).length > 0) {
              fetchOptions.headers = headersFinal
              // Log de headers que se están enviando para debug
              console.log(`📤 [Milanuncios] Headers enviados:`)
              Object.entries(headersFinal).forEach(([key, value]) => {
                console.log(`   ${key}: ${value.substring(0, 80)}${value.length > 80 ? '...' : ''}`)
              })
            }
            
            // Ejecutar fetch
            const response = await fetch(url, fetchOptions)
            
            // Limpiar timeouts e intervals
            clearTimeout(timeoutId)
            clearInterval(progressInterval)
            
            const fetchTime = Date.now() - startTime
            console.log(`✅ [Milanuncios] Respuesta recibida en ${fetchTime}ms`)
            console.log(`📊 [Milanuncios] Status: ${response.status} ${response.statusText}`)
            console.log(`📊 [Milanuncios] URL final (después de redirecciones): ${response.url}`)
            
            // Verificar si hay redirección
            if (response.url !== url && !useProxy) {
              console.log(`⚠️ [Milanuncios] Hubo una redirección: ${url} -> ${response.url}`)
            }
            
            // Verificar si ScraperAPI retornó un error
            if (useProxy && !response.ok) {
              try {
                const errorText = await response.text()
                console.error(`❌ [Milanuncios] ScraperAPI retornó error ${response.status}: ${errorText.substring(0, 200)}`)
                if (errorText.includes('account') || errorText.includes('quota') || errorText.includes('limit')) {
                  console.error(`❌ [Milanuncios] ⚠️ Posible problema con la cuenta de ScraperAPI (quota agotada o API key inválida)`)
                  console.error(`❌ [Milanuncios] Verifica tu cuenta en https://www.scraperapi.com/dashboard`)
                }
              } catch (parseError) {
                // Si no se puede parsear el error, continuar
                console.error(`❌ [Milanuncios] Error HTTP ${response.status} de ScraperAPI`)
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
                console.error(`❌ [Milanuncios] TIMEOUT después de ${fetchTime}ms: La petición fue abortada`)
                if (useProxy) {
                  console.error(`❌ [Milanuncios] ⚠️ ScraperAPI está tardando demasiado o hay un problema de conexión`)
                } else {
                  console.error(`❌ [Milanuncios] ⚠️ DIAGNÓSTICO: Milanuncios probablemente está bloqueando peticiones desde Vercel`)
                  console.error(`❌ [Milanuncios] SOLUCIÓN: Configura SCRAPERAPI_KEY para usar proxy`)
                }
              } else {
                console.error(`❌ [Milanuncios] Error de red después de ${fetchTime}ms:`, error.message)
                console.error(`❌ [Milanuncios] Error name: ${error.name}`)
                if ('cause' in error && error.cause) {
                  console.error(`❌ [Milanuncios] Error cause:`, error.cause)
                }
              }
            } else {
              console.error(`❌ [Milanuncios] Error no identificado después de ${fetchTime}ms:`, error)
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
        console.error(`❌ [Milanuncios] No se pudo obtener respuesta de Milanuncios`)
        console.error(`⚠️ [Milanuncios] Continuando sin resultados de Milanuncios...`)
        return anuncios // Retornar array vacío para no bloquear el proceso
      }

      if (!response.ok) {
        console.warn(`⚠️ [Milanuncios] Error HTTP ${response.status}: ${response.statusText}`)
        // Mostrar headers de respuesta para debug
        console.log(`🔍 [Milanuncios] Headers de respuesta:`)
        response.headers.forEach((value, key) => {
          console.log(`   ${key}: ${value}`)
        })
        return anuncios
      }

      console.log(`✅ [Milanuncios] Parseando HTML de la primera página...`)
      const html = await response.text()
      
      // Guardar HTML para debug
      await this.guardarHTML(html, producto, 1, apiUrl, curlCommand)
      
      // Debug: verificar si la respuesta es realmente HTML o es una redirección/error
      if (html.includes('Pardon Our Interruption') || html.includes('Cloudflare') || html.includes('challenge')) {
        console.warn(`⚠️ [Milanuncios] La respuesta parece ser una página de protección anti-bot`)
        console.warn(`⚠️ [Milanuncios] Esto puede indicar que Milanuncios está bloqueando la petición`)
        console.warn(`💡 [Milanuncios] SOLUCIÓN: Configura SCRAPERAPI_KEY para usar un proxy`)
      }
      
      // Debug: verificar tamaño del HTML y buscar indicadores
      console.log(`📊 [Milanuncios] Tamaño del HTML recibido: ${html.length} caracteres`)
      if (html.length < 1000) {
        console.warn(`⚠️ [Milanuncios] HTML muy pequeño, puede ser una página de error o redirección`)
        console.log(`🔍 [Milanuncios] Primeros 500 caracteres del HTML: ${html.substring(0, 500)}`)
      }
      
      // Verificar si el HTML contiene el patrón esperado
      const tieneProps = html.includes('window.__INITIAL_PROPS__')
      console.log(`🔍 [Milanuncios] Contiene __INITIAL_PROPS__: ${tieneProps}`)
      
      // Extraer JSON del HTML
      const data = this.extraerJSONDelHTML(html)
      if (!data) {
        console.error(`❌ [Milanuncios] No se pudo extraer JSON del HTML`)
        // Si el HTML es muy pequeño o parece un error, mostrar más información
        if (html.length < 5000 || html.includes('error') || html.includes('Error') || html.includes('403') || html.includes('404')) {
          console.log(`🔍 [Milanuncios] El HTML parece ser una página de error. Primeros 1000 caracteres:`)
          console.log(html.substring(0, 1000))
        }
        return anuncios
      }

      console.log(`✅ [Milanuncios] JSON extraído correctamente`)

      // Mapear anuncios de la primera página
      const anunciosPrimeraPagina = this.mapearAnuncios(data, producto)
      anuncios.push(...anunciosPrimeraPagina)

      // Obtener nextToken para paginación
      let nextToken = data?.adListPagination?.pagination?.nextToken
      let paginaActual = 1

      // Paginación: desde página 2 hasta maxPages
      while (nextToken && paginaActual < maxPages) {
        paginaActual++
        console.log(`\n📄 [Milanuncios] Obteniendo página ${paginaActual}/${maxPages}...`)

        // Verificación de seguridad: si por alguna razón excedemos el límite, salir inmediatamente
        if (paginaActual > maxPages) {
          console.log(`🛑 [Milanuncios] Límite de páginas excedido (${paginaActual} > ${maxPages}), deteniendo paginación`)
          break
        }

        try {
          // Esperar 10 segundos antes de cada llamada para evitar rate limiting
          console.log(`⏳ [Milanuncios] Esperando 10 segundos antes de la página ${paginaActual} (rate limiting)...`)
          await new Promise(resolve => setTimeout(resolve, 10000))
          
          // Generar headers aleatorios nuevos para esta página (simular navegador/sesión diferente)
          const nextHeaders = this.generarHeadersAleatorios()
          console.log(`🔀 [Milanuncios] Headers aleatorios generados para página ${paginaActual} (simular navegador diferente)`)
          
          // Construir URL para la siguiente página (usar las mismas coordenadas de IP)
          const urlPagina = this.construirURLPaginaSiguiente(producto, nextToken, paginaActual, lat, lon)
          
          let nextApiUrl = urlPagina
          if (useScraperAPI && scraperApiKey) {
            const encodedUrl = encodeURIComponent(urlPagina)
            nextApiUrl = `https://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodedUrl}&country_code=es`
          }

          // Generar comando curl para esta página
          let nextCurlCommand = ''
          if (useScraperAPI) {
            nextCurlCommand = `curl -X GET '${nextApiUrl}'`
          } else {
            const headersForCurl = Object.entries(nextHeaders)
              .map(([k, v]) => `  -H '${k}: ${v}'`)
              .join(' \\\n')
            nextCurlCommand = `curl -X GET '${nextApiUrl}' \\\n${headersForCurl}`
          }

          console.log(`🔍 [Milanuncios] Consultando página ${paginaActual}: ${urlPagina.substring(0, 100)}...`)
          console.log(`\n📋 [Milanuncios] Comando curl para página ${paginaActual}:`)
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
          
          // Solo agregar headers si NO usamos ScraperAPI (usar los headers aleatorios generados)
          if (!useScraperAPI && Object.keys(nextHeaders).length > 0) {
            nextFetchOptions.headers = nextHeaders
          }
          
          // Configurar timeout que cancela el fetch
          nextTimeoutId = setTimeout(() => {
            const elapsed = Date.now() - nextStartTime
            console.error(`⏰ [Milanuncios] Timeout en página ${paginaActual} después de ${elapsed}ms (límite: ${nextTimeoutMs}ms)`)
            console.error(`🛑 [Milanuncios] Cancelando fetch de página ${paginaActual}...`)
            nextAbortController.abort()
          }, nextTimeoutMs)
          
          let nextResponse: Response
          try {
            nextResponse = await fetch(nextApiUrl, nextFetchOptions)
            
            // Limpiar timeout si la petición fue exitosa
            if (nextTimeoutId) {
              clearTimeout(nextTimeoutId)
              nextTimeoutId = null
            }
            
            const nextFetchTime = Date.now() - nextStartTime
            console.log(`⏱️ [Milanuncios] Página ${paginaActual} recibida en ${nextFetchTime}ms`)
          } catch (nextError) {
            // Limpiar timeout si hay error
            if (nextTimeoutId) {
              clearTimeout(nextTimeoutId)
              nextTimeoutId = null
            }
            
            const nextFetchTime = Date.now() - nextStartTime
            if (nextError instanceof Error && (nextError.name === 'AbortError' || nextError.message.includes('Timeout') || nextError.message.includes('aborted'))) {
              console.error(`❌ [Milanuncios] Timeout en página ${paginaActual} después de ${nextFetchTime}ms`)
              console.error(`🛑 [Milanuncios] Deteniendo paginación debido al timeout`)
            } else {
              console.error(`❌ [Milanuncios] Error en página ${paginaActual} después de ${nextFetchTime}ms:`, nextError)
              console.error(`🛑 [Milanuncios] Deteniendo paginación debido al error`)
            }
            // Limpiar nextToken para evitar que el bucle continúe
            nextToken = null
            throw nextError
          }
          
          if (!nextResponse.ok) {
            console.warn(`⚠️ [Milanuncios] Error HTTP ${nextResponse.status} en página ${paginaActual}: ${nextResponse.statusText}`)
            console.warn(`🛑 [Milanuncios] Deteniendo paginación debido al error HTTP`)
            // Limpiar nextToken para evitar que el bucle continúe
            nextToken = null
            break // Salir del bucle si hay error
          }

          const nextHtml = await nextResponse.text()
          
          // Guardar HTML para debug
          await this.guardarHTML(nextHtml, producto, paginaActual, nextApiUrl, nextCurlCommand)
          
          const nextData = this.extraerJSONDelHTML(nextHtml)

          if (!nextData) {
            console.warn(`⚠️ [Milanuncios] No se pudo extraer JSON de la página ${paginaActual}`)
            break
          }

          // Mapear anuncios de esta página
          const anunciosPagina = this.mapearAnuncios(nextData, producto)
          console.log(`📊 [Milanuncios] Página ${paginaActual}: ${anunciosPagina.length} anuncios`)
          anuncios.push(...anunciosPagina)
          console.log(`📊 [Milanuncios] Total acumulado: ${anuncios.length} anuncios`)

          // Obtener nextToken para la siguiente página
          nextToken = nextData?.adListPagination?.pagination?.nextToken

          if (!nextToken) {
            console.log(`✅ [Milanuncios] No hay más páginas disponibles`)
            break
          }

          // Verificación adicional: si llegamos al máximo de páginas, salir
          if (paginaActual >= maxPages) {
            console.log(`✅ [Milanuncios] Límite de páginas alcanzado (${maxPages})`)
            nextToken = null // Limpiar para asegurar que el bucle termine
            break
          }
        } catch (error) {
          console.error(`❌ [Milanuncios] Error obteniendo página ${paginaActual}:`, error)
          if (error instanceof Error && error.name === 'AbortError') {
            console.error(`❌ [Milanuncios] Timeout en página ${paginaActual}`)
          }
          // IMPORTANTE: Limpiar nextToken para evitar bucle infinito
          nextToken = null
          console.log(`🛑 [Milanuncios] Deteniendo paginación debido al error`)
          break // Salir del bucle si hay error
        }
      }

      console.log(`\n✅ [Milanuncios] Paginación completada: ${paginaActual} páginas consultadas, ${anuncios.length} anuncios totales`)

      console.log(`✅ [Milanuncios] Búsqueda completada: ${anuncios.length} anuncios procesados`)
    } catch (error) {
      console.error(`❌ [Milanuncios] Error durante el scraping:`, error)
      if (error instanceof Error) {
        console.error(`❌ [Milanuncios] Error name: ${error.name}`)
        console.error(`❌ [Milanuncios] Error message: ${error.message}`)
      }
    }

    return anuncios
  }

  /**
   * Obtiene el detalle de un anuncio individual
   * NOTA: Milanuncios ya proporciona toda la información en el listado, no necesita obtener detalles
   */
  async obtenerDetalleAnuncio(url: string, numeroAnuncio?: number, totalAnuncios?: number): Promise<Partial<AnuncioRaw> | null> {
    // Milanuncios ya proporciona toda la información en el listado
    // No necesitamos hacer scraping adicional del detalle
    return null
  }
}
