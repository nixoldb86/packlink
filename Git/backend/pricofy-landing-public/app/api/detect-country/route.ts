import { NextRequest, NextResponse } from 'next/server'

// Evitar que Next.js intente pre-renderizar esta ruta durante el build
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Mapeo de códigos de país a nombres en español
const countryCodeToName: Record<string, string> = {
  'ES': 'España',
  'FR': 'Francia',
  'DE': 'Alemania',
  'IT': 'Italia',
  'GB': 'Reino Unido',
  'UK': 'Reino Unido',
  'PT': 'Portugal',
  'NL': 'Países Bajos',
  'BE': 'Bélgica',
  'AT': 'Austria',
  'CH': 'Suiza',
  'SE': 'Suecia',
  'NO': 'Noruega',
  'DK': 'Dinamarca',
  'FI': 'Finlandia',
  'PL': 'Polonia',
  'CZ': 'República Checa',
  'IE': 'Irlanda',
  'GR': 'Grecia',
  'HU': 'Hungría',
  'RO': 'Rumanía',
  'BG': 'Bulgaria',
  'HR': 'Croacia',
  'SK': 'Eslovaquia',
  'SI': 'Eslovenia',
  'EE': 'Estonia',
  'LV': 'Letonia',
  'LT': 'Lituania',
  'LU': 'Luxemburgo',
  'MT': 'Malta',
  'CY': 'Chipre',
  'IS': 'Islandia',
  'AL': 'Albania',
  'AD': 'Andorra',
  'AM': 'Armenia',
  'AZ': 'Azerbaiyán',
  'BY': 'Bielorrusia',
  'BA': 'Bosnia y Herzegovina',
  'GE': 'Georgia',
  'KZ': 'Kazajistán',
  'LI': 'Liechtenstein',
  'MD': 'Moldavia',
  'MC': 'Mónaco',
  'ME': 'Montenegro',
  'SM': 'San Marino',
  'RS': 'Serbia',
  'TR': 'Turquía',
  'UA': 'Ucrania',
  'VA': 'Vaticano',
  'RU': 'Rusia',
}

export async function GET(request: NextRequest) {
  try {
    // Intentar obtener el país desde los headers de Vercel (si está desplegado en Vercel)
    const vercelCountry = request.headers.get('x-vercel-ip-country')
    
    if (vercelCountry) {
      const countryName = countryCodeToName[vercelCountry] || null
      return NextResponse.json({ 
        country: countryName,
        countryCode: vercelCountry,
        source: 'vercel'
      })
    }
    
    // Fallback: obtener IP del cliente
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
    
    // Si la IP es localhost o privada, usar API externa
    if (ip === 'unknown' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      // En desarrollo, usar API externa
      try {
        const response = await fetch('https://ipapi.co/json/', {
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          const countryCode = data.country_code
          const countryName = countryCodeToName[countryCode] || null
          
          return NextResponse.json({ 
            country: countryName,
            countryCode: countryCode,
            source: 'ipapi'
          })
        }
      } catch (error) {
        console.error('Error fetching from ipapi.co:', error)
      }
    } else {
      // Intentar con otra API gratuita
      try {
        const response = await fetch(`https://ip-api.com/json/${ip}?fields=countryCode`)
        if (response.ok) {
          const data = await response.json()
          const countryCode = data.countryCode
          const countryName = countryCodeToName[countryCode] || null
          
          return NextResponse.json({ 
            country: countryName,
            countryCode: countryCode,
            source: 'ip-api'
          })
        }
      } catch (error) {
        console.error('Error fetching from ip-api.com:', error)
      }
    }
    
    // Si todo falla, retornar null
    return NextResponse.json({ 
      country: null,
      countryCode: null,
      source: 'none'
    })
  } catch (error) {
    console.error('Error detecting country:', error)
    return NextResponse.json({ 
      country: null,
      countryCode: null,
      source: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

