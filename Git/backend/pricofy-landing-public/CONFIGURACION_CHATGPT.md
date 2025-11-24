# ⚙️ Opciones de Configuración de ChatGPT (OpenAI API)

Esta guía explica todas las opciones de configuración disponibles para personalizar las llamadas a ChatGPT en tu aplicación.

## 📋 Configuraciones Disponibles

### 1. **Modelo (`model`)**

Elige el modelo de IA que quieres usar:

```typescript
model: 'gpt-4o-mini'  // Actual (recomendado - económico)
```

**Opciones disponibles:**

| Modelo | Descripción | Costo | Velocidad | Uso Recomendado |
|--------|-------------|-------|-----------|-----------------|
| `gpt-4o-mini` | Modelo más económico y rápido | ~$0.15/1M tokens | Muy rápido | ✅ **Recomendado para evaluaciones** |
| `gpt-4o` | Modelo más potente y preciso | ~$2.50/1M tokens | Rápido | Análisis complejos |
| `gpt-4-turbo` | Versión anterior de GPT-4 | ~$10/1M tokens | Medio | Análisis muy detallados |
| `gpt-3.5-turbo` | Modelo económico básico | ~$0.50/1M tokens | Muy rápido | Tareas simples |

**Ejemplo de cambio:**
```typescript
model: 'gpt-4o', // Cambiar a modelo más potente
```

---

### 2. **Temperature (Temperatura)**

Controla la creatividad/aleatoriedad de las respuestas:

```typescript
temperature: 0.7  // Actual (medio creativo)
```

**Valores y efectos:**

| Valor | Descripción | Uso Recomendado |
|-------|-------------|-----------------|
| `0.0` - `0.3` | Muy determinista, respuestas consistentes | ✅ **Evaluaciones de precio** (más precisas) |
| `0.4` - `0.7` | Balance entre creatividad y precisión | Análisis generales |
| `0.8` - `1.0` | Muy creativo, respuestas variadas | Contenido creativo |
| `1.0` - `2.0` | Máxima creatividad (puede ser impredecible) | No recomendado para evaluaciones |

**Ejemplo para evaluaciones más precisas:**
```typescript
temperature: 0.3, // Más determinista = respuestas más consistentes
```

---

### 3. **Max Tokens (`max_tokens`)**

Límite máximo de tokens en la respuesta (1 token ≈ 0.75 palabras):

```typescript
max_tokens: 1500  // Actual
```

**Guía de valores:**

| Valor | Aproximado | Uso |
|-------|------------|-----|
| `500` | ~375 palabras | Respuestas cortas |
| `1000` | ~750 palabras | Respuestas medias |
| `1500` | ~1125 palabras | ✅ **Actual - Evaluaciones detalladas** |
| `2000` | ~1500 palabras | Evaluaciones muy extensas |
| `4000` | ~3000 palabras | Análisis muy completos |

**Nota:** Si la respuesta es más larga, se cortará. Ajusta según necesites.

**Ejemplo:**
```typescript
max_tokens: 2000, // Para evaluaciones más extensas
```

---

### 4. **Top P (Nucleus Sampling)**

Controla la diversidad de respuestas alternando con `temperature`:

```typescript
top_p: 1.0  // Por defecto (no está configurado actualmente)
```

**Valores:**

| Valor | Efecto |
|-------|--------|
| `0.1` - `0.5` | Respuestas más enfocadas y deterministas |
| `0.6` - `0.9` | Balance entre diversidad y coherencia |
| `1.0` | Máxima diversidad (por defecto) |

**Ejemplo:**
```typescript
top_p: 0.9, // Combinado con temperature para más control
```

---

### 5. **Frequency Penalty**

Penaliza tokens que aparecen frecuentemente (reduce repetición):

```typescript
frequency_penalty: 0.0  // Por defecto (no está configurado)
```

**Valores:**

| Valor | Efecto |
|-------|--------|
| `-2.0` a `-0.1` | Aumenta la probabilidad de repetir tokens |
| `0.0` | Sin penalización (por defecto) |
| `0.1` a `2.0` | Reduce repetición de palabras/frases |

**Ejemplo para evitar repetición:**
```typescript
frequency_penalty: 0.5, // Reduce repetición de palabras
```

---

### 6. **Presence Penalty**

Penaliza tokens nuevos (fomenta hablar de nuevos temas):

```typescript
presence_penalty: 0.0  // Por defecto (no está configurado)
```

**Valores:**

| Valor | Efecto |
|-------|--------|
| `-2.0` a `-0.1` | Aumenta probabilidad de hablar de temas ya mencionados |
| `0.0` | Sin penalización (por defecto) |
| `0.1` a `2.0` | Fomenta introducir nuevos temas/conceptos |

**Ejemplo:**
```typescript
presence_penalty: 0.3, // Fomenta mencionar más aspectos diferentes
```

