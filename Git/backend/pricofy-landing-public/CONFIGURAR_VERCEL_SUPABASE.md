# 🚀 Configurar Supabase en Vercel

El error `ECONNREFUSED` en Vercel significa que no puede conectarse a Supabase. Sigue estos pasos:

## Paso 1: Obtener el Connection String de Transaction Pooler

1. **Ve a:** https://supabase.com → Tu proyecto
2. **Click en:** "Settings" → "Database"
3. **Scroll down** hasta "Connection string"
4. **Click en el dropdown "Method"** y selecciona **"Transaction pooler"**
5. **Copia** el connection string que aparece

Debería verse así:
```
postgresql://postgres.auavzewrjndymbbpirqh:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

## Paso 2: Extraer las Variables Individuales

Del connection string anterior, extrae:

- **Host:** `aws-0-[REGION].pooler.supabase.com` (ej: `aws-0-us-west-1.pooler.supabase.com`)
- **Port:** `6543`
- **User:** `postgres.auavzewrjndymbbpirqh` (nota: incluye el punto y el project ref)
- **Password:** `[YOUR_PASSWORD]`
- **Database:** `postgres`

## Paso 3: Configurar Variables de Entorno en Vercel

1. **Ve a:** https://vercel.com → Tu proyecto
2. **Click en:** "Settings" → "Environment Variables"
3. **Elimina** cualquier variable antigua de Railway o MySQL
4. **Agrega** estas nuevas variables (una por una):

### Variables requeridas:

```
DB_HOST=aws-0-[REGION].pooler.supabase.com
DB_PORT=6543
DB_USER=postgres.auavzewrjndymbbpirqh
DB_PASSWORD=[TU_PASSWORD]
DB_NAME=postgres
DB_SSL=true
```

**Ejemplo real (reemplaza con tus valores):**
```
DB_HOST=aws-0-us-west-1.pooler.supabase.com
DB_PORT=6543
DB_USER=postgres.auavzewrjndymbbpirqh
DB_PASSWORD=wawrox-Dyjvi7-raqnis
DB_NAME=postgres
DB_SSL=true
```

### Importante:

- ✅ **Host:** Debe ser `pooler.supabase.com` (NO `supabase.co`)
- ✅ **Port:** `6543` (NO `5432`)
- ✅ **User:** Debe incluir el punto: `postgres.[PROJECT-REF]`
- ✅ **DB_SSL:** Debe ser `true` (como string, no boolean)

## Paso 4: Verificar que las Variables Estén Configuradas

1. **En Vercel**, ve a "Settings" → "Environment Variables"
2. **Verifica** que todas las variables estén presentes:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `DB_SSL`

3. **Asegúrate** de que estén configuradas para todos los ambientes:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

## Paso 5: Hacer Redeploy

1. **Ve a:** Vercel Dashboard → Tu proyecto → "Deployments"
2. **Click en:** "Redeploy" en el último deployment
3. **O** haz un nuevo commit y push:
   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push
   ```

## Paso 6: Verificar los Logs

Después del deploy, ve a:
- Vercel Dashboard → Tu proyecto → "Logs"

Deberías ver:
- ✅ Sin errores de `ECONNREFUSED`
- ✅ Si hay errores, revisa que el host y puerto sean correctos

## 🆘 Troubleshooting

### Error: "ECONNREFUSED"
- **Causa:** Host o puerto incorrecto
- **Solución:** Verifica que `DB_HOST` sea `pooler.supabase.com` y `DB_PORT` sea `6543`

### Error: "password authentication failed"
- **Causa:** Usuario o contraseña incorrectos
- **Solución:** Verifica que `DB_USER` incluya el punto: `postgres.[PROJECT-REF]`

### Error: "SSL required"
- **Causa:** `DB_SSL` no está configurado
- **Solución:** Agrega `DB_SSL=true` en Vercel

### Error: "Connection timeout"
- **Causa:** Estás usando conexión directa (puerto 5432)
- **Solución:** Cambia a transaction pooler (puerto 6543)

## ✅ Checklist Final

Antes de hacer deploy, verifica:

- [ ] `DB_HOST` termina en `.pooler.supabase.com`
- [ ] `DB_PORT` es `6543`
- [ ] `DB_USER` incluye el punto: `postgres.[PROJECT-REF]`
- [ ] `DB_PASSWORD` es correcta
- [ ] `DB_NAME` es `postgres`
- [ ] `DB_SSL` es `true`
- [ ] Todas las variables están configuradas para Production, Preview y Development
- [ ] Las tablas `solicitudes` y `contactos` existen en Supabase

## 📝 Nota Importante

**Diferencia entre conexión directa y pooling:**

| Tipo | Host | Puerto | Usuario | Cuándo usar |
|------|------|--------|---------|------------|
| **Direct** | `db.[PROJECT].supabase.co` | `5432` | `postgres` | Solo para servidores persistentes |
| **Transaction Pooler** | `aws-0-[REGION].pooler.supabase.com` | `6543` | `postgres.[PROJECT-REF]` | **Vercel y desarrollo local** ✅ |

Usa siempre **Transaction Pooler** para Vercel.

