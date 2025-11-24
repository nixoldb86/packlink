# Pricofy - Contexto del Proyecto

## Descripción General

Pricofy es una plataforma de inteligencia de precios para productos de segunda mano que permite a los usuarios:
- **Comprar**: Buscar productos al mejor precio en plataformas de segunda mano
- **Vender**: Evaluar el precio óptimo para vender sus productos

## Arquitectura y Tecnologías

### Stack Tecnológico
- **Frontend**: Next.js 14+ (App Router), React, TypeScript
- **Estilos**: Tailwind CSS
- **Base de Datos**: PostgreSQL (Supabase)
- **Autenticación**: Supabase Auth (Google SSO, Email/Password, OTP)
- **Almacenamiento**: Backblaze B2 / S3 para imágenes
- **APIs Externas**: 
  - Wallapop API
  - Milanuncios API
  - Nominatim (OpenStreetMap) para geocodificación
  - ChatGPT API para verificación semántica y categorización

### Estructura del Proyecto

```
pricofy-landing/
├── app/
│   ├── api/
│   │   ├── submit-request/      # Endpoint para crear evaluaciones
│   │   ├── my-evaluations/      # Lista de evaluaciones del usuario
│   │   ├── evaluation/[id]/    # Detalle de una evaluación
│   │   ├── geocode/             # Geocodificación de ubicaciones
│   │   └── contact/             # Formulario de contacto
│   ├── dashboard/               # Dashboard principal
│   │   ├── page.tsx             # Vista principal con filtros
│   │   └── evaluation/[id]/     # Detalle de evaluación
│   ├── contacto/                # Página de contacto
│   ├── caracteristicas/         # Página de características
│   ├── pricing/                 # Página de precios
│   └── page.tsx                 # Home page
├── components/
│   ├── Hero.tsx                 # Sección hero de la home
│   ├── Navbar.tsx               # Barra de navegación
│   ├── ProductForm.tsx          # Formulario de evaluación
│   ├── AuthModal.tsx            # Modal de autenticación
│   ├── UserMenu.tsx             # Menú de usuario
│   ├── LanguageSelector.tsx     # Selector de idioma
│   └── ProblemsAndSolutions.tsx # Sección problemas/soluciones
├── contexts/
│   ├── AuthContext.tsx          # Contexto de autenticación
│   ├── LanguageContext.tsx      # Contexto de idioma
│   └── FormContext.tsx          # Contexto del formulario
├── lib/
│   ├── db.ts                    # Funciones de base de datos
│   ├── scraper/                 # Módulo de scraping
│   │   ├── wallapop.ts          # Scraper de Wallapop
│   │   ├── milanuncios.ts       # Scraper de Milanuncios
│   │   ├── processor.ts         # Procesador principal
│   │   ├── utils.ts             # Utilidades (normalización, outliers)
│   │   └── types.ts             # Tipos TypeScript
│   ├── chatgpt.ts               # Integración con ChatGPT
│   ├── geocoding.ts             # Utilidades de geocodificación
│   ├── translations.ts          # Sistema de traducciones
│   └── s3.ts                    # Upload a S3/Backblaze
└── database/
    └── schema.sql               # Esquema de base de datos
```

## Funcionalidades Principales

### 1. Autenticación
- **Login/Registro**: Email/Password, OTP, Google SSO
- **Gestión de sesión**: Context API con Supabase
- **Redirección**: Automática al dashboard tras login
- **UI**: Modal de autenticación con traducciones

### 2. Dashboard
- **Vista principal**: Dashboard rediseñado con secciones horizontales
- **Filtros**: Dashboard, Compras, Ventas, Favoritos, Perfil
- **Navegación**:
  - Desktop: Sidebar fijo a la izquierda (siempre visible en todas las páginas del dashboard)
  - Mobile: Barra inferior fija
  - **Sin logo**: El menú no incluye logo "ruit" ni ningún logo
  - **Nombres actualizados**: "Comprar" → "Compras", "Vender" → "Ventas"
