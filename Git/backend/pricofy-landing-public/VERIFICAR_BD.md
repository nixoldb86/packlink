# 🔍 Verificar que la Base de Datos esté funcionando

## Paso 1: Verificar que las tablas existen en Railway

1. **Ve a Railway:** https://railway.app
2. **Click en tu proyecto** → **Click en MySQL**
3. **Ve a la pestaña "Data" o "Query"**
4. **Ejecuta esta consulta:**

```sql
SHOW TABLES;
```

Deberías ver:
- `contactos`
- `solicitudes`

Si no ves estas tablas, necesitas ejecutar el script `CREATE_DATABASE_RAILWAY.sql` de nuevo.

## Paso 2: Verificar que puedes insertar datos

En Railway, ejecuta esta consulta SQL de prueba:

```sql
INSERT INTO contactos (nombre, email, telefono, comentario) 
VALUES ('Test', 'test@example.com', '123456789', 'Mensaje de prueba');
```

Si funciona, verifica con:

```sql
SELECT * FROM contactos;
```

## Paso 3: Revisar los logs del servidor

Cuando ejecutas `npm run dev`, deberías ver en la terminal:

1. **Al enviar el formulario:**
   - "Guardando contacto en BD..."
   - "Intentando guardar contacto: { nombre: ..., email: ... }"
   - "Conexión a BD obtenida"
   - "Contacto guardado exitosamente: ..."

2. **Si hay un error:**
   - Verás el error específico con detalles

## Errores comunes y soluciones

### Error: "Table 'railway.contactos' doesn't exist"

**Solución:** Las tablas no se crearon. Ejecuta el script `CREATE_DATABASE_RAILWAY.sql` en Railway.

### Error: "Access denied for user"

**Solución:** Verifica que `DB_USER` y `DB_PASSWORD` sean correctos en `.env.local`.

### Error: "ECONNREFUSED" o "getaddrinfo ENOTFOUND"

**Solución:** 
- Verifica que `DB_HOST` sea correcto (debe ser `gondola.proxy.rlwy.net`, no una URL completa)
- Verifica que `DB_PORT` sea correcto (debe ser `36353`, no `3306`)

### No hay errores pero no se guarda

**Solución:**
1. Verifica que estés conectándote a la base de datos correcta
2. Verifica que las variables de entorno estén cargadas (reinicia el servidor)
3. Revisa los logs en la terminal para ver si hay errores silenciosos

