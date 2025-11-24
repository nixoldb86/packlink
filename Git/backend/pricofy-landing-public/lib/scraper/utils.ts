// Utilidades para scraping: normalización, deduplicación, outliers, etc.

import { AnuncioRaw, AnuncioNormalizado, ScrapingInputs } from './types'

/**
 * Prefiltrado semántico usando Jaccard similarity, detección de marca y modelo
 * Opción A: sin dependencias externas
 */

/**
 * Normaliza texto de forma robusta para comparaciones:
 * - Convierte a minúsculas
 * - Elimina todos los caracteres especiales (puntuación, símbolos, etc.)
 * - Normaliza acentos y caracteres especiales (á->a, é->e, ö->o, â->a, etc.)
 * - Elimina espacios múltiples
 * 
 * @param s Texto a normalizar
 * @returns Texto normalizado con solo letras, números y espacios
 */
function normalize(s: string): string {
  if (!s || typeof s !== 'string') return ''
  
  return s
    .toLowerCase()
    // Normalizar caracteres Unicode (NFD = Canonical Decomposition)
    // Esto separa los caracteres base de sus diacríticos (á -> a + ´)
    .normalize('NFD')
    // Eliminar todos los diacríticos (acentos, tildes, umlauts, etc.)
    // Esto convierte: á->a, é->e, í->i, ó->o, ú->u, ñ->n, ö->o, ü->u, â->a, ê->e, etc.
    .replace(/[\u0300-\u036f]/g, '')
    // Eliminar todos los caracteres especiales y de puntuación
    // Mantener solo letras (a-z), números (0-9) y espacios
    // Esto elimina: ", ; , - # % & @ ! ? ( ) [ ] { } / \ | * + = < > etc.
    .replace(/[^a-z0-9\s]/g, ' ')
    // Normalizar espacios múltiples a un solo espacio
    .replace(/\s+/g, ' ')
    .trim()
}

const STOP = new Set([
  'el', 'la', 'los', 'las', 'de', 'del', 'para', 'por', 'con', 'y', 'en', 'un', 'una', 'uno', 'unos', 'unas',
  'the', 'a', 'an', 'for', 'with', 'and', 'in'
])

// Mapa de sinónimos de marcas (puede expandirse)
const brandMap = new Map([
  ['logitech', 'logitech'],
  ['logi', 'logitech'],
  ['logi-tech', 'logitech'],
  ['apple', 'apple'],
  ['samsung', 'samsung'],
  ['sony', 'sony'],
  ['lg', 'lg'],
  ['xiaomi', 'xiaomi'],
  ['huawei', 'huawei'],
  ['nike', 'nike'],
  ['adidas', 'adidas'],
  ['babybjorn', 'babybjorn'],
  //['babybjörn', 'babybjorn'], // Variante con ö normalizada
  ['stokke', 'stokke'],
  ['ikea', 'ikea'],
  ['chicco', 'chicco'],
  ['maxi-cosi', 'maxi-cosi'],
  ['maxicosi', 'maxi-cosi'],
  ['shokz', 'shokz'],
])

const isStop = (t: string): boolean => !t || STOP.has(t)

/**
 * Normaliza tokens numéricos con unidades (ej: "512gb" -> "512 gb", "17pro" -> "17 pro")
 * Esto ayuda a que "512 gb" y "512gb" se tokenicen de la misma forma
 */
function normalizeNumericUnits(s: string): string {
  // Separar números seguidos de letras (ej: "512gb" -> "512 gb", "17pro" -> "17 pro")
  return s.replace(/(\d+)([a-z]+)/gi, '$1 $2')
    .replace(/([a-z]+)(\d+)/gi, '$1 $2') // También "gb512" -> "gb 512"
}

const tokenize = (s: string): string[] => {
  const normalized = normalize(s)
  const withSpaces = normalizeNumericUnits(normalized)
  return withSpaces.split(' ').filter(t => !isStop(t) && t.length > 0)
}

