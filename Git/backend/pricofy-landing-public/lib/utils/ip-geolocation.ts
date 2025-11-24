/**
 * Utilidades para obtener coordenadas geográficas basadas en la IP del usuario
 */
import { NextRequest } from 'next/server'

export interface IPCoordinates {
  lat: number
  lon: number
  country_code?: string // Código de país ISO (ej: "ES", "IT", "FR")
}

/**
 * Obtiene las coordenadas geográficas de una IP usando ipapi.co
 * @param ip - Dirección IP del usuario
 * @returns Coordenadas o null si no se pueden obtener
 */
export async function getIPCoordinates(ip: string): Promise<IPCoordinates | null> {
  try {
    console.log(`\n${'═'.repeat(80)}`)
    console.log(`🌍 [IP Geolocation] INICIANDO OBTENCIÓN DE COORDENADAS DE IP`)
    console.log(`${'═'.repeat(80)}`)
    console.log(`📋 [IP Geolocation] IP recibida: ${ip || 'null'}`)
    
    // Si la IP es localhost o privada, usar coordenadas por defecto (Madrid)
    if (!ip || ip === 'unknown' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      console.log(`📍 [IP Geolocation] IP local/privada detectada (${ip}), usando coordenadas por defecto (Madrid)`)
      console.log(`📍 [IP Geolocation] Coordenadas por defecto: lat=40.4259419, lon=-3.5654669`)
      console.log(`📍 [IP Geolocation] País por defecto: ES (España)`)
      console.log(`${'═'.repeat(80)}\n`)
      return {
        lat: 40.4259419,
        lon: -3.5654669,
        country_code: 'ES'
      }
    }

    console.log(`🌐 [IP Geolocation] Consultando ipapi.co para obtener coordenadas de IP: ${ip}`)
    // Usar ipapi.co para obtener coordenadas
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    })

    if (!response.ok) {
      console.warn(`⚠️ [IP Geolocation] Error al obtener coordenadas de IP ${ip}: ${response.status}`)
      console.log(`📍 [IP Geolocation] Usando coordenadas por defecto: lat=40.4259419, lon=-3.5654669`)
      console.log(`📍 [IP Geolocation] País por defecto: ES (España)`)
      console.log(`${'═'.repeat(80)}\n`)
      return {
        lat: 40.4259419,
        lon: -3.5654669,
        country_code: 'ES'
      }
    }

    const data = await response.json()
    const countryCode = data.country_code || data.country || 'ES' // Fallback a ES si no hay código
    console.log(`📊 [IP Geolocation] Respuesta de ipapi.co:`, {
      latitude: data.latitude,
      longitude: data.longitude,
      city: data.city,
      country: data.country_name,
      country_code: countryCode
    })
    
    if (data.latitude && data.longitude) {
      const lat = parseFloat(data.latitude)
      const lon = parseFloat(data.longitude)
      console.log(`✅ [IP Geolocation] Coordenadas obtenidas exitosamente para IP ${ip}`)
      console.log(`📍 [IP Geolocation] Latitud: ${lat}`)
      console.log(`📍 [IP Geolocation] Longitud: ${lon}`)
      console.log(`📍 [IP Geolocation] Ciudad: ${data.city || 'N/A'}, País: ${data.country_name || 'N/A'}`)
      console.log(`📍 [IP Geolocation] Código de país: ${countryCode}`)
      console.log(`${'═'.repeat(80)}\n`)
      return {
        lat: lat,
        lon: lon,
        country_code: countryCode
      }
    }

    console.warn(`⚠️ [IP Geolocation] No se pudieron obtener coordenadas de IP ${ip}, usando por defecto`)
    console.log(`📍 [IP Geolocation] Coordenadas por defecto: lat=40.4259419, lon=-3.5654669`)
    console.log(`📍 [IP Geolocation] País por defecto: ES (España)`)
    console.log(`${'═'.repeat(80)}\n`)
    return {
      lat: 40.4259419,
      lon: -3.5654669,
      country_code: 'ES'
    }
  } catch (error) {
    console.error(`❌ [IP Geolocation] Error al obtener coordenadas de IP ${ip}:`, error)
    console.log(`📍 [IP Geolocation] Usando coordenadas por defecto debido al error: lat=40.4259419, lon=-3.5654669`)
    console.log(`📍 [IP Geolocation] País por defecto: ES (España)`)
    console.log(`${'═'.repeat(80)}\n`)
    // Retornar coordenadas por defecto en caso de error
    return {
      lat: 40.4259419,
      lon: -3.5654669,
      country_code: 'ES'
    }
  }
}

/**
 * Obtiene la IP del usuario desde los headers de la request
 * @param request - NextRequest object
 * @returns IP del usuario o null
 */
export function getUserIP(request: NextRequest | Request): string | null {
  // Intentar obtener IP desde headers de Vercel
  const headers = request.headers
  const forwarded = headers.get('x-forwarded-for')
  const realIP = headers.get('x-real-ip')
  const vercelIP = headers.get('x-vercel-forwarded-for')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP.trim()
  }
  
  if (vercelIP) {
    return vercelIP.split(',')[0].trim()
  }
  
  return null
}

