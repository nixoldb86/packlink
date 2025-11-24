-- Esquema de base de datos para Pricofy
-- Compatible con MySQL, PostgreSQL y otros sistemas SQL

-- Tabla para almacenar las solicitudes
CREATE TABLE IF NOT EXISTS solicitudes (
    id INT AUTO_INCREMENT PRIMARY KEY,  -- En PostgreSQL usar: SERIAL PRIMARY KEY
    email VARCHAR(255) NOT NULL,
    pais VARCHAR(100) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    accion VARCHAR(100) NOT NULL,
    tipo_producto VARCHAR(100) NOT NULL,
    modelo_marca VARCHAR(255) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    accesorios TEXT,
    urgencia VARCHAR(100) NOT NULL,
    fotos_paths JSON,  -- En MySQL 5.7+ usar JSON, en versiones anteriores usar TEXT
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP  -- MySQL
    -- En PostgreSQL: updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar las búsquedas
CREATE INDEX idx_email ON solicitudes(email);
CREATE INDEX idx_accion ON solicitudes(accion);
CREATE INDEX idx_created_at ON solicitudes(created_at);

-- Tabla para almacenar los contactos
CREATE TABLE IF NOT EXISTS contactos (
    id INT AUTO_INCREMENT PRIMARY KEY,  -- En PostgreSQL usar: SERIAL PRIMARY KEY
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    comentario TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP  -- MySQL
    -- En PostgreSQL: updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para la tabla contactos
CREATE INDEX idx_contacto_email ON contactos(email);
CREATE INDEX idx_contacto_created_at ON contactos(created_at);

-- Para PostgreSQL, agregar trigger para updated_at:
/*
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_solicitudes_updated_at 
    BEFORE UPDATE ON solicitudes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
*/