const detectBrand = (tokens: string[]): string | null => {
  for (const t of tokens) {
    if (brandMap.has(t)) {
      return brandMap.get(t) || null
    }
  }
  return null
}

// modelo = token con letras y números (z906, g502, mx518)
// Prioriza modelos que empiezan con letras sobre los que empiezan con números
const detectModel = (tokens: string[]): string | null => {
  const cand = tokens.filter(t => /^(?=.*[a-z])(?=.*\d)[a-z0-9\-]+$/.test(t))
  if (cand.length === 0) return null
  
  // Priorizar modelos que empiezan con letras (z906, g502) sobre los que empiezan con números (1000w, 5.1)
  // Esto evita que "1000w" sea detectado como modelo cuando el usuario busca "z906"
  const modelosConLetraInicial = cand.filter(t => /^[a-z]/.test(t))
  if (modelosConLetraInicial.length > 0) {
    // Si hay modelos que empiezan con letra, usar el más largo de esos
    return modelosConLetraInicial.sort((a, b) => b.length - a.length)[0]
  }
  
  // Si no hay modelos que empiezan con letra, usar el más largo de todos
  return cand.sort((a, b) => b.length - a.length)[0]
}

const jaccard = (A: string[], B: string[]): number => {
  const a = new Set(A)
  const b = new Set(B)
  let inter = 0
  
  // Convertir Set a Array para iterar
  Array.from(a).forEach(x => {
    if (b.has(x)) inter++
  })
  
  const union = a.size + b.size - inter
  return union === 0 ? 0 : inter / union
}

/**
 * Verifica si dos textos son semánticamente similares usando Jaccard similarity,
 * detección de marca y modelo
 * 
 * @param a Texto del producto buscado por el usuario
 * @param b Texto del anuncio (título + descripción)
 * @param options Opciones: jaccardMin (umbral mínimo de Jaccard, default 0.6)
 * @returns true si son similares, false en caso contrario
 */
