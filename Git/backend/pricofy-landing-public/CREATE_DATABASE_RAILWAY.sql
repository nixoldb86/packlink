-- Script SQL para crear las tablas en Railway
-- Railway ya crea la base de datos, así que NO necesitas CREATE DATABASE
-- Solo ejecuta las siguientes líneas CREATE TABLE

-- Tabla para almacenar las solicitudes
CREATE TABLE IF NOT EXISTS solicitudes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    pais VARCHAR(100) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    accion VARCHAR(100) NOT NULL,
    tipo_producto VARCHAR(100) NOT NULL,
    modelo_marca VARCHAR(255) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    accesorios TEXT,
    urgencia VARCHAR(100) NULL,
    fotos_paths JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Índices para mejorar las búsquedas
-- Nota: IF NOT EXISTS no está disponible en todas las versiones de MySQL
-- Si los índices ya existen, estos comandos fallarán silenciosamente
CREATE INDEX idx_email ON solicitudes(email);
CREATE INDEX idx_accion ON solicitudes(accion);
CREATE INDEX idx_created_at ON solicitudes(created_at);

-- Tabla para almacenar los contactos
CREATE TABLE IF NOT EXISTS contactos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    comentario TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Índices para la tabla contactos
-- Nota: IF NOT EXISTS no está disponible en todas las versiones de MySQL
-- Si los índices ya existen, estos comandos fallarán silenciosamente
CREATE INDEX idx_contacto_email ON contactos(email);
CREATE INDEX idx_contacto_created_at ON contactos(created_at);

