# 📸 Agregar Columna `fotos_urls` a la Tabla `solicitudes`

## Resumen

Se ha agregado una nueva columna `fotos_urls` a la tabla `solicitudes` para almacenar las URLs públicas de las fotos que se suben a Backblaze B2.

## ¿Qué se cambió?

### 1. Esquema de Base de Datos

Se agregó la columna `fotos_urls JSONB` a la tabla `solicitudes`:

```sql
ALTER TABLE solicitudes 
ADD COLUMN IF NOT EXISTS fotos_urls JSONB;
```

### 2. Función `saveSolicitud`

La función ahora guarda las URLs de Backblaze en dos lugares:
- `fotos_paths`: Para compatibilidad hacia atrás (mantiene las rutas/URLs)
- `fotos_urls`: Nueva columna específica para las URLs públicas de Backblaze

### 3. Compatibilidad

El código maneja automáticamente:
- ✅ Bases de datos que ya tienen la columna `fotos_urls`
- ✅ Bases de datos que aún no tienen la columna (intenta crearla automáticamente)
- ✅ Fallback a solo usar `fotos_paths` si la columna no puede crearse

## Pasos para Actualizar Base de Datos Existente

### Opción 1: Ejecutar Script de Migración (Recomendado)

1. Abre el **SQL Editor** en Supabase
2. Ejecuta el script `MIGRAR_AGREGAR_FOTOS_URLS.sql`:

```sql
-- Agregar la columna fotos_urls si no existe
ALTER TABLE solicitudes 
ADD COLUMN IF NOT EXISTS fotos_urls JSONB;

-- Migrar datos existentes: copiar las URLs de fotos_paths a fotos_urls
UPDATE solicitudes
SET fotos_urls = fotos_paths
WHERE fotos_paths IS NOT NULL 
  AND fotos_urls IS NULL
  AND jsonb_typeof(fotos_paths) = 'array';
```

### Opción 2: El Código lo Hace Automáticamente

Si no ejecutas el script manualmente, el código intentará agregar la columna automáticamente la primera vez que se guarde una solicitud. Sin embargo, **es recomendable ejecutar el script manualmente** para tener control total.

## Formato de Datos

### `fotos_urls` (JSONB)

Almacena un array de URLs públicas:

```json
[
  "https://f000.backblazeb2.com/file/bucket-name/uploads/1234567890-abc123.jpg",
  "https://f000.backblazeb2.com/file/bucket-name/uploads/1234567891-def456.jpg"
]
```

### `fotos_paths` (JSONB)

Se mantiene para compatibilidad y contiene el mismo formato:

```json
[
  "https://f000.backblazeb2.com/file/bucket-name/uploads/1234567890-abc123.jpg",
  "https://f000.backblazeb2.com/file/bucket-name/uploads/1234567891-def456.jpg"
]
```

## Consultar las URLs

### Desde SQL

```sql
-- Obtener todas las solicitudes con sus URLs de fotos
SELECT 
  id,
  email,
  tipo_producto,
  fotos_urls,
  created_at
FROM solicitudes
WHERE fotos_urls IS NOT NULL
ORDER BY created_at DESC;
```

### Desde el Código

El campo `fotos_urls` ya está disponible en los resultados de `getAllSolicitudes()`:

```typescript
const solicitudes = await getAllSolicitudes()
solicitudes.forEach(solicitud => {
  if (solicitud.fotos_urls) {
    const urls = JSON.parse(solicitud.fotos_urls)
    console.log('URLs de fotos:', urls)
  }
})
```

## Verificación

Para verificar que la columna se agregó correctamente:

```sql
-- Ver la estructura de la tabla
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'solicitudes' 
  AND column_name IN ('fotos_paths', 'fotos_urls');
```

Deberías ver ambas columnas listadas.

## Notas Importantes

1. **URLs Simplificadas**: Las URLs almacenadas son las URLs públicas completas de Backblaze B2, listas para usar directamente en `<img src="...">` o enlaces.

2. **Compatibilidad**: Las solicitudes antiguas que solo tienen `fotos_paths` seguirán funcionando. El script de migración copia automáticamente los datos de `fotos_paths` a `fotos_urls` si están disponibles.

3. **Nuevas Solicitudes**: Todas las nuevas solicitudes guardarán las URLs en ambos campos (`fotos_paths` y `fotos_urls`) para mantener compatibilidad.

4. **Tipo de Datos**: Se usa `JSONB` (PostgreSQL) que es eficiente para consultas y permite indexación si es necesario en el futuro.

