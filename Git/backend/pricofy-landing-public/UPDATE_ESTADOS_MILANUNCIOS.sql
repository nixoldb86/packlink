-- Script para actualizar los estados de Milanuncios en la base de datos
-- Mapea los estados de Milanuncios a los estados internos del sistema
-- Ejecutar en el SQL Editor de Supabase

-- Mapeo de estados:
-- "Sin estrenar" → "Nuevo"
-- "Prácticamente nuevo" → "Como nuevo"
-- "En buen estado" → "Buen estado"
-- "Aceptable" → "Usado"
-- "Mejorable" → "Necesita reparación"

-- Actualizar estados en json_compradores
UPDATE scraping_results
SET json_compradores = jsonb_set(
  json_compradores,
  '{compradores}',
  (
    SELECT jsonb_agg(
      CASE 
        WHEN comprador->>'plataforma' = 'milanuncios' THEN
          jsonb_set(
            comprador,
            '{estado_declarado}',
            CASE 
              WHEN LOWER(TRIM(comprador->>'estado_declarado')) = 'sin estrenar' THEN to_jsonb('Nuevo'::text)
              WHEN LOWER(TRIM(comprador->>'estado_declarado')) = 'prácticamente nuevo' OR LOWER(TRIM(comprador->>'estado_declarado')) = 'practicamente nuevo' THEN to_jsonb('Como nuevo'::text)
              WHEN LOWER(TRIM(comprador->>'estado_declarado')) = 'en buen estado' THEN to_jsonb('Buen estado'::text)
              WHEN LOWER(TRIM(comprador->>'estado_declarado')) = 'aceptable' THEN to_jsonb('Usado'::text)
              WHEN LOWER(TRIM(comprador->>'estado_declarado')) = 'mejorable' THEN to_jsonb('Necesita reparación'::text)
              ELSE comprador->'estado_declarado'
            END
          )
        ELSE comprador
      END
    )
    FROM jsonb_array_elements(json_compradores->'compradores') AS comprador
  )
)
WHERE json_compradores IS NOT NULL
  AND json_compradores->'compradores' IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements(json_compradores->'compradores') AS comprador
    WHERE comprador->>'plataforma' = 'milanuncios'
      AND comprador->>'estado_declarado' IS NOT NULL
      AND LOWER(TRIM(comprador->>'estado_declarado')) IN ('sin estrenar', 'prácticamente nuevo', 'practicamente nuevo', 'en buen estado', 'aceptable', 'mejorable')
  );

-- Actualizar estados en tabla_compradores
UPDATE scraping_results
SET tabla_compradores = (
  SELECT jsonb_agg(
    CASE 
      WHEN comprador->>'plataforma' = 'milanuncios' THEN
        jsonb_set(
          comprador,
          '{estado_declarado}',
          CASE 
            WHEN LOWER(TRIM(comprador->>'estado_declarado')) = 'sin estrenar' THEN to_jsonb('Nuevo'::text)
            WHEN LOWER(TRIM(comprador->>'estado_declarado')) = 'prácticamente nuevo' OR LOWER(TRIM(comprador->>'estado_declarado')) = 'practicamente nuevo' THEN to_jsonb('Como nuevo'::text)
            WHEN LOWER(TRIM(comprador->>'estado_declarado')) = 'en buen estado' THEN to_jsonb('Buen estado'::text)
            WHEN LOWER(TRIM(comprador->>'estado_declarado')) = 'aceptable' THEN to_jsonb('Usado'::text)
            WHEN LOWER(TRIM(comprador->>'estado_declarado')) = 'mejorable' THEN to_jsonb('Necesita reparación'::text)
            ELSE comprador->'estado_declarado'
          END
        )
      ELSE comprador
    END
  )
  FROM jsonb_array_elements(tabla_compradores) AS comprador
)
WHERE tabla_compradores IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements(tabla_compradores) AS comprador
    WHERE comprador->>'plataforma' = 'milanuncios'
      AND comprador->>'estado_declarado' IS NOT NULL
      AND LOWER(TRIM(comprador->>'estado_declarado')) IN ('sin estrenar', 'prácticamente nuevo', 'practicamente nuevo', 'en buen estado', 'aceptable', 'mejorable')
  );

-- Verificar los cambios realizados
SELECT 
  id,
  producto_text,
  (
    SELECT COUNT(*)
    FROM jsonb_array_elements(json_compradores->'compradores') AS comprador
    WHERE comprador->>'plataforma' = 'milanuncios'
      AND comprador->>'estado_declarado' IN ('Nuevo', 'Como nuevo', 'Buen estado', 'Usado', 'Necesita reparación')
  ) AS anuncios_milanuncios_actualizados
FROM scraping_results
WHERE json_compradores IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements(json_compradores->'compradores') AS comprador
    WHERE comprador->>'plataforma' = 'milanuncios'
  )
ORDER BY id DESC
LIMIT 10;

