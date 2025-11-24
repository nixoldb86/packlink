-- Script SQL para crear las tablas en Supabase (PostgreSQL)
-- Ejecuta este script en el SQL Editor de Supabase

-- Tabla para almacenar las solicitudes
CREATE TABLE IF NOT EXISTS solicitudes (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    pais VARCHAR(100) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    accion VARCHAR(100) NOT NULL,
    tipo_producto VARCHAR(100) NOT NULL,
    modelo_marca VARCHAR(255) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    accesorios TEXT,
    urgencia VARCHAR(100),
    fotos_paths JSONB,
    fotos_urls JSONB,  -- URLs públicas de las fotos en Backblaze (URLs simplificadas)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar las búsquedas
CREATE INDEX IF NOT EXISTS idx_email ON solicitudes(email);
CREATE INDEX IF NOT EXISTS idx_accion ON solicitudes(accion);
CREATE INDEX IF NOT EXISTS idx_created_at ON solicitudes(created_at);

-- Tabla para almacenar los contactos
CREATE TABLE IF NOT EXISTS contactos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    comentario TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para la tabla contactos
CREATE INDEX IF NOT EXISTS idx_contacto_email ON contactos(email);
CREATE INDEX IF NOT EXISTS idx_contacto_created_at ON contactos(created_at);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_solicitudes_updated_at BEFORE UPDATE ON solicitudes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contactos_updated_at BEFORE UPDATE ON contactos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

