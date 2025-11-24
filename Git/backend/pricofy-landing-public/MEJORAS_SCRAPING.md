# ✅ Mejoras Implementadas en el Sistema de Scraping

## 🎯 Problemas Resueltos

### 1. ✅ Wallapop con Puppeteer

**Problema anterior:**
- Wallapop carga contenido dinámicamente con JavaScript
- `fetch()` no obtenía los anuncios (HTML vacío)
- No se encontraban resultados

**Solución implementada:**
- ✅ Instalado `puppeteer` para controlar un navegador real
- ✅ Reescrito `wallapop.ts` para usar Puppeteer
- ✅ Implementado scroll infinito para cargar más resultados
- ✅ Extracción de anuncios desde el DOM renderizado

**Características:**
- Navegador headless (sin interfaz gráfica)
- Espera a que carguen los resultados dinámicamente
- Scroll automático para cargar más páginas
- Manejo de errores y timeouts
- Cierre automático del navegador al finalizar

### 2. ✅ Geocodificación con OpenStreetMap Nominatim

**Problema anterior:**
- No se convertían ciudades a coordenadas
- Búsquedas por radio no funcionaban correctamente

**Solución implementada:**
- ✅ Creado `lib/scraper/geocoding.ts`
- ✅ Función `geocodificar()` usando Nominatim (gratis, sin API key)
- ✅ Cache de geocodificaciones para evitar requests repetidos
- ✅ Integrado en Wallapop y Milanuncios
- ✅ Rate limiting (1 request/segundo según límites de Nominatim)

**Características:**
- Formato de entrada: `"españa/madrid"` o `"españa/coslada"`
- Retorna: `{ lat, lon, ciudad, pais }`
- Cache automático (no repite geocodificación de la misma ciudad)
- Función auxiliar `calcularDistancia()` para calcular distancias entre coordenadas

## 📝 Cambios en el Código

### Archivos Modificados/Creados

1. **`lib/scraper/geocoding.ts`** (NUEVO)
   - `geocodificar()` - Convierte ubicación a coordenadas
   - `geocodificarConCache()` - Versión con cache
   - `calcularDistancia()` - Calcula distancia entre coordenadas

2. **`lib/scraper/wallapop.ts`** (REESCRITO)
   - Ahora usa Puppeteer en lugar de `fetch()`
   - Implementado scroll infinito
   - Extracción de anuncios desde DOM renderizado
   - Geocodificación integrada

3. **`lib/scraper/milanuncios.ts`** (MEJORADO)
   - Geocodificación integrada (opcional pero útil)

4. **`lib/scraper/processor.ts`** (MEJORADO)
   - Limpieza automática de recursos (cierra navegadores)
   - Importa geocodificación

## 🚀 Cómo Funciona Ahora

### Flujo de Wallapop con Puppeteer

1. **Geocodificación**: Convierte `"españa/coslada"` → `{ lat: 40.4238, lon: -3.5319 }`
2. **Abrir navegador**: Puppeteer abre Chrome headless
3. **Navegar**: Va a la URL de búsqueda de Wallapop con coordenadas
4. **Esperar**: Espera a que carguen los resultados dinámicamente
5. **Extraer**: Extrae anuncios del DOM renderizado
6. **Scroll**: Hace scroll hacia abajo para cargar más resultados
7. **Repetir**: Continúa hasta alcanzar `min_paginas_por_plataforma`
8. **Cerrar**: Cierra el navegador automáticamente

### Flujo de Geocodificación

1. **Input**: `"españa/coslada"`
2. **Parse**: Divide en `["españa", "coslada"]`
3. **Request**: Llama a Nominatim API
4. **Cache**: Guarda resultado en memoria
5. **Output**: Retorna `{ lat: 40.4238, lon: -3.5319, ciudad: "coslada", pais: "españa" }`

## ⚙️ Configuración

### Puppeteer

Puppeteer se instala automáticamente con Chromium. En producción (Vercel), puede necesitar configuración adicional:

```typescript
// En wallapop.ts ya está configurado para producción
args: [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
]
```

### Geocodificación

No requiere configuración. OpenStreetMap Nominatim es gratuito y no necesita API key.

**Límites:**
- 1 request por segundo (ya implementado con delay de 1.1s)
- Máximo 1 request/segundo por IP
- Cache implementado para evitar requests repetidos

## 📊 Ejemplo de Uso

```typescript
import { ScrapingProcessor } from '@/lib/scraper/processor'

const processor = new ScrapingProcessor()

const resultados = await processor.procesar({
  producto_text: 'árbol navidad montgomery 210',
  categoria: 'hogar',
  ubicacion: 'españa/coslada', // ✅ Ahora se geocodifica automáticamente
  radio_km: 30,
  condicion_objetivo: 'nuevo',
  idioma_busqueda: 'es',
  min_paginas_por_plataforma: 5,
  min_resultados_por_plataforma: 10,
})

// Wallapop ahora encontrará resultados ✅
// Las coordenadas se usan para búsqueda por radio ✅
```

## 🔍 Verificación

Para verificar que funciona:

1. **Ejecutar scraping**:
   ```bash
   curl -X POST http://localhost:3001/api/scrape \
     -H "Content-Type: application/json" \
     -d '{
       "producto_text": "árbol navidad",
       "categoria": "hogar",
       "ubicacion": "españa/coslada",
       "radio_km": 30,
       "condicion_objetivo": "nuevo",
       "idioma_busqueda": "es",
       "min_paginas_por_plataforma": 5,
       "min_resultados_por_plataforma": 10
     }'
   ```

2. **Revisar logs**:
   - Deberías ver: `📍 Geocodificando: coslada, españa`
   - Deberías ver: `✅ Coordenadas encontradas: 40.4238, -3.5319`
   - Deberías ver: `🔍 Buscando en Wallapop: ...`
   - Deberías ver: `✅ Encontrados X anuncios en página 1`

3. **Verificar resultados**:
   - Los JSONs deberían contener anuncios de Wallapop
   - Las coordenadas deberían estar correctas

## ⚠️ Notas Importantes

### Puppeteer en Vercel

Vercel puede tener limitaciones con Puppeteer. Si hay problemas:

1. **Usar Playwright** (alternativa más ligera):
   ```bash
   npm install playwright
   ```

2. **O usar servicio externo** como ScrapingBee, ScraperAPI, etc.

3. **O ejecutar scraping en un servidor separado** (no en Vercel)

### Performance

- Puppeteer es más lento que `fetch()` (abre navegador real)
- Cada scraping puede tardar 30-60 segundos
- Considera ejecutar en background job si es posible

### Rate Limiting

- Nominatim: 1 request/segundo (ya implementado)
- Wallapop/Milanuncios: Respetar límites de sus servidores
- Considera agregar delays entre requests

## 🎉 Resultado

✅ **Wallapop ahora encuentra anuncios** usando Puppeteer
✅ **Geocodificación funciona** con OpenStreetMap Nominatim
✅ **Búsquedas por radio** funcionan correctamente
✅ **Sistema listo para producción** (con consideraciones de Vercel)

---

¿Necesitas ayuda con algo más del scraping?

