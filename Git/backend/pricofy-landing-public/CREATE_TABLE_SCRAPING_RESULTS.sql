-- Script para crear la tabla scraping_results en PostgreSQL (Supabase)
-- Ejecutar en el SQL Editor de Supabase

-- Primero, eliminar la tabla evaluaciones antigua si existe (OPCIONAL - solo si quieres reemplazarla)
-- DROP TABLE IF EXISTS evaluaciones CASCADE;

-- Tabla para almacenar los resultados del scraping
CREATE TABLE IF NOT EXISTS scraping_results (
    id SERIAL PRIMARY KEY,
    solicitud_id INTEGER NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
    
    -- Parámetros de búsqueda utilizados
    producto_text VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(200) NOT NULL,
    radio_km INTEGER NOT NULL,
    condicion_objetivo VARCHAR(50) NOT NULL,
    
    -- Resultados JSON
    json_compradores JSONB,
    json_vendedores JSONB,
    tabla_compradores JSONB,
    tabla_vendedores JSONB,

    -- Todas las URLs encontradas (sin filtrar)
    todas_urls_encontradas TEXT[],

    -- Metadatos
    total_anuncios_encontrados INTEGER DEFAULT 0,
    total_anuncios_filtrados INTEGER DEFAULT 0,
    plataformas_consultadas TEXT[],
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_scraping_results_solicitud_id ON scraping_results(solicitud_id);
CREATE INDEX IF NOT EXISTS idx_scraping_results_created_at ON scraping_results(created_at);
CREATE INDEX IF NOT EXISTS idx_scraping_results_producto_text ON scraping_results(producto_text);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Eliminar trigger si existe (para evitar errores en re-ejecución)
DROP TRIGGER IF EXISTS update_scraping_results_updated_at ON scraping_results;

CREATE TRIGGER update_scraping_results_updated_at 
    BEFORE UPDATE ON scraping_results 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Verificar que la tabla se creó correctamente
SELECT 'Tabla scraping_results creada correctamente' AS resultado;

-- Query de ejemplo para consultar resultados
-- SELECT
--     sr.id,
--     sr.producto_text,
--     sr.total_anuncios_encontrados,
--     sr.total_anuncios_filtrados,
--     array_length(sr.todas_urls_encontradas, 1) as total_urls_encontradas,
--     sr.todas_urls_encontradas[1:5] as primeras_5_urls,  -- Solo las primeras 5 URLs
--     sr.json_compradores->'compradores' as compradores,
--     sr.json_vendedores->'vendedores' as precios_vendedor,
--     sr.created_at,
--     s.email,
--     s.pais,
--     s.ciudad
-- FROM scraping_results sr
-- JOIN solicitudes s ON sr.solicitud_id = s.id
-- ORDER BY sr.created_at DESC
-- LIMIT 10;

-- Query para ver todas las URLs encontradas en un scraping específico
-- SELECT
--     sr.id,
--     sr.producto_text,
--     array_length(sr.todas_urls_encontradas, 1) as total_urls,
--     unnest(sr.todas_urls_encontradas) as url
-- FROM scraping_results sr
-- WHERE sr.id = 123;  -- Cambiar por el ID del scraping

