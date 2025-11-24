# Mejoras de Relevancia Implementadas

## Resumen

Se ha implementado un sistema de filtrado por relevancia que mejora significativamente la calidad de los resultados del scraping, priorizando tokens importantes (números y especificaciones técnicas) y evitando resultados no relevantes.

## Cambios Realizados

### 1. Sistema de Puntuación de Relevancia (`lib/scraper/utils.ts`)

**Función:** `calcularRelevancia(terminoBusqueda: string, tituloAnuncio: string): number`

- **Extracción de tokens:** Divide el término de búsqueda y el título en tokens normalizados
- **Sistema de pesos:**
  - Números (17, 512, etc.): **peso 3** - Críticos para modelos y capacidades
  - Palabras técnicas (pro, max, plus, gb, etc.): **peso 2** - Importantes para especificaciones
  - Palabras genéricas (iphone, árbol, etc.): **peso 1** - Contexto general

- **Penalizaciones:**
  - **Números incorrectos:** Penalización total (0 puntos) - Cualquier número diferente es crítico
  - **Palabras técnicas ausentes:** 30% del peso
  - **Palabras genéricas ausentes:** 50% del peso

- **Bonus:** Hasta 10 puntos adicionales por coincidencias en orden correcto

- **Resultado:** Puntuación de 0-100%

### 2. Filtrado por Relevancia (`lib/scraper/utils.ts`)

**Función:** `filtrarPorRelevancia(anuncios: AnuncioNormalizado[], terminoBusqueda: string, umbral: number = 70)`

- Aplica `calcularRelevancia()` a cada anuncio
- Descarta anuncios con relevancia < umbral
- **Umbral por defecto:** 70% (búsqueda estricta)
- **Umbral para variantes:** 60% (búsqueda laxa)
- Registra en logs cada anuncio descartado con su puntuación

### 3. Flujo Optimizado en Processor (`lib/scraper/processor.ts`)

**Cambios en el flujo de procesamiento:**

1. **Primera pasada (búsqueda estricta):**
   - Buscar en plataformas
   - Normalizar inmediatamente
   - **Aplicar filtro de relevancia (70%)**
   - Evaluar si hay suficientes resultados

2. **Decisión de búsqueda laxa:**
   ```
   SI resultados relevantes >= min_resultados_por_plataforma:
     → OMITIR búsqueda laxa (optimización)
   SINO:
     → Ejecutar búsqueda laxa con variantes
     → Aplicar filtro de relevancia (60%) a cada variante
   ```

3. **Radio ampliado (si < 10 resultados):**
   - También aplica filtro de relevancia (70%)

## Resultados del Test

### Búsqueda: "iphone 17 pro 512gb"

| Título | Relevancia | Estado |
|--------|-----------|---------|
| iPhone 17 Pro 512GB | 100.0% | ✅ Aceptado |
| iPhone 17 Pro 512GB Nuevo | 100.0% | ✅ Aceptado |
| iPhone 17 Pro 512 GB Negro | 81.7% | ✅ Aceptado |
| iPhone 17 Pro 256GB | 81.7% | ✅ Aceptado |
| iPhone 17 512GB | 86.9% | ✅ Aceptado |
| **iPhone 15 Pro Max 512GB** | **69.2%** | ❌ **Rechazado** |
| **iPhone 15 Pro 512GB** | **69.2%** | ❌ **Rechazado** |
| **iPhone 16 Pro 512GB** | **69.2%** | ❌ **Rechazado** |
| iPhone 17 256GB | 63.6% | ❌ Rechazado |
| Samsung Galaxy S23 512GB | 45.6% | ❌ Rechazado |

## Beneficios

1. **Mayor precisión:** Solo anuncios relevantes en los resultados finales
2. **Optimización de tiempo:** Omite búsqueda laxa cuando no es necesaria
3. **Logs informativos:** Visibilidad completa del proceso de filtrado
4. **Flexibilidad:** Umbrales ajustables según necesidades

## Ejemplo de Logs en Producción

```
🔍 [Processor] PRIMERA PASADA: búsqueda estricta
✅ [Processor] Primera pasada completada: 45 anuncios encontrados

🔄 [Processor] Normalizando anuncios de primera pasada...
✅ [Processor] Normalización completada: 45 → 45 anuncios

🎯 [Processor] Aplicando filtro de relevancia (umbral: 70%)...
  ⚠️ [Relevancia] Descartado (69.2%): "iPhone 15 Pro Max 512GB..."
  ⚠️ [Relevancia] Descartado (69.2%): "iPhone 15 Pro 512GB..."
  ⚠️ [Relevancia] Descartado (63.6%): "iPhone 17 256GB..."
✅ [Relevancia] Filtro aplicado: 45 → 28 anuncios (17 descartados, umbral: 70%)

📊 [Processor] Resultados relevantes encontrados: 280
📊 [Processor] Mínimo requerido: 250

✅ [Processor] Suficientes resultados relevantes encontrados (280/250)
⏭️  [Processor] OMITIENDO búsqueda laxa para optimizar tiempo y relevancia
```

## Archivos Modificados

- `lib/scraper/utils.ts` - Funciones de relevancia
- `lib/scraper/processor.ts` - Flujo optimizado con filtrado
- `lib/scraper/TEST_RELEVANCIA.md` - Documentación de testing
- `lib/scraper/test-relevancia.js` - Script de test ejecutable

## Testing

Para probar el sistema de relevancia:

```bash
node lib/scraper/test-relevancia.js
```

Para hacer scraping real con el nuevo sistema, el comportamiento se activa automáticamente.

## Configuración

Los umbrales se pueden ajustar en las llamadas a `filtrarPorRelevancia()`:

- **Búsqueda estricta:** 70% (recomendado)
- **Búsqueda laxa (variantes):** 60% (recomendado)
- **Radio ampliado:** 70% (recomendado)

Para cambiar los umbrales globalmente, modificar el parámetro por defecto en `lib/scraper/utils.ts` línea 393.

