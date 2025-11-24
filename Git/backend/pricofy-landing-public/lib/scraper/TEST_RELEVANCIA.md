# Test del Sistema de Relevancia

## Objetivo
Verificar que el sistema de relevancia filtra correctamente anuncios no relevantes.

## Caso de Prueba: "iphone 17 pro 512gb"

### Anuncios Esperados (Alta Relevancia ≥ 70%)

| Título del Anuncio | Relevancia Esperada | Razón |
|-------------------|---------------------|-------|
| "iPhone 17 Pro 512GB" | ~95-100% | Coincidencia exacta |
| "iPhone 17 Pro 512GB Nuevo" | ~95-100% | Coincidencia exacta + extra |
| "iPhone 17 Pro 512 GB Negro" | ~90-95% | Coincidencia (espaciado diferente) |
| "iPhone 17 Pro 256GB" | ~70-80% | Modelo correcto, capacidad diferente |
| "iPhone 17 512GB" | ~70-80% | Falta "Pro" pero modelo y capacidad ok |

### Anuncios Rechazados (Baja Relevancia < 70%)

| Título del Anuncio | Relevancia Esperada | Razón |
|-------------------|---------------------|-------|
| "iPhone 15 Pro Max 512GB" | ~40-55% | Número de modelo incorrecto (15 vs 17) |
| "iPhone 15 Pro 512GB" | ~45-60% | Número de modelo incorrecto |
| "iPhone 16 Pro 512GB" | ~55-65% | Número de modelo cercano pero incorrecto |
| "iPhone 17 256GB" | ~60-70% | Falta "Pro" y capacidad incorrecta |
| "Samsung Galaxy S23 512GB" | ~20-30% | Marca completamente diferente |

## Prueba Manual con Node.js

```javascript
// Copiar en Node.js REPL o crear archivo test-relevancia.js
const { calcularRelevancia } = require('./lib/scraper/utils')

// Casos de prueba
const busqueda = "iphone 17 pro 512gb"

const casos = [
  "iPhone 17 Pro 512GB",
  "iPhone 17 Pro 512GB Nuevo",
  "iPhone 17 Pro 512 GB Negro",
  "iPhone 17 Pro 256GB",
  "iPhone 17 512GB",
  "iPhone 15 Pro Max 512GB",
  "iPhone 15 Pro 512GB",
  "iPhone 16 Pro 512GB",
  "iPhone 17 256GB",
  "Samsung Galaxy S23 512GB"
]

console.log("Búsqueda:", busqueda)
console.log("-".repeat(80))

casos.forEach(caso => {
  const relevancia = calcularRelevancia(busqueda, caso)
  const estado = relevancia >= 60 ? "✅ ACEPTADO" : "❌ RECHAZADO"
  console.log(`${estado} | ${relevancia.toFixed(1)}% | ${caso}`)
})
```

## Verificación del Flujo Completo

Para verificar que el sistema funciona en el scraping real:

1. Hacer scraping de "iphone 17 pro 512gb"
2. Verificar en los logs:
   - Se muestran anuncios descartados con su puntuación
   - Total de anuncios antes y después del filtro
   - Si la búsqueda laxa se omite (cuando hay suficientes resultados relevantes)

3. Revisar resultados finales:
   - No deben incluir iPhone 15 o modelos muy diferentes
   - Deben incluir principalmente iPhone 17 Pro 512GB o variantes cercanas

## Ejemplo de Logs Esperados

```
🎯 [Processor] Aplicando filtro de relevancia (umbral: 70%)...
  ⚠️ [Relevancia] Descartado (69.2%): "iPhone 15 Pro Max 512GB Azul Como Nuevo..."
  ⚠️ [Relevancia] Descartado (69.2%): "iPhone 15 Pro 512GB Negro Garantía Apple..."
  ⚠️ [Relevancia] Descartado (69.2%): "iPhone 16 Pro 512GB Titanio Natural..."
✅ [Relevancia] Filtro aplicado: 45 → 28 anuncios (17 descartados, umbral: 70%)

📊 [Processor] Resultados relevantes encontrados: 28
📊 [Processor] Mínimo requerido: 250

⚠️ [Processor] Insuficientes resultados relevantes (28/250)
// ... continúa con búsqueda laxa
```

O si hay suficientes:

```
📊 [Processor] Resultados relevantes encontrados: 265
📊 [Processor] Mínimo requerido: 250

✅ [Processor] Suficientes resultados relevantes encontrados (265/250)
⏭️  [Processor] OMITIENDO búsqueda laxa para optimizar tiempo y relevancia
```

## Resultado Esperado Final

- ✅ Anuncios de iPhone 17 Pro 512GB tienen prioridad
- ✅ Anuncios de iPhone 15/16 son filtrados
- ✅ Búsqueda laxa se omite si hay suficientes resultados relevantes
- ✅ El tiempo de scraping se reduce significativamente cuando hay suficientes resultados

