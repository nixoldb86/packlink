# 🕷️ Guía de Sistema de Scraping

Sistema modular para hacer scraping de plataformas de segunda mano y generar evaluaciones automáticas de precios.

## 📋 Estructura del Sistema

```
lib/scraper/
├── types.ts          # Tipos TypeScript
├── utils.ts          # Utilidades (normalización, deduplicación, outliers)
├── wallapop.ts       # Scraper de Wallapop
├── milanuncios.ts    # Scraper de Milanuncios
├── processor.ts      # Procesador principal que orquesta todo
└── index.ts          # Exports
```

## 🚀 Uso Básico

### Opción 1: Desde API Endpoint

```typescript
// POST /api/scrape
const response = await fetch('/api/scrape', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    producto_text: 'árbol navidad montgomery 210',
    categoria: 'hogar',
    ubicacion: 'españa/coslada',
    radio_km: 30,
    condicion_objetivo: 'nuevo',
    idioma_busqueda: 'es',
    min_paginas_por_plataforma: 100,
    min_resultados_por_plataforma: 250,
  }),
})

const { compradores, vendedores } = await response.json()
```

### Opción 2: Directamente en Código

```typescript
import { ScrapingProcessor } from '@/lib/scraper/processor'

const processor = new ScrapingProcessor()
const resultados = await processor.procesar({
  producto_text: 'árbol navidad montgomery 210',
  categoria: 'hogar',
  ubicacion: 'españa/coslada',
  radio_km: 30,
  condicion_objetivo: 'nuevo',
  idioma_busqueda: 'es',
  min_paginas_por_plataforma: 100,
  min_resultados_por_plataforma: 250,
})

console.log(resultados.jsonCompradores)
console.log(resultados.jsonVendedores)
```

## 🔧 Implementación Actual

### Plataformas Implementadas

✅ **Wallapop** (`lib/scraper/wallapop.ts`)
- Búsqueda básica implementada
- ⚠️ **Necesita mejoras**: Wallapop usa carga dinámica (JavaScript), idealmente usar Puppeteer/Playwright

✅ **Milanuncios** (`lib/scraper/milanuncios.ts`)
- Parsing con Cheerio
- Extracción de tarjetas de listado
- Obtención de detalles (si no requiere login)

### Funcionalidades Implementadas

✅ **Normalización**
- Títulos (minúsculas, sin acentos)
- Precios (conversión a EUR)
- Estados (mapeo a valores estándar)
- URLs (eliminación de tracking)

✅ **Deduplicación**
- Por título + precio + URL
- Conserva el de menor precio si hay duplicados

✅ **Filtrado de Outliers**
- Método IQR (Interquartile Range)
- Filtrado de precios señuelo (< 2 EUR)

✅ **Generación de Resultados**
- Tabla COMPRADORES (mínimo 10 filas)
- Tabla VENDEDORES (Mínimo, Ideal, Rápido)
- JSONs según esquema especificado

## ✅ Mejoras Implementadas

### 1. ✅ Wallapop con Puppeteer

Wallapop ahora usa **Puppeteer** para cargar contenido dinámico. Ya está implementado y funcionando.

**Características:**
- Scroll infinito automático
- Extracción de anuncios desde DOM renderizado
- Geocodificación integrada
- Cierre automático del navegador

### 2. ✅ Geocodificación con OpenStreetMap Nominatim

La geocodificación está implementada y funcionando. Convierte automáticamente `"españa/coslada"` a coordenadas.

**Características:**
- Gratis, sin API key
- Cache automático (evita requests repetidos)
- Rate limiting implementado (1 req/segundo)

Ver `lib/scraper/geocoding.ts` para más detalles.

### 3. ⚠️ Milanuncios - Login/Bloqueos

Milanuncios puede requerir login para ver detalles. El código ya maneja esto marcando como `verificado_tarjeta: true` cuando no se puede abrir el detalle.

## 📝 Próximos Pasos

### 1. ✅ Completado: Wallapop con Puppeteer

Ya implementado en `lib/scraper/wallapop.ts`. Ver el código para referencia.

### 2. Mejorar Extracción de Wallapop

Los selectores CSS pueden necesitar ajustes según la estructura real de Wallapop. Si no encuentra anuncios:

1. Abre Wallapop en el navegador
2. Inspecciona los elementos de anuncios
3. Actualiza los selectores en `wallapop.ts` (línea ~107-110)

### 2. Agregar Más Plataformas

Crear nuevos archivos siguiendo el patrón:

```typescript
// lib/scraper/facebook-marketplace.ts
export class FacebookMarketplaceScraper implements PlataformaScraper {
  nombre = 'facebook_marketplace'
  
  async buscar(inputs: ScrapingInputs): Promise<AnuncioRaw[]> {
    // Implementar scraping de Facebook Marketplace
  }
  
  async obtenerDetalleAnuncio(url: string): Promise<Partial<AnuncioRaw> | null> {
    // Implementar obtención de detalle
  }
}
```

Luego registrar en `processor.ts`:

```typescript
this.plataformas.set('facebook_marketplace', new FacebookMarketplaceScraper())
```

### 3. Implementar Búsqueda Laxa

El código ya tiene la estructura para búsqueda laxa con variantes. Mejorar `generarVariantesBusqueda()` en `utils.ts` para:

- Detectar modelo/marca en `producto_text`
- Generar equivalencias de tallas (43 = EU 43 = UK 9 = US 9.5)
- Generar sinónimos más completos
- Manejar variantes con guiones, espacios, etc.

### 4. Mejorar Filtrado por Condición

El mapeo de condiciones está implementado, pero puede mejorarse con:

- Detección de tokens en descripción
- Análisis de fotos (si se implementa visión por computadora)
- Validación cruzada entre estado declarado y descripción

## 🧪 Testing

### Probar Manualmente

```typescript
// test-scraper.ts
import { ScrapingProcessor } from './lib/scraper/processor'

const processor = new ScrapingProcessor()

const resultados = await processor.procesar({
  producto_text: 'árbol navidad montgomery 210',
  categoria: 'hogar',
  ubicacion: 'españa/coslada',
  radio_km: 30,
  condicion_objetivo: 'nuevo',
  idioma_busqueda: 'es',
  min_paginas_por_plataforma: 5, // Reducir para testing
  min_resultados_por_plataforma: 10,
})

console.log('Compradores:', resultados.jsonCompradores)
console.log('Vendedores:', resultados.jsonVendedores)
```

## ⚖️ Consideraciones Legales

⚠️ **IMPORTANTE**: El scraping puede violar los términos de servicio de algunas plataformas. Asegúrate de:

1. Revisar los ToS de cada plataforma
2. Respetar `robots.txt`
3. No hacer requests excesivos (rate limiting)
4. Usar headers apropiados (User-Agent)
5. Considerar usar APIs oficiales si están disponibles

## 📚 Referencias

- [Cheerio Documentation](https://cheerio.js.org/)
- [Puppeteer Documentation](https://pptr.dev/)
- [Playwright Documentation](https://playwright.dev/)

---

¿Necesitas ayuda implementando alguna plataforma específica o mejorando alguna funcionalidad?

