/**
 * Sistema dinámico para gestionar fuentes de scraping por país
 * Lee variables de entorno como ES_SOURCES, IT_SOURCES, etc.
 * y coordenadas por defecto como LATITUD_ES, LONGITUD_ES, etc.
 */

export interface CountrySourceConfig {
  countryCode: string
  platforms: string[]
  defaultLat: number
  defaultLon: number
}

export interface PlatformCoordinates {
  platform: string
  lat: number
  lon: number
  countryCode: string
}

/**
 * Obtiene todas las configuraciones de países disponibles desde variables de entorno
 * Busca patrones como: ES_SOURCES, IT_SOURCES, FR_SOURCES, etc.
 * y sus coordenadas correspondientes: LATITUD_ES, LONGITUD_ES, etc.
 */
export function getCountrySourcesConfig(): CountrySourceConfig[] {
  const configs: CountrySourceConfig[] = []
  
  // Obtener todas las variables de entorno que terminan en _SOURCES
  const envKeys = Object.keys(process.env)
  const countryCodes = new Set<string>()
  
  // Extraer códigos de país de las variables _SOURCES
  envKeys.forEach(key => {
    if (key.endsWith('_SOURCES')) {
      const countryCode = key.replace('_SOURCES', '').toUpperCase()
      countryCodes.add(countryCode)
    }
  })
  
  // Para cada código de país encontrado, construir la configuración
  countryCodes.forEach(countryCode => {
    const sourcesKey = `${countryCode}_SOURCES`
    const latKey = `LATITUD_${countryCode}`
    const lonKey = `LONGITUD_${countryCode}`
    
    const sourcesValue = process.env[sourcesKey]
    const latValue = process.env[latKey]
    const lonValue = process.env[lonKey]
    
    if (sourcesValue) {
      // Parsear las fuentes (separadas por comas)
      const platforms = sourcesValue
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0)
      
      // Obtener coordenadas por defecto
      const defaultLat = latValue ? parseFloat(latValue) : null
      const defaultLon = lonValue ? parseFloat(lonValue) : null
      
      if (platforms.length > 0) {
        // Si no hay coordenadas, usar valores por defecto según el país
        const finalLat = defaultLat ?? getDefaultLatForCountry(countryCode)
        const finalLon = defaultLon ?? getDefaultLonForCountry(countryCode)
        
        configs.push({
          countryCode: countryCode,
          platforms: platforms,
          defaultLat: finalLat,
          defaultLon: finalLon
        })
        
        console.log(`🌍 [Country Sources] Configuración para ${countryCode}:`)
        console.log(`   - Fuentes: ${platforms.join(', ')}`)
        console.log(`   - Coordenadas por defecto: ${finalLat}, ${finalLon}`)
      }
    }
  })
  
  return configs
}

/**
 * Obtiene las coordenadas por defecto para un país específico
 * (fallback si no están en variables de entorno)
 */
export function getDefaultLatForCountry(countryCode: string): number {
  const defaults: Record<string, number> = {
    'ES': 40.4168,  // Madrid, España
    'IT': 41.9028,  // Roma, Italia
    'FR': 48.8566,  // París, Francia
    'PT': 38.7223,  // Lisboa, Portugal
    'DE': 52.5200,  // Berlín, Alemania
    'GB': 51.5074,  // Londres, Reino Unido
  }
  return defaults[countryCode] ?? 40.4168 // Default: Madrid
}

/**
 * Obtiene las coordenadas por defecto para un país específico
 * (fallback si no están en variables de entorno)
 */
export function getDefaultLonForCountry(countryCode: string): number {
  const defaults: Record<string, number> = {
    'ES': -3.7038,  // Madrid, España
    'IT': 12.4964,  // Roma, Italia
    'FR': 2.3522,   // París, Francia
    'PT': -9.1393,  // Lisboa, Portugal
    'DE': 13.4050,  // Berlín, Alemania
    'GB': -0.1278,  // Londres, Reino Unido
  }
  return defaults[countryCode] ?? -3.7038 // Default: Madrid
}

/**
 * Obtiene la configuración de coordenadas para cada plataforma según el país del usuario
 * @param userCountryCode - Código de país del usuario (ej: "ES")
 * @param userCoordinates - Coordenadas de la IP del usuario
 * @returns Array con coordenadas para cada plataforma
 */