- **Layout del Dashboard**:
  - **Barra de búsqueda**: En la parte superior, sin botón de lupa interno
  - **Botones de acción**: 
    - Contenedor con "Comprar" (con icono de lupa) + botón circular de barita mágica (búsqueda inteligente)
    - Botón "Vender" (mismo ancho que el contenedor de Comprar)
    - Ambos contenedores tienen el mismo ancho y están centrados
  - **Secciones con scroll horizontal**:
    - **Compras**: Muestra evaluaciones de tipo "comprar" con icono de tipo de búsqueda (lupa/barita) y fecha
    - **Ventas**: Muestra evaluaciones de tipo "vender" con fecha
    - **Alertas configuradas**: Mensaje informativo sobre alertas automáticas
    - **Notificaciones**: Mensaje cuando no hay notificaciones
    - **Favoritos**: Muestra evaluaciones marcadas como favoritas con icono de tipo (si es compra), pill de "Compra"/"Venta" y corazón
    - **Archivados**: Muestra evaluaciones archivadas con icono de tipo (si es compra), pill de "Compra"/"Venta" y botón de desarchivar
- **Sección Compras**:
  - Barra de búsqueda con botón de lupa y botón de barita mágica
  - Selector de vista (lista/cuadrícula) con pill más estrecha
  - Vista lista: Alineación vertical de todos los elementos (icono, título, corazón, pill)
  - Vista cuadrícula: Cards más compactas con corazón junto a la pill
- **Sección Ventas**:
  - Barra de búsqueda orientada a venta (sin barita mágica)
  - Selector de vista (lista/cuadrícula)
  - Mismo diseño que Compras pero con colores verdes
- **Búsqueda**: 
  - En "Compras": Barra de búsqueda que actúa como formulario rápido
  - En "Ventas": Barra de búsqueda que abre modal para subir fotos
  - En detalle: Búsqueda y filtros por precio/ubicación/estado/top profile
- **Cards de evaluación**:
  - Desktop: Información completa
  - Mobile: Expandible al hacer click (solo título, pill, precio mínimo)
- **KPIs en cards**:
  - **Analizados** (morado): `total_anuncios_analizados` - Total de anuncios obtenidos de todas las búsquedas
  - **Descartados** (rojo): `total_anuncios_descartados` - Anuncios descartados por ChatGPT
  - **Outliers** (naranja): `total_anuncios_outliers` - Anuncios descartados por precios extremos (IQR)
  - **Filtrados** (verde): `total_anuncios_filtrados` - Anuncios finales que pasaron todos los filtros

### 3. Sistema de Evaluaciones

#### Formulario de Evaluación
- **Campos simplificados**:
  - Email (oculto si usuario está logueado)
  - Modelo/Marca
  - Acción: "Quiero vender" / "Quiero comprar"
  - Fotos (máximo 6, solo para "vender")
- **Validación**: Backend valida campos requeridos
- **Límite diario**: Configurable via `EVALUACIONES_LIMITE_DIARIO`
- **Modal para "Vender" desde Dashboard**:
  - Título: "Fotografías de tu producto" (tamaño reducido para una línea)
  - Solo solicita fotografías (sin input de búsqueda, sin pregunta de acción)
  - Preview de imágenes con botón X para eliminar cada una
  - Contador dinámico de fotos seleccionadas
  - Botón "Enviar evaluación" en verde
  - Se abre automáticamente cuando se hace click en "Vender" desde el dashboard

#### Procesamiento
1. **Guardado inicial**: Se guarda en `solicitudes` con `user_id` si está autenticado
2. **Scraping en background**: 
   - Búsqueda en Wallapop y Milanuncios
   - Generación de variantes de búsqueda con ChatGPT
   - Filtrado semántico (Jaccard similarity)
   - Detección de marca/modelo
   - Normalización de textos
3. **Análisis de precios**:
   - Detección de outliers (IQR: Q1=percentil 50, Q3=percentil 90)
   - Filtrado por relevancia
   - Cálculo de estadísticas
4. **Categorización**: ChatGPT determina categoría del producto
5. **Geocodificación**: Coordenadas de ciudades para filtrado por ubicación

### 4. Scraping y Procesamiento

#### Plataformas Soportadas
- **Wallapop**: API REST
- **Milanuncios**: API REST

#### Flujo de Procesamiento
1. **Búsqueda**: Múltiples variantes generadas por ChatGPT (6 búsquedas en paralelo)
2. **Verificación con ChatGPT (SIEMPRE ACTIVA)**: 
   - **Eliminado prefiltrado semántico (Jaccard similarity)**: Ahora todos los anuncios pasan directamente a verificación con ChatGPT
   - Verificación semántica usando el título del anuncio y todas las variantes de búsqueda
   - ChatGPT determina si el anuncio coincide con alguna variante de búsqueda
   - Solo los anuncios aceptados por ChatGPT continúan en el proceso