export function areSimilar(
  a: string,
  b: string,
  options: { jaccardMin?: number } = {}
): boolean {
  const { jaccardMin = 0.6 } = options
  const ta = tokenize(a)
  const tb = tokenize(b)
  const brandA = detectBrand(ta)
  const brandB = detectBrand(tb)
  const modelA = detectModel(ta)
  const modelB = detectModel(tb)

  // 1) Si el usuario tiene un modelo, verificar si ese modelo está presente en el anuncio
  // Esto es más robusto que solo comparar modelos detectados, ya que puede haber múltiples candidatos
  if (modelA) {
    // Verificar si el modelo del usuario está presente en los tokens del anuncio
    if (tb.includes(modelA)) {
      // El modelo del usuario está presente en el anuncio -> muy probable que sea el mismo producto
      if (brandA && brandB && brandA !== brandB) {
        return false // marcas incompatibles
      }
      return true // modelo coincide, aceptar
    }
  }

  // 2) Si ambos tienen modelo detectado y coinciden -> casi seguro similar (verificamos marca si existe)
  if (modelA && modelB && modelA === modelB) {
    if (brandA && brandB && brandA !== brandB) {
      return false // marcas incompatibles
    }
    return true // tolera palabras extra y orden distinto
  }

  // 3) Si ambos tienen modelo detectado pero NO coinciden -> verificar si el modelo del usuario está en el anuncio
  if (modelA && modelB && modelA !== modelB) {
    // Si el modelo del usuario está presente en el anuncio, aceptar (ignorar el modelo detectado del anuncio)
    if (tb.includes(modelA)) {
      if (brandA && brandB && brandA !== brandB) {
        return false // marcas incompatibles
      }
      return true // modelo del usuario está presente, aceptar
    }
    // Si el modelo del usuario NO está presente y hay otro modelo diferente, rechazar
    return false
  }

  // 3) Si hay marca en ambos y coincide, reducir umbral (marca es muy importante)
  const baseScore = jaccard(ta, tb)
  
  // Si hay marca en ambos, exige que coincida la marca normalizada
  if (brandA && brandB && brandA !== brandB) {
    return false
  }

  // Si ambas tienen la misma marca, reducir el umbral (marca es muy importante)
  // Esto ayuda con casos como "hamaca babybjorn" vs "Hamaca BabyBjörn Balance Soft"
  if (brandA && brandB && brandA === brandB) {
    // Si hay marca coincidente, reducir umbral significativamente
    // Cuando hay descripción larga, el Jaccard puede bajar mucho, pero si la marca coincide
    // y hay palabras clave comunes, debería aceptarse
    // Ejemplo: "hamaca babybjorn" (2 tokens) vs "Hamaca Babybjorn Bliss Beige ... descripción larga" (20+ tokens)
    // Jaccard puede ser 0.1-0.2, pero si la marca coincide, debería aceptarse
    // 
    // ESTRATEGIA: Si hay marca coincidente y al menos una palabra clave común (además de la marca),
    // aceptar incluso con Jaccard bajo, ya que la marca es un indicador muy fuerte
    const palabrasComunes = ta.filter(t => tb.includes(t) && t !== brandA)
    if (palabrasComunes.length > 0) {
      // Si hay marca + al menos una palabra clave común, umbral muy bajo (0.1 = 10%)
      // Esto cubre casos como "hamaca babybjorn" vs "Hamaca Babybjorn Bliss Beige ... descripción larga"
      const thresholdConMarca = Math.max(0.1, jaccardMin * 0.17) // 17% del umbral original, mínimo 0.1
      return baseScore >= thresholdConMarca
    } else {
      // Si solo coincide la marca pero no hay otras palabras clave, usar umbral un poco más alto
      const thresholdConMarca = Math.max(0.15, jaccardMin * 0.25) // 25% del umbral original, mínimo 0.15
      return baseScore >= thresholdConMarca
    }
  }

  // NUEVO: Si el usuario busca una marca específica pero el anuncio no la menciona explícitamente,
  // pero tiene palabras clave relevantes (como "hamaca" + marca), reducir el umbral
  // Esto ayuda con casos como "hamaca babybjorn" vs "Hamaca para bebé gris y roja"
  // donde el anuncio es de la marca pero no la menciona en el título
  if (brandA && !brandB) {
    // Si el usuario busca una marca pero el anuncio no la menciona, pero hay palabras clave comunes,
    // reducir el umbral si hay al menos una palabra clave común (como "hamaca")
    const palabrasComunes = ta.filter(t => tb.includes(t) && t !== brandA)
    if (palabrasComunes.length > 0) {
      // Si hay palabras clave comunes además de la marca, reducir umbral a 0.2 (20%)
      // Esto permite aceptar anuncios que son del producto correcto pero no mencionan la marca
      // Ejemplo: "hamaca babybjorn" (2 tokens) vs "hamaca para bebe gris roja" (4 tokens)
      // Jaccard = 1/5 = 0.2, que es suficiente si hay marca en la búsqueda
      const thresholdConMarcaUsuario = Math.max(0.2, jaccardMin * 0.33) // 33% del umbral original
      return baseScore >= thresholdConMarcaUsuario
    }
  }

  // Si hay números importantes en la búsqueda (como "17", "512"), tratarlos como tokens críticos
  // y reducir el umbral si están presentes en el anuncio
  const numerosImportantes = ta.filter(t => /^\d+$/.test(t) || /^\d+gb$/i.test(t) || /^\d+tb$/i.test(t))
  const numerosEnAnuncio = tb.filter(t => /^\d+$/.test(t) || /^\d+gb$/i.test(t) || /^\d+tb$/i.test(t))
  
  // Si hay números importantes y todos están presentes en el anuncio, reducir umbral
  if (numerosImportantes.length > 0) {
    const numerosPresentes = numerosImportantes.filter(num => {
      // Verificar si el número está presente (puede estar como "512" o "512gb")
      return numerosEnAnuncio.some(anuncioNum => {
        const numBase = num.replace(/gb|tb/gi, '')
        const anuncioNumBase = anuncioNum.replace(/gb|tb/gi, '')
        return numBase === anuncioNumBase
      })
    })
    
    // Si todos los números importantes están presentes, reducir umbral significativamente
    if (numerosPresentes.length === numerosImportantes.length && numerosImportantes.length > 0) {
      // Si hay marca coincidente también, umbral muy bajo
      if (brandA && brandB && brandA === brandB) {
        const thresholdConNumeros = Math.max(0.15, jaccardMin * 0.25) // 25% del umbral original, mínimo 0.15
        return baseScore >= thresholdConNumeros
      }
      // Si no hay marca pero todos los números están presentes, umbral moderado
      const thresholdConNumeros = Math.max(0.3, jaccardMin * 0.5) // 50% del umbral original, mínimo 0.3
      return baseScore >= thresholdConNumeros
    }
  }
  
  // Eleva el umbral si solo hay un modelo detectado (pero no si hay números importantes)
  const threshold = (modelA || modelB) && numerosImportantes.length === 0 ? Math.max(jaccardMin, 0.75) : jaccardMin
  return baseScore >= threshold
}

