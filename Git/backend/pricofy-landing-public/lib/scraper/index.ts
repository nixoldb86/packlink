// Exportar todo el sistema de scraping
export * from './types'
export * from './utils'
export * from './geocoding'
export { WallapopScraper } from './wallapop'
export { MilanunciosScraper } from './milanuncios'
export { ScrapingProcessor } from './processor'
export { scrapeCiaoProductosNuevos } from './ciao'

import { ScrapingProcessor } from './processor'
import type { ScrapingInputs } from './types'

/**
 * Función principal para ejecutar el scraping
 * Wrapper conveniente para usar desde API routes u otros lugares
 * 
 * @param inputs Parámetros de scraping
 * @returns Resultados del scraping (tablas y JSONs)
 */
export async function runScraping(inputs: ScrapingInputs) {
  const processor = new ScrapingProcessor()
  
  try {
    const results = await processor.procesar(inputs)
    return results
  } finally {
    // Limpiar recursos
    await processor.limpiar()
  }
}

/**
 * Función para ejecutar búsqueda directa sin filtros ni alternativas de ChatGPT
 * 
 * @param inputs Parámetros de scraping
 * @returns Resultados del scraping sin filtrar (solo compradores)
 */
export async function runScrapingDirecto(inputs: ScrapingInputs) {
  const processor = new ScrapingProcessor()
  
  try {
    const results = await processor.buscarDirecto(inputs)
    return results
  } finally {
    // Limpiar recursos
    await processor.limpiar()
  }
}
