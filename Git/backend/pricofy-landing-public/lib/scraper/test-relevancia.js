#!/usr/bin/env node

/**
 * Test simple para verificar el sistema de relevancia
 * Ejecutar con: node lib/scraper/test-relevancia.js
 */

// Importar la función (ajustar path si es necesario)
// Como esto es JavaScript puro y las funciones están en TypeScript,
// este script es para referencia. Se puede ejecutar después de compilar
// o copiar la lógica aquí directamente.

// Simulación de la función normalizarTitulo
function normalizarTitulo(titulo) {
  return titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina acentos
    .replace(/\s+/g, ' ')
    .trim()
}

// Simulación de la función calcularRelevancia
function calcularRelevancia(terminoBusqueda, tituloAnuncio) {
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

// Casos de prueba
const busqueda = "iphone 17 pro 512gb"

const casos = [
  { titulo: "iPhone 17 Pro 512GB", esperado: "alta" },
  { titulo: "iPhone 17 Pro 512GB Nuevo", esperado: "alta" },
  { titulo: "iPhone 17 Pro 512 GB Negro", esperado: "alta" },
  { titulo: "iPhone 17 Pro 256GB", esperado: "media" },
  { titulo: "iPhone 17 512GB", esperado: "media" },
  { titulo: "iPhone 15 Pro Max 512GB", esperado: "baja" },
  { titulo: "iPhone 15 Pro 512GB", esperado: "baja" },
  { titulo: "iPhone 16 Pro 512GB", esperado: "media-baja" },
  { titulo: "iPhone 17 256GB", esperado: "media" },
  { titulo: "Samsung Galaxy S23 512GB", esperado: "muy baja" }
]

console.log("\n" + "=".repeat(80))
console.log("TEST SISTEMA DE RELEVANCIA")
console.log("=".repeat(80))
console.log(`Búsqueda: "${busqueda}"`)
console.log("Umbral de aceptación: 70%")
console.log("=".repeat(80))
console.log()

casos.forEach(({ titulo, esperado }) => {
  const relevancia = calcularRelevancia(busqueda, titulo)
  const estado = relevancia >= 70 ? "✅ ACEPTADO" : "❌ RECHAZADO"
  const padding = " ".repeat(Math.max(0, 50 - titulo.length))
  console.log(`${estado} | ${relevancia.toFixed(1).padStart(5)}% | ${titulo}${padding} | (esperado: ${esperado})`)
})

console.log()
console.log("=".repeat(80))
console.log("RESUMEN:")
console.log("- Los anuncios de iPhone 17 Pro 512GB deben tener relevancia > 90%")
console.log("- Los anuncios con capacidad diferente deben tener relevancia ~70-80%")
console.log("- Los anuncios de iPhone 15/16 deben tener relevancia < 70% (rechazados)")
console.log("=".repeat(80))
console.log()