/**
 * Normaliza el título de forma robusta para comparaciones:
 * - Convierte a minúsculas
 * - Elimina todos los caracteres especiales (puntuación, símbolos, etc.)
 * - Normaliza acentos y caracteres especiales (á->a, é->e, ö->o, â->a, etc.)
 * - Elimina espacios múltiples
 * 
 * @param titulo Título a normalizar
 * @returns Título normalizado con solo letras, números y espacios
 */
export function normalizarTitulo(titulo: string): string {
  if (!titulo || typeof titulo !== 'string') return ''
  
  return titulo
    .toLowerCase()
    // Normalizar caracteres Unicode (NFD = Canonical Decomposition)
    // Esto separa los caracteres base de sus diacríticos (á -> a + ´)
    .normalize('NFD')
    // Eliminar todos los diacríticos (acentos, tildes, umlauts, etc.)
    // Esto convierte: á->a, é->e, í->i, ó->o, ú->u, ñ->n, ö->o, ü->u, â->a, ê->e, etc.
    .replace(/[\u0300-\u036f]/g, '')
    // Eliminar todos los caracteres especiales y de puntuación
    // Mantener solo letras (a-z), números (0-9) y espacios
    // Esto elimina: ", ; , - # % & @ ! ? ( ) [ ] { } / \ | * + = < > etc.
    .replace(/[^a-z0-9\s]/g, ' ')
    // Normalizar espacios múltiples a un solo espacio
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Normaliza el precio a EUR
 */
export function normalizarPrecio(precio: string | number, moneda?: string): {
  precio_eur: number
  moneda_original: string
} {
  let precioNum = typeof precio === 'string' 
    ? parseFloat(precio.replace(/[^\d.,]/g, '').replace(',', '.'))
    : precio

  if (isNaN(precioNum)) {
    precioNum = 0
  }

  // Conversión de monedas (tasas aproximadas)
  const tasas: Record<string, number> = {
    'EUR': 1,
    '€': 1,
    'USD': 0.92,
    '$': 0.92,
    'GBP': 1.17,
    '£': 1.17,
    'GB': 1.17,
  }

  const monedaDetectada = moneda || 'EUR'
  const tasa = tasas[monedaDetectada.toUpperCase()] || 1
  const precioEur = precioNum * tasa

  return {
    precio_eur: Math.round(precioEur * 100) / 100, // 2 decimales
    moneda_original: monedaDetectada.toUpperCase(),
  }
}

/**
 * Normaliza el estado del producto
 */
export function normalizarEstado(
  estado?: string,
  titulo?: string,
  descripcion?: string
): 'nuevo' | 'como_nuevo' | 'muy_buen_estado' | 'buen_estado' | 'usado' | 'aceptable' | null {
  if (!estado && !titulo && !descripcion) return null

  const texto = `${estado || ''} ${titulo || ''} ${descripcion || ''}`.toLowerCase()

  // Mapeo de condiciones
  const condiciones: Record<string, string> = {
    'nuevo': 'nuevo',
    'precintado': 'nuevo',
    'sin abrir': 'nuevo',
    'a estrenar': 'nuevo',
    'sin estrenar': 'nuevo',
    'como nuevo': 'como_nuevo',
    'como_nuevo': 'como_nuevo',
    '9/10': 'como_nuevo',
    'excelente': 'como_nuevo',
    'grade a': 'como_nuevo',
    'a+': 'como_nuevo',
    'grado a': 'como_nuevo',
    'casi sin uso': 'como_nuevo',
    '8/10': 'muy_buen_estado',
    'muy buen estado': 'muy_buen_estado',
    '7/10': 'buen_estado',
    'buen estado': 'buen_estado',
    'usado correcto': 'buen_estado',
    'funciona': 'usado',
    'con marcas': 'usado',
    'con signos de uso': 'usado',
    'aceptable': 'aceptable',
  }

  for (const [key, value] of Object.entries(condiciones)) {
    if (texto.includes(key)) {
      return value as any
    }
  }

  return null
}

/**
 * Limpia y normaliza URLs (elimina parámetros de tracking)
 */
export function normalizarURL(url: string): string {
  try {
    const urlObj = new URL(url)
    
    // Eliminar parámetros de tracking
    const paramsToRemove = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
      'gclid', 'fbclid', 'igshid', 'ref', 'ref_src', 'ref_url',
      '_ga', '_gid', 'source', 'campaign',
    ]

    paramsToRemove.forEach(param => {
      urlObj.searchParams.delete(param)
    })

    // Eliminar fragmentos innecesarios
    urlObj.hash = ''

    return urlObj.toString()
  } catch {
    return url
  }
}