export function getPlatformCoordinates(
  userCountryCode: string,
  userCoordinates: { lat: number; lon: number }
): PlatformCoordinates[] {
  const platformCoords: PlatformCoordinates[] = []
  const countryConfigs = getCountrySourcesConfig()
  
  console.log(`\n${'═'.repeat(80)}`)
  console.log(`🌍 [Country Sources] CONFIGURANDO COORDENADAS POR PLATAFORMA`)
  console.log(`${'═'.repeat(80)}`)
  console.log(`📍 [Country Sources] País del usuario: ${userCountryCode}`)
  console.log(`📍 [Country Sources] Coordenadas del usuario: ${userCoordinates.lat}, ${userCoordinates.lon}`)
  console.log(`${'═'.repeat(80)}\n`)
  
  // Para cada configuración de país
  countryConfigs.forEach(config => {
    const isUserCountry = config.countryCode === userCountryCode
    
    // Para cada plataforma de este país
    config.platforms.forEach(platform => {
      if (isUserCountry) {
        // Si es el país del usuario, usar coordenadas de la IP
        platformCoords.push({
          platform: platform,
          lat: userCoordinates.lat,
          lon: userCoordinates.lon,
          countryCode: config.countryCode
        })
        console.log(`✅ [Country Sources] ${platform} (${config.countryCode}): usando coordenadas del usuario (${userCoordinates.lat}, ${userCoordinates.lon})`)
      } else {
        // Si es otro país, usar coordenadas por defecto de ese país
        platformCoords.push({
          platform: platform,
          lat: config.defaultLat,
          lon: config.defaultLon,
          countryCode: config.countryCode
        })
        console.log(`🌍 [Country Sources] ${platform} (${config.countryCode}): usando coordenadas por defecto (${config.defaultLat}, ${config.defaultLon})`)
      }
    })
  })
  
  console.log(`\n✅ [Country Sources] Total de plataformas configuradas: ${platformCoords.length}`)
  console.log(`${'═'.repeat(80)}\n`)
  
  return platformCoords
}

/**
 * Interfaz para representar una plataforma con su país asociado
 */
export interface PlatformWithCountry {
  platform: string
  countryCode: string
}

/**
 * Obtiene todas las plataformas que deben consultarse según las configuraciones de países
 * Devuelve plataformas con su país asociado, permitiendo múltiples entradas de la misma plataforma
 * si está configurada en diferentes países
 */
export function getAllPlatformsFromCountrySources(): PlatformWithCountry[] {
  const countryConfigs = getCountrySourcesConfig()
  const allPlatforms: PlatformWithCountry[] = []
  
  countryConfigs.forEach(config => {
    config.platforms.forEach(platform => {
      allPlatforms.push({
        platform: platform,
        countryCode: config.countryCode
      })
    })
  })
  
  return allPlatforms
}

/**
 * Obtiene todas las plataformas únicas (sin país) - para compatibilidad hacia atrás
 */
export function getAllPlatformsFromCountrySourcesUnique(): string[] {
  const platformsWithCountry = getAllPlatformsFromCountrySources()
  const uniquePlatforms = new Set<string>()
  
  platformsWithCountry.forEach(p => {
    uniquePlatforms.add(p.platform)
  })
  
  return Array.from(uniquePlatforms)
}

/**
 * Mapeo fijo de plataformas a sus países de origen
 * Esto asegura que cada plataforma siempre use las coordenadas de su país correcto,
 * independientemente de en qué _SOURCES esté configurada
 */
const PLATFORM_COUNTRY_MAP: Record<string, string> = {
  // Plataformas españolas
  'wallapop': 'ES',
  'milanuncios': 'ES',
  'tablondeanuncios': 'ES',
  'todocoleccion': 'ES',
  
  // Plataformas italianas
  'subito': 'IT',
  'prezzoforte': 'IT',
  
  // Plataformas francesas
  'leboncoin': 'FR',
  'vinted': 'FR', // Vinted tiene presencia en varios países, pero su origen es Francia
  
  // Plataformas internacionales (pueden tener presencia en múltiples países)
  'facebook_marketplace': 'ES', // Por defecto España, pero puede variar según el usuario
  'ebay': 'ES', // eBay tiene presencia en múltiples países
  'back_market': 'FR', // Back Market es francés
  'rebuy': 'DE', // Rebuy es alemán
  'swappie': 'FI', // Swappie es finlandés
  'depop': 'GB', // Depop es británico
  'vestiaire': 'FR', // Vestiaire Collective es francés
  'selency': 'FR', // Selency es francés
}

/**
 * Obtiene el país de origen de una plataforma
 * @param platform - Nombre de la plataforma
 * @returns Código de país de la plataforma o null si no está mapeada
 */
function getPlatformCountry(platform: string): string | null {
  return PLATFORM_COUNTRY_MAP[platform.toLowerCase()] || null
}

/**
 * Obtiene las coordenadas para una plataforma específica
 * @param platform - Nombre de la plataforma
 * @param userCountryCode - Código de país del usuario (ej: "ES")
 * @param userCoordinates - Coordenadas EXACTAS de la IP del usuario
 * @param targetCountryCode - País específico desde .env.local (ej: "ES" o "IT") - SIEMPRE se debe pasar cuando está disponible
 * @returns Coordenadas para la plataforma o null si no está configurada
 */
