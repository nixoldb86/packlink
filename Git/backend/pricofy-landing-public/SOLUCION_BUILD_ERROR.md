# 🔧 Solución: Error durante Build en Vercel

## Problema

Durante el build en Vercel, Next.js intenta pre-renderizar las rutas API, lo que causa errores de conexión a la base de datos:

```
Error: connect ECONNREFUSED 127.0.0.1:3306
Generating static pages (0/10) ...
```

## Solución Aplicada

He agregado `export const dynamic = 'force-dynamic'` a todas las rutas API para evitar que Next.js intente pre-renderizarlas durante el build.

## ✅ Cambios Realizados

Se agregó a todas las rutas API:
- `app/api/contactos/route.ts`
- `app/api/solicitudes/route.ts`
- `app/api/contact/route.ts`
- `app/api/submit-request/route.ts`

```typescript
// Evitar que Next.js intente pre-renderizar esta ruta durante el build
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
```

## 📋 Verificar Variables en Vercel

Aunque el código está corregido, asegúrate de que las variables estén configuradas para **TODOS** los ambientes:

1. **Ve a:** Vercel Dashboard → Tu proyecto → Settings → Environment Variables
2. **Para cada variable** (`POSTGRES_HOST`, `POSTGRES_PORT`, etc.):
   - Click en la variable
   - Verifica que esté configurada para **"All Environments"** o al menos para **"Production"**
   - Si solo está en "Production", edítala y selecciona "All Environments"

### Variables Requeridas

```
POSTGRES_HOST=aws-1-eu-north-1.pooler.supabase.com
POSTGRES_PORT=6543
POSTGRES_USER=postgres.auavzewrjndymbbpirqh
POSTGRES_PASSWORD=[TU_PASSWORD]
POSTGRES_DB=postgres
DB_SSL=true
```

## 🚀 Próximos Pasos

1. **Haz commit y push:**
   ```bash
   git add .
   git commit -m "Fix: Evitar pre-renderizado de rutas API durante build"
   git push
   ```

2. **Vercel detectará el push** y hará un nuevo build automáticamente

3. **Verifica los logs** en Vercel Dashboard → Tu proyecto → Logs

4. **Deberías ver:**
   - ✅ Build exitoso sin errores de conexión
   - ✅ Las rutas API funcionando correctamente en producción

## 🆘 Si el Error Persiste

Si después de estos cambios el error persiste:

1. **Verifica que todas las variables estén en "All Environments"**
2. **Revisa los logs de build** en Vercel para ver qué variable falta
3. **Asegúrate de que `DB_SSL=true`** esté configurado
4. **Haz un redeploy manual** desde Vercel Dashboard