/**
 * Genera variantes de búsqueda básicas a partir del producto_text
 * (Función de fallback cuando ChatGPT no está disponible)
 */
export function generarVariantesBusqueda(producto_text: string): string[] {
  const variantes = [producto_text.toLowerCase().trim()]

  // Variantes con/sin espacios, guiones
  const variante = producto_text.toLowerCase().trim()
  variantes.push(variante.replace(/\s+/g, '-'))
  variantes.push(variante.replace(/\s+/g, ''))
  variantes.push(variante.replace(/-/g, ' '))

  // Singular/plural básico
  if (variante.endsWith('s')) {
    variantes.push(variante.slice(0, -1))
  } else {
    variantes.push(variante + 's')
  }

  return Array.from(new Set(variantes)) // Eliminar duplicados
}

/**
 * Calcula estadísticas para detectar outliers
 * Q1 usa percentil 50 (mediana) y Q3 usa percentil 90
 */
export function calcularEstadisticas(precios: number[]): {
  q1: number
  q3: number
  iqr: number
  min: number
  max: number
  media: number
} {
  const sorted = [...precios].sort((a, b) => a - b)
  const n = sorted.length

  // Q1 ahora usa percentil 50 (mediana)
  const q1Index = Math.floor(n * 0.50)
  // Q3 ahora usa percentil 90
  const q3Index = Math.floor(n * 0.90)
  const q1 = sorted[q1Index] || 0
  const q3 = sorted[q3Index] || 0
  const iqr = q3 - q1
  const media = n > 0 ? sorted.reduce((a, b) => a + b, 0) / n : 0

  return {
    q1,
    q3,
    iqr,
    min: sorted[0] || 0,
    max: sorted[n - 1] || 0,
    media,
  }
}

/**
 * Filtra outliers usando método IQR
 * Retorna tanto los anuncios filtrados como información sobre los eliminados
 */
