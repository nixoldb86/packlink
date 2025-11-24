// Ejemplo de uso del sistema de scraping
// Este archivo es solo para referencia - no se usa directamente

import { ScrapingProcessor } from './processor'
import type { ScrapingInputs } from './types'

async function ejemploUso() {
  // Crear instancia del procesador
  const processor = new ScrapingProcessor()

  // Definir inputs según tu prompt
  const inputs: ScrapingInputs = {
    producto_text: 'árbol navidad montgomery 210',
    categoria: 'hogar',
    ubicacion: 'españa/coslada',
    radio_km: 30,
    condicion_objetivo: 'nuevo',
    idioma_busqueda: 'es',
    min_paginas_por_plataforma: 1,
    min_resultados_por_plataforma: 10,
  }

  // Procesar
  const resultados = await processor.procesar(inputs)

  // Resultados disponibles:
  console.log('Tabla Compradores:', resultados.tablaCompradores)
  console.log('Tabla Vendedores:', resultados.tablaVendedores)
  console.log('JSON Compradores:', JSON.stringify(resultados.jsonCompradores, null, 2))
  console.log('JSON Vendedores:', JSON.stringify(resultados.jsonVendedores, null, 2))
}

// Ejemplo de uso desde API endpoint
async function ejemploDesdeAPI() {
  const response = await fetch('/api/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      producto_text: 'árbol navidad montgomery 210',
      categoria: 'hogar',
      ubicacion: 'españa/coslada',
      radio_km: 30,
      condicion_objetivo: 'nuevo',
      idioma_busqueda: 'es',
      min_paginas_por_plataforma: 1,
      min_resultados_por_plataforma: 10,
    }),
  })

  const { compradores, vendedores } = await response.json()
  
  console.log('Compradores:', compradores)
  console.log('Vendedores:', vendedores)
}

