-- Script para crear la tabla productos_nuevos en PostgreSQL (Supabase)
-- Ejecutar en el SQL Editor de Supabase

-- Tabla para almacenar información de productos nuevos de ciao.es
CREATE TABLE IF NOT EXISTS productos_nuevos (
    id SERIAL PRIMARY KEY,
    scraping_result_id INTEGER NOT NULL REFERENCES scraping_results(id) ON DELETE CASCADE,
    nombre_del_producto VARCHAR(255) NOT NULL,
    datos_producto_nuevo JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_productos_nuevos_scraping_result_id ON productos_nuevos(scraping_result_id);
CREATE INDEX IF NOT EXISTS idx_productos_nuevos_nombre_producto ON productos_nuevos(nombre_del_producto);
CREATE INDEX IF NOT EXISTS idx_productos_nuevos_created_at ON productos_nuevos(created_at);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_productos_nuevos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Eliminar trigger si existe (para evitar errores en re-ejecución)
DROP TRIGGER IF EXISTS update_productos_nuevos_updated_at ON productos_nuevos;

CREATE TRIGGER update_productos_nuevos_updated_at 
    BEFORE UPDATE ON productos_nuevos
    FOR EACH ROW
    EXECUTE FUNCTION update_productos_nuevos_updated_at();

-- Comentarios para documentación
COMMENT ON TABLE productos_nuevos IS 'Almacena información de productos nuevos obtenidos de ciao.es para comparación con productos de segunda mano';
COMMENT ON COLUMN productos_nuevos.scraping_result_id IS 'ID del resultado de scraping relacionado';
COMMENT ON COLUMN productos_nuevos.nombre_del_producto IS 'Nombre del producto buscado por el cliente';
COMMENT ON COLUMN productos_nuevos.datos_producto_nuevo IS 'JSON con información de ofertas de productos nuevos (title, description, price, currency, offerUrl, images)';

