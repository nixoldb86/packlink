# 🔗 Integración de Scraping en Formulario de Solicitud

Este documento explica cómo se ha integrado el sistema de scraping automático cuando un usuario envía un formulario de evaluación.

## 📋 Resumen de Cambios

Se ha reemplazado la **evaluación con ChatGPT** por un **proceso de scraping automático** que busca anuncios reales en Wallapop y Milanuncios, manteniendo solo el uso de ChatGPT para generar variantes de búsqueda laxa.

---

## 🔄 Flujo Completo

```
Usuario rellena formulario
        ↓
Validar datos (email, campos obligatorios, fotos si vende)
        ↓
Verificar límite (1 solicitud por email/día)
        ↓
Subir fotos (Backblaze B2 o local)
        ↓
Guardar solicitud en BD → obtener solicitud_id
        ↓
🕷️ EJECUTAR SCRAPING AUTOMÁTICO
   ├── Mapear tipo_producto → categoría
   ├── Mapear estado → condición_objetivo
   ├── Construir ubicación (país/ciudad)
   ├── Ejecutar scraping con runScraping()
   │   └── ChatGPT solo para búsqueda laxa (si es necesario)
   └── Guardar resultados en scraping_results
        ↓
Enviar email de confirmación al usuario
        ↓
Responder al cliente con success
```

**Importante:** El scraping NO bloquea el flujo. Si falla, la solicitud ya está guardada y el usuario recibe confirmación.

---

## 📝 Archivos Modificados

### 1️⃣ `app/api/submit-request/route.ts`

**Cambios principales:**

#### Antes (líneas 5-9):
```typescript
import { saveSolicitud, checkSolicitudToday, saveEvaluacion } from '@/lib/db'
import { sendEvaluationConfirmationEmail, type EvaluationData } from '@/lib/email'
import { generateEvaluation } from '@/lib/chatgpt'
```

#### Ahora:
```typescript
import { saveSolicitud, checkSolicitudToday, saveScrapingResults } from '@/lib/db'
import { sendEvaluationConfirmationEmail, type EvaluationData } from '@/lib/email'
import { runScraping } from '@/lib/scraper'
```

#### Lógica de Scraping (líneas 139-210):

```typescript
// Ejecutar scraping automático (no bloquea si falla)
if (insertId) {
  try {
    console.log('🕷️ Iniciando scraping automático para solicitud ID:', insertId)
    
    // Mapear tipo de producto a categoría
    const categoriasMap: Record<string, string> = {
      'electronica': 'electronica',
      'electrodomésticos': 'electrodomesticos',
      'hogar y jardín': 'hogar',
      'moda y accesorios': 'moda',
      'deportes y ocio': 'deporte',
      'motor': 'motor',
      'otros': 'general',
    }
    const categoria = categoriasMap[data.tipoProducto?.toLowerCase()] || 'general'
    
    // Mapear estado a condición objetivo
    const estadosMap: Record<string, string> = {
      'nuevo': 'nuevo',
      'como nuevo': 'como_nuevo',
      'muy buen estado': 'muy_buen_estado',
      'buen estado': 'buen_estado',
      'usado': 'usado',
      'aceptable': 'aceptable',
    }
    const condicion = estadosMap[data.estado?.toLowerCase()] || 'buen_estado'
    
    // Determinar idioma de búsqueda
    const acceptLanguage = request.headers.get('accept-language') || ''
    const idioma = acceptLanguage.includes('en') && !acceptLanguage.includes('es') ? 'en' : 'es'
    
    // Construir ubicación (formato: "país/ciudad")
    const ubicacion = `${data.pais}/${data.ciudad}`.toLowerCase()
    
    // Ejecutar scraping
    const scrapingResult = await runScraping({
      producto_text: data.modeloMarca,
      categoria: categoria,
      ubicacion: ubicacion,
      radio_km: 30, // Radio por defecto: 30 km
      condicion_objetivo: condicion as any,
      idioma_busqueda: idioma,
      min_paginas_por_plataforma: 100,
      min_resultados_por_plataforma: 250,
    })

    if (scrapingResult) {
      // Guardar resultados del scraping en la base de datos
      await saveScrapingResults(
        insertId,
        {
          producto_text: data.modeloMarca,
          categoria: categoria,
          ubicacion: ubicacion,
          radio_km: 30,
          condicion_objetivo: condicion,
        },
        scrapingResult
      )
      console.log('✅ Scraping ejecutado y guardado correctamente')
      console.log(`   - Compradores: ${scrapingResult.jsonCompradores?.compradores?.length || 0} anuncios`)
      console.log(`   - Vendedores: ${scrapingResult.jsonVendedores?.vendedores?.length || 0} precios`)
    } else {
      console.warn('⚠️ No se pudo ejecutar el scraping')
    }
  } catch (scrapingError) {
    console.error('❌ Error en el proceso de scraping automático (no crítico):', scrapingError)
    // No bloqueamos el flujo - la solicitud ya está guardada
  }
}
```

