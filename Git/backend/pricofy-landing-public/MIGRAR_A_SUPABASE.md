# 🚀 Migrar a Supabase (PostgreSQL Gratis)

Railway está dando problemas de conectividad con Vercel. Supabase es una mejor opción porque:
- ✅ Gratis (plan generoso)
- ✅ Funciona perfectamente con Vercel
- ✅ Sin problemas de conectividad
- ✅ Dashboard fácil de usar

## Paso 1: Crear cuenta y proyecto en Supabase

1. **Ve a:** https://supabase.com
2. **Click en:** "Start your project" o "Sign up"
3. **Crea cuenta** con GitHub o email
4. **Click en:** "New Project"
5. **Completa el formulario:**
   - **Name:** `pricofy-db`
   - **Database Password:** Crea una contraseña fuerte (¡GUÁRDALA!)
   - **Region:** Elige la más cercana (ej: "West US (California)")
   - **Pricing Plan:** Selecciona "Free"
6. **Click en:** "Create new project"
7. **Espera** 2-3 minutos a que se cree el proyecto

## Paso 2: Obtener las credenciales de conexión

1. **Una vez creado el proyecto, ve a:** "Settings" → "Database"
2. **En la sección "Connection string", busca:**
   - **Connection pooling** (recomendado para Vercel)
   - O **Direct connection**

3. **Copia la "Connection string"** que se ve así:
   ```
   postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true
   ```

4. **O toma nota de estos valores individuales:**
   - **Host:** `[PROJECT-REF].supabase.co` (ej: `abcdefghijklmnop.supabase.co`)
   - **Port:** `5432` (o `6543` para connection pooling)
   - **User:** `postgres`
   - **Password:** La que creaste
   - **Database:** `postgres`

## Paso 3: Crear las tablas en Supabase

1. **Ve a:** "SQL Editor" en el menú lateral de Supabase
2. **Click en:** "New Query"
3. **Copia y pega** el contenido del archivo `CREATE_DATABASE_SUPABASE.sql`
4. **Click en:** "Run" (o presiona `Cmd/Ctrl + Enter`)
5. **Verifica** que aparezca el mensaje "Success. No rows returned"

## Paso 4: Configurar variables de entorno en Vercel

1. **Ve a:** Vercel Dashboard → Tu proyecto → Settings → Environment Variables
2. **Elimina** las variables de Railway (DB_HOST, DB_PORT, etc.)
3. **Agrega estas nuevas variables:**

### Opción A: Usar Connection String (Más fácil)
```
DB_HOST=postgresql://postgres:[TU_PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=[TU_PASSWORD]
DB_NAME=postgres
DB_SSL=true
```

**Reemplaza:**
- `[TU_PASSWORD]` = La contraseña que creaste al crear el proyecto
- `[PROJECT-REF]` = El ID de tu proyecto (ej: `abcdefghijklmnop`)

### Opción B: Usar valores individuales
```
DB_HOST=[PROJECT-REF].supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=[TU_PASSWORD]
DB_NAME=postgres
DB_SSL=true
```

**Nota:** Para connection pooling (recomendado), usa el puerto `6543` y añade `?pgbouncer=true` a la URL.

## Paso 5: Actualizar .env.local (para desarrollo local)

Abre tu archivo `.env.local` y actualiza las variables:

```env
# Base de datos Supabase
DB_HOST=[PROJECT-REF].supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=[TU_PASSWORD]
DB_NAME=postgres
DB_SSL=true

# Backblaze B2 (mantener igual)
S3_ENDPOINT=https://s3.us-west-000.backblazeb2.com
S3_REGION=us-west-000
S3_ACCESS_KEY_ID=[TU_KEY_ID]
S3_SECRET_ACCESS_KEY=[TU_SECRET_KEY]
S3_BUCKET_NAME=[TU_BUCKET_NAME]
S3_PUBLIC_URL=https://[TU_BUCKET_NAME].s3.us-west-000.backblazeb2.com
S3_FORCE_PATH_STYLE=false
S3_MAKE_PUBLIC=true
```

## Paso 6: Verificar que el código está actualizado

El código ya está actualizado para usar PostgreSQL. Solo necesitas:
1. ✅ Instalar dependencias: `npm install` (ya hecho)
2. ✅ Crear tablas en Supabase (Paso 3)
3. ✅ Configurar variables de entorno (Pasos 4 y 5)

## Paso 7: Hacer deploy en Vercel

1. **Commit y push** tus cambios:
   ```bash
   git add .
   git commit -m "Migrar a Supabase PostgreSQL"
   git push
   ```

2. **Vercel detectará** el push y hará deploy automáticamente
3. **O manualmente:** Ve a Vercel Dashboard → Tu proyecto → Deployments → "Redeploy"

## ✅ ¡Listo!

Tu aplicación debería funcionar correctamente con Supabase. Los beneficios:
- ✅ Sin problemas de conectividad
- ✅ Funciona perfectamente con Vercel
- ✅ Plan gratuito generoso
- ✅ Dashboard fácil de usar

## 🆘 Troubleshooting

### Error: "relation does not exist"
- **Solución:** Ejecuta el script SQL en Supabase (Paso 3)

### Error: "password authentication failed"
- **Solución:** Verifica que `DB_PASSWORD` sea correcta en Vercel

### Error: "timeout" o "connection refused"
- **Solución:** Verifica que `DB_HOST` tenga el formato correcto: `[PROJECT-REF].supabase.co`
- **Solución:** Asegúrate de que `DB_SSL=true` esté configurado

### Error: "too many connections"
- **Solución:** Usa connection pooling (puerto `6543` en lugar de `5432`)
