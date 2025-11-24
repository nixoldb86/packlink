# 🔧 Solución: Error ETIMEDOUT en Vercel

## Problema

El error `ETIMEDOUT` significa que Vercel no puede conectarse a Railway. Esto sucede porque el host `gondola.proxy.rlwy.net` es un proxy interno que puede no ser accesible desde Vercel.

## Soluciones

### Opción 1: Obtener el Host Público de Railway (Recomendado)

1. **Ve a Railway:** https://railway.app
2. **Click en tu proyecto** → **Click en MySQL**
3. **Ve a la pestaña "Connect" o "Public Network"**
4. **Busca el host público** (no el proxy interno)
   - Debería ser algo como: `xxxxxx.railway.app` o similar
   - NO uses `gondola.proxy.rlwy.net` (ese es el proxy interno)

5. **En Vercel, actualiza la variable de entorno:**
   - Ve a tu proyecto en Vercel
   - Settings → Environment Variables
   - Edita `DB_HOST` y cambia el valor al host público de Railway
   - También actualiza `DB_PORT` si es necesario

### Opción 2: Usar Railway Proxy (Alternativa)

Si Railway solo ofrece el proxy interno, puedes usar Railway CLI para crear un túnel:

1. **Instala Railway CLI:**
   ```bash
   npm i -g @railway/cli
   ```

2. **En Railway, crea un servicio proxy:**
   - Ve a tu proyecto
   - Add Service → "Public Network" o "Proxy"
   - Esto creará un endpoint público

### Opción 3: Cambiar a Supabase (Alternativa Gratuita)

Si Railway sigue dando problemas, puedes usar Supabase (PostgreSQL) que es más compatible con Vercel:

1. **Crea cuenta en:** https://supabase.com
2. **Crea un proyecto nuevo**
3. **Obtén las credenciales de conexión**
4. **Actualiza el código para usar PostgreSQL** (requiere cambios en `lib/db.ts`)

## Verificar Variables de Entorno en Vercel

1. **Ve a Vercel Dashboard:** https://vercel.com
2. **Selecciona tu proyecto**
3. **Settings → Environment Variables**
4. **Verifica que estas variables estén correctas:**
   - `DB_HOST` - Debe ser el host público, no el proxy
   - `DB_PORT` - Puerto correcto
   - `DB_USER` - Usuario correcto
   - `DB_PASSWORD` - Password correcto
   - `DB_NAME` - Nombre de la base de datos
   - `DB_SSL` - `false` para Railway

## Verificar que Railway Permita Conexiones Externas

1. **En Railway, ve a tu base de datos MySQL**
2. **Busca "Public Network" o "External Access"**
3. **Asegúrate de que esté habilitado**
4. **Si no hay opción, Railway puede requerir usar el proxy**

## Solución Temporal: Usar Base de Datos Local para Desarrollo

Si necesitas seguir desarrollando mientras solucionas el problema:

1. **Usa MySQL local o Docker:**
   ```bash
   docker run -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root mysql:8
   ```

2. **Actualiza `.env.local` con:**
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=root
   DB_NAME=pricofy_db
   ```

## Próximos Pasos

1. **Verifica el host público en Railway**
2. **Actualiza las variables de entorno en Vercel**
3. **Haz un nuevo deploy**
4. **Prueba de nuevo**

Si el problema persiste, considera usar Supabase o otra base de datos que tenga mejor integración con Vercel.

