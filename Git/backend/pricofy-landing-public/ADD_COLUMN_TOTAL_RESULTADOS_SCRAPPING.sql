-- Script para añadir la columna total_resultados_scrapping a la tabla scraping_results
-- Ejecutar en el SQL Editor de Supabase

-- Añadir columna total_resultados_scrapping (JSONB) para guardar todos los resultados sin filtrar
ALTER TABLE scraping_results 
ADD COLUMN IF NOT EXISTS total_resultados_scrapping JSONB;

-- Añadir columna tipo_busqueda para identificar si fue búsqueda directa o con varita mágica
-- 'directa' = búsqueda directa sin alternativas de ChatGPT
-- 'completa' = búsqueda con varita mágica (flujo completo con alternativas)
ALTER TABLE scraping_results 
ADD COLUMN IF NOT EXISTS tipo_busqueda VARCHAR(20) DEFAULT 'completa';

-- Comentarios para documentación
COMMENT ON COLUMN scraping_results.total_resultados_scrapping IS 'Todos los anuncios encontrados sin filtrar (sin prefiltrado, sin verificación GPT, sin outliers). Formato similar a json_compradores';
COMMENT ON COLUMN scraping_results.tipo_busqueda IS 'Tipo de búsqueda: directa (sin alternativas ChatGPT) o completa (con alternativas y filtros)';

-- Verificar que las columnas se añadieron correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'scraping_results' 
    AND column_name IN ('total_resultados_scrapping', 'tipo_busqueda');




