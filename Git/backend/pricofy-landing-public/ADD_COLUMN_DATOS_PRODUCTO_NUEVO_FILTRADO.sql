-- Agregar columna datos_producto_nuevo_filtrado a la tabla productos_nuevos
-- Esta columna contendrá los productos nuevos filtrados por verificación de GPT

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'productos_nuevos' 
        AND column_name = 'datos_producto_nuevo_filtrado'
    ) THEN
        ALTER TABLE productos_nuevos
        ADD COLUMN datos_producto_nuevo_filtrado JSONB;
        
        RAISE NOTICE 'Columna datos_producto_nuevo_filtrado añadida a productos_nuevos.';
    ELSE
        RAISE NOTICE 'La columna datos_producto_nuevo_filtrado ya existe en productos_nuevos.';
    END IF;
END
$$;


