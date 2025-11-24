import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const YAHOO_HEADERS: Record<string, string> = {
  accept: '*/*',
  'accept-language': 'es-ES,es;q=0.9',
  origin: 'https://shopping.yahoo.com',
  priority: 'u=1, i',
  referer: 'https://shopping.yahoo.com/',
  'sec-ch-ua': '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-site',
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = (searchParams.get('q') || '').trim()

  // Solo llamar cuando el usuario introduzca a partir del 4º carácter
  if (query.length < 4) {
    return NextResponse.json({ suggestions: [] })
  }

  // Generar timestamp actual
  const timestamp = Date.now() / 1000

  // Construir URL con el comando del usuario (sin .crumb ya que puede cambiar)
  const url = `https://search.yahoo.com/sugg/gossip/gossip-us-vertical_ss?command=${encodeURIComponent(query)}&output=sd1&t_stmp=${timestamp}&pubid=1319`

  // Logging: Mostrar la llamada curl equivalente
  console.log('\n=== LLAMADA A YAHOO SUGGESTIONS ===')
  console.log('URL:', url)
  console.log('\nCURL equivalente:')
  const curlCommand = `curl '${url}' \\\n` +
    Object.entries(YAHOO_HEADERS)
      .map(([key, value]) => `  -H '${key}: ${value}'`)
      .join(' \\\n')
  console.log(curlCommand)
  console.log('=====================================\n')

  try {
    console.log('Iniciando fetch a Yahoo...')
    const response = await fetch(url, {
      method: 'GET',
      headers: YAHOO_HEADERS,
      cache: 'no-store'
    })

    console.log('Status de respuesta:', response.status, response.statusText)
    console.log('Headers de respuesta:', Object.fromEntries(response.headers.entries()))
    
    // Obtener el texto de la respuesta SIEMPRE, incluso si no es OK
    let responseText: string
    try {
      responseText = await response.text()
      console.log('=== RESPUESTA COMPLETA DE YAHOO ===')
      console.log('Longitud de respuesta:', responseText.length, 'caracteres')
      console.log('Respuesta completa (primeros 2000 caracteres):')
      console.log(responseText.substring(0, 2000))
      if (responseText.length > 2000) {
        console.log('... (respuesta truncada, total:', responseText.length, 'caracteres)')
      }
      console.log('=====================================')
    } catch (textError) {
      console.error('Error al leer el texto de la respuesta:', textError)
      return NextResponse.json({ suggestions: [] }, { status: 200 })
    }
    
    if (!response.ok) {
      console.error('Error al obtener sugerencias de Yahoo:', response.status, response.statusText)
      console.error('Respuesta recibida:', responseText.substring(0, 500))
      return NextResponse.json({ suggestions: [] }, { status: 200 })
    }
    
    // Intentar parsear como JSON
    let data: any
    try {
      console.log('Intentando parsear respuesta como JSON...')
      data = JSON.parse(responseText)
      console.log('=== DATOS PARSEADOS DE YAHOO ===')
      console.log(JSON.stringify(data, null, 2))
      console.log('=================================')
    } catch (parseError) {
      // Si no es JSON válido, podría ser JSONP o otro formato
      console.error('Error al parsear respuesta de Yahoo como JSON:', parseError)
      console.log('Respuesta recibida (completa):', responseText)
      return NextResponse.json({ suggestions: [] }, { status: 200 })
    }

    const suggestions: string[] = []
    
    // Extraer los primeros 4 resultados de r.k
    if (data?.r && Array.isArray(data.r)) {
      console.log(`Encontrados ${data.r.length} resultados en data.r`)
      for (let i = 0; i < Math.min(data.r.length, 4); i++) {
        const item = data.r[i]
        console.log(`Resultado ${i + 1}:`, item)
        if (item?.k && typeof item.k === 'string') {
          suggestions.push(item.k)
        }
      }
    } else {
      // Log para debug si la estructura es diferente
      console.log('Estructura de respuesta de Yahoo (no tiene data.r o no es array):', JSON.stringify(data).substring(0, 500))
    }

    console.log('Sugerencias finales extraídas:', suggestions)
    console.log('=== FIN DE PROCESAMIENTO ===\n')
    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('=== ERROR AL LLAMAR A YAHOO ===')
    console.error('Tipo de error:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('Mensaje:', error instanceof Error ? error.message : String(error))
    console.error('Stack:', error instanceof Error ? error.stack : 'No disponible')
    console.error('================================\n')
    return NextResponse.json({ suggestions: [] }, { status: 200 })
  }
}