3. **Normalización**:
   - Eliminación de caracteres especiales
   - Normalización de acentos
   - Detección de marca/modelo
   - Separación de números y unidades para mejor matching
   - **Mapeo de marcas**: Incluye marcas como "shokz", "logitech", "apple", "samsung", etc.
4. **Deduplicación**: Por URL y título similar
5. **Outliers**: Método IQR con percentiles 50 y 90
6. **Geocodificación**: Cache de coordenadas de ciudades

#### Campos Extraídos de Wallapop
- Título, precio, **descripción** (extraída de `item.description || item.desc || item.details`)
- Estado del producto (inferido)
- Ciudad/ubicación
- URL del anuncio
- **product_image**: `data.section.payload.items.images.urls.small` o `images.small` (fallback)
- **is_shippable**: `data.section.payload.items.shipping.item_is_shippable`
- **is_top_profile**: `data.section.payload.items.is_top_profile.flag`
- **user_id**: `data.section.payload.items.user_id`

#### Campos Extraídos de Milanuncios
- Título, precio, **descripción** (extraída de `ad?.description`)
- **Estado del producto**: Mapeo de estados de Milanuncios a estados internos:
  - "Sin estrenar" → "Nuevo"
  - "Prácticamente nuevo" / "Practicamente nuevo" → "Como nuevo"
  - "En buen estado" → "Buen estado"
  - "Aceptable" → "Usado"
  - "Mejorable" → "Necesita reparación"
- Ciudad/ubicación
- URL del anuncio

### 5. Filtros y Búsqueda

#### Dashboard
- **Filtros por sección**: Resumen, Comprar, Vender
- **Búsqueda en "Comprar"**: 
  - Barra de búsqueda ovalada
  - Botón "Buscar" integrado
  - Dispara evaluación directamente (sin abrir formulario)

#### Detalle de Evaluación
- **Navegación dinámica**: 
  - Enlace "Volver a Compras" (azul) para evaluaciones de compra
  - Enlace "Volver a Ventas" (verde) para evaluaciones de venta
- **Búsqueda de texto**: Filtra anuncios por título
- **Filtros avanzados**:
  - **Precio**: Desde - Hasta
  - **Ubicación**: Ciudad + Radio (km)
  - **Geocodificación**: Usa Nominatim con rate limiting
  - **Cálculo de distancia**: Fórmula de Haversine
  - **Estado mínimo**: Sistema de 5 estrellas para filtrar por condición:
    - 1 estrella: Necesita reparación
    - 2 estrellas: Usado
    - 3 estrellas: Buen estado
    - 4 estrellas: Como nuevo
    - 5 estrellas: Nuevo
  - **Solo perfiles top**: Checkbox para mostrar solo anuncios con `is_top_profile: true`
- **Modal de detalle de anuncio**:
  - Se abre al hacer click en un anuncio de la lista
  - Muestra: título, imagen del producto (con max-height para evitar scroll), descripción, precio
  - Icono de plataforma (Wallapop/Milanuncios) junto al título, clickeable para ir al anuncio
  - Botón X en la esquina superior derecha para cerrar
- **Orden de anuncios**:
  - Para búsquedas directas (`tipo_busqueda=directa`): Mantiene el orden original de las fuentes escrapeadas
  - Para otras búsquedas: Anuncios intercalados aleatoriamente entre plataformas para mejor diversidad visual
- **Vista "Vender"**:
  - **Gráficos de análisis de mercado**:
    - Distribución por plataformas (Wallapop, Milanuncios, etc.)
    - Distribución por envío (con envío / sin envío)
    - Distribución por antigüedad (menos de 1 semana, 1-4 semanas, 1-3 meses, >3 meses, sin fecha)
    - Distribución de precios (5 rangos con porcentajes dentro o fuera de las barras)
    - Distribución por ubicación (top 10 ciudades)
    - Relación precio vs antigüedad (precio promedio por categoría de antigüedad)
  - **Precios recomendados**:
    - Precio Mínimo (icono `precio_minimo.png`)
    - Precio Ideal (icono `precio_ideal.png`)
    - Precio Rápido (icono `precio_rapido.png`)
    - Cada uno con descripción y tooltip informativo
  - **Sin secciones**: Ocultas la barra de búsqueda, filtros, "Nuestros preferidos" y "Todos los anuncios disponibles"

