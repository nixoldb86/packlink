# 🔧 Solución: Error 500 al enviar formularios

## Problema

Si recibes un error `500` al enviar formularios, probablemente es porque:

1. **El host de Railway es interno** (`mysql.railway.internal`) y solo funciona dentro de Railway, no desde tu máquina local
2. **Faltan variables de entorno** o están mal configuradas
3. **Error de conexión a la base de datos**

## Solución: Obtener el Host Público de Railway

### Paso 1: Obtener el host público de Railway

1. **Ve a tu dashboard de Railway:** https://railway.app
2. **Click en tu proyecto** que contiene la base de datos MySQL
3. **Click en el servicio MySQL** (el card de la base de datos)
4. **Ve a la pestaña "Variables"** o "Connect"
5. **Busca la variable `MYSQLHOST`**

6. **IMPORTANTE:** Si ves `mysql.railway.internal`, ese es el host interno
   - Necesitas el host **público** que se ve así: `xxxxxx.railway.app`
   - O busca en la pestaña "Connect" → "Public Network" o "Public Connection"

7. **Si no ves el host público:**
   - En Railway, ve a tu base de datos MySQL
   - Busca la pestaña "Connect" o "Public Network"
   - Deberías ver algo como:
     ```
     Host: xxxxxx.railway.app
     Port: 3306
     ```

### Paso 2: Actualizar tu archivo `.env.local`

1. **Abre tu archivo `.env.local`** en la raíz del proyecto

2. **Actualiza `DB_HOST`** con el host público de Railway:

```env
# Base de datos - Railway
DB_HOST=xxxxxx.railway.app  # ← Cambia esto por tu host público de Railway
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password_de_railway
DB_NAME=railway
DB_SSL=false
```

3. **NO uses `mysql.railway.internal`** - ese solo funciona dentro de Railway

### Paso 3: Verificar que las variables estén correctas

Tu `.env.local` debería tener algo así:

```env
# Base de datos - Railway (usa el host público, NO el interno)
DB_HOST=xxxxxx.railway.app  # ← Host público de Railway
DB_PORT=3306
DB_USER=root
DB_PASSWORD=UtPkmLVYUbaNYIstvAIvJfrmBrKysJYo
DB_NAME=railway
DB_SSL=false

# Almacenamiento - Backblaze B2
S3_ENDPOINT=https://s3.eu-central-003.backblazeb2.com
S3_REGION=eu-central-003
S3_ACCESS_KEY_ID=003ddbbd074e61b0000000001
S3_SECRET_ACCESS_KEY=K003/5ut2mmbTGSEDXFD4h9YBtRWLkU
S3_BUCKET_NAME=pricofy-uploads
S3_FORCE_PATH_STYLE=true
S3_PUBLIC_URL=https://f000.backblazeb2.com/file/pricofy-uploads
S3_MAKE_PUBLIC=true
```

### Paso 4: Reiniciar el servidor de desarrollo

1. **Detén el servidor** (Ctrl+C en la terminal)
2. **Vuelve a iniciarlo:**
   ```bash
   npm run dev
   ```
3. **Prueba enviar un formulario de nuevo**

## Verificar el error específico

Si el error persiste, revisa los logs en la terminal donde ejecutas `npm run dev`. Deberías ver el error específico que está causando el 500.

### Errores comunes:

1. **"ECONNREFUSED"** → El host o puerto es incorrecto
2. **"Access denied"** → El usuario o password es incorrecto
3. **"Unknown database"** → El nombre de la base de datos es incorrecto
4. **"ETIMEDOUT"** → El host no es accesible (puede ser que necesites el host público)

## Si Railway no muestra un host público

Algunas bases de datos de Railway solo tienen acceso interno. En ese caso:

1. **Opción A:** Usa Railway Proxy para desarrollo local
   - Instala Railway CLI: `npm i -g @railway/cli`
   - Ejecuta: `railway link` y luego `railway connect mysql`

2. **Opción B:** Usa una base de datos local para desarrollo
   - Instala MySQL localmente
   - Usa Docker: `docker run -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root mysql:8`
   - Usa `localhost` como host en desarrollo

## Verificar que todo funcione

1. **Prueba la conexión:**
   ```bash
   # En una terminal, prueba conectarte con:
   mysql -h [tu-host-publico] -u root -p
   ```

2. **Si puedes conectarte, el problema puede ser:**
   - Variables de entorno no cargadas (reinicia el servidor)
   - Puerto incorrecto
   - Firewall bloqueando la conexión

## ¿Sigue sin funcionar?

Comparte el error específico que ves en la terminal cuando ejecutas `npm run dev` y lo intentamos solucionar.

