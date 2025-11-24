/**
 * Utilidades para geocodificación y cálculo de distancias
 */

export interface Coordinates {
  lat: number
  lon: number
}

/**
 * Geocodifica una ubicación (texto) a coordenadas usando Nominatim (OpenStreetMap)
 * @param location - Texto de la ubicación (ej: "Madrid, España")
 * @returns Coordenadas o null si no se encuentra
 */
export async function geocodeLocation(location: string): Promise<Coordinates | null> {
  try {
    if (!location || !location.trim()) {
      return null
    }

    // Usar Nominatim API (OpenStreetMap) - gratuito, sin API key
    const encodedLocation = encodeURIComponent(location.trim())
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedLocation}&format=json&limit=1&addressdetails=1`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Pricofy App' // Nominatim requiere User-Agent
      }
    })

    if (!response.ok) {
      console.error(`Error en geocodificación: ${response.status}`)
      return null
    }

    const data = await response.json()
    
    if (data && data.length > 0) {
      const result = data[0]
      return {
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon)
      }
    }

    return null
  } catch (error) {
    console.error('Error geocodificando ubicación:', error)
    return null
  }
}

/**
 * Calcula la distancia en kilómetros entre dos coordenadas usando la fórmula de Haversine
 * @param coord1 - Primera coordenada
 * @param coord2 - Segunda coordenada
 * @returns Distancia en kilómetros
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371 // Radio de la Tierra en kilómetros
  const dLat = toRadians(coord2.lat - coord1.lat)
  const dLon = toRadians(coord2.lon - coord1.lon)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.lat)) *
      Math.cos(toRadians(coord2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return distance
}

/**
 * Convierte grados a radianes
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Cache simple para geocodificaciones (evitar múltiples llamadas para la misma ubicación)
 */
const geocodeCache = new Map<string, Coordinates | null>()

/**
 * Geocodifica una ubicación con cache
 */
export async function geocodeLocationCached(location: string): Promise<Coordinates | null> {
  const cacheKey = location.toLowerCase().trim()
  
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey) || null
  }
  
  const coords = await geocodeLocation(location)
  geocodeCache.set(cacheKey, coords)
  
  return coords
}

/**
 * Interfaz para resultados de autocompletar
 */
export interface LocationSuggestion {
  display_name: string
  lat: number
  lon: number
  place_id: number
}

/**
 * Obtiene sugerencias de autocompletar para una ubicación
 * @param query - Texto de búsqueda
 * @returns Array de sugerencias
 */
export async function getLocationSuggestions(query: string): Promise<LocationSuggestion[]> {
  try {
    if (!query || query.trim().length < 2) {
      return []
    }

    const encodedQuery = encodeURIComponent(query.trim())
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=5&addressdetails=1`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Pricofy App'
      }
    })

    if (!response.ok) {
      console.error(`Error en autocompletar: ${response.status}`)
      return []
    }

    const data = await response.json()
    
    if (data && Array.isArray(data)) {
      return data.map((item: any) => ({
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        place_id: item.place_id
      }))
    }

    return []
  } catch (error) {
    console.error('Error obteniendo sugerencias de ubicación:', error)
    return []
  }
}