export function filtrarOutliers(
  anuncios: AnuncioNormalizado[],
  relajado: boolean = false
): { filtrados: AnuncioNormalizado[], eliminados: Array<{ anuncio: AnuncioNormalizado, razon: string }> } {
  const precios = anuncios.map(a => a.precio_eur).filter(p => p > 0)
  
  if (precios.length < 5) {
    return { filtrados: anuncios, eliminados: [] } // Si hay muy pocos, no filtrar
  }

  const stats = calcularEstadisticas(precios)
  const multiplicador = relajado ? 2 : 1.5
  
  const limiteInferior = stats.q1 - multiplicador * stats.iqr
  const limiteSuperior = stats.q3 + multiplicador * stats.iqr

  // Separar anuncios filtrados y eliminados para logging
  const eliminados: Array<{ anuncio: AnuncioNormalizado, razon: string }> = []
  const filtrados = anuncios.filter(a => {
    let razon = ''
    
    if (a.precio_eur < limiteInferior) {
      razon = `Precio ${a.precio_eur}€ < límite inferior ${limiteInferior.toFixed(2)}€`
      eliminados.push({ anuncio: a, razon })
      return false
    }
    
    if (a.precio_eur > limiteSuperior) {
      razon = `Precio ${a.precio_eur}€ > límite superior ${limiteSuperior.toFixed(2)}€`
      eliminados.push({ anuncio: a, razon })
      return false
    }
    
    if (a.precio_eur <= 2) {
      razon = `Precio ${a.precio_eur}€ ≤ 2€ (posible señuelo)`
      eliminados.push({ anuncio: a, razon })
      return false
    }
    
    return true
  })

  // Log de estadísticas y límites
  console.log(`   📊 Estadísticas IQR:`)
  console.log(`      - Q1 (percentil 50 - mediana): ${stats.q1.toFixed(2)}€`)
  console.log(`      - Q3 (percentil 90): ${stats.q3.toFixed(2)}€`)
  console.log(`      - IQR: ${stats.iqr.toFixed(2)}€`)
  console.log(`      - Multiplicador: ${multiplicador}`)
  console.log(`      - Límite inferior: ${limiteInferior.toFixed(2)}€`)
  console.log(`      - Límite superior: ${limiteSuperior.toFixed(2)}€`)
  
  // Log de anuncios eliminados
  if (eliminados.length > 0) {
    console.log(`\n   ❌ Anuncios eliminados por outliers (${eliminados.length}):`)
    eliminados.forEach(({ anuncio, razon }, index) => {
      console.log(`      ${index + 1}. "${anuncio.titulo.substring(0, 60)}..." - ${anuncio.precio_eur}€`)
      console.log(`         Razón: ${razon}`)
      console.log(`         URL: ${anuncio.url_anuncio}`)
    })
  } else {
    console.log(`   ✅ No se eliminaron anuncios por outliers`)
  }

  // Si tras filtrar quedan menos de 5, usar relajado
  if (filtrados.length < 5 && !relajado) {
    console.log(`   ⚠️  Quedan menos de 5 anuncios (${filtrados.length}), aplicando filtro relajado...`)
    return filtrarOutliers(anuncios, true)
  }

  return { filtrados, eliminados }
}

/**
 * Deduplica anuncios
 */
export function deduplicarAnuncios(anuncios: AnuncioNormalizado[]): AnuncioNormalizado[] {
  const seen = new Map<string, AnuncioNormalizado>()

  for (const anuncio of anuncios) {
    const clave = `${anuncio.titulo_normalizado}_${anuncio.precio_normalizado}_${anuncio.url_anuncio}`
    
    if (!seen.has(clave)) {
      seen.set(clave, anuncio)
    } else {
      // Si hay duplicado, conservar el de menor precio
      const existente = seen.get(clave)!
      if (anuncio.precio_eur < existente.precio_eur) {
        seen.set(clave, anuncio)
      }
    }
  }

  return Array.from(seen.values())
}

/**
 * Normaliza todos los anuncios
 */
export function normalizarAnuncios(
  anuncios: AnuncioRaw[],
  inputs: ScrapingInputs
): AnuncioNormalizado[] {
  return anuncios.map(anuncio => {
    const tituloNorm = normalizarTitulo(anuncio.titulo)
    const precioData = normalizarPrecio(anuncio.precio, anuncio.moneda_original)
    const estadoNorm = normalizarEstado(
      anuncio.estado_declarado || anuncio.estado_inferido,
      anuncio.titulo,
      anuncio.descripcion
    )
    const urlNorm = normalizarURL(anuncio.url_anuncio)

    return {
      ...anuncio,
      titulo_normalizado: tituloNorm,
      precio_eur: precioData.precio_eur,
      precio_normalizado: precioData.precio_eur,
      moneda_original: precioData.moneda_original,
      estado_normalizado: estadoNorm,
      ciudad_normalizada: anuncio.ciudad_o_zona,
      url_anuncio: urlNorm,
    }
  })
}

