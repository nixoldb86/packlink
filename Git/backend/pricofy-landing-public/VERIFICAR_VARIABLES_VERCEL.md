# 🔍 Verificar Variables de Entorno en Vercel

El error `ECONNREFUSED 127.0.0.1:3306` significa que **las variables de entorno NO están configuradas en Vercel** o están usando valores incorrectos.

## ✅ Checklist de Variables en Vercel

Ve a: **Vercel Dashboard → Tu proyecto → Settings → Environment Variables**

### Verifica que TENGAS estas variables:

```
POSTGRES_HOST=aws-0-[REGION].pooler.supabase.com
POSTGRES_PORT=6543
POSTGRES_USER=postgres.auavzewrjndymbbpirqh
POSTGRES_PASSWORD=[TU_PASSWORD]
POSTGRES_DB=postgres
DB_SSL=true
```

O si prefieres usar `DB_*`:

```
DB_HOST=aws-0-[REGION].pooler.supabase.com
DB_PORT=6543
DB_USER=postgres.auavzewrjndymbbpirqh
DB_PASSWORD=[TU_PASSWORD]
DB_NAME=postgres
DB_SSL=true
```

## 🔍 Cómo Verificar

### Paso 1: Verificar en Vercel Dashboard

1. **Ve a:** https://vercel.com → Tu proyecto
2. **Click en:** "Settings" → "Environment Variables"
3. **Verifica** que cada variable esté presente:
   - ✅ `POSTGRES_HOST` o `DB_HOST`
   - ✅ `POSTGRES_PORT` o `DB_PORT`
   - ✅ `POSTGRES_USER` o `DB_USER`
   - ✅ `POSTGRES_PASSWORD` o `DB_PASSWORD`
   - ✅ `POSTGRES_DB` o `DB_NAME`
   - ✅ `DB_SSL`

### Paso 2: Verificar Ambientes

Asegúrate de que las variables estén configuradas para **TODOS** los ambientes:

- ✅ **Production**
- ✅ **Preview**
- ✅ **Development**

**Cómo hacerlo:**
- Al agregar cada variable, selecciona los ambientes donde aplicará
- O usa el dropdown "Environment" para seleccionar "Production, Preview, Development"

### Paso 3: Verificar Valores

**IMPORTANTE:**
- `POSTGRES_HOST` debe ser: `aws-0-[REGION].pooler.supabase.com` (NO `supabase.co`)
- `POSTGRES_PORT` debe ser: `6543` (NO `5432`)
- `POSTGRES_USER` debe ser: `postgres.auavzewrjndymbbpirqh` (con el punto)
- `DB_SSL` debe ser: `true` (como string)

## 🐛 Troubleshooting

### Error: "ECONNREFUSED 127.0.0.1:3306"

**Causa:** Las variables de entorno no están configuradas o no están disponibles en Vercel.

**Solución:**
1. Ve a Vercel Dashboard → Settings → Environment Variables
2. Verifica que todas las variables estén presentes
3. Asegúrate de que estén configuradas para Production, Preview y Development
4. **Haz un redeploy** después de agregar las variables

### Error: "Variables de entorno faltantes"

**Causa:** El código detecta que faltan variables en Vercel.

**Solución:**
1. Revisa los logs en Vercel para ver qué variables faltan
2. Agrega las variables faltantes
3. Haz un redeploy

### Error: "password authentication failed"

**Causa:** Usuario o contraseña incorrectos.

**Solución:**
1. Verifica en Supabase que el usuario sea: `postgres.[PROJECT-REF]`
2. Verifica que la contraseña sea correcta
3. Copia los valores directamente desde Supabase Dashboard

## 📝 Paso a Paso para Agregar Variables

1. **Ve a:** Vercel Dashboard → Tu proyecto → Settings → Environment Variables
2. **Click en:** "Add New" o el botón "+"
3. **Para cada variable:**
   - **Key:** `POSTGRES_HOST` (o `DB_HOST`)
   - **Value:** `aws-0-[REGION].pooler.supabase.com`
   - **Environment:** Selecciona "Production", "Preview", "Development"
   - **Click en:** "Save"
4. **Repite** para todas las variables
5. **Haz redeploy:**
   - Ve a "Deployments"
   - Click en "Redeploy" en el último deployment

## ✅ Verificación Final

Después de configurar las variables y hacer redeploy:

1. **Ve a:** Vercel Dashboard → Tu proyecto → Logs
2. **Busca** mensajes que empiecen con `🔍 Configuración de conexión:`
3. **Deberías ver:**
   ```
   🔍 Configuración de conexión: {
     host: 'aws-0-[REGION].pooler.supabase.com',
     port: 6543,
     user: 'postgres.au...',
     ...
   }
   ```

Si ves `host: 'localhost'` o `port: 3306`, significa que las variables **NO están configuradas correctamente**.