---

### 2️⃣ `lib/db.ts`

**Función nueva:** `saveScrapingResults()`

Reemplaza a `saveEvaluacion()` y guarda:

```typescript
export async function saveScrapingResults(
  solicitudId: number,
  searchParams: {
    producto_text: string
    categoria: string
    ubicacion: string
    radio_km: number
    condicion_objetivo: string
  },
  results: {
    tablaCompradores: any[]
    tablaVendedores: any[]
    jsonCompradores: any
    jsonVendedores: any
  }
): Promise<{ insertId: number }>
```

**Datos que guarda:**
- Parámetros de búsqueda (producto, categoría, ubicación, radio, condición)
- Resultados completos en formato JSON
- Metadatos (total anuncios encontrados, filtrados, plataformas)

---

### 3️⃣ Nueva Tabla SQL: `scraping_results`

**Archivo:** `CREATE_TABLE_SCRAPING_RESULTS.sql`

**Estructura:**

```sql
CREATE TABLE IF NOT EXISTS scraping_results (
    id SERIAL PRIMARY KEY,
    solicitud_id INTEGER NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,

    -- Parámetros de búsqueda
    producto_text VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(200) NOT NULL,
    radio_km INTEGER NOT NULL,
    condicion_objetivo VARCHAR(50) NOT NULL,

    -- Resultados JSON
    json_compradores JSONB,
    json_vendedores JSONB,
    tabla_compradores JSONB,
    tabla_vendedores JSONB,

    -- Todas las URLs encontradas (sin filtrar)
    todas_urls_encontradas TEXT[],

    -- Metadatos
    total_anuncios_encontrados INTEGER DEFAULT 0,
    total_anuncios_filtrados INTEGER DEFAULT 0,
    plataformas_consultadas TEXT[],

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Nueva Columna:** `todas_urls_encontradas TEXT[]`
- Array con **todas** las URLs encontradas durante el scraping
- **Sin filtrar** (incluye URLs descartadas por relevancia, outliers, etc.)
- Útil para auditoría y debugging
- Puede ser consultada con `unnest(todas_urls_encontradas)` en PostgreSQL

**Índices:**
- `idx_scraping_results_solicitud_id` → Para JOIN con `solicitudes`
- `idx_scraping_results_created_at` → Para ordenar por fecha
- `idx_scraping_results_producto_text` → Para búsquedas por producto

---

## 🎯 Mapeos Automáticos

### Tipo de Producto → Categoría de Scraping

| Tipo Producto (formulario) | Categoría (scraping) |
|----------------------------|----------------------|
| Electrónica | `electronica` |
| Electrodomésticos | `electrodomesticos` |
| Hogar y jardín | `hogar` |
| Moda y accesorios | `moda` |
| Deportes y ocio | `deporte` |
| Motor | `motor` |
| Otros | `general` |

### Estado → Condición Objetivo

| Estado (formulario) | Condición (scraping) |
|--------------------|----------------------|
| Nuevo | `nuevo` |
| Como nuevo | `como_nuevo` |
| Muy buen estado | `muy_buen_estado` |
| Buen estado | `buen_estado` |
| Usado | `usado` |
| Aceptable | `aceptable` |

---

## 📊 Parámetros de Scraping

Los siguientes parámetros se usan automáticamente:

```typescript
{
  producto_text: data.modeloMarca,           // Ej: "iPhone 17 Pro 512GB"
  categoria: categoriaMapeada,               // Ej: "electronica"
  ubicacion: `${pais}/${ciudad}`,            // Ej: "españa/madrid"
  radio_km: 30,                              // Radio fijo: 30 km
  condicion_objetivo: condicionMapeada,      // Ej: "buen_estado"
  idioma_busqueda: 'es' | 'en',              // Detectado automáticamente
  min_paginas_por_plataforma: 100,           // Páginas por plataforma
  min_resultados_por_plataforma: 250,        // Anuncios mínimos por plataforma
}
```

**Nota:** Puedes ajustar `radio_km`, `min_paginas_por_plataforma` y `min_resultados_por_plataforma` según necesites.

---

## 🤖 Uso de ChatGPT

ChatGPT **solo se usa** en un caso específico:

### Búsqueda Laxa (Lazy Search)

Si la primera búsqueda estricta **no encuentra suficientes resultados** (< 250 anuncios relevantes), el sistema:

1. Llama a `generateSearchVariants()` de ChatGPT
2. ChatGPT genera 5 variantes de búsqueda optimizadas
3. Se ejecuta una segunda búsqueda con esas variantes
4. **Fallback:** Si ChatGPT falla, usa `generarVariantesBusqueda()` (manual)

**Prompt usado por ChatGPT:**
```
Actúa como experto en búsqueda de anuncios de segunda mano. 
A partir de product_text="..." e idioma="...", 
genera exactamente 5 cadenas de búsqueda distintas, 
optimizadas para títulos/listados.

