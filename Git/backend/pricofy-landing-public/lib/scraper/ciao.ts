/**
 * Scraper para ciao.es - Obtiene información de productos nuevos
 */

interface CiaoOffer {
  offerId: string
  title: string
  description: string
  price: number
  currency: string
  offerUrl: string
  images: Array<{
    url: string
    zoomUrl: string
  }>
}

interface CiaoNormalizedData {
  offers: CiaoOffer[]
}

/**
 * Obtiene productos nuevos de ciao.es para un término de búsqueda
 */
export async function scrapeCiaoProductosNuevos(consulta: string): Promise<CiaoOffer[]> {
  try {
    console.log(`\n${'='.repeat(80)}`)
    console.log(`🛒 [Ciao] Iniciando búsqueda de productos nuevos`)
    console.log(`${'='.repeat(80)}`)
    console.log(`📋 [Ciao] Consulta: "${consulta}"`)
    
    const url = `https://www.ciao.es/buscar?consulta=${encodeURIComponent(consulta)}`
    
    const headers = {
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'accept-language': 'es-ES,es;q=0.9',
      'priority': 'u=0, i',
      'sec-ch-device-memory': '8',
      'sec-ch-ua': '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
      'sec-ch-ua-arch': '"arm"',
      'sec-ch-ua-full-version-list': '"Google Chrome";v="141.0.7390.55", "Not?A_Brand";v="8.0.0.0", "Chromium";v="141.0.7390.55"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-model': '""',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'
    }
    
    console.log(`🌐 [Ciao] Realizando petición a: ${url}`)
    const response = await fetch(url, { headers })
    
    if (!response.ok) {
      console.error(`❌ [Ciao] Error en la petición: ${response.status} ${response.statusText}`)
      return []
    }
    
    const html = await response.text()
    console.log(`✅ [Ciao] HTML recibido (${html.length} caracteres)`)
    
    // Buscar el script con __NUXT_DATA__
    const nuxtDataMatch = html.match(/id="__NUXT_DATA__">(.+?)<\/script>/s)
    if (!nuxtDataMatch) {
      console.warn(`⚠️ [Ciao] No se encontró __NUXT_DATA__ en el HTML`)
      return []
    }
    
    let nuxtDataContent = nuxtDataMatch[1]
    console.log(`📦 [Ciao] Datos NUXT encontrados (${nuxtDataContent.length} caracteres)`)
    
    // Limpiar el contenido si tiene caracteres de escape HTML
    nuxtDataContent = nuxtDataContent
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
    
    // Parsear el JSON
    let table: any[]
    try {
      // Intentar parsear como JSON puro
      table = JSON.parse(nuxtDataContent)
    } catch (parseError) {
      console.warn(`⚠️ [Ciao] Error al parsear JSON:`, parseError)
      // Intentar extraer solo el array si está dentro de un objeto más grande
      try {
        const jsonMatch = nuxtDataContent.match(/\[.*\]/s)
        if (jsonMatch) {
          table = JSON.parse(jsonMatch[0])
        } else {
          console.warn(`⚠️ [Ciao] No se pudo extraer el array JSON`)
          return []
        }
      } catch {
        console.warn(`⚠️ [Ciao] No se pudo parsear el JSON de ninguna forma`)
        return []
      }
    }
    
    if (!Array.isArray(table)) {
      console.warn(`⚠️ [Ciao] Los datos no son un array`)
      return []
    }
    
    console.log(`📊 [Ciao] Tabla cargada con ${table.length} elementos`)
    
    // Helper para acceder a la tabla por índice
    const get = (idx: number) => {
      if (idx < 0 || idx >= table.length) {
        return undefined
      }
      return table[idx]
    }
    
    // Localizar la raíz
    const root = get(4)
    if (!root || typeof root !== 'object' || !('offers' in root)) {
      console.warn(`⚠️ [Ciao] No se encontró la raíz con offers en el índice 4`)
      return []
    }
    
    const offersIndices: number[] = get(root.offers)
    if (!Array.isArray(offersIndices)) {
      console.warn(`⚠️ [Ciao] offers no es un array de índices`)
      return []
    }
    
    console.log(`🎯 [Ciao] Encontradas ${offersIndices.length} ofertas`)
    
    // Función para resolver las imágenes (lista de índices)
    function resolveImages(imagesPtr: number): Array<{ url: string; zoomUrl: string }> {
      const imageIndices: number[] = get(imagesPtr)
      if (!Array.isArray(imageIndices)) {
        return []
      }
      
      return imageIndices.map((imgIdx) => {
        const imgMap = get(imgIdx)
        if (!imgMap || typeof imgMap !== 'object') {
          return { url: '', zoomUrl: '' }
        }
        
        return {
          url: typeof imgMap.url === 'number' ? get(imgMap.url) || '' : imgMap.url || '',
          zoomUrl: typeof imgMap.zoomUrl === 'number' ? get(imgMap.zoomUrl) || '' : imgMap.zoomUrl || ''
        }
      }).filter(img => img.url || img.zoomUrl)
    }
    
    // Resolver una oferta concreta
    function resolveOffer(offerIndex: number): CiaoOffer | null {
      const map = get(offerIndex)
      if (!map || typeof map !== 'object') {
        return null
      }
      
      const simpleKeys = [
        'offerId',
        'title',
        'lastUpdateDate',
        'description',
        'country',
        'price',
        'priceWithoutRebate',
        'rebatePercentage',
        'deliveryCost',
        'totalPrice',
        'currency',
        'availabilityStatus',
        'condition',
        'offerStatus',
        'performanceScore',
      ]
      
      const result: any = {}
      
      // Campos simples: un salto de índice -> valor real
      for (const key of simpleKeys) {
        if (key in map) {
          const value = map[key]
          result[key] = typeof value === 'number' ? get(value) : value
        }
      }
      
      // Diccionarios anidados: un salto más para cada propiedad
      const dictKeys = [
        'brand',
        'merchant',
        'code',
        'category',
        'googleProductCategory',
        'merchantProvidedCategory',
        'offerUrl',
      ]
      
      for (const key of dictKeys) {
        if (key in map) {
          const raw = get(map[key])
          if (typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
            const nested: any = {}
            for (const [k, v] of Object.entries(raw)) {
              nested[k] = typeof v === 'number' ? get(v) : v
            }
            result[key] = nested
          } else {
            result[key] = raw
          }
        }
      }
      
      // Imágenes
      if ('images' in map) {
        result.images = resolveImages(map.images)
      }
      
      // Extraer offerUrl - puede ser un objeto con landingUrl o url, o una string directamente
      let offerUrlFinal: string | { landingUrl?: string; url?: string } = ''
      if (result.offerUrl) {
        if (typeof result.offerUrl === 'string') {
          offerUrlFinal = result.offerUrl
        } else if (typeof result.offerUrl === 'object' && result.offerUrl !== null) {
          // Mantener el objeto completo si tiene landingUrl o url
          offerUrlFinal = result.offerUrl
        }
      }
      
      // Validar que tenemos los campos mínimos requeridos
      const urlValida = typeof offerUrlFinal === 'string' 
        ? offerUrlFinal 
        : (offerUrlFinal as any)?.landingUrl || (offerUrlFinal as any)?.url || ''
      
      if (!result.title || !result.price || !result.currency || !urlValida) {
        return null
      }
      
      return {
        offerId: result.offerId || '',
        title: result.title || '',
        description: result.description || '',
        price: typeof result.price === 'number' ? result.price : parseFloat(result.price) || 0,
        currency: result.currency || 'EUR',
        offerUrl: offerUrlFinal, // Puede ser string o objeto con landingUrl
        images: result.images || []
      }
    }
    
    // Reconstruir todas las ofertas
    const normalizedOffers = offersIndices
      .map(resolveOffer)
      .filter((offer): offer is CiaoOffer => offer !== null)
    
    console.log(`✅ [Ciao] ${normalizedOffers.length} ofertas normalizadas correctamente`)
    
    return normalizedOffers
    
  } catch (error) {
    console.error('❌ [Ciao] Error al scrapear productos nuevos:', error)
    if (error instanceof Error) {
      console.error('❌ [Ciao] Mensaje de error:', error.message)
      console.error('❌ [Ciao] Stack:', error.stack)
    }
    return []
  }
}

