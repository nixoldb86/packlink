# Sistema de Umbrales Adaptativos para Relevancia

## Problema Resuelto

El sistema de relevancia original usaba un umbral fijo de 70% para todas las búsquedas. Esto funcionaba bien para productos con números críticos (como "iPhone 17 Pro 512GB"), pero era demasiado estricto para productos sin números (como "bañera flexible stokke con patas").

## Solución: Umbrales Adaptativos

El sistema ahora ajusta automáticamente el umbral de relevancia según el tipo de búsqueda:

### Detección Automática

```typescript
function tieneNumerosCriticos(terminoBusqueda: string): boolean
```

Detecta si la búsqueda contiene números que parecen ser:
- Modelos (17, 15, 16)
- Capacidades (512, 256, 1TB)
- Tamaños u otras especificaciones numéricas

### Umbrales por Tipo de Búsqueda

| Tipo de Búsqueda | Ejemplo | Umbral Estricto | Umbral Laxa |
|------------------|---------|-----------------|-------------|
| **Con números** | "iPhone 17 Pro 512GB" | 70% | 55% |
| **Sin números** | "bañera flexible stokke con patas" | 60% | 50% |

## Ejemplos de Funcionamiento

### Búsqueda CON números: "iPhone 17 Pro 512GB"

```
📊 [Relevancia] Umbral adaptativo: 70% (búsqueda con números críticos)

Resultados:
✅ iPhone 17 Pro 512GB → 100% (ACEPTADO)
✅ iPhone 17 Pro 256GB → 81.7% (ACEPTADO)
❌ iPhone 15 Pro 512GB → 69.2% (RECHAZADO)
```

**Razón:** Los números son críticos. Un modelo diferente (15 vs 17) debe ser rechazado.

### Búsqueda SIN números: "bañera flexible stokke con patas"

```
📊 [Relevancia] Umbral adaptativo: 60% (búsqueda sin números críticos)

Resultados:
✅ Bañera Stokke Flexi Bath con patas → 90% (ACEPTADO)
✅ Bañera flexible Stokke → 80% (ACEPTADO)
✅ Bañera bebé Stokke → 70% (ACEPTADO)
✅ Stokke Flexi Bath → 60% (ACEPTADO) ← Ahora se acepta
❌ Bañera genérica plegable → 40% (RECHAZADO)
```

**Razón:** Sin números críticos, el umbral es más permisivo para capturar variaciones legítimas del producto.

## Beneficios

1. **Flexibilidad:** Se adapta automáticamente al tipo de producto
2. **Precisión con números:** Mantiene estricto el filtro cuando hay modelos específicos
3. **Cobertura sin números:** No descarta variaciones válidas de productos genéricos
4. **Sin configuración:** Funciona automáticamente, sin necesidad de ajustes manuales

## Escenarios Cubiertos

### ✅ Productos Tecnológicos (con números)
- Teléfonos móviles (iPhone 15, Samsung S23)
- Ordenadores (MacBook Pro 14", Surface Pro 9)
- Componentes (RTX 4090, Ryzen 7 5800X)
- Almacenamiento (SSD 1TB, USB 128GB)

**Comportamiento:** Umbral alto (70%) - Rechaza modelos diferentes

### ✅ Productos de Hogar/Bebé (sin números)
- Muebles (mesa de comedor, silla ergonómica)
- Ropa (abrigo de invierno, zapatos deportivos)
- Juguetes (muñeca Barbie, coche teledirigido)
- Accesorios bebé (bañera Stokke, silla de paseo)

**Comportamiento:** Umbral medio (60%) - Acepta variaciones del producto

### ✅ Productos Mixtos
Si un producto tiene números **opcionales** (ej: "árbol de navidad 210 cm"), el sistema detectará el número y usará umbral alto, lo cual es correcto porque el tamaño es una especificación importante.

## Configuración Manual

Si necesitas forzar un umbral específico, puedes pasarlo como tercer parámetro:

```typescript
// Forzar umbral de 80% (muy estricto)
filtrarPorRelevancia(anuncios, "mi búsqueda", 80)

// Forzar umbral de 50% (muy permisivo)
filtrarPorRelevancia(anuncios, "mi búsqueda", 50)

// Usar umbral adaptativo (recomendado)
filtrarPorRelevancia(anuncios, "mi búsqueda") // Sin tercer parámetro
```

## Logs de Diagnóstico

El sistema ahora muestra claramente qué umbral está usando:

```
📊 [Relevancia] Umbral adaptativo: 70% (búsqueda con números críticos)
```

o

```
📊 [Relevancia] Umbral adaptativo: 60% (búsqueda sin números críticos)
```

Esto facilita el diagnóstico si los resultados no son los esperados.

## Resultado Final

El sistema ahora es **inteligente y adaptativo**, proporcionando:
- **Alta precisión** para productos con especificaciones numéricas críticas
- **Buena cobertura** para productos sin números, evitando rechazos excesivos
- **Funcionamiento automático** sin necesidad de configuración manual