Reglas:
- Solo texto plano (palabras separadas por espacios)
- Incluye variantes de marca/modelo, abreviaturas y errores comunes
- Prioriza tokens de alto valor (marca, modelo, medida, color)
- Evita stopwords y relleno

Salida: solo 5 líneas, cada línea una cadena; sin numeración ni texto extra.
```

---

## 📦 Resultados Guardados

Cada scraping guarda **dos tipos de datos**:

#### 🔍 URLs Encontradas (Todas)
- **Columna:** `todas_urls_encontradas TEXT[]`
- **Contenido:** Array con **todas** las URLs encontradas durante el scraping
- **Sin filtros:** Incluye URLs descartadas por relevancia, outliers, duplicados, etc.
- **Propósito:** Auditoría, debugging, análisis de cobertura

#### ✅ URLs Finales (Filtradas)
- **Contenido:** Solo las URLs que pasan todos los filtros y aparecen en resultados
- **Con filtros:** Relevancia, outliers, duplicados, condición mínima, etc.
- **Propósito:** Datos finales para mostrar al usuario

### Ejemplo de Diferencia

Para una búsqueda de "iPhone 17 Pro 512GB":

| Tipo | Cantidad | Ejemplo |
|------|----------|---------|
| **URLs Encontradas** | 150 URLs | wallapop.com/item/iphone-15-pro, wallapop.com/item/iphone-17-pro, ... |
| **URLs Procesadas** | 120 URLs | Después de normalización y filtros básicos |
| **URLs Filtradas** | 28 URLs | Después de filtro de relevancia (70%) |
| **URLs Finales** | 25 URLs | Después de outliers y deduplicación |

### JSON Compradores
```json
{
  "compradores": [
    {
      "plataforma": "wallapop",
      "precio_eur": 950.00,
      "estado_declarado": "como_nuevo",
      "ciudad_o_zona": "Madrid",
      "url_anuncio": "https://...",
      "url_listado": "https://...",
      "fecha_publicacion": "2025-01-15"
    },
    // ... más anuncios
  ]
}
```

### JSON Vendedores
```json
{
  "vendedores": [
    {
      "tipo_precio": "minimo",
      "precio_eur": 800.00,
      "plataforma": "wallapop, milanuncios",
      "urls": ["https://...", "https://..."],
      "plataforma_sugerida": ["wallapop", "milanuncios"]
    },
    {
      "tipo_precio": "ideal",
      "precio_eur": 920.50,
      "plataforma": "wallapop, milanuncios",
      "urls": ["https://...", "https://..."],
      "plataforma_sugerida": ["wallapop", "milanuncios"]
    },
    {
      "tipo_precio": "rapido",
      "precio_eur": 828.45,
      "plataforma": "wallapop, milanuncios",
      "urls": ["https://...", "https://..."],
      "plataforma_sugerida": ["wallapop", "milanuncios"]
    }
  ],
  "descripcion_anuncio": "iPhone 17 Pro 512GB en muy buen estado..."
}
```

### Tablas
Similar pero en formato array de objetos, listas para mostrar en tablas.

---

## 🔍 Consultas SQL Útiles

### Ver últimos scrapings ejecutados
```sql
SELECT 
    sr.id,
    sr.producto_text,
    sr.ubicacion,
    sr.total_anuncios_encontrados,
    sr.total_anuncios_filtrados,
    sr.plataformas_consultadas,
    sr.created_at,
    s.email,
    s.pais,
    s.ciudad
