# 🔐 Configurar Autenticación con Supabase (Google SSO)

Esta guía te ayudará a configurar la autenticación con Google usando Supabase.

## Paso 0: Obtener el PROJECT_REF de Supabase

El `PROJECT_REF` es el identificador único de tu proyecto en Supabase. Puedes obtenerlo de varias formas:

### Opción 1: Desde el Dashboard de Supabase (Recomendado)
1. **Ve a:** https://supabase.com → Tu proyecto
2. **Ve a:** "Settings" → "API"
3. **Busca:** "Project URL"
4. **El PROJECT_REF** es la parte que aparece antes de `.supabase.co`
   - Ejemplo: Si la URL es `https://abcdefghijklmnop.supabase.co`
   - Entonces `TU_PROJECT_REF` = `abcdefghijklmnop`

### Opción 2: Desde la URL del Dashboard
- La URL del dashboard tiene el formato: `https://supabase.com/dashboard/project/[TU_PROJECT_REF]`
- El `PROJECT_REF` es la parte final de la URL

### Opción 3: Desde variables de entorno existentes
- Si ya tienes `NEXT_PUBLIC_SUPABASE_URL` configurada, el `PROJECT_REF` es la parte antes de `.supabase.co`
- Ejemplo: `https://abcdefghijklmnop.supabase.co` → `abcdefghijklmnop`

## Paso 1: Configurar Google OAuth en Google Cloud Console

1. **Ve a:** https://console.cloud.google.com
2. **Crea un nuevo proyecto** o selecciona uno existente
3. **Ve a:** "APIs & Services" → "Credentials"
4. **Click en:** "Create Credentials" → "OAuth client ID"
5. **Si es la primera vez, configura la pantalla de consentimiento:**
   - Tipo: External
   - Nombre de la app: Pricofy
   - Email de soporte: tu email
   - Dominios autorizados: tu dominio (ej: pricofy.com)
   - Guarda y continúa
6. **Crea el OAuth Client ID:**
   - Tipo de aplicación: Web application
   - Nombre: Pricofy Web Client
   - **Authorized JavaScript origins:**
     - `http://localhost:3001` (para desarrollo local)
     - `https://tu-dominio.vercel.app` (para producción)
   - **Authorized redirect URIs:**
     - `http://localhost:3001/auth/callback` (para desarrollo local)
     - `https://tu-dominio.vercel.app/auth/callback` (para producción)
     - `https://[TU_PROJECT_REF].supabase.co/auth/v1/callback` (URL de Supabase - reemplaza `[TU_PROJECT_REF]` con el valor obtenido en el Paso 0)
7. **Copia el Client ID y Client Secret**

## Paso 2: Configurar Site URL y Redirect URLs en Supabase

**⚠️ IMPORTANTE:** Esta configuración determina a dónde redirige Supabase después de la autenticación.

1. **Ve a:** https://supabase.com → Tu proyecto
2. **Ve a:** "Authentication" → "URL Configuration"
3. **Configura las URLs:**
   - **Site URL:** `http://localhost:3001` (para desarrollo) o `https://tu-dominio.vercel.app` (para producción)
   - **Redirect URLs:** Agrega ambas URLs (una por línea):
     - `http://localhost:3001/auth/callback`
     - `https://tu-dominio.vercel.app/auth/callback`
   - **Save**

**Nota:** Si estás probando en localhost pero te redirige a Vercel, verifica que `http://localhost:3001/auth/callback` esté en la lista de "Redirect URLs" y que la "Site URL" esté configurada correctamente.

## Paso 3: Configurar Google Provider en Supabase

1. **Ve a:** https://supabase.com → Tu proyecto
2. **Ve a:** "Authentication" → "Providers"
3. **Habilita Google:**
   - Click en "Google"
   - Activa el toggle
   - **Client ID (for OAuth):** Pega el Client ID de Google
   - **Client Secret (for OAuth):** Pega el Client Secret de Google
   - **Save**

## Paso 4: Obtener las credenciales de Supabase

1. **Ve a:** "Settings" → "API"
2. **Copia estos valores:**
   - **Project URL:** `https://[TU_PROJECT_REF].supabase.co`
   - **anon public key:** (la clave pública anónima)

## Paso 5: Configurar variables de entorno

### En `.env.local` (desarrollo local):

