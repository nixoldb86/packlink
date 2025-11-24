// Procesador principal: orquesta el scraping, normalización, deduplicación y generación de resultados

import {
  ScrapingInputs,
  AnuncioRaw,
  AnuncioNormalizado,
  JSONCompradores,
  JSONVendedores,
  TablaCompradores,
  TablaVendedores,
} from './types'
import { PlataformaScraper } from './types'
import { WallapopScraper } from './wallapop'
import { MilanunciosScraper } from './milanuncios'
import {
  normalizarAnuncios,
  filtrarOutliers,
  deduplicarAnuncios,
  generarVariantesBusqueda,
  filtrarPorRelevancia,
  areSimilar,
} from './utils'
import { geocodificarConCache } from './geocoding'
import { generateSearchVariants, verificarCoincidenciaAnuncio, inferirEstadoProducto } from '../chatgpt'
import { getPlatformCoordinates, getAllPlatformsFromCountrySources, getCoordinatesForPlatform, PlatformWithCountry } from './country-sources'

export class ScrapingProcessor {
  private plataformas: Map<string, PlataformaScraper> = new Map()
  private wallapopScraper: WallapopScraper
  private milanunciosScraper: MilanunciosScraper

  constructor() {
    // Registrar plataformas disponibles
    this.wallapopScraper = new WallapopScraper()
    this.milanunciosScraper = new MilanunciosScraper()
    this.plataformas.set('wallapop', this.wallapopScraper)
    this.plataformas.set('milanuncios', this.milanunciosScraper)
    // Agregar más plataformas aquí cuando estén implementadas
  }

  /**
   * Limpia recursos
   */
  async limpiar(): Promise<void> {
    // No hay recursos que limpiar cuando se usa solo API
    // Los scrapers basados en API no requieren limpieza de navegadores
  }

  /**
   * Búsqueda directa sin filtros ni alternativas de ChatGPT
   * Busca directamente el producto en las plataformas y devuelve todos los resultados sin filtrar
   */
  async buscarDirecto(inputs: ScrapingInputs): Promise<{
    tablaCompradores: TablaCompradores[]
    jsonCompradores: JSONCompradores | null // null para búsqueda directa (solo se guarda en total_resultados_scrapping)
    todasUrlsEncontradas: string[]
    totalResultadosScrapping: JSONCompradores // Todos los resultados sin filtrar
  }> {
    const todasUrlsEncontradas: string[] = []
    const tiempoInicio = Date.now()

    // Obtener plataformas según categoría y país (si es búsqueda avanzada)
    const plataformasAConsultar = this.obtenerPlataformasPorCategoria(inputs.categoria, inputs)

    console.log(`\n${'='.repeat(80)}`)
    console.log(`🚀 [Processor] INICIANDO BÚSQUEDA DIRECTA (SIN FILTROS)`)
    console.log(`${'='.repeat(80)}`)
    console.log(`📋 [Processor] INPUTS RECIBIDOS:`)
    console.log(`   - Producto: "${inputs.producto_text}"`)
    console.log(`   - Ubicación: "${inputs.ubicacion}"`)
    console.log(`   - Radio: ${inputs.radio_km}km`)
    console.log(`   - Categoría: "${inputs.categoria}"`)
    console.log(`   - Condición objetivo: "${inputs.condicion_objetivo}"`)
    console.log(`   - Idioma: "${inputs.idioma_busqueda}"`)
    const plataformasStr = plataformasAConsultar.map(p => typeof p === 'string' ? p : `${p.platform}${p.countryCode ? `(${p.countryCode})` : ''}`).join(', ')
    console.log(`🏪 [Processor] Plataformas a consultar: ${plataformasStr}`)
    console.log(`${'='.repeat(80)}\n`)

    // Buscar directamente sin variantes
    console.log(`\n${'━'.repeat(80)}`)
    console.log(`📌 BÚSQUEDA DIRECTA EN PLATAFORMAS (SIN VARIANTES)`)
    console.log(`${'━'.repeat(80)}`)
    
    const tiempoInicioBusqueda = Date.now()
    const anuncios = await this.buscarEnPlataformas(
      plataformasAConsultar,
      inputs,
      inputs.radio_km,
      false
    )
    
    const tiempoTotalBusqueda = Date.now() - tiempoInicioBusqueda
    console.log(`\n✅ [Processor] Búsqueda completada en ${tiempoTotalBusqueda}ms`)
    console.log(`📊 [Processor] Total anuncios encontrados: ${anuncios.length}`)

    // Recolectar todas las URLs encontradas
    anuncios.forEach(anuncio => {
      if (anuncio.url_anuncio && !todasUrlsEncontradas.includes(anuncio.url_anuncio)) {
        todasUrlsEncontradas.push(anuncio.url_anuncio)
      }
    })

    // Normalizar anuncios
    console.log(`\n🔄 [Processor] Normalizando anuncios...`)
    let todosAnuncios = normalizarAnuncios(anuncios, inputs)
    console.log(`✅ [Processor] Normalización completada: ${anuncios.length} → ${todosAnuncios.length} anuncios`)

    // Deduplicar
    console.log(`\n🔍 [Processor] Deduplicando anuncios...`)
    const antesDedup = todosAnuncios.length
    todosAnuncios = deduplicarAnuncios(todosAnuncios)
    console.log(`✅ [Processor] Deduplicación: ${antesDedup} → ${todosAnuncios.length} anuncios (${antesDedup - todosAnuncios.length} duplicados eliminados)`)

    // Para búsqueda directa, mantener el orden original de las fuentes escrapeadas (sin ordenar por precio)
    // Esto permite que los usuarios vean los anuncios en el mismo orden que se recibieron de las plataformas
    console.log(`\n📊 [Processor] Búsqueda directa: manteniendo orden original de las fuentes (sin ordenar por precio)`)
    console.log(`✅ [Processor] Orden original preservado`)

    // Generar tablas y JSONs usando los métodos existentes
    console.log(`\n📋 [Processor] Generando tabla COMPRADORES...`)
    const tablaCompradores = this.generarTablaCompradores(todosAnuncios)
    console.log(`✅ [Processor] Tabla COMPRADORES: ${tablaCompradores.length} filas`)
    
    // Para búsqueda directa, NO generamos jsonCompradores (se guarda null)
    // Todos los resultados se guardan SOLO en total_resultados_scrapping
    console.log(`📋 [Processor] Búsqueda directa: jsonCompradores será null (solo se guarda en total_resultados_scrapping)`)
    const jsonCompradores = null
    
    // Generar los resultados para total_resultados_scrapping (todos los anuncios sin filtrar)
    const totalResultadosScrapping = this.generarJSONCompradores(todosAnuncios)
    const totalResultadosCount = totalResultadosScrapping?.compradores?.length || 0
    console.log(`📋 [Processor] Total resultados para total_resultados_scrapping: ${totalResultadosCount} anuncios`)

    const tiempoTotal = Date.now() - tiempoInicio
    console.log(`\n${'='.repeat(80)}`)
    console.log(`✅ [Processor] BÚSQUEDA DIRECTA COMPLETADA`)
    console.log(`${'='.repeat(80)}`)
    console.log(`⏱️  Tiempo total: ${tiempoTotal}ms`)
    console.log(`📊 Total anuncios encontrados: ${tablaCompradores.length}`)
    console.log(`📊 URLs únicas: ${todasUrlsEncontradas.length}`)
    console.log(`${'='.repeat(80)}\n`)

    return {
      tablaCompradores,
      jsonCompradores, // null para búsqueda directa
      todasUrlsEncontradas,
      totalResultadosScrapping, // Todos los resultados sin filtrar
    }
  }

