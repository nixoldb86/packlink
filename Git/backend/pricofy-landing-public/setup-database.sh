#!/bin/bash

# Script para configurar la base de datos en MySQL Docker
# Ejecuta: bash setup-database.sh

CONTAINER_NAME="mysql-local"
DB_NAME="pricofy_db"
SQL_FILE="CREATE_DATABASE.sql"

echo "🚀 Configurando base de datos en contenedor Docker..."

# Verificar que el contenedor está corriendo
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "❌ Error: El contenedor '$CONTAINER_NAME' no está corriendo."
    echo "💡 Inicia el contenedor con:"
    echo "   docker run --name mysql-local -e MYSQL_ROOT_PASSWORD=root -p 3306:3306 -d mysql:8"
    exit 1
fi

echo "✅ Contenedor MySQL encontrado"

# Esperar a que MySQL esté listo
echo "⏳ Esperando a que MySQL esté listo..."
sleep 5

# Ejecutar el script SQL
echo "📝 Ejecutando script SQL..."
docker exec -i "$CONTAINER_NAME" mysql -uroot -proot < "$SQL_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Base de datos creada exitosamente!"
    echo ""
    echo "📊 Verificar con:"
    echo "   docker exec -it mysql-local mysql -uroot -proot -e 'USE pricofy_db; SHOW TABLES;'"
else
    echo "❌ Error al ejecutar el script SQL"
    exit 1
fi

