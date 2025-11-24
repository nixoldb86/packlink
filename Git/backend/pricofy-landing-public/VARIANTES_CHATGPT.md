# Generación de Variantes de Búsqueda con ChatGPT

## Cambio Implementado

El sistema de scraping ahora utiliza **ChatGPT** para generar variantes de búsqueda optimizadas en lugar de usar un sistema de variantes manual básico.

## Cómo Funciona

### Antes (Sistema Manual)

```typescript
// Generaba variantes simples:
// "árbol navidad" → ["arbol navidad", "arbol-navidad", "arbolnavidad", "arbols", "arbol navidad-s"]
const variantes = generarVariantesBusqueda(inputs.producto_text)
```

### Ahora (ChatGPT)

```typescript
// ChatGPT genera 5 variantes inteligentes optimizadas para segunda mano:
// "iPhone 17 Pro 512GB" → [
//   "iphone 17 pro 512gb",
//   "iphone 17 pro 512",
//   "iphone17 pro 512gb",
//   "apple iphone 17 pro",
//   "iphone 17 pro titanio azul"
// ]
const result = await generateSearchVariants(inputs.producto_text, 'es')
const variantes = result.variants
```

## Prompt Utilizado

El prompt enviado a ChatGPT es:

```
Actúa como experto en búsqueda de anuncios de segunda mano. 
A partir de product_text="[PRODUCTO]" e idioma="[es|en]", 
genera exactamente 5 cadenas de búsqueda distintas, optimizadas para títulos/listados.

Reglas:
- Solo texto plano (palabras separadas por espacios)
- Sin operadores booleanos, comillas, signos "+/-", ni paréntesis
- Incluye variantes de marca/modelo, abreviaturas y errores comunes
- Normaliza a minúsculas y sin acentos
- Prioriza tokens de alto valor (marca, modelo, medida/talla/capacidad, color clave)
- Evita stopwords y relleno ("de", "para", etc.)

Cobertura sugerida:
- versión literal depurada
- marca+modelo+atributo clave
- modelo+atributo sin marca
- sinónimo/alias del modelo
- color/versión relevante

Salida: solo 5 líneas, cada línea una cadena; sin numeración ni texto extra.
```

## Ejemplos de Variantes Generadas

### Ejemplo 1: "iPhone 17 Pro 512GB"

ChatGPT genera:
```
iphone 17 pro 512gb
iphone 17 pro 512
apple iphone 17 pro
iphone17 pro 512gb
iphone 17 pro titanio
```

### Ejemplo 2: "bañera flexible stokke con patas"

ChatGPT genera:
```
banera flexible stokke patas
stokke flexi bath patas
banera stokke soporte
flexi bath stokke
banera plegable stokke
```

### Ejemplo 3: "MacBook Pro 14 M3"

ChatGPT genera:
```
macbook pro 14 m3
macbook pro 14 m3 chip
apple macbook 14 m3
macbook pro m3 14 pulgadas
macbook 14 m3 pro
```

## Configuración

### Variables de Entorno Requeridas

En tu archivo `.env.local`:

```bash
# OpenAI API Key (requerida)
OPENAI_API_KEY=sk-...tu-api-key-aqui...

# Modelo a usar (opcional, por defecto: gpt-4o-mini)
OPENAI_MODEL=gpt-4o-mini
# Opciones: gpt-4o-mini, gpt-4o, gpt-3.5-turbo
```

### Modelos Disponibles

| Modelo | Velocidad | Costo | Calidad | Recomendado para |
|--------|-----------|-------|---------|------------------|
| `gpt-4o-mini` | Rápido | Bajo | Buena | **Uso general (recomendado)** |
| `gpt-4o` | Medio | Alto | Excelente | Productos complejos |
| `gpt-3.5-turbo` | Muy rápido | Muy bajo | Aceptable | Alto volumen/pruebas |

## Fallback Automático

Si ChatGPT no está disponible (API key no configurada, error, límite de tasa), el sistema automáticamente usa el generador de variantes manual:

```
⚠️ [Processor] ChatGPT no disponible, usando generación de variantes por defecto
   Razón: OPENAI_API_KEY no configurada
📝 [Processor] Variantes de búsqueda: arbol navidad, arbol-navidad, ...
```

Esto asegura que el scraping **siempre funcione**, incluso sin ChatGPT.

