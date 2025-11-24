# Configuración de Base de Datos - Guía Paso a Paso

## Problema Actual
Los datos no se están guardando porque el código de la base de datos está comentado y no hay variables de entorno configuradas.

## Solución Rápida

### Paso 1: Crear archivo de variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con este contenido:

```env
# Para MySQL/MariaDB
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=pricofy_db

# O para PostgreSQL (descomenta y usa estos en lugar de MySQL)
# DB_TYPE=postgresql
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=tu_usuario
# DB_PASSWORD=tu_contraseña
# DB_NAME=pricofy_db
```

**Reemplaza** `tu_usuario`, `tu_contraseña` y `pricofy_db` con tus valores reales.

### Paso 2: Instalar la dependencia de base de datos

**Para MySQL:**
```bash
npm install mysql2
```

**Para PostgreSQL:**
```bash
npm install pg
```

### Paso 3: Crear la base de datos y tabla

Ejecuta el script SQL en tu base de datos:

```bash
# Para MySQL
mysql -u tu_usuario -p pricofy_db < database/schema.sql

# O para PostgreSQL
psql -U tu_usuario -d pricofy_db -f database/schema.sql
```

O crea manualmente la base de datos y ejecuta el contenido de `database/schema.sql`.

### Paso 4: Configurar lib/db.ts

Abre `lib/db.ts` y descomenta el código correspondiente a tu base de datos:

- **Si usas MySQL**: Descomenta las líneas 5-54 (desde `import mysql` hasta el cierre del bloque `*/`)
- **Si usas PostgreSQL**: Descomenta las líneas 57-108 (desde `import { Pool }` hasta el cierre del bloque `*/`)

**IMPORTANTE**: Comenta o elimina las funciones genéricas al final (líneas 111-127) que solo loguean los datos.

### Paso 5: Reiniciar el servidor

```bash
npm run dev
```

## Verificación

1. Envía un formulario desde la landing page
2. Verifica en la consola del servidor que no hay errores
3. Accede a `http://localhost:3001/admin` para ver las solicitudes guardadas
4. O consulta directamente tu base de datos:
   ```sql
   SELECT * FROM solicitudes;
   ```

## Solución Temporal (Solo para pruebas)

Si necesitas ver los datos mientras configuras la base de datos, puedes verificar los logs en la consola del servidor donde se muestran los datos que se están intentando guardar.