export function getCoordinatesForPlatform(
  platform: string,
  userCountryCode: string,
  userCoordinates: { lat: number; lon: number },
  targetCountryCode?: string
): { lat: number; lon: number; countryCode: string } | null {
  // SIEMPRE usar targetCountryCode si está disponible (viene de .env.local)
  // Esto permite que la misma plataforma se llame con diferentes coordenadas según el país configurado
  if (targetCountryCode) {
    const countryConfigs = getCountrySourcesConfig()
    const targetCountryConfig = countryConfigs.find(c => c.countryCode === targetCountryCode)
    
    if (targetCountryConfig) {
      // Si el país objetivo es el mismo que el del usuario, usar coordenadas EXACTAS de la IP del usuario
      if (targetCountryCode === userCountryCode) {
        console.log(`✅ [Country Sources] ${platform} (${targetCountryCode}): usando coordenadas EXACTAS de la IP del usuario (${userCoordinates.lat}, ${userCoordinates.lon})`)
        return {
          lat: userCoordinates.lat,
          lon: userCoordinates.lon,
          countryCode: targetCountryCode
        }
      } else {
        // Si es otro país, usar coordenadas por defecto de ese país (desde .env.local)
        console.log(`🌍 [Country Sources] ${platform} (${targetCountryCode}): usando coordenadas por defecto del país (${targetCountryConfig.defaultLat}, ${targetCountryConfig.defaultLon})`)
        return {
          lat: targetCountryConfig.defaultLat,
          lon: targetCountryConfig.defaultLon,
          countryCode: targetCountryCode
        }
      }
    } else {
      // Si no hay configuración para el país objetivo, usar valores por defecto
      const defaultLat = getDefaultLatForCountry(targetCountryCode)
      const defaultLon = getDefaultLonForCountry(targetCountryCode)
      console.log(`⚠️ [Country Sources] ${platform} (${targetCountryCode}): usando valores por defecto (${defaultLat}, ${defaultLon})`)
      return {
        lat: defaultLat,
        lon: defaultLon,
        countryCode: targetCountryCode
      }
    }
  }
  
  // Si NO se especifica targetCountryCode (fallback - no debería pasar en búsquedas avanzadas)
  // Usar la lógica anterior con mapeo fijo solo como último recurso
  const platformCountry = getPlatformCountry(platform)
  
  if (platformCountry) {
    const countryConfigs = getCountrySourcesConfig()
    const platformCountryConfig = countryConfigs.find(c => c.countryCode === platformCountry)
    
    if (platformCountryConfig) {
      if (platformCountry === userCountryCode) {
        console.log(`✅ [Country Sources] ${platform} es del país del usuario (${platformCountry}), usando coordenadas del usuario (${userCoordinates.lat}, ${userCoordinates.lon})`)
        return {
          lat: userCoordinates.lat,
          lon: userCoordinates.lon,
          countryCode: platformCountry
        }
      } else {
        console.log(`🌍 [Country Sources] ${platform} es de ${platformCountry} (no es el país del usuario), usando coordenadas por defecto (${platformCountryConfig.defaultLat}, ${platformCountryConfig.defaultLon})`)
        return {
          lat: platformCountryConfig.defaultLat,
          lon: platformCountryConfig.defaultLon,
          countryCode: platformCountry
        }
      }
    } else {
      const defaultLat = getDefaultLatForCountry(platformCountry)
      const defaultLon = getDefaultLonForCountry(platformCountry)
      console.log(`⚠️ [Country Sources] ${platform} es de ${platformCountry} pero no hay configuración, usando valores por defecto (${defaultLat}, ${defaultLon})`)
      return {
        lat: defaultLat,
        lon: defaultLon,
        countryCode: platformCountry
      }
    }
  }
  
  // Si la plataforma no tiene país de origen definido, buscar en configuraciones
  const allCoords = getPlatformCoordinates(userCountryCode, userCoordinates)
  const platformCoord = allCoords.find(pc => pc.platform === platform)
  
  if (platformCoord) {
    console.log(`📍 [Country Sources] ${platform} encontrada en configuración de países, usando coordenadas (${platformCoord.lat}, ${platformCoord.lon}) del país ${platformCoord.countryCode}`)
    return {
      lat: platformCoord.lat,
      lon: platformCoord.lon,
      countryCode: platformCoord.countryCode
    }
  }
  
  console.log(`⚠️ [Country Sources] ${platform} no tiene país de origen definido ni está en configuración de países, usando coordenadas del usuario`)
  return null
}

