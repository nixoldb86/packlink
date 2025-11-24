// Geocodificación usando OpenStreetMap Nominatim (gratis, sin API key)

interface Coordenadas {
  lat: number
  lon: number
  ciudad: string
  pais: string
  provincia?: string // Provincia/estado obtenida de Nominatim
}

/**
 * Convierte una ubicación (ciudad, país) a coordenadas usando OpenStreetMap Nominatim
 * 
 * @param ubicacion Formato: "españa/madrid" o "españa/coslada"
 * @returns Coordenadas (lat, lon) o null si no se encuentra
 */
export async function geocodificar(ubicacion: string): Promise<Coordenadas | null> {
  try {
    // Parsear ubicación: "españa/madrid" -> ["españa", "madrid"]
    const partes = ubicacion.split('/').map(p => p.trim()).filter(p => p)
    
    if (partes.length < 2) {
      console.warn(`⚠️ Formato de ubicación inválido: ${ubicacion}`)
      return null
    }

    const pais = partes[0]
    const ciudad = partes[partes.length - 1]
    
    // Construir query para Nominatim
    const query = `${ciudad}, ${pais}`
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`

    console.log(`📍 [Geocodificación] Consultando Nominatim para: ${query}`)
    console.log(`🌐 [Geocodificación] URL: ${url}`)

    // Crear AbortController para timeout (1.5 segundos máximo - muy agresivo para Vercel)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.warn(`⏱️ [Geocodificación] Timeout después de 1.5 segundos, cancelando petición...`)
      controller.abort()
    }, 1500)

    try {
      console.log(`🌐 [Geocodificación] Iniciando fetch a Nominatim...`)
      const startTime = Date.now()
      
      // Timeout muy agresivo de 1.5 segundos con Promise.race
      const fetchPromise = fetch(url, {
        headers: {
          'User-Agent': 'Pricofy Scraper (contact: contacto@pricofy.com)', // Nominatim requiere User-Agent
          'Accept': 'application/json',
        },
        signal: controller.signal,
      }).catch((error) => {
        console.error(`❌ [Geocodificación] Error en fetch:`, error.name, error.message)
        throw error
      })

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          console.warn(`⏱️ [Geocodificación] Promise.race timeout activado después de 1.5s`)
          reject(new Error('Fetch timeout después de 1.5 segundos'))
        }, 1500)
      })

      console.log(`⏳ [Geocodificación] Esperando respuesta (máximo 1.5s)...`)
      const response = await Promise.race([fetchPromise, timeoutPromise])
      const fetchTime = Date.now() - startTime
      console.log(`✅ [Geocodificación] Fetch completado en ${fetchTime}ms`)

      clearTimeout(timeoutId)

      if (!response.ok) {
        console.warn(`⚠️ [Geocodificación] Error HTTP ${response.status} para: ${query}`)
        console.warn(`   Status text: ${response.statusText}`)
        return null
      }

      console.log(`✅ [Geocodificación] Respuesta recibida (${response.status}), parseando JSON...`)
      const parseStartTime = Date.now()
      const data = await response.json()
      const parseTime = Date.now() - parseStartTime
      console.log(`⏱️ [Geocodificación] JSON parseado en ${parseTime}ms`)

      if (!data || data.length === 0) {
        console.warn(`⚠️ [Geocodificación] No se encontraron resultados para: ${query}`)
        return null
      }

      console.log(`📊 [Geocodificación] Nominatim retornó ${data.length} resultado(s), usando el primero`)
      const resultado = data[0]
      
      // Intentar obtener la provincia desde los datos de Nominatim
      // Para España, Nominatim puede devolver la provincia en diferentes campos
      // Prioridad: state > region > county > province
      // También puede estar en "state_district" para algunas ciudades
      let provincia = resultado.address?.state || 
                      resultado.address?.region || 
                      resultado.address?.state_district ||
                      resultado.address?.county || 
                      resultado.address?.province || 
                      undefined
      
      // Si la provincia viene como "Comunidad de Madrid" o similar, normalizarla
      if (provincia) {
        const provinciaLower = provincia.toLowerCase().trim()
        // Extraer solo el nombre de la provincia si viene con prefijo
        if (provinciaLower.includes('comunidad de')) {
          provincia = provinciaLower.replace('comunidad de', '').trim()
          // Capitalizar primera letra
          provincia = provincia.charAt(0).toUpperCase() + provincia.slice(1)
        } else if (provinciaLower.includes('comunidad')) {
          provincia = provinciaLower.replace('comunidad', '').trim()
          provincia = provincia.charAt(0).toUpperCase() + provincia.slice(1)
        }
      }

      const coordenadas: Coordenadas = {
        lat: parseFloat(resultado.lat),
        lon: parseFloat(resultado.lon),
        ciudad: ciudad,
        pais: pais,
        provincia: provincia,
      }

      console.log(`✅ [Geocodificación] Coordenadas encontradas: ${coordenadas.lat}, ${coordenadas.lon} (${coordenadas.ciudad}, ${coordenadas.pais}${provincia ? `, ${provincia}` : ''})`)

      // Rate limiting: Nominatim permite 1 request/segundo
      // Esperar 1 segundo antes de la siguiente petición
      console.log(`⏳ [Geocodificación] Esperando 1.1 segundos (rate limiting Nominatim)...`)
      await new Promise(resolve => setTimeout(resolve, 1100))

      return coordenadas
    } catch (error: any) {
      clearTimeout(timeoutId)
      
      if (error.name === 'AbortError' || error.name === 'TimeoutError' || error.message?.includes('timeout')) {
        console.error(`❌ [Geocodificación] Timeout: La petición a Nominatim excedió 1.5 segundos para: ${query}`)
        console.error(`   Esto puede deberse a problemas de red, que Nominatim esté lento, o límites de Vercel`)
        console.error(`   Vercel Hobby tiene límite de 10s por función - usando coordenadas fallback`)
        console.error(`   Error completo:`, {
          name: error.name,
          message: error.message,
          stack: error.stack?.substring(0, 500), // Limitar stack trace
        })
      } else if (error.message?.includes('fetch') || error.message?.includes('network')) {
        console.error(`❌ [Geocodificación] Error de red al conectar con Nominatim: ${error.message}`)
        console.error(`   Tipo de error: ${error.constructor.name}`)
      } else {
        console.error(`❌ [Geocodificación] Error inesperado:`, {
          name: error.name,
          message: error.message,
          type: error.constructor.name,
          stack: error.stack?.substring(0, 500),
        })
      }
      return null
    }
  } catch (error: any) {
    console.error('❌ [Geocodificación] Error general en geocodificación:', error)
    if (error.message) {
      console.error(`   Mensaje: ${error.message}`)
    }
    return null
  }
}

/**
 * Calcula la distancia en kilómetros entre dos coordenadas usando la fórmula de Haversine
 */
export function calcularDistancia(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distancia = R * c
  
  return Math.round(distancia * 10) / 10 // Redondear a 1 decimal
}

/**
 * Obtiene coordenadas de una ubicación con cache simple (evita repetir requests)
 */
const cacheGeocodificacion = new Map<string, Coordenadas | null>()

// Pre-cachear coordenadas comunes para evitar llamadas a Nominatim
const coordenadasComunes: Record<string, Coordenadas> = {
  'españa/madrid': { lat: 40.4168, lon: -3.7038, ciudad: 'madrid', pais: 'españa', provincia: 'Madrid' },
  'españa/coslada': { lat: 40.4238, lon: -3.5313, ciudad: 'coslada', pais: 'españa', provincia: 'Madrid' },
  'españa/getafe': { lat: 40.3057, lon: -3.7329, ciudad: 'getafe', pais: 'españa', provincia: 'Madrid' },
  'españa/móstoles': { lat: 40.3228, lon: -3.8644, ciudad: 'móstoles', pais: 'españa', provincia: 'Madrid' },
  'españa/alcalá de henares': { lat: 40.4818, lon: -3.3635, ciudad: 'alcalá de henares', pais: 'españa', provincia: 'Madrid' },
  'españa/leganés': { lat: 40.3272, lon: -3.7636, ciudad: 'leganés', pais: 'españa', provincia: 'Madrid' },
  'españa/barcelona': { lat: 41.3851, lon: 2.1734, ciudad: 'barcelona', pais: 'españa', provincia: 'Barcelona' },
  'españa/valencia': { lat: 39.4699, lon: -0.3763, ciudad: 'valencia', pais: 'españa', provincia: 'Valencia' },
  'españa/sevilla': { lat: 37.3891, lon: -5.9845, ciudad: 'sevilla', pais: 'españa', provincia: 'Sevilla' },
  'españa/zaragoza': { lat: 41.6488, lon: -0.8891, ciudad: 'zaragoza', pais: 'españa', provincia: 'Zaragoza' },
  'españa/málaga': { lat: 36.7213, lon: -4.4214, ciudad: 'málaga', pais: 'españa', provincia: 'Málaga' },
  'españa/murcia': { lat: 37.9922, lon: -1.1307, ciudad: 'murcia', pais: 'españa', provincia: 'Murcia' },
  'españa/bilbao': { lat: 43.2627, lon: -2.9253, ciudad: 'bilbao', pais: 'españa', provincia: 'Vizcaya' },
  'españa/alicante': { lat: 38.3452, lon: -0.4810, ciudad: 'alicante', pais: 'españa', provincia: 'Alicante' },
  'españa/córdoba': { lat: 37.8882, lon: -4.7794, ciudad: 'córdoba', pais: 'españa', provincia: 'Córdoba' },
}

// Inicializar cache con coordenadas comunes
Object.entries(coordenadasComunes).forEach(([key, coords]) => {
  cacheGeocodificacion.set(key.toLowerCase(), coords)
})
console.log(`💾 [Geocodificación] Cache inicializado con ${cacheGeocodificacion.size} coordenadas comunes`)

/**
 * Mapeo de países a coordenadas por defecto (capital o ciudad principal)
 */
const coordenadasPorPais: Record<string, Coordenadas> = {
  'españa': { lat: 40.4168, lon: -3.7038, ciudad: 'madrid', pais: 'españa', provincia: 'Madrid' },
  'spain': { lat: 40.4168, lon: -3.7038, ciudad: 'madrid', pais: 'españa', provincia: 'Madrid' },
  'italia': { lat: 41.9028, lon: 12.4964, ciudad: 'roma', pais: 'italia', provincia: 'Lazio' },
  'italy': { lat: 41.9028, lon: 12.4964, ciudad: 'roma', pais: 'italia', provincia: 'Lazio' },
  'francia': { lat: 48.8566, lon: 2.3522, ciudad: 'parís', pais: 'francia', provincia: 'Île-de-France' },
  'france': { lat: 48.8566, lon: 2.3522, ciudad: 'parís', pais: 'francia', provincia: 'Île-de-France' },
  'portugal': { lat: 38.7223, lon: -9.1393, ciudad: 'lisboa', pais: 'portugal', provincia: 'Lisboa' },
  'alemania': { lat: 52.5200, lon: 13.4050, ciudad: 'berlín', pais: 'alemania', provincia: 'Berlín' },
  'germany': { lat: 52.5200, lon: 13.4050, ciudad: 'berlín', pais: 'alemania', provincia: 'Berlín' },
  'reino unido': { lat: 51.5074, lon: -0.1278, ciudad: 'londres', pais: 'reino unido', provincia: 'Londres' },
  'united kingdom': { lat: 51.5074, lon: -0.1278, ciudad: 'londres', pais: 'reino unido', provincia: 'Londres' },
  'uk': { lat: 51.5074, lon: -0.1278, ciudad: 'londres', pais: 'reino unido', provincia: 'Londres' },
}

export async function geocodificarConCache(ubicacion: string): Promise<Coordenadas | null> {
  const cacheKey = ubicacion.toLowerCase()
  
  if (cacheGeocodificacion.has(cacheKey)) {
    const cached = cacheGeocodificacion.get(cacheKey)
    console.log(`💾 [Geocodificación] Cache HIT para: ${ubicacion}`)
    if (cached) {
      console.log(`📍 [Geocodificación] Coordenadas desde cache: ${cached.lat}, ${cached.lon}`)
    }
    return cached || null
  }

  // Verificar si la ubicación es solo un país (sin ciudad)
  // Si es solo un país, usar coordenadas por defecto sin intentar geocodificar
  const partes = ubicacion.split('/').map(p => p.trim().toLowerCase()).filter(p => p)
  if (partes.length === 1) {
    const pais = partes[0]
    if (coordenadasPorPais[pais]) {
      console.log(`🌍 [Geocodificación] Ubicación es solo país: "${pais}", usando coordenadas por defecto`)
      const coordenadasDefault = coordenadasPorPais[pais]
      console.log(`📍 [Geocodificación] Coordenadas por defecto: ${coordenadasDefault.lat}, ${coordenadasDefault.lon} (${coordenadasDefault.ciudad})`)
      // Guardar en cache para futuras consultas
      cacheGeocodificacion.set(cacheKey, coordenadasDefault)
      return coordenadasDefault
    } else {
      console.warn(`⚠️ [Geocodificación] País "${pais}" no tiene coordenadas por defecto configuradas`)
      // Guardar null en cache para evitar reintentos
      cacheGeocodificacion.set(cacheKey, null)
      return null
    }
  }

  console.log(`🔍 [Geocodificación] Cache MISS para: ${ubicacion}, consultando Nominatim...`)
  
  // Timeout total de 1.5 segundos para la geocodificación completa (muy agresivo)
  const timeoutPromise = new Promise<Coordenadas | null>((resolve) => {
    setTimeout(() => {
      console.warn(`⏱️ [Geocodificación] Timeout total de 1.5s alcanzado para: ${ubicacion}`)
      console.warn(`⚠️ [Geocodificación] Retornando null - se usará fallback`)
      resolve(null)
    }, 1500)
  })

  try {
    console.log(`⏳ [Geocodificación] Iniciando geocodificación con timeout de 1.5s...`)
    const coordenadas = await Promise.race([
      geocodificar(ubicacion),
      timeoutPromise,
    ])
    console.log(`✅ [Geocodificación] geocodificarConCache completado`)
    
    cacheGeocodificacion.set(cacheKey, coordenadas)
    console.log(`💾 [Geocodificación] Coordenadas guardadas en cache (total en cache: ${cacheGeocodificacion.size})`)
    
    return coordenadas
  } catch (error) {
    console.error(`❌ [Geocodificación] Error en geocodificarConCache:`, error)
    // Guardar null en cache para evitar reintentos inmediatos
    cacheGeocodificacion.set(cacheKey, null)
    return null
  }
}

