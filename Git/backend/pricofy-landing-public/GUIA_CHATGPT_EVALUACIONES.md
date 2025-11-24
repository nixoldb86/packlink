# 🤖 Guía: Integración de ChatGPT para Evaluaciones Automáticas

Esta guía te llevará paso a paso para integrar ChatGPT y generar evaluaciones automáticas cuando se reciba una solicitud.

## 📋 Resumen del Proceso

1. Instalar OpenAI SDK
2. Crear tabla `evaluaciones` en la base de datos
3. Configurar variables de entorno (API Key de OpenAI)
4. Crear función para llamar a ChatGPT
5. Crear función para guardar evaluación en BD
6. Modificar el endpoint de solicitudes para procesar automáticamente

---

## Paso 1: Instalar OpenAI SDK

Ejecuta en tu terminal:

```bash
npm install openai
```

---

## Paso 2: Crear Tabla `evaluaciones` en Supabase

### Opción A: Desde el SQL Editor de Supabase

1. Ve a tu proyecto en Supabase
2. Abre **SQL Editor**
3. Ejecuta este script:

```sql
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

-- Índice para búsquedas rápidas
CREATE INDEX idx_evaluacion_solicitud_id ON evaluaciones(solicitud_id);
CREATE INDEX idx_evaluacion_created_at ON evaluaciones(created_at);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_evaluaciones_updated_at 
    BEFORE UPDATE ON evaluaciones 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### Opción B: Guardar como archivo SQL

He creado el archivo `CREATE_TABLE_EVALUACIONES.sql` que puedes ejecutar directamente.

---

## Paso 3: Configurar Variables de Entorno

### En `.env.local` (desarrollo):

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### En Vercel (producción):

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega:
   - `OPENAI_API_KEY` = `sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Asegúrate de seleccionar **"All Environments"**

### Obtener API Key de OpenAI:

1. Ve a [platform.openai.com](https://platform.openai.com)
2. Inicia sesión o crea una cuenta
3. Ve a **API Keys** en el menú
4. Haz clic en **"Create new secret key"**
5. Copia la key (solo se muestra una vez)

**Nota**: OpenAI tiene un plan gratuito con $5 de crédito inicial. Revisa los precios en [openai.com/pricing](https://openai.com/pricing)

---

## Paso 4: Crear Función para Llamar a ChatGPT

He creado `lib/chatgpt.ts` con la función `generateEvaluation()` que:

1. Recibe los datos de la solicitud
2. Construye el prompt (personalizable)
3. Llama a la API de OpenAI
4. Retorna la respuesta de ChatGPT

**Puedes personalizar el prompt** editando la función `buildEvaluationPrompt()` en ese archivo.

---

## Paso 5: Crear Función para Guardar Evaluación

He actualizado `lib/db.ts` con la función `saveEvaluacion()` que:

1. Guarda la evaluación en la tabla `evaluaciones`
2. Vincula la evaluación con la solicitud mediante `solicitud_id`
3. Guarda el prompt usado y la respuesta de ChatGPT

---

## Paso 6: Integrar en el Endpoint de Solicitudes

He modificado `app/api/submit-request/route.ts` para que:

1. Después de guardar la solicitud en BD
2. Extraiga los datos necesarios (modelo_marca, tipo_producto, pais, ciudad, estado)
3. Llame a ChatGPT automáticamente
4. Guarde la respuesta en la tabla `evaluaciones`

**El proceso es asíncrono y no bloquea** - si ChatGPT falla, la solicitud se guarda igual.

---

## 📝 Estructura del Prompt (Personalizable)

El prompt base que he creado incluye:

- Información del producto (modelo/marca, tipo, estado)
- Ubicación (país, ciudad)
- Instrucciones para generar una evaluación de precio

**Puedes modificar el prompt** editando `lib/chatgpt.ts`, función `buildEvaluationPrompt()`.

Ejemplo de prompt base:

```
Eres un experto en evaluación de precios de productos de segunda mano.
Analiza el siguiente producto y proporciona una evaluación detallada:

Producto: [modelo_marca]
Tipo: [tipo_producto]
Estado: [estado]
Ubicación: [ciudad], [pais]

Genera una evaluación con:
1. Precio recomendado
2. Precio mínimo
3. Precio máximo
4. Análisis de mercado
5. Recomendaciones
```

---

## 🔍 Verificar que Funciona

### 1. Envío de Solicitud de Prueba

1. Envía una solicitud de evaluación desde el formulario
2. Revisa los logs del servidor (en desarrollo) o Vercel (en producción)
3. Deberías ver:
   - `✅ Solicitud guardada`
   - `🤖 Llamando a ChatGPT...`
   - `✅ Evaluación generada y guardada`

### 2. Verificar en Base de Datos

Ejecuta en Supabase SQL Editor:

```sql
SELECT * FROM evaluaciones 
ORDER BY created_at DESC 
LIMIT 5;
```

Deberías ver las evaluaciones guardadas con:
- `solicitud_id` (vinculado a la solicitud)
- `respuesta_chatgpt` (la respuesta completa de ChatGPT)
- `prompt_usado` (el prompt que se envió)

---

## ⚠️ Manejo de Errores

El sistema está diseñado para:

1. **No bloquear** si ChatGPT falla - la solicitud se guarda igual
2. **Registrar errores** en los logs para debugging
3. **Retornar éxito** al usuario aunque ChatGPT falle

Si ChatGPT falla, verás en los logs:
```
❌ Error generando evaluación con ChatGPT: [error]
```

Pero la solicitud se habrá guardado correctamente.

---

## 💰 Costos de OpenAI

- **Modelo usado**: `gpt-4o-mini` (más económico)
- **Costo aproximado**: ~$0.01-0.05 por evaluación (depende del prompt)
- **Con $5 de crédito**: ~100-500 evaluaciones

Puedes cambiar el modelo en `lib/chatgpt.ts` si prefieres otro:
- `gpt-4o-mini` (recomendado, económico)
- `gpt-4o` (más potente, más caro)
- `gpt-3.5-turbo` (alternativa económica)

---

## 🔄 Próximos Pasos Opcionales

1. **Generar PDF automáticamente** con la evaluación
2. **Enviar el PDF por email** al usuario
3. **Programar evaluaciones** para procesarlas en lote
4. **Cache de evaluaciones** similares para ahorrar costos

---

## 📁 Archivos Creados/Modificados

1. ✅ `lib/chatgpt.ts` - Función para llamar a ChatGPT
2. ✅ `lib/db.ts` - Función `saveEvaluacion()`
3. ✅ `app/api/submit-request/route.ts` - Integración automática
4. ✅ `CREATE_TABLE_EVALUACIONES.sql` - Script SQL para crear tabla

---

## 🆘 Troubleshooting

### Error: "OpenAI API key not found"
- Verifica que `OPENAI_API_KEY` esté en `.env.local` (desarrollo) o Vercel (producción)
- Reinicia el servidor después de agregar la variable

### Error: "Insufficient quota"
- Revisa tu cuenta de OpenAI - puede que hayas agotado el crédito
- Ve a [platform.openai.com/account/billing](https://platform.openai.com/account/billing)

### Error: "Table evaluaciones does not exist"
- Ejecuta el script SQL en Supabase para crear la tabla
- Verifica que estés conectado a la base de datos correcta

### La evaluación no se genera
- Revisa los logs del servidor/Vercel
- Verifica que el `solicitud_id` se esté pasando correctamente
- Asegúrate de que la tabla `evaluaciones` existe

---

¿Necesitas ayuda con algún paso específico? ¡Dímelo!