  /**
   * Procesa la búsqueda completa según las especificaciones
   * Flujo: generar variantes → lanzar búsquedas → verificación GPT (siempre activa) → outliers → inferencia estado
   */
  async procesar(inputs: ScrapingInputs): Promise<{
    tablaCompradores: TablaCompradores[]
    tablaVendedores: TablaVendedores[]
    jsonCompradores: JSONCompradores
    jsonVendedores: JSONVendedores
    todasUrlsEncontradas: string[]
    totalAnunciosAnalizados: number
    totalAnunciosDescartados: number
    totalAnunciosOutliers: number
    totalAnunciosAnalizadosFiltrados: number // Total de URLs que partió el análisis (todasUrlsEncontradas.length)
    totalResultadosScrapping: JSONCompradores // Todos los resultados sin filtrar (antes del análisis inteligente)
  }> {
    const todasUrlsEncontradas: string[] = []
    const tiempoInicio = Date.now()

    // Obtener plataformas según categoría y país (si es búsqueda avanzada)
    const plataformasAConsultar = this.obtenerPlataformasPorCategoria(inputs.categoria, inputs)

    console.log(`\n${'='.repeat(80)}`)
    console.log(`🚀 [Processor] INICIANDO PROCESAMIENTO DE SCRAPING`)
    console.log(`${'='.repeat(80)}`)
    console.log(`📋 [Processor] INPUTS RECIBIDOS:`)
    console.log(`   - Producto: "${inputs.producto_text}"`)
    console.log(`   - Ubicación: "${inputs.ubicacion}"`)
    console.log(`   - Radio: ${inputs.radio_km}km`)
    console.log(`   - Categoría: "${inputs.categoria}"`)
    console.log(`   - Condición objetivo: "${inputs.condicion_objetivo}"`)
    console.log(`   - Idioma: "${inputs.idioma_busqueda}"`)
    console.log(`   - Min páginas por plataforma: ${inputs.min_paginas_por_plataforma}`)
    console.log(`   - Min resultados por plataforma: ${inputs.min_resultados_por_plataforma}`)
    const plataformasStr = plataformasAConsultar.map(p => typeof p === 'string' ? p : `${p.platform}${p.countryCode ? `(${p.countryCode})` : ''}`).join(', ')
    console.log(`🏪 [Processor] Plataformas a consultar: ${plataformasStr}`)
    console.log(`${'='.repeat(80)}\n`)

    // Paso 1: Generar variantes con ChatGPT
    console.log(`\n${'━'.repeat(80)}`)
    console.log(`📌 PASO 1/5: GENERAR VARIANTES DE BÚSQUEDA CON CHATGPT`)
    console.log(`${'━'.repeat(80)}`)
    console.log(`🤖 [Processor] Llamando a ChatGPT para generar variantes...`)
    console.log(`   📤 Input: producto_text="${inputs.producto_text}", idioma="${inputs.idioma_busqueda}"`)
    const tiempoInicioVariantes = Date.now()
    const chatGPTResult = await generateSearchVariants(inputs.producto_text, inputs.idioma_busqueda as 'es' | 'en')
    const tiempoVariantes = Date.now() - tiempoInicioVariantes
    console.log(`   ⏱️  Tiempo de respuesta de ChatGPT: ${tiempoVariantes}ms`)
    
    let variantes: string[]
    if (chatGPTResult.success && chatGPTResult.variants) {
      variantes = chatGPTResult.variants
      console.log(`✅ [Processor] ChatGPT generó ${variantes.length} variantes de búsqueda:`)
      variantes.forEach((v, i) => console.log(`   ${i + 1}. "${v}"`))
    } else {
      console.log(`⚠️ [Processor] ChatGPT no disponible, usando generación de variantes por defecto`)
      console.log(`   Razón: ${chatGPTResult.error}`)
      variantes = generarVariantesBusqueda(inputs.producto_text)
      console.log(`   📝 Variantes generadas por defecto: ${variantes.join(', ')}`)
    }

    // Paso 2: Determinar qué búsquedas usar
    const productoTrimmed = inputs.producto_text.trim()
    const palabras = productoTrimmed.split(/\s+/).filter(p => p.length > 0)
    const esPalabraCorta = palabras.length === 1 && palabras[0].length <= 5
    
    let busquedas: string[]
    if (esPalabraCorta) {
      console.log(`\n⚠️ [Processor] Producto es una sola palabra de ${palabras[0].length} letras (≤5)`)
      console.log(`   🔄 Usando SOLO las variantes de ChatGPT (excluyendo búsqueda original)`)
      busquedas = variantes
    } else {
      console.log(`\n✅ [Processor] Producto tiene ${palabras.length} palabra(s), usando original + variantes`)
      busquedas = [inputs.producto_text, ...variantes]
    }
    
    console.log(`📝 [Processor] Total búsquedas a ejecutar: ${busquedas.length}`)
    console.log(`📝 [Processor] Búsquedas: ${busquedas.join(', ')}`)

    // Paso 2: Lanzar las búsquedas (en serie con delay si es Milanuncios, en paralelo si no)
    const tieneMilanuncios = plataformasAConsultar.includes('milanuncios')
    const modoEjecucion = tieneMilanuncios ? 'SERIE (con delay de 10s entre cada una para Milanuncios)' : 'PARALELO'
    
    console.log(`\n${'━'.repeat(80)}`)
    console.log(`📌 PASO 2/5: LANZAR ${busquedas.length} BÚSQUEDAS EN ${modoEjecucion}`)
    console.log(`${'━'.repeat(80)}`)
    
    if (tieneMilanuncios) {
      console.log(`🔍 [Processor] Iniciando búsquedas en serie (con delay de 10s entre cada una para evitar rate limiting de Milanuncios)...`)
    } else {
      console.log(`🔍 [Processor] Iniciando búsquedas paralelas...`)
    }
    
    const tiempoInicioBusquedas = Date.now()
    
    let resultadosBusquedas: AnuncioRaw[][]
    
    if (tieneMilanuncios) {
      // Ejecutar búsquedas en serie con delay de 10 segundos entre cada una (solo para Milanuncios)
      resultadosBusquedas = []
      
      for (let index = 0; index < busquedas.length; index++) {
        const busqueda = busquedas[index]
        
        // Esperar 10 segundos antes de cada búsqueda (excepto la primera)
        if (index > 0) {
          console.log(`\n⏳ [Processor] Esperando 10 segundos antes de la búsqueda ${index + 1} (rate limiting de Milanuncios)...`)
          await new Promise(resolve => setTimeout(resolve, 10000))
        }
        
        const tiempoInicioBusqueda = Date.now()
        console.log(`\n🔍 [Processor] ━━━ Búsqueda ${index + 1}/${busquedas.length} ━━━`)
        console.log(`   📝 Término de búsqueda: "${busqueda}"`)
        console.log(`   🕐 Inicio: ${new Date(tiempoInicioBusqueda).toISOString()}`)
        
        const inputsBusqueda = { ...inputs, producto_text: busqueda }
        const anuncios = await this.buscarEnPlataformas(
          plataformasAConsultar,
          inputsBusqueda,
          inputs.radio_km,
          false
        )
        
        const tiempoBusqueda = Date.now() - tiempoInicioBusqueda
        console.log(`   ✅ Búsqueda ${index + 1} completada en ${tiempoBusqueda}ms`)
        console.log(`   📊 Anuncios encontrados: ${anuncios.length}`)
        
        // Recolectar todas las URLs encontradas
        anuncios.forEach(anuncio => {
          if (anuncio.url_anuncio && !todasUrlsEncontradas.includes(anuncio.url_anuncio)) {
            todasUrlsEncontradas.push(anuncio.url_anuncio)
          }
        })
        
        resultadosBusquedas.push(anuncios)
      }
    } else {
      // Ejecutar búsquedas en paralelo (para otras plataformas)
      const busquedasPromesas = busquedas.map(async (busqueda, index) => {
        const tiempoInicioBusqueda = Date.now()
        console.log(`\n🔍 [Processor] ━━━ Búsqueda ${index + 1}/${busquedas.length} ━━━`)
        console.log(`   📝 Término de búsqueda: "${busqueda}"`)
        console.log(`   🕐 Inicio: ${new Date(tiempoInicioBusqueda).toISOString()}`)
        
        const inputsBusqueda = { ...inputs, producto_text: busqueda }
        const anuncios = await this.buscarEnPlataformas(
          plataformasAConsultar,
          inputsBusqueda,
          inputs.radio_km,
          false
        )
        
        const tiempoBusqueda = Date.now() - tiempoInicioBusqueda
        console.log(`   ✅ Búsqueda ${index + 1} completada en ${tiempoBusqueda}ms`)
        console.log(`   📊 Anuncios encontrados: ${anuncios.length}`)
        
        // Recolectar todas las URLs encontradas
        anuncios.forEach(anuncio => {
          if (anuncio.url_anuncio && !todasUrlsEncontradas.includes(anuncio.url_anuncio)) {
            todasUrlsEncontradas.push(anuncio.url_anuncio)
          }
        })
        
        return anuncios
      })
      
      console.log(`\n⏳ [Processor] Esperando que todas las búsquedas paralelas completen...`)
      resultadosBusquedas = await Promise.all(busquedasPromesas)
    }
    
    const tiempoTotalBusquedas = Date.now() - tiempoInicioBusquedas
    
    // Consolidar todos los resultados
    let todosAnunciosRaw: AnuncioRaw[] = []
    console.log(`\n📊 [Processor] RESULTADOS DE BÚSQUEDAS:`)
    resultadosBusquedas.forEach((anuncios, index) => {
      console.log(`   Búsqueda ${index + 1} ("${busquedas[index]}"): ${anuncios.length} anuncios`)
      todosAnunciosRaw.push(...anuncios)
    })
    
    console.log(`\n✅ [Processor] Búsquedas completadas en ${tiempoTotalBusquedas}ms`)
    console.log(`📊 [Processor] Total anuncios consolidados: ${todosAnunciosRaw.length}`)

    // Normalizar anuncios
    console.log(`\n🔄 [Processor] Normalizando anuncios...`)
    let todosAnuncios = normalizarAnuncios(todosAnunciosRaw, inputs)
    console.log(`✅ [Processor] Normalización completada: ${todosAnunciosRaw.length} → ${todosAnuncios.length} anuncios`)

    // Deduplicar antes de la verificación con ChatGPT
    console.log(`\n🔍 [Processor] Deduplicando anuncios...`)
    const antesDedup = todosAnuncios.length
    const todosAnunciosAntesDedup = [...todosAnuncios]
    todosAnuncios = deduplicarAnuncios(todosAnuncios)
    const duplicadosEliminados = antesDedup - todosAnuncios.length
    console.log(`✅ [Processor] Deduplicación: ${antesDedup} → ${todosAnuncios.length} anuncios (${duplicadosEliminados} duplicados eliminados)`)
    
    // Guardar información de duplicados eliminados para el resumen final
    const urlsDuplicadas: string[] = []
    if (duplicadosEliminados > 0) {
      const urlsDespuesDedup = new Set(todosAnuncios.map(a => a.url_anuncio))
      todosAnunciosAntesDedup.forEach(anuncio => {
        if (!urlsDespuesDedup.has(anuncio.url_anuncio)) {
          urlsDuplicadas.push(anuncio.url_anuncio)
        }
      })
    }

    // Guardar TODOS los anuncios sin filtrar (después de normalizar y deduplicar, pero ANTES del análisis inteligente)
    // Esto se usará para total_resultados_scrapping
    const todosAnunciosSinFiltrar = [...todosAnuncios]
    const totalResultadosScrapping = this.generarJSONCompradores(todosAnunciosSinFiltrar)
    console.log(`\n📋 [Processor] Guardando TODOS los resultados sin filtrar para total_resultados_scrapping: ${totalResultadosScrapping?.compradores?.length || 0} anuncios`)

    // Estructura para rastrear todos los anuncios descartados
    interface AnuncioDescartado {
      url: string
      titulo: string
      precio?: number
      razon: string
      etapa: string
    }
    const todosAnunciosDescartados: AnuncioDescartado[] = []

    // Paso 3: Verificación con ChatGPT (siempre se ejecuta)
    console.log(`\n${'━'.repeat(80)}`)
    console.log(`📌 PASO 3/5: VERIFICACIÓN CON CHATGPT (SIEMPRE ACTIVA)`)
    console.log(`${'━'.repeat(80)}`)
    console.log(`🤖 [Processor] Verificando coincidencia con ChatGPT...`)
    console.log(`   📝 Producto buscado: "${inputs.producto_text}"`)
    console.log(`   📊 Anuncios a verificar: ${todosAnuncios.length}`)
    console.log(`   ⚠️  IMPORTANTE: Solo se usa el TÍTULO del anuncio, NO la descripción`)
    
    // Preparar todas las variantes a probar: input original + variantes generadas
    const todasVariantes = [inputs.producto_text, ...variantes]
    console.log(`   🔍 Variantes a probar (${todasVariantes.length}):`)
    todasVariantes.forEach((v, i) => {
      const tipo = i === 0 ? '(original)' : '(variante)'
      console.log(`      ${i + 1}. "${v}" ${tipo}`)
    })
    
    const antesVerificacionGPT = todosAnuncios.length
    const anunciosDescartadosPorGPT: AnuncioNormalizado[] = []
    const anunciosDespuesGPT: AnuncioNormalizado[] = []
    const tiempoInicioVerificacion = Date.now()
    
    let contadorGPT = 0
    for (const anuncio of todosAnuncios) {
      contadorGPT++
      const tiempoInicioAnuncio = Date.now()
      
      try {
        console.log(`\n   🔍 [${contadorGPT}/${antesVerificacionGPT}] Verificando con GPT:`)
        console.log(`      Título: "${anuncio.titulo.substring(0, 70)}..."`)
        
        // Una sola llamada a ChatGPT con todas las variantes (solo título, sin descripción)
        const verificacion = await verificarCoincidenciaAnuncio(
          anuncio.titulo,
          todasVariantes
        )
        
        const tiempoAnuncio = Date.now() - tiempoInicioAnuncio
        console.log(`      ⏱️  Tiempo de respuesta GPT: ${tiempoAnuncio}ms`)
        console.log(`      📊 Resultado: ${verificacion.success ? '✅ Éxito' : '❌ Error'}, coincide: ${verificacion.coincide ? '✅ SÍ' : '❌ NO'}`)
        
        if (verificacion.success && verificacion.coincide === true) {
          anunciosDespuesGPT.push(anuncio)
          const varianteInfo = verificacion.varianteAceptada 
            ? ` (coincide con: "${verificacion.varianteAceptada}")` 
            : ''
          console.log(`      ✅ ACEPTADO por GPT${varianteInfo}`)
        } else {
          anunciosDescartadosPorGPT.push(anuncio)
          const razonDescarto = verificacion.error 
            ? `Error en verificación: ${verificacion.error}`
            : 'ChatGPT determinó que ninguna variante coincide con el anuncio'
          todosAnunciosDescartados.push({
            url: anuncio.url_anuncio,
            titulo: anuncio.titulo,
            precio: anuncio.precio_eur,
            razon: razonDescarto,
            etapa: 'Verificación ChatGPT'
          })
          if (verificacion.error) {
            console.log(`      ❌ DESCARTADO por GPT: ${verificacion.error}`)
          } else {
            console.log(`      ❌ DESCARTADO por GPT (ninguna variante coincidió)`)
          }
        }
      } catch (error) {
        const tiempoAnuncio = Date.now() - tiempoInicioAnuncio
        console.error(`      ⚠️ [${contadorGPT}/${antesVerificacionGPT}] Error verificando anuncio (${tiempoAnuncio}ms):`, error)
        // En caso de error, conservar el anuncio
        anunciosDespuesGPT.push(anuncio)
        console.log(`      ⚠️  Conservado por error en verificación`)
      }
    }
    
    const tiempoVerificacion = Date.now() - tiempoInicioVerificacion
    console.log(`\n✅ [Processor] Verificación GPT completada en ${tiempoVerificacion}ms`)
    console.log(`   📊 Resultado: ${antesVerificacionGPT} → ${anunciosDespuesGPT.length} anuncios`)
    console.log(`   ❌ Descartados: ${anunciosDescartadosPorGPT.length}`)
    console.log(`   ✅ Aceptados: ${anunciosDespuesGPT.length}`)
    todosAnuncios = anunciosDespuesGPT

    // Paso 4: Eliminar outliers
    console.log(`\n${'━'.repeat(80)}`)
    console.log(`📌 PASO 4/5: FILTRAR OUTLIERS (PRECIOS EXTREMOS)`)
    console.log(`${'━'.repeat(80)}`)
    console.log(`🔍 [Processor] Filtrando outliers...`)
    const antesOutliers = todosAnuncios.length
    const precios = todosAnuncios.map(a => a.precio_eur).filter(p => p > 0)
    if (precios.length > 0) {
      const precioMin = Math.min(...precios)
      const precioMax = Math.max(...precios)
      const precioMedio = precios.reduce((a, b) => a + b, 0) / precios.length
      console.log(`   📊 Estadísticas de precios:`)
      console.log(`      - Mínimo: ${precioMin}€`)
      console.log(`      - Máximo: ${precioMax}€`)
      console.log(`      - Media: ${precioMedio.toFixed(2)}€`)
      console.log(`      - Total anuncios: ${precios.length}`)
    }
    
    const anunciosAntesOutliers = [...todosAnuncios]
    const resultadoOutliers = filtrarOutliers(todosAnuncios)
    todosAnuncios = resultadoOutliers.filtrados
    const eliminadosPorOutliers = antesOutliers - todosAnuncios.length
    
    // Agregar los eliminados por outliers a la lista de descartados
    resultadoOutliers.eliminados.forEach(({ anuncio, razon }) => {
      todosAnunciosDescartados.push({
        url: anuncio.url_anuncio,
        titulo: anuncio.titulo,
        precio: anuncio.precio_eur,
        razon: razon,
        etapa: 'Filtro de outliers (precios extremos)'
      })
    })
    
    console.log(`\n✅ [Processor] Filtro de outliers: ${antesOutliers} → ${todosAnuncios.length} anuncios (${eliminadosPorOutliers} outliers eliminados)`)
    
    // Mostrar todos los anuncios que pasaron el filtro de outliers
    if (todosAnuncios.length > 0) {
      console.log(`\n   ✅ Anuncios que PASARON el filtro de outliers (${todosAnuncios.length}):`)
      todosAnuncios.forEach((anuncio, index) => {
        console.log(`      ${index + 1}. "${anuncio.titulo.substring(0, 60)}..." - ${anuncio.precio_eur}€ - ${anuncio.url_anuncio}`)
      })
    }

    // Paso 5: Inferir estado del producto con ChatGPT
    console.log(`\n${'━'.repeat(80)}`)
    console.log(`📌 PASO 5/5: INFERIR ESTADO DEL PRODUCTO CON CHATGPT`)
    console.log(`${'━'.repeat(80)}`)
    console.log(`🤖 [Processor] Infiriendo estado del producto...`)
    console.log(`   📊 Anuncios a procesar: ${todosAnuncios.length}`)
    
    const tiempoInicioInferencia = Date.now()
    let contadorInferencia = 0
    
    for (const anuncio of todosAnuncios) {
      contadorInferencia++
      const tiempoInicioAnuncio = Date.now()
      
      try {
        if (contadorInferencia <= 3 || contadorInferencia % 5 === 0) {
          console.log(`\n   🔍 [${contadorInferencia}/${todosAnuncios.length}] Infiriendo estado:`)
          console.log(`      Título: "${anuncio.titulo.substring(0, 70)}..."`)
        }
        
        const resultadoEstado = await inferirEstadoProducto(anuncio.titulo, anuncio.descripcion || '')
        const tiempoAnuncio = Date.now() - tiempoInicioAnuncio
        
        if (contadorInferencia <= 3 || contadorInferencia % 5 === 0) {
          console.log(`      ⏱️  Tiempo de respuesta GPT: ${tiempoAnuncio}ms`)
        }
        
        if (resultadoEstado.success && resultadoEstado.estado) {
          if (resultadoEstado.estado === 'ND') {
            // Si ChatGPT retorna "ND", usar el estado del formulario
            anuncio.estado_inferido = inputs.condicion_objetivo
            anuncio.estado_normalizado = inputs.condicion_objetivo as any
            if (contadorInferencia <= 3 || contadorInferencia % 5 === 0) {
              console.log(`      📊 Estado inferido: ND → usando estado del formulario: "${inputs.condicion_objetivo}"`)
            }
          } else {
            anuncio.estado_inferido = resultadoEstado.estado
            // Mapear el estado inferido a estado_normalizado
            const mapeoEstado: Record<string, any> = {
              'Nuevo': 'nuevo',
              'Como nuevo': 'como_nuevo',
              'Buen estado': 'buen_estado',
              'Usado': 'usado',
              'Necesita reparación': 'aceptable',
            }
            anuncio.estado_normalizado = mapeoEstado[resultadoEstado.estado] || null
            if (contadorInferencia <= 3 || contadorInferencia % 5 === 0) {
              console.log(`      📊 Estado inferido: "${resultadoEstado.estado}" → normalizado: "${anuncio.estado_normalizado}"`)
            }
          }
        }
      } catch (error) {
        const tiempoAnuncio = Date.now() - tiempoInicioAnuncio
        console.error(`  ⚠️ [${contadorInferencia}/${todosAnuncios.length}] Error infiriendo estado (${tiempoAnuncio}ms):`, error)
        // En caso de error, usar el estado del formulario
        anuncio.estado_inferido = inputs.condicion_objetivo
        anuncio.estado_normalizado = inputs.condicion_objetivo as any
      }
    }
    
    const tiempoInferencia = Date.now() - tiempoInicioInferencia
    console.log(`\n✅ [Processor] Inferencia de estado completada en ${tiempoInferencia}ms`)
    console.log(`   📊 Anuncios procesados: ${todosAnuncios.length}`)

    // Ordenar por precio ascendente
    console.log(`\n📊 [Processor] Ordenando por precio ascendente...`)
    todosAnuncios.sort((a, b) => a.precio_eur - b.precio_eur)
    console.log(`✅ [Processor] Ordenamiento completado`)

    // Generar tablas y JSONs
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`📊 [Processor] Generando tablas y JSONs finales...`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    
    console.log(`📋 [Processor] Generando tabla COMPRADORES...`)
    const tablaCompradores = this.generarTablaCompradores(todosAnuncios)
    console.log(`✅ [Processor] Tabla COMPRADORES: ${tablaCompradores.length} filas`)
    
    console.log(`📋 [Processor] Generando tabla VENDEDORES...`)
    const tablaVendedores = this.generarTablaVendedores(todosAnuncios, plataformasAConsultar)
    console.log(`✅ [Processor] Tabla VENDEDORES: ${tablaVendedores.length} filas`)
    
    console.log(`📋 [Processor] Generando JSON COMPRADORES...`)
    const jsonCompradores = this.generarJSONCompradores(todosAnuncios)
    const compradoresCount = jsonCompradores?.compradores?.length || 0
    console.log(`✅ [Processor] JSON COMPRADORES: ${compradoresCount} items`)
    
    // Mostrar todos los anuncios finales que estarán en el JSON COMPRADORES
    if (jsonCompradores?.compradores && jsonCompradores.compradores.length > 0) {
      console.log(`\n   📋 ANUNCIOS FINALES EN JSON COMPRADORES (${jsonCompradores.compradores.length}):`)
      jsonCompradores.compradores.forEach((comprador: any, index: number) => {
        console.log(`      ${index + 1}. "${comprador.titulo || comprador.plataforma || 'Sin título'}" - ${comprador.precio_eur || 'Sin precio'}€`)
        console.log(`         URL: ${comprador.url_anuncio || 'Sin URL'}`)
        console.log(`         Plataforma: ${comprador.plataforma || 'N/A'}`)
        console.log(`         Ciudad: ${comprador.ciudad_o_zona || 'N/A'}`)
        console.log(`         Estado: ${comprador.estado_declarado || 'N/A'}`)
      })
    } else {
      console.log(`   ⚠️  JSON COMPRADORES está vacío o no tiene la estructura esperada`)
    }
    
    console.log(`📋 [Processor] Generando JSON VENDEDORES...`)
    const jsonVendedores = this.generarJSONVendedores(todosAnuncios, plataformasAConsultar, inputs)
    const vendedoresCount = jsonVendedores?.vendedores?.length || 0
    console.log(`✅ [Processor] JSON VENDEDORES: ${vendedoresCount} items`)
    
    // Calcular tiempo total
    const tiempoFin = Date.now()
    const tiempoTotalMs = tiempoFin - tiempoInicio
    const tiempoTotalSegundos = Math.floor(tiempoTotalMs / 1000)
    const tiempoTotalMinutos = Math.floor(tiempoTotalSegundos / 60)
    const tiempoTotalHoras = Math.floor(tiempoTotalMinutos / 60)
    
    let tiempoTotalFormateado = ''
    if (tiempoTotalHoras > 0) {
      tiempoTotalFormateado = `${tiempoTotalHoras}h ${tiempoTotalMinutos % 60}m ${tiempoTotalSegundos % 60}s`
    } else if (tiempoTotalMinutos > 0) {
      tiempoTotalFormateado = `${tiempoTotalMinutos}m ${tiempoTotalSegundos % 60}s`
    } else {
      tiempoTotalFormateado = `${tiempoTotalSegundos}s ${tiempoTotalMs % 1000}ms`
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`✅ [Processor] Procesamiento completado exitosamente`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`📊 [Processor] RESUMEN FINAL:`)
    console.log(`   ⏱️  Tiempo total: ${tiempoTotalFormateado} (${tiempoTotalMs}ms)`)
    console.log(`   📦 Anuncios procesados: ${todosAnuncios.length}`)
    console.log(`   📋 Tabla COMPRADORES: ${tablaCompradores.length} filas`)
    console.log(`   📋 Tabla VENDEDORES: ${tablaVendedores.length} filas`)
    console.log(`   📄 JSON COMPRADORES: ${compradoresCount} items`)
    console.log(`   📄 JSON VENDEDORES: ${vendedoresCount} items`)
    console.log(`   🔗 Total URLs encontradas: ${todasUrlsEncontradas.length}`)
    console.log(`\n📊 [Processor] ESTADÍSTICAS DE FILTRADO:`)
    console.log(`   🤖 Anuncios enviados a ChatGPT para verificación: ${antesVerificacionGPT}`)
    console.log(`   ❌ Anuncios descartados por ChatGPT: ${anunciosDescartadosPorGPT.length}`)
    console.log(`   ✅ Anuncios aceptados por ChatGPT: ${anunciosDespuesGPT.length}`)

    // Resumen completo de anuncios descartados
    console.log(`\n${'='.repeat(100)}`)
    console.log(`📋 RESUMEN COMPLETO DE ANUNCIOS DESCARTADOS`)
    console.log(`${'='.repeat(100)}`)
    console.log(`Total de anuncios descartados: ${todosAnunciosDescartados.length}`)
    
    if (todosAnunciosDescartados.length > 0) {
      // Agrupar por etapa
      const porEtapa = todosAnunciosDescartados.reduce((acc, descartado) => {
        if (!acc[descartado.etapa]) {
          acc[descartado.etapa] = []
        }
        acc[descartado.etapa].push(descartado)
        return acc
      }, {} as Record<string, AnuncioDescartado[]>)
      
      Object.entries(porEtapa).forEach(([etapa, descartados]) => {
        console.log(`\n📌 ${etapa} (${descartados.length} anuncios):`)
        descartados.forEach((desc, index) => {
          const precioInfo = desc.precio ? ` - ${desc.precio}€` : ''
          console.log(`   ${index + 1}. ${desc.url}`)
          console.log(`      Título: "${desc.titulo.substring(0, 80)}${desc.titulo.length > 80 ? '...' : ''}"${precioInfo}`)
          console.log(`      Razón: ${desc.razon}`)
        })
      })
      
      // Lista completa ordenada por URL
      console.log(`\n📋 LISTA COMPLETA DE URLs DESCARTADAS (${todosAnunciosDescartados.length}):`)
      todosAnunciosDescartados.forEach((desc, index) => {
        console.log(`   ${index + 1}. ${desc.url} - ${desc.etapa}: ${desc.razon}`)
      })
    } else {
      console.log(`   ✅ No se descartaron anuncios durante el proceso`)
    }
    console.log(`${'='.repeat(100)}\n`)

    // Mostrar formato de salida esperado
    console.log(`\n📤 [Processor] FORMATO DE SALIDA ESPERADO:`)
    console.log(`   - JSON COMPRADORES: objeto con array 'compradores'`)
    console.log(`   - JSON VENDEDORES: objeto con array 'vendedores' y 'descripcion_anuncio'`)
    console.log(`   - TABLA COMPRADORES: array de objetos con campos: Plataforma, Precio, Estado, Ciudad, URL, fecha`)
    console.log(`   - TABLA VENDEDORES: array de objetos con tipos: Mínimo, Ideal, Rápido`)
    console.log(`   - TODAS URLs: array con todas las URLs encontradas (sin filtrar)`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

    // Calcular contadores finales para la base de datos
    const totalAnunciosAnalizados = todosAnunciosRaw.length // Total de anuncios obtenidos de todas las búsquedas (antes de cualquier filtrado)
    const totalAnunciosDescartados = anunciosDescartadosPorGPT.length // Descartados por ChatGPT
    const totalAnunciosOutliers = resultadoOutliers.eliminados.length // Descartados por outliers
    
    console.log(`\n📊 [Processor] CONTADORES FINALES PARA BASE DE DATOS:`)
    console.log(`   📦 total_anuncios_analizados: ${totalAnunciosAnalizados} (anuncios obtenidos de todas las búsquedas, antes de filtrado)`)
    console.log(`   ❌ total_anuncios_descartados: ${totalAnunciosDescartados} (descartados por ChatGPT)`)
    console.log(`   📉 total_anuncios_outliers: ${totalAnunciosOutliers} (descartados por precios extremos)`)

    // Resumen final de URLs y recuento de exclusiones
    console.log(`\n${'='.repeat(100)}`)
    console.log(`📊 RESUMEN FINAL DE URLs Y EXCLUSIONES`)
    console.log(`${'='.repeat(100)}`)
    
    const totalUrlsIniciales = todasUrlsEncontradas.length
    const urlsEnResultadoFinal = jsonCompradores?.compradores?.length || 0
    const urlsExcluidas = totalUrlsIniciales - urlsEnResultadoFinal
    
    console.log(`\n🔗 TOTAL DE URLs QUE PARTIÓ EL ANÁLISIS: ${totalUrlsIniciales}`)
    console.log(`✅ URLs EN EL RESULTADO FINAL (mostradas al usuario): ${urlsEnResultadoFinal}`)
    console.log(`❌ URLs EXCLUIDAS DEL RESULTADO FINAL: ${urlsExcluidas}`)
    
    if (urlsExcluidas > 0) {
      console.log(`\n📋 DESGLOSE DE POR QUÉ LOS ANUNCIOS NO FORMAN PARTE DEL LISTADO FINAL:`)
      
      // Contar descartados por ChatGPT
      const descartadosPorGPT = todosAnunciosDescartados.filter(d => 
        d.etapa.includes('ChatGPT') || d.etapa.includes('verificación')
      ).length
      
      // Contar descartados por outliers
      const descartadosPorOutliers = todosAnunciosDescartados.filter(d => 
        d.etapa.includes('outliers') || d.etapa.includes('precios extremos')
      ).length
      
      // Contar duplicados eliminados (calculado antes)
      const descartadosPorDeduplicacion = urlsDuplicadas.length
      
      // Contar otros motivos (normalización que elimina anuncios sin precio válido, etc.)
      const descartadosPorOtros = urlsExcluidas - descartadosPorGPT - descartadosPorOutliers - descartadosPorDeduplicacion
      
      console.log(`   🤖 Descartados por ChatGPT (relevancia/no coincidencia): ${descartadosPorGPT}`)
      console.log(`   📉 Descartados por outliers (precios extremos): ${descartadosPorOutliers}`)
      if (descartadosPorDeduplicacion > 0) {
        console.log(`   🔄 Descartados por deduplicación: ${descartadosPorDeduplicacion}`)
      }
      if (descartadosPorOtros > 0) {
        console.log(`   ⚠️  Descartados por otros motivos (normalización, sin precio válido, etc.): ${descartadosPorOtros}`)
      }
      
      // Verificar que la suma coincide
      const sumaDescartados = descartadosPorGPT + descartadosPorOutliers + descartadosPorDeduplicacion + descartadosPorOtros
      if (sumaDescartados !== urlsExcluidas) {
        console.log(`   ⚠️  NOTA: Diferencia de ${urlsExcluidas - sumaDescartados} URLs (puede deberse a normalización o filtros adicionales)`)
      }
      
      // Mostrar porcentajes
      console.log(`\n📊 PORCENTAJES:`)
      const porcentajeFinal = totalUrlsIniciales > 0 ? ((urlsEnResultadoFinal / totalUrlsIniciales) * 100).toFixed(1) : '0.0'
      const porcentajeGPT = totalUrlsIniciales > 0 ? ((descartadosPorGPT / totalUrlsIniciales) * 100).toFixed(1) : '0.0'
      const porcentajeOutliers = totalUrlsIniciales > 0 ? ((descartadosPorOutliers / totalUrlsIniciales) * 100).toFixed(1) : '0.0'
      const porcentajeDeduplicacion = totalUrlsIniciales > 0 ? ((descartadosPorDeduplicacion / totalUrlsIniciales) * 100).toFixed(1) : '0.0'
      const porcentajeOtros = totalUrlsIniciales > 0 ? ((descartadosPorOtros / totalUrlsIniciales) * 100).toFixed(1) : '0.0'
      
      console.log(`   ✅ Resultado final: ${porcentajeFinal}% (${urlsEnResultadoFinal}/${totalUrlsIniciales})`)
      console.log(`   ❌ Descartados por ChatGPT: ${porcentajeGPT}% (${descartadosPorGPT}/${totalUrlsIniciales})`)
      console.log(`   ❌ Descartados por outliers: ${porcentajeOutliers}% (${descartadosPorOutliers}/${totalUrlsIniciales})`)
      if (descartadosPorDeduplicacion > 0) {
        console.log(`   ❌ Descartados por deduplicación: ${porcentajeDeduplicacion}% (${descartadosPorDeduplicacion}/${totalUrlsIniciales})`)
      }
      if (descartadosPorOtros > 0) {
        console.log(`   ❌ Descartados por otros motivos: ${porcentajeOtros}% (${descartadosPorOtros}/${totalUrlsIniciales})`)
      }
    } else {
      console.log(`\n✅ Todas las URLs están en el resultado final (no hubo exclusiones)`)
    }
    
    console.log(`${'='.repeat(100)}\n`)

    // Limpiar recursos antes de retornar
    console.log(`🧹 [Processor] Limpiando recursos...`)
    await this.limpiar()
    console.log(`✅ [Processor] Limpieza completada`)

    return {
      tablaCompradores,
      tablaVendedores,
      jsonCompradores,
      jsonVendedores,
      todasUrlsEncontradas,
      totalAnunciosAnalizados,
      totalAnunciosDescartados,
      totalAnunciosOutliers,
      totalAnunciosAnalizadosFiltrados: totalUrlsIniciales, // Total de URLs que partió el análisis
      totalResultadosScrapping, // Todos los resultados sin filtrar (antes del análisis inteligente)
    }
  }


  /**
   * Busca en todas las plataformas especificadas (en paralelo)
   * NOTA: Las llamadas internas de Milanuncios (paginación) siguen siendo en serie
   * @param plataformas - Array de plataformas, puede ser string[] (compatibilidad) o Array<{platform: string, countryCode?: string}>
   */
  private async buscarEnPlataformas(
    plataformas: string[] | Array<{ platform: string; countryCode?: string }>,
    inputs: ScrapingInputs,
    radio: number,
    busquedaLaxa: boolean
  ): Promise<AnuncioRaw[]> {
    // Normalizar entrada: convertir string[] a formato con país si es necesario
    const plataformasNormalizadas: Array<{ platform: string; countryCode?: string }> = 
      plataformas.map(p => typeof p === 'string' ? { platform: p } : p)
    
    console.log(`\n🔄 [Processor] Ejecutando búsquedas en ${plataformasNormalizadas.length} plataforma(s) en PARALELO:`)
    plataformasNormalizadas.forEach(p => {
      console.log(`   - ${p.platform}${p.countryCode ? ` (${p.countryCode})` : ''}`)
    })
    
    // Crear promesas para cada plataforma (se ejecutarán en paralelo)
    const promesasPlataformas = plataformasNormalizadas.map(async (plataformaInfo) => {
      const nombrePlataforma = plataformaInfo.platform.toLowerCase() // Normalizar a minúsculas
      const countryCode = plataformaInfo.countryCode
      
      const scraper = this.plataformas.get(nombrePlataforma)
      if (!scraper) {
        console.warn(`⚠️ [Processor] Plataforma ${nombrePlataforma} no implementada`)
        return []
      }

      try {
        console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
        console.log(`🔍 [Processor] Buscando en ${nombrePlataforma}${countryCode ? ` (${countryCode})` : ''}...`)
        console.log(`📋 [Processor] Parámetros: producto="${inputs.producto_text}", radio=${radio}km, búsqueda ${busquedaLaxa ? 'laxa' : 'estricta'}`)
        
        // Si es búsqueda avanzada, usar coordenadas específicas por plataforma y país
        let inputsParaPlataforma = { ...inputs, radio_km: radio }
        if (inputs.coordenadas_ip?.country_code) {
          const userCountryCode = inputs.coordenadas_ip.country_code
          const userCoords = { lat: inputs.coordenadas_ip.lat, lon: inputs.coordenadas_ip.lon }
          
          // Obtener coordenadas específicas para esta plataforma y país
          const platformCoords = getCoordinatesForPlatform(
            nombrePlataforma, 
            userCountryCode, 
            userCoords,
            countryCode // Pasar el país específico si está definido
          )
          
          if (platformCoords) {
            inputsParaPlataforma = {
              ...inputsParaPlataforma,
              coordenadas_ip: {
                lat: platformCoords.lat,
                lon: platformCoords.lon,
                country_code: platformCoords.countryCode
              }
            }
            console.log(`📍 [Processor] ${nombrePlataforma}${countryCode ? ` (${countryCode})` : ''}: usando coordenadas (${platformCoords.lat}, ${platformCoords.lon}) del país ${platformCoords.countryCode}`)
          } else {
            // Si no hay configuración específica, usar coordenadas del usuario
            console.log(`📍 [Processor] ${nombrePlataforma}${countryCode ? ` (${countryCode})` : ''}: usando coordenadas del usuario (${userCoords.lat}, ${userCoords.lon})`)
          }
        }
        
        const inicio = Date.now()
        const anuncios = await scraper.buscar(inputsParaPlataforma)
        const tiempo = Date.now() - inicio
        console.log(`✅ [Processor] ${nombrePlataforma} completado en ${tiempo}ms: ${anuncios.length} anuncios encontrados`)
        
        // Intentar obtener detalles de cada anuncio (solo si tiene URL válida)
        // NOTA: Wallapop ya proporciona toda la información en la API, no necesita obtener detalles
        if (anuncios.length > 0 && nombrePlataforma !== 'wallapop') {
          // Filtrar anuncios con URLs válidas
          const anunciosConUrlValida = anuncios.filter(a => 
            a.url_anuncio && 
            a.url_anuncio !== 'https://es.wallapop.com' && 
            a.url_anuncio.includes('/item/')
          )
          
          console.log(`🔍 [Processor] Obteniendo detalles de ${anunciosConUrlValida.length}/${anuncios.length} anuncios válidos de ${nombrePlataforma}...`)
          console.log(`   ⚠️ [Processor] ${anuncios.length - anunciosConUrlValida.length} anuncios sin URL válida serán marcados como verificado_tarjeta`)
          
          let detallesObtenidos = 0
          let detallesFallidos = 0
          const totalAnuncios = anunciosConUrlValida.length
          for (let i = 0; i < anunciosConUrlValida.length; i++) {
            const anuncio = anunciosConUrlValida[i]
            const numeroAnuncio = i + 1
            console.log(`  🔍 [Processor] Visitando anuncio ${numeroAnuncio}/${totalAnuncios}...`)
            if (!anuncio.verificado_tarjeta) {
              try {
                const detalle = await scraper.obtenerDetalleAnuncio?.(anuncio.url_anuncio, numeroAnuncio, totalAnuncios)
                if (detalle) {
                  Object.assign(anuncio, detalle)
                  detallesObtenidos++
                  console.log(`  ✅ [Processor] Anuncio ${numeroAnuncio}/${totalAnuncios} procesado correctamente`)
                } else {
                  // Si no se puede abrir, marcar como verificado por tarjeta
                  anuncio.verificado_tarjeta = true
                  detallesFallidos++
                  console.log(`  ⚠️ [Processor] Anuncio ${numeroAnuncio}/${totalAnuncios} sin detalle disponible`)
                }
              } catch (err) {
                anuncio.verificado_tarjeta = true
                detallesFallidos++
                console.log(`  ❌ [Processor] Error procesando anuncio ${numeroAnuncio}/${totalAnuncios}`)
              }
            } else {
              console.log(`  ⏭️ [Processor] Anuncio ${numeroAnuncio}/${totalAnuncios} ya verificado, omitiendo`)
            }
          }
          
          // Marcar anuncios sin URL válida como verificado_tarjeta
          const anunciosSinUrlValida = anuncios.filter(a => 
            !a.url_anuncio || 
            a.url_anuncio === 'https://es.wallapop.com' || 
            !a.url_anuncio.includes('/item/')
          )
          anunciosSinUrlValida.forEach(a => a.verificado_tarjeta = true)
          
          console.log(`✅ [Processor] Detalles de ${nombrePlataforma}: ${detallesObtenidos} obtenidos, ${detallesFallidos} fallidos, ${anunciosSinUrlValida.length} sin URL válida`)
        }

        console.log(`✅ [Processor] ${nombrePlataforma}: ${anuncios.length} anuncios encontrados`)
        return anuncios
      } catch (error) {
        console.error(`❌ [Processor] Error en ${nombrePlataforma}:`, error)
        if (error instanceof Error) {
          console.error(`❌ [Processor] Mensaje: ${error.message}`)
          console.error(`❌ [Processor] Stack: ${error.stack}`)
        }
        return [] // Retornar array vacío en caso de error
      }
    })

    // Ejecutar todas las plataformas en paralelo
    console.log(`\n⏳ [Processor] Esperando que todas las plataformas completen (ejecutándose en paralelo)...`)
    const resultadosPlataformas = await Promise.all(promesasPlataformas)
    
    // Consolidar todos los anuncios
    const todosAnuncios: AnuncioRaw[] = []
    resultadosPlataformas.forEach((anuncios, index) => {
      todosAnuncios.push(...anuncios)
      const plataformaInfo = plataformasNormalizadas[index]
      const nombrePlataforma = typeof plataformaInfo === 'string' ? plataformaInfo : plataformaInfo.platform
      const countryCode = typeof plataformaInfo === 'string' ? undefined : plataformaInfo.countryCode
      console.log(`✅ [Processor] ${nombrePlataforma}${countryCode ? ` (${countryCode})` : ''}: ${anuncios.length} anuncios agregados`)
    })
    
    console.log(`\n✅ [Processor] Total consolidado de todas las plataformas: ${todosAnuncios.length} anuncios`)
    return todosAnuncios
  }

  /**
   * Obtiene las plataformas según la categoría y país (si es búsqueda avanzada)
   * Mapea las categorías que vienen del formulario a las plataformas correspondientes
   * Si hay coordenadas de IP con country_code (búsqueda avanzada), también incluye fuentes de otros países
   * Devuelve una lista de objetos con plataforma y país, permitiendo múltiples llamadas a la misma plataforma
   * con diferentes coordenadas según la configuración en .env.local
   */
  private obtenerPlataformasPorCategoria(categoria: string, inputs?: ScrapingInputs): Array<{ platform: string; countryCode?: string }> {
    const categoryMap: Record<string, string[]> = {
      // Categorías del formulario
      // Categorías del formulario → categoria por plataforma 
      //'Electrónica' → 'electronica'
      //'Móviles y Tablets' → 'electronica' 
      //'Informática' → 'electronica' 
      //'Audio y Video' → 'electronica' 
      //'Electrodomésticos' → 'electrodomesticos'
      //'Hogar y Jardín' → 'hogar'
      //'Ropa y Accesorios' → 'moda' 
      //'Deportes y Ocio' → 'deporte'
      //'Coches' → 'motor' 
      //'Motos' → 'motor' 
      //'Libros y Música' → 'general' 
      //'Juguetes y Bebés' → 'general' 
      //'Otros' → 'general'

      general: ['wallapop', 'milanuncios', 'facebook_marketplace', 'tablondeanuncios'],
      //general: ['milanuncios'],
      electronica: ['wallapop', 'back_market', 'rebuy', 'swappie'],
      //electronica: ['milanuncios'],
      electrodomesticos: [],
      hogar: ['wallapop', 'milanuncios', 'facebook_marketplace', 'todocoleccion'],
      hogar_jardin: ['wallapop', 'milanuncios', 'facebook_marketplace', 'selency'],
      moda: ['wallapop', 'vinted', 'depop', 'vestiaire'],
      deporte: [],
      motor: [],
      // Categorías adicionales que pueden llegar del formulario
      otros: [],
      libros: [],
      juguetes: [],
      // ... agregar más según necesidad
    }

    // Normalizar categoría (convertir a minúsculas y reemplazar caracteres especiales)
    const categoriaNorm = categoria.toLowerCase().replace(/[^a-z]/g, '_')
    
    // Obtener plataformas base según categoría
    const plataformasBase = categoryMap[categoriaNorm] || []
    
    // Si es búsqueda avanzada (hay coordenadas de IP con country_code), incluir fuentes de otros países
    if (inputs?.coordenadas_ip?.country_code) {
      const userCountryCode = inputs.coordenadas_ip.country_code
      console.log(`\n🌍 [Processor] Búsqueda avanzada detectada - País del usuario: ${userCountryCode}`)
      console.log(`🌍 [Processor] Incluyendo fuentes de todos los países configurados...`)
      
      // Obtener todas las plataformas con sus países asociados desde las configuraciones
      const todasPlataformasConPais = getAllPlatformsFromCountrySources()
      
      // Convertir plataformas base a formato con país (usando el país del usuario por defecto)
      const plataformasBaseConPais = plataformasBase.map(p => ({
        platform: p,
        countryCode: userCountryCode // Por defecto, usar el país del usuario
      }))
      
      // Combinar plataformas base con todas las plataformas de países
      // NO eliminar duplicados - si wallapop está en ES_SOURCES e IT_SOURCES, aparecerá dos veces
      const todasPlataformas = [...plataformasBaseConPais, ...todasPlataformasConPais]
      
      // Crear un mapa para evitar duplicados exactos (misma plataforma + mismo país)
      const plataformasUnicas = new Map<string, { platform: string; countryCode: string }>()
      todasPlataformas.forEach(p => {
        const key = `${p.platform}:${p.countryCode}`
        if (!plataformasUnicas.has(key)) {
          plataformasUnicas.set(key, p)
        }
      })
      
      const resultado = Array.from(plataformasUnicas.values())
      
      console.log(`🌍 [Processor] Plataformas base (categoría): ${plataformasBase.join(', ')}`)
      console.log(`🌍 [Processor] Plataformas con país desde .env.local:`)
      todasPlataformasConPais.forEach(p => {
        console.log(`   - ${p.platform} (${p.countryCode})`)
      })
      console.log(`🌍 [Processor] Total plataformas a consultar: ${resultado.length}`)
      console.log(`🌍 [Processor] Detalle: ${resultado.map(p => `${p.platform}(${p.countryCode})`).join(', ')}`)
      
      return resultado
    }
    
    // Retornar plataformas base sin país si no es búsqueda avanzada
    return plataformasBase.map(p => ({ platform: p }))
  }

  /**
   * Filtra anuncios por condición mínima
   */
  private filtrarPorCondicion(
    anuncios: AnuncioNormalizado[],
    condicionMinima: string
  ): AnuncioNormalizado[] {
    const ordenCondiciones = [
      'nuevo',
      'como_nuevo',
      'muy_buen_estado',
      'buen_estado',
      'usado',
      'aceptable',
    ]

    const indiceMinimo = ordenCondiciones.indexOf(condicionMinima)
    if (indiceMinimo === -1) return anuncios

    return anuncios.filter(anuncio => {
      if (!anuncio.estado_normalizado) return false
      const indiceAnuncio = ordenCondiciones.indexOf(anuncio.estado_normalizado)
      return indiceAnuncio <= indiceMinimo
    })
  }

  /**
   * Genera la tabla COMPRADORES
   */
  private generarTablaCompradores(anuncios: AnuncioNormalizado[]): TablaCompradores[] {
    // Tomar todos los anuncios disponibles (ya ordenados por precio ascendente)
    return anuncios.map(anuncio => ({
      plataforma: anuncio.plataforma,
      precio: anuncio.precio_eur,
      estado_declarado: anuncio.estado_normalizado,
      ciudad_o_zona: anuncio.ciudad_normalizada || null,
      url_exacta: anuncio.url_listado 
        ? `${anuncio.url_anuncio} (${anuncio.url_listado})`
        : anuncio.url_anuncio,
      fecha_publicacion: anuncio.fecha_publicacion || 'ND',
      product_image: anuncio.product_image || null,
    }))
  }

  /**
   * Genera la tabla VENDEDORES
   */
  private generarTablaVendedores(
    anuncios: AnuncioNormalizado[],
    plataformas: string[]
  ): TablaVendedores[] {
    if (anuncios.length === 0) {
      return [
        { tipo_precio: 'minimo', precio: 0, plataforma: 'N/A', url_exacta: '', plataforma_sugerida: plataformas.join(', ') },
        { tipo_precio: 'ideal', precio: 0, plataforma: 'N/A', url_exacta: '', plataforma_sugerida: plataformas.join(', ') },
        { tipo_precio: 'rapido', precio: 0, plataforma: 'N/A', url_exacta: '', plataforma_sugerida: plataformas.join(', ') },
      ]
    }

    const precios = anuncios.map(a => a.precio_eur)
    const precioMinimo = Math.min(...precios)
    const precioIdeal = precios.reduce((a, b) => a + b, 0) / precios.length
    const precioRapido = Math.round(precioIdeal * 0.9 * 10) / 10

    const plataformasUnicas = new Set(anuncios.map(a => a.plataforma))
    const todasPlataformas = Array.from(plataformasUnicas).join(', ')
    const todasURLs = anuncios.map(a => a.url_anuncio).join('; ')

    return [
      {
        tipo_precio: 'minimo',
        precio: precioMinimo,
        plataforma: todasPlataformas,
        url_exacta: todasURLs,
        plataforma_sugerida: plataformas.join(', '),
      },
      {
        tipo_precio: 'ideal',
        precio: Math.round(precioIdeal * 10) / 10,
        plataforma: todasPlataformas,
        url_exacta: todasURLs,
        plataforma_sugerida: plataformas.join(', '),
      },
      {
        tipo_precio: 'rapido',
        precio: precioRapido,
        plataforma: todasPlataformas,
        url_exacta: todasURLs,
        plataforma_sugerida: plataformas.join(', '),
      },
    ]
  }

  /**
   * Genera el JSON COMPRADORES
   */
  private generarJSONCompradores(anuncios: AnuncioNormalizado[]): JSONCompradores {
    return {
      // Tomar todos los anuncios disponibles (ya ordenados por precio ascendente)
      compradores: anuncios.map(anuncio => {
        const comprador: any = {
          titulo: anuncio.titulo,
          plataforma: anuncio.plataforma,
          precio_eur: anuncio.precio_eur,
          moneda_original: anuncio.moneda_original || 'EUR',
          estado_declarado: anuncio.estado_normalizado,
          ciudad_o_zona: anuncio.ciudad_normalizada || null,
          url_anuncio: anuncio.url_anuncio,
          url_listado: anuncio.url_listado || null,
          fecha_publicacion: anuncio.fecha_publicacion || 'ND',
          product_image: anuncio.product_image || null,
          descripcion: anuncio.descripcion || null,
          is_shippable: anuncio.is_shippable ?? null,
          is_top_profile: anuncio.is_top_profile ?? null,
          user_id: anuncio.user_id || null,
        }
        
        // Agregar country_code para anuncios de Milanuncios (siempre "ES")
        if (anuncio.plataforma === 'milanuncios') {
          comprador.country_code = 'ES'
        }
        // Agregar country_code para anuncios de Wallapop (si está disponible)
        else if (anuncio.plataforma === 'wallapop' && anuncio.country_code) {
          comprador.country_code = anuncio.country_code
        }
        
        return comprador
      }),
    }
  }

  /**
   * Genera el JSON VENDEDORES
   */
  private generarJSONVendedores(
    anuncios: AnuncioNormalizado[],
    plataformas: string[],
    inputs: ScrapingInputs
  ): JSONVendedores {
    if (anuncios.length === 0) {
      return {
        vendedores: [
          { tipo_precio: 'minimo', precio_eur: 0, plataforma: 'N/A', urls: [], plataforma_sugerida: plataformas },
          { tipo_precio: 'ideal', precio_eur: 0, plataforma: 'N/A', urls: [], plataforma_sugerida: plataformas },
          { tipo_precio: 'rapido', precio_eur: 0, plataforma: 'N/A', urls: [], plataforma_sugerida: plataformas },
        ],
        descripcion_anuncio: `Producto: ${inputs.producto_text}`,
      }
    }

    const precios = anuncios.map(a => a.precio_eur)
    const precioMinimo = Math.min(...precios)
    const precioIdeal = precios.reduce((a, b) => a + b, 0) / precios.length
    const precioRapido = Math.round(precioIdeal * 0.9 * 10) / 10

    const plataformasUnicas = new Set(anuncios.map(a => a.plataforma))
    const todasPlataformas = Array.from(plataformasUnicas).join(', ')
    const todasURLs = anuncios.map(a => a.url_anuncio)

    // Generar descripción basada en patrones de anuncios válidos
    const descripcion = this.generarDescripcionAnuncio(anuncios, inputs)

    return {
      vendedores: [
        {
          tipo_precio: 'minimo',
          precio_eur: precioMinimo,
          plataforma: todasPlataformas,
          urls: todasURLs,
          plataforma_sugerida: plataformas,
        },
        {
          tipo_precio: 'ideal',
          precio_eur: Math.round(precioIdeal * 10) / 10,
          plataforma: todasPlataformas,
          urls: todasURLs,
          plataforma_sugerida: plataformas,
        },
        {
          tipo_precio: 'rapido',
          precio_eur: precioRapido,
          plataforma: todasPlataformas,
          urls: todasURLs,
          plataforma_sugerida: plataformas,
        },
      ],
      descripcion_anuncio: descripcion,
    }
  }

  /**
   * Genera una descripción de anuncio basada en patrones encontrados
   */
  private generarDescripcionAnuncio(
    anuncios: AnuncioNormalizado[],
    inputs: ScrapingInputs
  ): string {
    // Analizar palabras comunes en títulos y descripciones
    const palabrasFrecuentes = new Map<string, number>()
    
    anuncios.forEach(anuncio => {
      const texto = `${anuncio.titulo} ${anuncio.descripcion || ''}`.toLowerCase()
      const palabras = texto.split(/\s+/)
      palabras.forEach(palabra => {
        if (palabra.length > 3) {
          palabrasFrecuentes.set(palabra, (palabrasFrecuentes.get(palabra) || 0) + 1)
        }
      })
    })

    // Construir descripción
    return `${inputs.producto_text} en excelente estado. ${Array.from(palabrasFrecuentes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([palabra]) => palabra)
      .join(', ')}.`
  }
}

