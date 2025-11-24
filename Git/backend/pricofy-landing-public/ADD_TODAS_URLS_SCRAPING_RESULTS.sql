-- Script para añadir la columna 'todas_urls_encontradas' a la tabla scraping_results
-- Ejecutar en el SQL Editor de Supabase si la tabla ya existe

-- Añadir la nueva columna si no existe
ALTER TABLE scraping_results
ADD COLUMN IF NOT EXISTS todas_urls_encontradas TEXT[];

-- Verificar que la columna se añadió correctamente
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'scraping_results'
AND column_name = 'todas_urls_encontradas';

-- Query de ejemplo para consultar la nueva columna
-- SELECT
--     sr.id,
--     sr.producto_text,
--     sr.total_anuncios_encontrados,
--     sr.total_anuncios_filtrados,
--     array_length(sr.todas_urls_encontradas, 1) as total_urls_encontradas,
--     sr.todas_urls_encontradas[1:3] as primeras_3_urls,
--     sr.created_at
-- FROM scraping_results sr
-- ORDER BY sr.created_at DESC
-- LIMIT 5;

-- Query para ver todas las URLs de un scraping específico
-- SELECT
--     sr.id,
--     sr.producto_text,
--     unnest(sr.todas_urls_encontradas) as url_encontrada
-- FROM scraping_results sr
-- WHERE sr.id = 123;  -- Cambiar por el ID del scraping