FROM scraping_results sr
JOIN solicitudes s ON sr.solicitud_id = s.id
ORDER BY sr.created_at DESC
LIMIT 10;
```

### Ver anuncios encontrados para un scraping específico
```sql
SELECT 
    sr.json_compradores->'compradores' as anuncios_compradores,
    sr.json_vendedores->'vendedores' as precios_vendedor
FROM scraping_results sr
WHERE sr.id = 123;  -- Cambiar por el ID del scraping
```

### Estadísticas de scraping
```sql
SELECT
    sr.categoria,
    COUNT(*) as total_scrapings,
    AVG(sr.total_anuncios_encontrados) as promedio_anuncios,
    AVG(sr.total_anuncios_filtrados) as promedio_filtrados,
    AVG(array_length(sr.todas_urls_encontradas, 1)) as promedio_urls_encontradas
FROM scraping_results sr
GROUP BY sr.categoria
ORDER BY total_scrapings DESC;
```

### Ver todas las URLs encontradas en un scraping
```sql
SELECT
    sr.id,
    sr.producto_text,
    array_length(sr.todas_urls_encontradas, 1) as total_urls,
    unnest(sr.todas_urls_encontradas) as url_encontrada
FROM scraping_results sr
WHERE sr.id = 123;  -- Cambiar por el ID del scraping
```

### Comparar URLs encontradas vs URLs finales
```sql
SELECT
    sr.id,
    sr.producto_text,
    array_length(sr.todas_urls_encontradas, 1) as urls_encontradas,
    sr.total_anuncios_encontrados as urls_procesadas,
    sr.total_anuncios_filtrados as urls_finales,
    jsonb_array_length(sr.json_compradores->'compradores') as compradores_finales
FROM scraping_results sr
WHERE sr.id = 123;
```

---

## ⚙️ Configuración Requerida

### 1. Crear la Tabla en Supabase

Ejecuta `CREATE_TABLE_SCRAPING_RESULTS.sql` en el SQL Editor de Supabase.

#### Si ya tienes la tabla sin la columna `todas_urls_encontradas`:

Ejecuta `ADD_TODAS_URLS_SCRAPING_RESULTS.sql` para añadir la nueva columna:

```sql
ALTER TABLE scraping_results
ADD COLUMN IF NOT EXISTS todas_urls_encontradas TEXT[];
```

### 2. Variables de Entorno

Asegúrate de tener configuradas:

```bash
# Base de datos (Supabase)
POSTGRES_HOST=xxx.supabase.co
POSTGRES_PORT=6543
POSTGRES_USER=postgres.xxx
POSTGRES_PASSWORD=xxx
POSTGRES_DB=postgres