/**
 * Calcula la relevancia de un anuncio respecto a un término de búsqueda
 * Retorna una puntuación de 0-100
 */
export function calcularRelevancia(terminoBusqueda: string, tituloAnuncio: string): number {
  // Normalizar ambos textos
  const busquedaNorm = normalizarTitulo(terminoBusqueda)
  const tituloNorm = normalizarTitulo(tituloAnuncio)

  // Extraer tokens de la búsqueda
  const tokensBusqueda = busquedaNorm.split(/\s+/).filter(t => t.length > 0)
  const tokensTitulo = tituloNorm.split(/\s+/).filter(t => t.length > 0)

  if (tokensBusqueda.length === 0) return 0

  // Palabras técnicas comunes que son importantes
  const palabrasTecnicas = new Set([
    'pro', 'max', 'plus', 'ultra', 'mini', 'air', 'lite', 'premium', 'deluxe',
    'edition', 'special', 'limited', 'standard', 'basic', 'advance', 'advanced',
    'gb', 'tb', 'ghz', 'mhz', 'gen', 'generation', 'series', 'model',
    'slim', 'wide', 'xl', 'xxl', 's', 'm', 'l'
  ])

  // Asignar pesos a cada token de búsqueda
  const tokensPeso = tokensBusqueda.map(token => {
    // Números: peso 3 (muy importantes - modelos, capacidades, tamaños)
    if (/^\d+$/.test(token) || /^\d+gb$/i.test(token) || /^\d+tb$/i.test(token)) {
      return { token, peso: 3 }
    }
    // Palabras técnicas: peso 2 (importantes - especificaciones)
    if (palabrasTecnicas.has(token)) {
      return { token, peso: 2 }
    }
    // Palabras genéricas: peso 1 (contexto general)
    return { token, peso: 1 }
  })

  const pesoTotal = tokensPeso.reduce((sum, tp) => sum + tp.peso, 0)
  let puntuacionAcumulada = 0

  // Evaluar cada token
  for (const { token, peso } of tokensPeso) {
    if (tokensTitulo.includes(token)) {
      // Coincidencia exacta: sumar el peso completo
      puntuacionAcumulada += peso
    } else {
      // Verificar si hay un token similar (para números, verificar sustitución)
      if (/^\d+$/.test(token)) {
        // Si es un número y no está presente, penalizar fuertemente
        // Buscar si hay otro número en su lugar
        const numBusqueda = parseInt(token)
        const numerosEnTitulo = tokensTitulo.filter(t => /^\d+$/.test(t)).map(t => parseInt(t))
        
        if (numerosEnTitulo.length > 0) {
          // Calcular la diferencia para penalización proporcional
          const diferencias = numerosEnTitulo.map(n => Math.abs(n - numBusqueda))
          const minDiferencia = Math.min(...diferencias)
          
          // Penalización muy fuerte para cualquier número incorrecto
          // Los números son críticos (modelos, capacidades)
          if (minDiferencia === 0) {
            puntuacionAcumulada += peso // Coincidencia exacta
          } else {
            // Cualquier diferencia en números es crítica - penalización severa
            // No importa si es 1 o 2 de diferencia - está mal
            puntuacionAcumulada += 0 // Penalización total para números incorrectos
          }
        }
        // Si no hay números en el título, no sumar nada (penalización total)
      } else if (peso >= 2) {
        // Token importante ausente: penalización moderada (30% del peso)
        puntuacionAcumulada += peso * 0.3
      } else {
        // Token genérico ausente: penalización leve (50% del peso)
        puntuacionAcumulada += peso * 0.5
      }
    }
  }

  // Calcular puntuación base (0-100)
  let puntuacion = (puntuacionAcumulada / pesoTotal) * 100

  // Bonus por coincidencias en orden
  let coincidenciasConsecutivas = 0
  let maxCoincidenciasConsecutivas = 0
  
  for (let i = 0; i < tokensBusqueda.length; i++) {
    const indexEnTitulo = tokensTitulo.indexOf(tokensBusqueda[i])
    if (indexEnTitulo >= 0) {
      // Verificar si el siguiente token también está en orden
      if (i + 1 < tokensBusqueda.length) {
        const siguienteIndexEnTitulo = tokensTitulo.indexOf(tokensBusqueda[i + 1], indexEnTitulo + 1)
        if (siguienteIndexEnTitulo > indexEnTitulo) {
          coincidenciasConsecutivas++
        } else {
          maxCoincidenciasConsecutivas = Math.max(maxCoincidenciasConsecutivas, coincidenciasConsecutivas)
          coincidenciasConsecutivas = 0
        }
      }
    } else {
      maxCoincidenciasConsecutivas = Math.max(maxCoincidenciasConsecutivas, coincidenciasConsecutivas)
      coincidenciasConsecutivas = 0
    }
  }
  maxCoincidenciasConsecutivas = Math.max(maxCoincidenciasConsecutivas, coincidenciasConsecutivas)

  // Bonus de hasta 10 puntos por orden correcto
  const bonusOrden = Math.min(10, (maxCoincidenciasConsecutivas / tokensBusqueda.length) * 10)
  puntuacion += bonusOrden

  // Asegurar que esté en rango 0-100
  return Math.max(0, Math.min(100, puntuacion))
}

