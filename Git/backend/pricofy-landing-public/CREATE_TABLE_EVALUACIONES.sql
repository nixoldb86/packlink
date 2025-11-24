-- Script para crear la tabla evaluaciones en PostgreSQL (Supabase)
-- Ejecutar en el SQL Editor de Supabase

-- Tabla para almacenar las evaluaciones generadas por ChatGPT
CREATE TABLE IF NOT EXISTS evaluaciones (
    id SERIAL PRIMARY KEY,
    solicitud_id INTEGER NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
    modelo_marca VARCHAR(255) NOT NULL,
    tipo_producto VARCHAR(100) NOT NULL,
    pais VARCHAR(100) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    respuesta_chatgpt TEXT NOT NULL,
    prompt_usado TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_evaluacion_solicitud_id ON evaluaciones(solicitud_id);
CREATE INDEX IF NOT EXISTS idx_evaluacion_created_at ON evaluaciones(created_at);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Eliminar trigger si existe (para evitar errores en re-ejecución)
DROP TRIGGER IF EXISTS update_evaluaciones_updated_at ON evaluaciones;

CREATE TRIGGER update_evaluaciones_updated_at 
    BEFORE UPDATE ON evaluaciones 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Verificar que la tabla se creó correctamente
SELECT 'Tabla evaluaciones creada correctamente' AS resultado;