```env
# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=https://[TU_PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[TU_ANON_KEY]
```

### En Vercel (producción):

1. **Ve a:** Vercel Dashboard → Tu proyecto → Settings → Environment Variables
2. **Agrega:**
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://[TU_PROJECT_REF].supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `[TU_ANON_KEY]`

## Paso 6: Ejecutar migración de base de datos

1. **Ve a:** Supabase Dashboard → SQL Editor
2. **Ejecuta el script:** `database/ADD_USER_ID_TO_SOLICITUDES.sql`
3. **Verifica** que la columna `user_id` se haya agregado correctamente

## Paso 7: Verificar que todo funciona

1. **Inicia el servidor local:**
   ```bash
   npm run dev
   ```

2. **Ve a:** http://localhost:3001
3. **Click en:** "Iniciar con Google" en el navbar
4. **Deberías ser redirigido** a Google para autenticarte
5. **Después del login**, deberías ser redirigido a `/dashboard`

## ✅ ¡Listo!

Ahora los usuarios pueden:
- ✅ Iniciar sesión con Google
- ✅ Ver sus evaluaciones en el dashboard
- ✅ Las nuevas evaluaciones se asociarán automáticamente con su cuenta

## Notas importantes

- **Las evaluaciones antiguas** (sin `user_id`) seguirán siendo accesibles por email
- **Las nuevas evaluaciones** se asociarán con el `user_id` del usuario autenticado
- **Si un usuario no está autenticado**, las evaluaciones se guardan normalmente (sin `user_id`)

## 🔧 Solución de Problemas

### Problema: Me redirige a Vercel en lugar de localhost:3001

**Síntoma:** Cuando te autenticas con Google, te redirige a `vercel.com` en lugar de `localhost:3001`.

**⚠️ IMPORTANTE:** Supabase solo permite redirecciones a URLs que estén explícitamente en la lista de "Redirect URLs". Si `http://localhost:3001/auth/callback` no está en esa lista, Supabase ignorará el `redirectTo` del código y usará la "Site URL" por defecto.

**Solución paso a paso:**

1. **En Google Cloud Console:**
   - Ve a "APIs & Services" → "Credentials"
   - Edita tu OAuth Client ID
   - En "Authorized redirect URIs", asegúrate de que el URI 1 sea:
     - `http://localhost:3001/auth/callback` (⚠️ debe incluir `/auth/callback`)
   - Guarda los cambios

2. **En Supabase Dashboard (CRÍTICO):**
   - Ve a: Tu proyecto → "Authentication" → "URL Configuration"
   - **En "Redirect URLs"**, agrega (una por línea):
     - `http://localhost:3001/auth/callback`
     - `https://tu-dominio.vercel.app/auth/callback` (si tienes producción)
   - **En "Site URL"**, cambia temporalmente a:
     - `http://localhost:3001` (para desarrollo local)
   - **Guarda los cambios**
   - ⚠️ **Espera 1-2 minutos** para que los cambios se propaguen

3. **Verifica en la consola del navegador:**
   - Abre las DevTools (F12)
   - Ve a la pestaña "Console"
   - Intenta hacer login
   - Deberías ver logs que muestran la URL de redirección

4. **Si sigue sin funcionar:**
   - Limpia las cookies del navegador para `localhost:3001`
   - Cierra todas las pestañas de `localhost:3001`
   - Reinicia el servidor de desarrollo (`npm run dev`)
   - Vuelve a intentar

**Nota:** Puedes tener múltiples URLs en "Redirect URLs" (una por línea), así que puedes agregar tanto `http://localhost:3001/auth/callback` como `https://tu-dominio.vercel.app/auth/callback` para que funcione en ambos entornos sin cambiar la configuración cada vez.

### Problema: Error "redirect_uri_mismatch" en Google

**Síntoma:** Google muestra un error sobre que la URI de redirección no coincide.

**Solución:**
1. **Ve a:** Google Cloud Console → "APIs & Services" → "Credentials"
2. **Edita tu OAuth Client ID**
3. **Verifica que en "Authorized redirect URIs" esté:**
   - `https://[TU_PROJECT_REF].supabase.co/auth/v1/callback` (reemplaza `[TU_PROJECT_REF]` con tu PROJECT_REF real)
4. **Guarda los cambios**
5. **Espera unos minutos** para que los cambios se propaguen