/**
 * Detecta si una búsqueda contiene números críticos (modelos, capacidades)
 */
function tieneNumerosCriticos(terminoBusqueda: string): boolean {
  const busquedaNorm = normalizarTitulo(terminoBusqueda)
  const tokens = busquedaNorm.split(/\s+/)
  
  // Buscar números que parezcan ser modelos o capacidades
  const tieneNumeros = tokens.some(token => 
    /^\d+$/.test(token) || /^\d+gb$/i.test(token) || /^\d+tb$/i.test(token)
  )
  
  return tieneNumeros
}

/**
 * Filtra anuncios por relevancia respecto a un término de búsqueda
 * Descarta anuncios con relevancia menor al umbral especificado
 * Ajusta automáticamente el umbral si no hay números críticos en la búsqueda
 */
export function filtrarPorRelevancia(
  anuncios: AnuncioNormalizado[],
  terminoBusqueda: string,
  umbral?: number
): AnuncioNormalizado[] {
  // Si no se especifica umbral, usar uno adaptativo
  let umbralFinal = umbral
  if (umbralFinal === undefined) {
    // Si la búsqueda tiene números (ej: "iphone 17 pro 512gb"), usar umbral alto (70%)
    // Si no tiene números (ej: "bañera stokke"), usar umbral medio (60%)
    umbralFinal = tieneNumerosCriticos(terminoBusqueda) ? 70 : 60
    console.log(`📊 [Relevancia] Umbral adaptativo: ${umbralFinal}% (búsqueda ${tieneNumerosCriticos(terminoBusqueda) ? 'con' : 'sin'} números críticos)`)
  }
  
  const anunciosFiltrados: AnuncioNormalizado[] = []
  let descartados = 0

  for (const anuncio of anuncios) {
    const relevancia = calcularRelevancia(terminoBusqueda, anuncio.titulo)
    
    if (relevancia >= umbralFinal) {
      anunciosFiltrados.push(anuncio)
    } else {
      descartados++
      console.log(`  ⚠️ [Relevancia] Descartado (${relevancia.toFixed(1)}%): "${anuncio.titulo.substring(0, 50)}..."`)
    }
  }

  console.log(`✅ [Relevancia] Filtro aplicado: ${anuncios.length} → ${anunciosFiltrados.length} anuncios (${descartados} descartados, umbral: ${umbralFinal}%)`)

  return anunciosFiltrados
}

