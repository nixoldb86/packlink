-- Script para agregar la tabla contactos a una base de datos existente
-- Ejecuta este script con: docker exec -i mysql-local mysql -uroot -proot pricofy_db < ADD_CONTACTOS_TABLE.sql
-- O si tienes MySQL local: mysql -u root -p pricofy_db < ADD_CONTACTOS_TABLE.sql

USE pricofy_db;

-- Crear la tabla de contactos si no existe
CREATE TABLE IF NOT EXISTS contactos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    comentario TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Crear índices para la tabla contactos
CREATE INDEX IF NOT EXISTS idx_contacto_email ON contactos(email);
CREATE INDEX IF NOT EXISTS idx_contacto_created_at ON contactos(created_at);

-- Mostrar confirmación
SELECT 'Tabla contactos creada correctamente' AS mensaje;

