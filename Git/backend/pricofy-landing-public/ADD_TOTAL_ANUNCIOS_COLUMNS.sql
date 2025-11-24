-- Script para agregar las nuevas columnas de contadores a scraping_results
-- Ejecutar en el SQL Editor de Supabase

-- Agregar columna total_anuncios_analizados si no existe
-- Esta columna almacena el total de anuncios obtenidos de todas las búsquedas (antes de cualquier filtrado)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scraping_results' 
    AND column_name = 'total_anuncios_analizados'
  ) THEN
    ALTER TABLE scraping_results 
    ADD COLUMN total_anuncios_analizados INTEGER DEFAULT 0;
    
    -- Actualizar registros existentes con el valor de total_anuncios_encontrados (compatibilidad)
    UPDATE scraping_results 
    SET total_anuncios_analizados = COALESCE(total_anuncios_encontrados, 0)
    WHERE total_anuncios_analizados IS NULL;
    
    RAISE NOTICE 'Columna total_anuncios_analizados agregada exitosamente';
  ELSE
    RAISE NOTICE 'Columna total_anuncios_analizados ya existe';
  END IF;
END $$;

-- Agregar columna total_anuncios_descartados si no existe
-- Esta columna almacena el total de anuncios descartados por prefiltrado semántico + ChatGPT (antes de outliers)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scraping_results' 
    AND column_name = 'total_anuncios_descartados'
  ) THEN
    ALTER TABLE scraping_results 
    ADD COLUMN total_anuncios_descartados INTEGER DEFAULT 0;
    
    RAISE NOTICE 'Columna total_anuncios_descartados agregada exitosamente';
  ELSE
    RAISE NOTICE 'Columna total_anuncios_descartados ya existe';
  END IF;
END $$;

-- Agregar columna total_anuncios_outliers si no existe
-- Esta columna almacena el total de anuncios descartados por precios extremos (outliers)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scraping_results' 
    AND column_name = 'total_anuncios_outliers'
  ) THEN
    ALTER TABLE scraping_results 
    ADD COLUMN total_anuncios_outliers INTEGER DEFAULT 0;
    
    RAISE NOTICE 'Columna total_anuncios_outliers agregada exitosamente';
  ELSE
    RAISE NOTICE 'Columna total_anuncios_outliers ya existe';
  END IF;
END $$;

-- Verificar que las columnas fueron agregadas correctamente
SELECT 
  column_name, 
  data_type, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'scraping_results' 
  AND column_name IN ('total_anuncios_analizados', 'total_anuncios_descartados', 'total_anuncios_outliers')
ORDER BY column_name;