---

### 7. **System Message**

Define el rol/comportamiento del asistente:

```typescript
{
  role: 'system',
  content: 'Eres un experto en evaluación de precios...'
}
```

**Puedes personalizar:**
- Tono (formal, informal, técnico)
- Nivel de detalle
- Estilo de respuesta
- Restricciones o instrucciones especiales

**Ejemplo más detallado:**
```typescript
{
  role: 'system',
  content: `Eres un experto en evaluación de precios de productos de segunda mano en el mercado español/europeo.
  
  Instrucciones:
  - Siempre proporciona precios en euros (€)
  - Basa tus análisis en datos reales del mercado
  - Sé específico y detallado
  - Usa un tono profesional pero accesible
  - Incluye referencias a plataformas de venta relevantes para la ubicación`
}
```

---

### 8. **Response Format**

Controla el formato de la respuesta:

```typescript
// Opción 1: JSON estructurado (requiere modelo compatible)
response_format: { type: 'json_object' }

// Opción 2: Texto libre (actual)
// No especificar response_format
```

**Para JSON estructurado:**
- Necesitas modelos: `gpt-4o-mini`, `gpt-4o`, `gpt-4-turbo`
- La respuesta será JSON válido
- Útil para procesar automáticamente la respuesta

**Ejemplo:**
```typescript
response_format: { type: 'json_object' },
// Y en el prompt indicar: "Responde en formato JSON con campos: precio_recomendado, precio_minimo, precio_maximo..."
```

---

### 9. **Seed (Semilla)**

Para reproducibilidad (misma entrada = misma salida):

```typescript
seed: 42  // Por defecto: undefined (no está configurado)
```

**Ejemplo:**
```typescript
seed: 42, // Para respuestas reproducibles (útil para testing)
```

---

### 10. **Stop Sequences**

Detiene la generación cuando encuentra ciertas secuencias:

```typescript
stop: ['\n\n---', 'FIN']  // Por defecto: undefined
```

**Ejemplo:**
```typescript
stop: ['\n\n---', 'FIN'], // Detiene cuando encuentra estas secuencias
```

---

## 🎯 Configuración Recomendada para Evaluaciones de Precio

```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini',              // Modelo económico
  messages: [...],
  temperature: 0.3,                  // Más determinista = más preciso
  max_tokens: 2000,                  // Respuestas detalladas
  top_p: 0.9,                        // Balance de diversidad
  frequency_penalty: 0.3,            // Reduce repetición
  presence_penalty: 0.2,             // Fomenta cubrir más aspectos
})
```

---

## 📝 Cómo Aplicar Estos Cambios

Edita el archivo `lib/chatgpt.ts`, específicamente la función `generateEvaluation()` alrededor de la línea 92:

```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [...],
  // Agrega aquí las opciones que quieras personalizar:
  temperature: 0.3,           // Cambiar de 0.7 a 0.3
  max_tokens: 2000,           // Cambiar de 1500 a 2000
  top_p: 0.9,                 // Agregar
  frequency_penalty: 0.3,     // Agregar
  presence_penalty: 0.2,      // Agregar
})
```

---

## 💰 Consideraciones de Costo

| Configuración | Impacto en Costo |
|---------------|------------------|
| `max_tokens` más alto | ✅ Aumenta costo (más tokens = más costo) |
| Modelo más potente | ✅ Aumenta costo significativamente |
| `temperature` más bajo | ❌ No afecta costo |
| `top_p`, `frequency_penalty` | ❌ No afectan costo |

**Ejemplo de costos aproximados:**
- `gpt-4o-mini` con `max_tokens: 1500`: ~$0.0002-0.0003 por evaluación
- `gpt-4o` con `max_tokens: 2000`: ~$0.005 por evaluación

---

## 🔧 Configuración por Variables de Entorno (Opcional)

Puedes hacer la configuración más flexible usando variables de entorno:

```typescript
const completion = await openai.chat.completions.create({
  model: process.env.CHATGPT_MODEL || 'gpt-4o-mini',
  temperature: parseFloat(process.env.CHATGPT_TEMPERATURE || '0.7'),
  max_tokens: parseInt(process.env.CHATGPT_MAX_TOKENS || '1500'),
  // ...
})
```

Y en `.env.local`:
```env
CHATGPT_MODEL=gpt-4o-mini
CHATGPT_TEMPERATURE=0.3
CHATGPT_MAX_TOKENS=2000
```

---

## 📚 Referencias

- [Documentación oficial de OpenAI](https://platform.openai.com/docs/api-reference/chat/create)
- [Guía de parámetros](https://platform.openai.com/docs/guides/text-generation)
- [Precios de modelos](https://openai.com/api/pricing/)

---

¿Quieres que implemente alguna de estas configuraciones específicas en tu código?