### 6. Internacionalización
- **Idiomas**: Español, Inglés
- **Sistema**: Context API + archivo `translations.ts`
- **Componentes traducidos**: 
  - Navbar, Hero, Formularios, Dashboard, Modales
  - Mensajes de error y éxito

### 7. UI/UX

#### Diseño
- **Tipografía**: Poppins (configurada globalmente)
- **Colores**: 
  - Primary: Verde (#667EEA)
  - Purple: Morado (#8B5CF6)
  - Gradientes: Primary → Purple
- **Responsive**: 
  - Mobile-first
  - Breakpoints: sm, md, lg
  - Menú adaptativo (sidebar desktop, bottom nav mobile)

#### Componentes Clave
- **Cards**: Con sombras, hover effects, gradientes
- **Botones**: Gradientes, estados hover, animaciones
- **Formularios**: Inputs ovalados, validación visual
- **Modales**: Overlay, animaciones de entrada/salida

## Base de Datos

### Tablas Principales

#### `solicitudes`
- `id`, `email`, `pais`, `ciudad`, `accion`, `tipo_producto`
- `modelo_marca`, `estado`, `accesorios`, `urgencia`
- `fotos_paths` (JSON), `fotos_urls` (JSONB)
- `user_id` (UUID, nullable para compatibilidad)
- `created_at`, `updated_at`

#### `scraping_results`
- `id`, `solicitud_id`
- `producto_text`, `categoria`, `ubicacion`, `radio_km`, `condicion_objetivo`
- `json_compradores` (JSONB): Array de anuncios con campos:
  - `titulo`, `plataforma`, `precio_eur`, `moneda_original`
  - `estado_declarado`, `ciudad_o_zona`, `url_anuncio`, `url_listado`
  - `fecha_publicacion`
  - `product_image` (string | null): URL de imagen del producto
  - `descripcion` (string | null): Descripción del anuncio extraída de la plataforma
  - `is_shippable` (boolean | null): Si el producto se puede enviar
  - `is_top_profile` (boolean | null): Si el vendedor es perfil destacado
  - `user_id` (string | null): ID del usuario vendedor
- `json_vendedores` (JSONB)
- `tabla_compradores` (JSONB), `tabla_vendedores` (JSONB)
- `total_anuncios_analizados`: Total de anuncios obtenidos de todas las búsquedas (antes de filtrado)
- `total_anuncios_descartados`: Anuncios descartados por ChatGPT (prefiltrado semántico eliminado)
- `total_anuncios_outliers`: Anuncios descartados por precios extremos (IQR)
- `total_anuncios_filtrados`: Anuncios finales que pasaron todos los filtros
- `todas_urls_encontradas` (JSONB): Todas las URLs encontradas (incluso descartadas)
- `plataformas_consultadas` (JSONB)
- `created_at`

#### `contactos`
- `id`, `nombre`, `email`, `telefono`, `comentario`
- `created_at`, `updated_at`

### Índices
- `idx_email` en `solicitudes`
- `idx_accion` en `solicitudes`
- `idx_user_id` en `solicitudes` (si existe)
- `idx_created_at` en ambas tablas

## Variables de Entorno

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Base de Datos
DATABASE_URL=

# Evaluaciones
EVALUACIONES_LIMITE_DIARIO=1

# ChatGPT
OPENAI_API_KEY=

# Storage
BACKBLAZE_APPLICATION_KEY_ID=
BACKBLAZE_APPLICATION_KEY=
BACKBLAZE_BUCKET_NAME=
BACKBLAZE_ENDPOINT=
USE_CLOUD_STORAGE=true

# Email
RESEND_API_KEY=
```

## APIs y Endpoints

### Frontend → Backend

#### `POST /api/submit-request`
- Crea una nueva evaluación
- Valida límite diario por email
- Sube fotos a S3/Backblaze
- Guarda en BD
- Inicia scraping en background
- Retorna ID de solicitud

#### `GET /api/my-evaluations`
- Lista evaluaciones del usuario
- Filtra por `user_id` o `email` (compatibilidad)
- Incluye `jsonCompradores` para filtrado cliente

#### `GET /api/evaluation/[id]`
- Detalle completo de una evaluación
- Incluye scraping results y estadísticas

#### `POST /api/geocode`
- Geocodifica una ubicación (ciudad)
- Usa Nominatim con rate limiting
- Retorna coordenadas (lat, lon)

#### `POST /api/contact`
- Envía formulario de contacto
- Envía email via Resend

### Backend → Externas

#### Wallapop API
- Búsqueda de productos
- Extracción de campos:
  - Imágenes: `data.section.payload.items.images.urls.small` o `images.small` (fallback)
  - Envío: `data.section.payload.items.shipping.item_is_shippable`
  - Perfil destacado: `data.section.payload.items.is_top_profile.flag`
  - ID de usuario: `data.section.payload.items.user_id`

#### Milanuncios API
- Búsqueda de productos

#### Nominatim (OpenStreetMap)
- Geocodificación de ciudades
- Rate limiting: 1 request/segundo
- Timeout: 10 segundos
- User-Agent requerido

#### ChatGPT API
- Generación de variantes de búsqueda
- Verificación semántica de anuncios
- Categorización de productos
- Inferencia de estado del producto

## Decisiones Técnicas Importantes

### 1. Compatibilidad con Datos Antiguos
- Evaluaciones sin `user_id` se buscan por `email`
- Columnas opcionales se agregan dinámicamente si no existen
- Fallbacks en queries SQL

### 2. Rate Limiting
- Nominatim: 1 req/seg (implementado en `lib/geocoding-rate-limiter.ts`)
- Cache de geocodificación para evitar llamadas redundantes

### 3. Procesamiento Asíncrono
- Scraping se ejecuta en background después de guardar solicitud
- No bloquea la respuesta al usuario

### 4. Normalización de Textos
- Eliminación de caracteres especiales
- Normalización de acentos (á→a, ö→o, etc.)
- **Normalización de números con unidades**: `"512gb"` → `"512 gb"` para mejor matching
- Detección de números importantes (modelos, capacidades) para ajustar umbrales
- Mejora matching semántico

### 5. Detección de Outliers
- Método IQR modificado:
  - Q1: Percentil 50 (en vez de 25)
  - Q3: Percentil 90 (en vez de 75)
- Más conservador, menos falsos positivos

### 6. Responsive Design
- Mobile: Cards expandibles, menú inferior
- Desktop: Sidebar fijo, información completa
- Grid adaptativo: 1 col (mobile) → 2 (tablet) → 3 (desktop)

## Estado Actual

### ✅ Implementado
- Autenticación completa (Supabase)
- Dashboard con filtros y búsqueda
- Formulario de evaluación simplificado
- Scraping de Wallapop y Milanuncios
- Procesamiento y análisis de precios
- Filtros por precio y ubicación
- Geocodificación con cache
- Internacionalización (ES/EN)
- Upload de imágenes a cloud storage
- Sistema de categorización con ChatGPT
- Vista de detalle de evaluación
- Menú responsive (sidebar/bottom nav)

### 🔄 En Desarrollo / Pendiente
- Mejoras en visualización de gráficos de análisis de mercado
- Optimización de rendimiento para grandes volúmenes de anuncios

### 🐛 Problemas Conocidos
- (Ninguno reportado actualmente)

## Notas de Desarrollo

### Correcciones Recientes

#### Dashboard y UI
1. **KPIs actualizados**: Cambio de orden y valores mostrados en cards de evaluación
   - Orden: Analizados (morado) → Descartados (rojo) → Outliers (naranja) → Filtrados (verde)
   - Valores: `total_anuncios_analizados`, `total_anuncios_descartados`, `total_anuncios_outliers`, `total_anuncios_filtrados`
2. **Menú lateral**: 
   - Eliminado logo "ruit" del sidebar
   - Menú siempre visible en todas las páginas del dashboard (principal y detalle)
   - Componente `DashboardSidebar` reutilizable
3. **Estructura JSX**: Funciones helper movidas antes de returns condicionales
4. **Indentación**: Corregida estructura JSX en detalle de evaluación

#### Scraping y Procesamiento
5. **Campos adicionales en JSON de compradores**:
   - `product_image`: Extraído de `data.section.payload.items.images.urls.small`
   - `descripcion`: Extraído de `item.description || item.desc || item.details` (Wallapop) y `ad?.description` (Milanuncios)
   - `is_shippable`: Extraído de `data.section.payload.items.shipping.item_is_shippable`
   - `is_top_profile`: Extraído de `data.section.payload.items.is_top_profile.flag`
   - `user_id`: Extraído de `data.section.payload.items.user_id`
6. **Verificación semántica con ChatGPT (SIEMPRE ACTIVA)**:
   - **Eliminado prefiltrado semántico (Jaccard similarity)**: Todos los anuncios pasan directamente a ChatGPT
   - ChatGPT verifica si el título del anuncio coincide con alguna variante de búsqueda
   - Proceso más preciso y menos propenso a falsos negativos
   - Soluciona problemas como rechazo de anuncios válidos (ej: "Shokz" no detectado como marca)
7. **Mapeo de marcas**:
   - Agregado "shokz" al brandMap para detección correcta de marca
   - Incluye marcas comunes: logitech, apple, samsung, sony, nike, adidas, etc.
8. **Mapeo de estados de Milanuncios**:
   - "Sin estrenar" → "Nuevo"
   - "Prácticamente nuevo" / "Practicamente nuevo" → "Como nuevo"
   - "En buen estado" → "Buen estado"
   - "Aceptable" → "Usado"
   - "Mejorable" → "Necesita reparación"
   - Script SQL disponible para actualizar estados existentes en BD

### Mejoras Futuras Sugeridas
- Cache más robusto para geocodificación (Redis?)
- Webhooks para notificar cuando scraping termine
- Paginación en listado de evaluaciones
- Exportar resultados a PDF/Excel
- Notificaciones push para evaluaciones completadas

## Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Linting
npm run lint

# Type checking
npm run type-check
```

## Referencias

- [Configuración Supabase Auth](./CONFIGURAR_SUPABASE_AUTH.md)
- [Variables de Entorno](./ENV_VARIABLES.md)
- [Integración Scraping](./INTEGRACION_SCRAPING_FORMULARIO.md)

---

## Cambios Recientes (2025-11-14)

### Dashboard
- **Rediseño completo del Dashboard**:
  - Renombrado de "Resumen" a "Dashboard" con icono apropiado
  - Nueva estructura con barra de búsqueda superior
  - Botones de acción: Contenedor "Comprar" + barita mágica, y botón "Vender" (mismo ancho)
  - Secciones con scroll horizontal: Compras, Ventas, Alertas, Notificaciones, Favoritos, Archivados
  - Cards con fecha en formato corto (ej: "3 de Nov de 2025")
  - Correcciones de alineación y visibilidad en desktop
- **Sección Compras**:
  - Barra de búsqueda con lupa y barita mágica
  - Selector de vista (lista/cuadrícula) más estrecho
  - Vista lista: Alineación vertical mejorada
  - Vista cuadrícula: Cards más compactas
- **Sección Ventas**:
  - Replicada funcionalidad de Compras con colores verdes
  - Barra de búsqueda orientada a venta
  - Selector de vista (lista/cuadrícula)
- **Menú actualizado**: "Comprar" → "Compras", "Vender" → "Ventas"
- **Pills actualizadas**: "Comprar" → "Compra", "Vender" → "Venta"
- **Navegación dinámica**: Enlaces "Volver a Compras" / "Volver a Ventas" según tipo de evaluación

### Detalle de Evaluación
- **Modal de detalle de anuncio**:
  - Se abre al hacer click en un anuncio
  - Muestra título, imagen, descripción, precio
  - Icono de plataforma clickeable para ir al anuncio original
- **Filtros mejorados**:
  - Filtro por estado mínimo (sistema de 5 estrellas)
  - Filtro por perfiles top (`is_top_profile`)
- **Orden de anuncios**:
  - Búsquedas directas mantienen orden original
  - Otras búsquedas: intercalado aleatorio entre plataformas
- **Vista "Vender" mejorada**:
  - 6 gráficos de análisis de mercado (plataformas, envío, antigüedad, precios, ubicación, precio vs antigüedad)
  - Sección de precios recomendados (mínimo, ideal, rápido) con iconos
  - Ocultas secciones no relevantes (búsqueda, filtros, preferidos, todos los anuncios)

### Scraping y Procesamiento
- **Verificación semántica**: Eliminado prefiltrado Jaccard, ahora siempre se usa ChatGPT
- **Campos adicionales**: `descripcion` extraída de Wallapop y Milanuncios
- **Mapeo de marcas**: Agregado "shokz" y otras marcas al brandMap
- **Mapeo de estados Milanuncios**: Normalización de estados a formato interno
- **Procesamiento**: Pasos reducidos de 7 a 5 (eliminado prefiltrado semántico)

### Formulario
- **Modal para "Vender" desde Dashboard**:
  - Solo solicita fotografías
  - Preview de imágenes con eliminación individual
  - Contador dinámico de fotos
  - Botón verde "Enviar evaluación"

---

**Última actualización**: 2025-11-14
**Versión**: 1.2.0

