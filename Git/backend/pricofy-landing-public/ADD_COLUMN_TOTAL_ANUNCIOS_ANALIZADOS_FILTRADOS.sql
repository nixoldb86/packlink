-- Script para añadir la columna total_anuncios_analizados_filtrados a la tabla scraping_results
-- Ejecutar en el SQL Editor de Supabase

-- Añadir columna total_anuncios_analizados_filtrados (INTEGER) para guardar el total de URLs que partió el análisis
ALTER TABLE scraping_results 
ADD COLUMN IF NOT EXISTS total_anuncios_analizados_filtrados INTEGER;

-- Comentario para documentación
COMMENT ON COLUMN scraping_results.total_anuncios_analizados_filtrados IS 'Total de URLs que partió el análisis (todasUrlsEncontradas.length). Este es el valor que se muestra en la métrica "Total analizados" del panel +info';

-- Verificar que la columna se añadió correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'scraping_results' 
    AND column_name = 'total_anuncios_analizados_filtrados';

