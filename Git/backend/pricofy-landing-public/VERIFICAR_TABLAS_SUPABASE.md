# 🔍 Verificar y Crear Tablas en Supabase

Si estás obteniendo errores 500 al enviar formularios, probablemente las tablas no existen en Supabase.

## Paso 1: Verificar si las tablas existen

1. **Ve a:** https://supabase.com
2. **Entra** a tu proyecto
3. **Ve a:** "SQL Editor" en el menú lateral
4. **Ejecuta esta query** para verificar si las tablas existen:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('solicitudes', 'contactos');
```

Si no aparece ninguna fila, las tablas no existen.

## Paso 2: Crear las tablas

1. **En SQL Editor**, haz click en "New Query"
2. **Copia y pega** el contenido completo de `CREATE_DATABASE_SUPABASE.sql`
3. **Click en "Run"** (o presiona `Cmd/Ctrl + Enter`)
4. **Verifica** que aparezca el mensaje "Success. No rows returned"

## Paso 3: Verificar que las tablas se crearon correctamente

Ejecuta esta query:

```sql
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name IN ('solicitudes', 'contactos')
ORDER BY table_name, ordinal_position;
```

Deberías ver todas las columnas de ambas tablas.

## Paso 4: Probar la inserción manual

Prueba insertar un registro de prueba:

```sql
INSERT INTO contactos 
(nombre, email, telefono, comentario, created_at) 
VALUES 
('Test', 'test@example.com', '123456789', 'Este es un comentario de prueba', NOW()) 
RETURNING id;
```

Si funciona, el problema no es la tabla. Si falla, copia el error y compártelo.

## 🆘 Troubleshooting

### Error: "relation does not exist"
- **Solución:** Ejecuta el script `CREATE_DATABASE_SUPABASE.sql` en Supabase

### Error: "permission denied"
- **Solución:** Asegúrate de estar usando el usuario correcto (`postgres`)

### Error: "syntax error"
- **Solución:** Verifica que copiaste todo el script completo sin omitir líneas

