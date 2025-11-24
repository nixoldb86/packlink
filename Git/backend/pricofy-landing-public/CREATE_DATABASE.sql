-- Script para crear la base de datos y tabla en MySQL
-- Ejecuta este script con: mysql -u root -p < CREATE_DATABASE.sql
-- O si no tienes contraseña: mysql -u root < CREATE_DATABASE.sql

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS pricofy_db;

-- Usar la base de datos
USE pricofy_db;

-- Eliminar la tabla si existe (para recrearla desde cero)
DROP TABLE IF EXISTS solicitudes;

-- Crear la tabla de solicitudes
CREATE TABLE solicitudes (
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

-- Crear índices para mejorar las búsquedas
CREATE INDEX idx_email ON solicitudes(email);
CREATE INDEX idx_accion ON solicitudes(accion);
CREATE INDEX idx_created_at ON solicitudes(created_at);

-- Crear la tabla de contactos
DROP TABLE IF EXISTS contactos;

CREATE TABLE contactos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    comentario TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Crear índices para la tabla contactos
CREATE INDEX idx_contacto_email ON contactos(email);
CREATE INDEX idx_contacto_created_at ON contactos(created_at);

-- Mostrar confirmación
SELECT 'Base de datos y tablas creadas correctamente' AS mensaje;

