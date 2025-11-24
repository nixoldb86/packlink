-- Script de migración para agregar la columna fotos_urls a la tabla solicitudes
-- Ejecuta este script en el SQL Editor de Supabase si ya tienes la tabla creada

-- Agregar la columna fotos_urls si no existe
ALTER TABLE solicitudes 
ADD COLUMN IF NOT EXISTS fotos_urls JSONB;

-- Migrar datos existentes: copiar las URLs de fotos_paths a fotos_urls
-- (si fotos_paths contiene URLs y fotos_urls está vacío)
UPDATE solicitudes
SET fotos_urls = fotos_paths
WHERE fotos_paths IS NOT NULL 
  AND fotos_urls IS NULL
  AND jsonb_typeof(fotos_paths) = 'array';

-- Comentario sobre la columna
COMMENT ON COLUMN solicitudes.fotos_urls IS 'URLs públicas de las fotos almacenadas en Backblaze (URLs simplificadas)';