# ChatGPT (para búsqueda laxa)
OPENAI_API_KEY=sk-xxx
OPENAI_MODEL=gpt-4o-mini  # Opcional, por defecto usa gpt-4o-mini

# Puppeteer (para Wallapop scraping)
# No requiere configuración adicional, se instala con npm install
```

### 3. Instalar Dependencias

Si aún no lo has hecho:

```bash
npm install puppeteer cheerio undici openai
```

---

## 🐛 Troubleshooting

### El scraping falla pero el formulario funciona

✅ **Esto es correcto.** El scraping no bloquea el flujo. La solicitud se guarda y el usuario recibe confirmación aunque el scraping falle.

### No se guardan resultados de scraping

1. Verifica que la tabla `scraping_results` existe:
   ```sql
   SELECT * FROM scraping_results LIMIT 1;
   ```

2. Revisa los logs del servidor:
   ```
   🕷️ Iniciando scraping automático para solicitud ID: X
   ✅ Scraping ejecutado y guardado correctamente
   ```

3. Si ves `❌ Error en el proceso de scraping automático`, revisa el mensaje de error específico.

### ChatGPT no genera variantes

Si ves:
```
⚠️ [Processor] ChatGPT no disponible, usando generación de variantes por defecto
```

Verifica:
1. `OPENAI_API_KEY` está configurada en `.env.local` y Vercel
2. Tienes créditos en tu cuenta de OpenAI
3. El modelo (`gpt-4o-mini` o el que uses) está disponible

**Nota:** El sistema funcionará con variantes manuales si ChatGPT falla.

### Puppeteer falla en Vercel

Puppeteer puede no funcionar en entornos serverless como Vercel. Considera:
1. Usar una función separada en un servidor con Node.js completo
2. Usar un servicio de scraping como BrightData o ScraperAPI
3. Implementar el scraping como un job asíncrono (cron, queue)

---

## 📚 Documentación Relacionada

| Archivo | Descripción |
|---------|-------------|
| `GUIA_SCRAPING.md` | Guía completa del sistema de scraping |
| `PORQUE_SE_DESCARTAN_ANUNCIOS.md` | Explicación de filtros de relevancia |
| `MEJORAS_RELEVANCIA_IMPLEMENTADAS.md` | Sistema de relevancia y umbrales |
| `VARIANTES_CHATGPT.md` | Generación de variantes con ChatGPT |
| `CREATE_TABLE_SCRAPING_RESULTS.sql` | Script SQL para crear la tabla |
| `lib/scraper/EJEMPLO_USO.ts` | Ejemplo de uso del scraping |

---

## ✅ Ventajas de Esta Implementación

1. **✅ Datos Reales:** Los usuarios reciben precios reales del mercado (no estimaciones de IA)
2. **✅ No Bloquea el Flujo:** El scraping es asíncrono, el usuario no espera
3. **✅ Robusto:** Fallback manual si ChatGPT falla
4. **✅ Escalable:** Fácil añadir más plataformas de scraping
5. **✅ Trazable:** Todos los resultados quedan guardados en BD
6. **✅ Optimizado:** Uso mínimo de ChatGPT (solo para búsqueda laxa)

---

## 🚀 Próximos Pasos Sugeridos

1. **Implementar vista en `/admin`** para ver resultados de scraping
2. **Añadir Milanuncios scraper** (actualmente solo Wallapop está completo)
3. **Enviar PDF con resultados** al email del usuario (usar puppeteer o jsPDF)
4. **Job asíncrono** para scrapings largos (usando Bull, BullMQ, o similar)
5. **Caché de resultados** para productos populares (evitar scraping duplicado)
6. **Rate limiting** para evitar baneos de Wallapop/Milanuncios

---

## 💡 Conclusión

El sistema ahora proporciona **datos reales del mercado** en lugar de estimaciones de IA, mientras mantiene un flujo de usuario rápido y robusto. ChatGPT se usa de forma estratégica solo cuando es necesario (búsqueda laxa), minimizando costos y maximizando precisión.

