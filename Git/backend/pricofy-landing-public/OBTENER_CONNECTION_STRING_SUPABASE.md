# 🔗 Obtener Connection String de Supabase

El error de timeout puede deberse a que necesitas usar el **connection pooler** de Supabase en lugar de la conexión directa.

## Paso 1: Obtener las credenciales correctas

1. **Ve a:** https://supabase.com → Tu proyecto
2. **Ve a:** "Settings" → "Database"
3. **Desplázate** hasta la sección "Connection string"

## Paso 2: Elegir el tipo de conexión

Supabase ofrece dos tipos de conexión:

### Opción A: Connection Pooling (RECOMENDADO para desarrollo local y Vercel)

**Usa esto cuando:**
- Desarrollas desde tu máquina local
- Despliegas en Vercel u otros servicios serverless
- Necesitas mejor manejo de conexiones

**Formato:**
```
Host: aws-0-[REGION].pooler.supabase.com
Port: 6543
Database: postgres
User: postgres.[PROJECT-REF]
Password: [TU_PASSWORD]
```

**En tu `.env.local`:**
```env
POSTGRES_HOST=aws-0-[REGION].pooler.supabase.com
POSTGRES_PORT=6543
POSTGRES_USER=postgres.[PROJECT-REF]
POSTGRES_PASSWORD=[TU_PASSWORD]
POSTGRES_DB=postgres
DB_SSL=true
```

**Ejemplo real:**
```env
POSTGRES_HOST=aws-0-us-west-1.pooler.supabase.com
POSTGRES_PORT=6543
POSTGRES_USER=postgres.auavzewrjndymbbpirqh
POSTGRES_PASSWORD=wawrox-Dyjvi7-raqnis
POSTGRES_DB=postgres
DB_SSL=true
```

### Opción B: Direct Connection (Solo para servidores dentro de la misma red)

**Usa esto solo si:**
- Tu servidor está en la misma red que Supabase
- O para pruebas directas desde el SQL Editor

**Formato:**
```
Host: db.[PROJECT-REF].supabase.co
Port: 5432
Database: postgres
User: postgres
Password: [TU_PASSWORD]
```

## Paso 3: Verificar la región

En Supabase, ve a "Settings" → "Database" y busca la región de tu proyecto:
- `us-west-1` → `aws-0-us-west-1.pooler.supabase.com`
- `us-east-1` → `aws-0-us-east-1.pooler.supabase.com`
- `eu-west-1` → `aws-0-eu-west-1.pooler.supabase.com`
- etc.

## Paso 4: Actualizar .env.local

1. **Copia** el connection string de pooling desde Supabase
2. **Actualiza** tu `.env.local` con los valores correctos
3. **Asegúrate** de que `DB_SSL=true` esté configurado
4. **Reinicia** el servidor

## Paso 5: Probar la conexión

Después de reiniciar, deberías ver en los logs:
```
✅ Conexión de prueba a PostgreSQL exitosa
```

Si ves un error, verifica:
- ✅ El hostname es correcto (pooler para desarrollo local)
- ✅ El puerto es `6543` para pooling o `5432` para directo
- ✅ El usuario incluye el project ref: `postgres.[PROJECT-REF]`
- ✅ `DB_SSL=true` está configurado

## 🆘 Troubleshooting

### Error: "Connection timeout"
- **Solución:** Usa connection pooling (puerto 6543) en lugar de conexión directa

### Error: "password authentication failed"
- **Solución:** Verifica que el usuario sea `postgres.[PROJECT-REF]` (con el punto) para pooling

### Error: "SSL required"
- **Solución:** Asegúrate de que `DB_SSL=true` esté en `.env.local`

