# Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

## Base de datos - PlanetScale (MySQL compatible)

```env
DB_HOST=aws.connect.psdb.cloud
DB_PORT=3306
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=pricofy_db
DB_SSL=true
```

**Obtén estas credenciales desde tu dashboard de PlanetScale:**
1. Ve a https://app.planetscale.com
2. Selecciona tu base de datos
3. Click en "Connect" y copia las credenciales

## Almacenamiento en la nube - Backblaze B2 (Recomendado)

```env
S3_ENDPOINT=https://s3.us-west-000.backblazeb2.com
S3_REGION=us-west-000
S3_ACCESS_KEY_ID=tu_key_id
S3_SECRET_ACCESS_KEY=tu_application_key
S3_BUCKET_NAME=nombre-del-bucket
S3_FORCE_PATH_STYLE=true
S3_PUBLIC_URL=https://f000.backblazeb2.com/file/nombre-del-bucket
S3_MAKE_PUBLIC=true
```

**Configuración de Backblaze B2:**
1. Crea una cuenta en https://www.backblaze.com/b2/sign-up.html
2. Crea un bucket
3. Genera Application Keys (Key ID y Application Key)
4. Configura el bucket como público si quieres acceso directo a las imágenes

## Almacenamiento en la nube - AWS S3 (Alternativa)

```env
S3_ENDPOINT=
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=tu_access_key
S3_SECRET_ACCESS_KEY=tu_secret_key
S3_BUCKET_NAME=nombre-del-bucket
S3_FORCE_PATH_STYLE=false
S3_PUBLIC_URL=
S3_MAKE_PUBLIC=true
```

## Configuración de Evaluaciones

```env
# Límite de evaluaciones por email por día (por defecto: 1)
# Si quieres permitir múltiples evaluaciones al día, aumenta este valor
EVALUACIONES_LIMITE_DIARIO=1
```

**Nota:** Por defecto, cada email solo puede hacer 1 evaluación por día. Si quieres permitir más (ej: 3 evaluaciones/día), cambia el valor a `3`.

## Configuración de Scraping

```env
# Número mínimo de páginas a procesar por plataforma (siempre 1 por defecto)
SCRAPING_MIN_PAGINAS_POR_PLATAFORMA=1

# Número mínimo de resultados requeridos por plataforma
SCRAPING_MIN_RESULTADOS_POR_PLATAFORMA=10

# Número máximo de páginas a consultar en Wallapop (por defecto: 10)
WALLAPOP_MAX_PAGES=10

# Número máximo de páginas a consultar en Milanuncios (por defecto: 10)
MILANUNCIOS_MAX_PAGES=10

# API Key de ScraperAPI (opcional pero recomendado para evitar bloqueos de Wallapop en Vercel)
# Obtén tu API key gratuita en: https://www.scraperapi.com/signup
# Tier gratuito: 5,000 requests/mes
SCRAPERAPI_KEY=tu_api_key_aqui
```

**Nota:** Estas variables se configuran únicamente en `.env.local` y no pueden ser sobrescritas desde las peticiones API. El valor por defecto de `SCRAPING_MIN_PAGINAS_POR_PLATAFORMA` es `1`, el de `WALLAPOP_MAX_PAGES` es `10` y el de `MILANUNCIOS_MAX_PAGES` es `10`.

**ScraperAPI:**
- Si no configuras `SCRAPERAPI_KEY`, el sistema intentará hacer fetch directo a Wallapop y Milanuncios (puede fallar en Vercel por bloqueos)
- Con `SCRAPERAPI_KEY` configurada, todas las peticiones a Wallapop y Milanuncios pasan por ScraperAPI, evitando bloqueos
- Tier gratuito: 5,000 requests/mes (suficiente para ~10-20 evaluaciones/día)
- Registro gratuito: https://www.scraperapi.com/signup

## Para Vercel

En Vercel, configura estas variables en:
**Settings → Environment Variables**

Agrega todas las variables de entorno mencionadas arriba para los ambientes:
- Production
- Preview
- Development