## Ventajas de ChatGPT

1. **Variantes Inteligentes**
   - Entiende el contexto del producto
   - Incluye sinónimos y abreviaturas comunes
   - Detecta errores típicos de escritura

2. **Adaptativo al Idioma**
   - Genera variantes en español o inglés según el idioma de búsqueda
   - Entiende diferencias regionales (España vs Latinoamérica)

3. **Optimizado para Segunda Mano**
   - Conoce cómo la gente publica anuncios en plataformas de segunda mano
   - Genera variantes que la gente realmente usa

4. **Mejor Cobertura**
   - 5 variantes cuidadosamente seleccionadas
   - Cada variante cubre un ángulo diferente del producto

## Logs del Sistema

Cuando ChatGPT está activo:

```
🤖 [Processor] Generando variantes de búsqueda con ChatGPT...
🤖 [ChatGPT] Generando variantes de búsqueda para: "iPhone 17 Pro 512GB"
✅ [ChatGPT] Generadas 5 variantes de búsqueda:
   1. "iphone 17 pro 512gb"
   2. "iphone 17 pro 512"
   3. "apple iphone 17 pro"
   4. "iphone17 pro 512gb"
   5. "iphone 17 pro titanio"
✅ [Processor] ChatGPT generó 5 variantes de búsqueda
```

Cuando ChatGPT no está disponible:

```
🤖 [Processor] Generando variantes de búsqueda con ChatGPT...
⚠️ OPENAI_API_KEY no configurada - usando variantes por defecto
⚠️ [Processor] ChatGPT no disponible, usando generación de variantes por defecto
   Razón: OPENAI_API_KEY no configurada
```

## Costos Estimados

Con `gpt-4o-mini` (recomendado):
- **Por búsqueda laxa:** ~$0.0001 - $0.0003 USD
- **200 búsquedas/mes:** ~$0.02 - $0.06 USD
- **1000 búsquedas/mes:** ~$0.10 - $0.30 USD

**Conclusión:** Extremadamente económico para el valor que aporta.

## Función Implementada

### `generateSearchVariants()`

```typescript
// En lib/chatgpt.ts

export async function generateSearchVariants(
  productoText: string,
  idioma: 'es' | 'en' = 'es'
): Promise<{
  success: boolean
  variants?: string[]
  error?: string
}>
```

**Parámetros:**
- `productoText`: Texto del producto a buscar (ej: "iPhone 17 Pro 512GB")
- `idioma`: Idioma de búsqueda ('es' o 'en', por defecto 'es')

**Retorno:**
- `success`: `true` si ChatGPT generó variantes exitosamente
- `variants`: Array con 5 variantes de búsqueda
- `error`: Mensaje de error si falló

## Integración en el Flujo

1. **Primera pasada:** Búsqueda estricta con el término original
2. **Evaluación:** ¿Hay suficientes resultados relevantes?
3. **Si faltan resultados:**
   - Llamar a ChatGPT para generar 5 variantes optimizadas
   - Buscar con cada variante
   - Aplicar filtro de relevancia (umbral más permisivo)
4. **Si ChatGPT falla:** Usar generador manual como fallback

## Archivos Modificados

1. **`lib/chatgpt.ts`**
   - Añadida función `generateSearchVariants()`
   - Reutiliza configuración de OpenAI existente

2. **`lib/scraper/processor.ts`**
   - Importa `generateSearchVariants` de `../chatgpt`
   - Reemplaza `generarVariantesBusqueda()` por llamada a ChatGPT
   - Mantiene fallback a método manual

## Testing

Para probar las variantes generadas:

```javascript
// Node.js REPL o script de test
import { generateSearchVariants } from './lib/chatgpt'

const result = await generateSearchVariants('iPhone 17 Pro 512GB', 'es')
console.log(result.variants)
```

## Recomendaciones

1. **Usar `gpt-4o-mini`** - Excelente balance calidad/costo
2. **Monitorear costos** - Revisar uso en OpenAI dashboard
3. **Configurar límites** - Establecer límite de gasto mensual en OpenAI
4. **Mantener fallback** - El sistema manual siempre debe funcionar

## Resultado Final

El sistema ahora genera variantes de búsqueda **significativamente mejores**, aumentando la probabilidad de encontrar anuncios relevantes en plataformas de segunda mano, mientras mantiene la robustez del sistema con fallback automático.

