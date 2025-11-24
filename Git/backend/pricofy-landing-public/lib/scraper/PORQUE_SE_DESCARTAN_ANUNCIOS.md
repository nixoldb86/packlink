# 🔍 Por Qué Se Descartan Anuncios - Análisis Detallado

Este documento explica **todos los puntos** donde el sistema puede descartar anuncios y **por qué** sucede.

## 📊 Resumen de Filtros Aplicados

El sistema aplica varios filtros en secuencia para garantizar que solo los anuncios **más relevantes** lleguen al resultado final:

```
Anuncios encontrados
    ↓
1️⃣ Filtro de Relevancia (70% o 60%)
    ↓
2️⃣ Filtro de Condición Mínima
    ↓
3️⃣ Deduplicación
    ↓
4️⃣ Filtro de Outliers (precios extremos)
    ↓
5️⃣ Ordenamiento por precio
    ↓
Resultado final
```

---

## 1️⃣ Filtro de Relevancia (Principal)

**Ubicación:** `lib/scraper/utils.ts` → función `filtrarPorRelevancia()`

### ¿Qué hace?

Calcula un **score de relevancia de 0-100** comparando el término de búsqueda con el título del anuncio. Solo acepta anuncios con score **≥ umbral**.

### ¿Cuándo se descarta un anuncio?

```typescript
if (relevancia < umbralFinal) {
  // DESCARTADO ❌
  console.log(`⚠️ [Relevancia] Descartado (${relevancia}%): "${anuncio.titulo}"`)
}
```

### Umbrales Adaptativos

| Tipo de búsqueda | Umbral | Ejemplo |
|------------------|--------|---------|
| **Con números críticos** | 70% | "iphone 17 pro 512gb" |
| **Sin números críticos** | 60% | "bañera flexible stokke" |
| **Variantes (lazy search)** | 55% / 50% | Búsqueda laxa con ChatGPT |

### ¿Cómo se calcula la relevancia?

#### A. Sistema de Pesos por Token

Cada palabra (token) de tu búsqueda tiene un peso:

| Tipo de Token | Peso | Ejemplo |
|---------------|------|---------|
| **Números** (modelos, capacidades) | 3 | `17`, `512`, `210` |
| **Palabras técnicas** | 2 | `pro`, `max`, `ultra`, `gb`, `slim` |
| **Palabras genéricas** | 1 | `arbol`, `flexible`, `con` |

#### B. Penalizaciones

##### 🔴 Penalización TOTAL (0 puntos) - Números Incorrectos

Si buscas `iphone 17 pro 512gb` y el anuncio tiene `iphone 15 pro 512gb`:
- ❌ El número `17` no coincide con `15`
- ❌ **Penalización: 0 puntos** (no importa si es 1 o 2 de diferencia)
- 📉 Score final: ~69% → **DESCARTADO** (< 70%)

**Por qué:** Los números son críticos porque definen el modelo exacto o la capacidad. Un iPhone 15 NO es un iPhone 17, aunque se parezcan.

##### 🟡 Penalización Moderada (30% del peso) - Palabras técnicas ausentes

Si buscas `iphone 17 pro` y el anuncio solo dice `iphone 17`:
- ⚠️ `pro` (peso 2) está ausente
- 📉 Se suma solo `2 × 0.3 = 0.6` puntos en lugar de 2
- Puede pasar o no el umbral, depende de otros tokens

##### 🟢 Penalización Leve (50% del peso) - Palabras genéricas ausentes

Si buscas `arbol navidad montgomery` y el anuncio dice `arbol montgomery`:
- 🟢 `navidad` (peso 1) está ausente
- 📉 Se suma `1 × 0.5 = 0.5` puntos en lugar de 1
- Impacto menor en el score total

#### C. Bonus por Orden Correcto

Si los tokens aparecen **en el mismo orden** que en la búsqueda, se suman hasta **10 puntos extra**.

Ejemplo:
- Búsqueda: `"iphone 17 pro 512gb"`
- Título 1: `"iPhone 17 Pro Max 512GB"` → +7 puntos (buen orden)
- Título 2: `"512GB iPhone Pro 17"` → +2 puntos (orden malo)

---

## 2️⃣ Filtro de Condición Mínima

**Ubicación:** `lib/scraper/processor.ts` → función `filtrarPorCondicion()`

### ¿Qué hace?

Si el usuario solicita una **condición mínima** (ej: `buen_estado`), descarta anuncios en peor estado.

### Jerarquía de Estados

```
nuevo (6) → más restrictivo
  ↓
como_nuevo (5)
  ↓
muy_buen_estado (4)
  ↓
buen_estado (3)  ← Ejemplo: si pides esto...
  ↓
usado (2)        ← ...esto se descarta
  ↓
aceptable (1)    ← ...y esto también
```

### Ejemplo

Si solicitas `condicion_objetivo: "buen_estado"`:
- ✅ Acepta: `nuevo`, `como_nuevo`, `muy_buen_estado`, `buen_estado`
- ❌ Descarta: `usado`, `aceptable`

---

## 3️⃣ Deduplicación

**Ubicación:** `lib/scraper/utils.ts` → función `deduplicarAnuncios()`

### ¿Qué hace?

Detecta anuncios duplicados (mismo título, precio y URL) y **conserva solo uno**.

### Clave de Deduplicación

```typescript
clave = `${titulo_normalizado}_${precio_normalizado}_${url_anuncio}`
```

### Criterio de Conservación

Si hay duplicados, se conserva el de **menor precio**.

### Ejemplo

```
Anuncio 1: "iPhone 17 Pro 512GB" - 1200€ - wallapop.com/item/123
Anuncio 2: "iPhone 17 Pro 512GB" - 1200€ - wallapop.com/item/123 (duplicado)
                                    ↓
                              Conserva Anuncio 1
```

---

## 4️⃣ Filtro de Outliers (Precios Extremos)

**Ubicación:** `lib/scraper/utils.ts` → función `filtrarOutliers()`

### ¿Qué hace?

Detecta y elimina anuncios con **precios anormalmente bajos o altos** usando el método estadístico **IQR (Rango Intercuartílico)**.

### Fórmula

```
Límite inferior = Q1 - 1.5 × IQR
Límite superior = Q3 + 1.5 × IQR

Q1 = Cuartil 1 (percentil 25)
Q3 = Cuartil 3 (percentil 75)
IQR = Q3 - Q1
```

### ¿Cuándo se descarta?

- ❌ **Precio muy bajo** (< límite inferior o < 2€)
  - Posibles señuelos, artículos incompletos, o errores
- ❌ **Precio muy alto** (> límite superior)
  - Productos premium, ediciones especiales, o errores de listado

### Ejemplo Real

```
Precios encontrados: 800€, 850€, 900€, 920€, 950€, 980€, 1000€, 1050€, 5000€

Q1 = 875€
Q3 = 990€
IQR = 115€

Límite inferior = 875 - 1.5×115 = 702.5€
Límite superior = 990 + 1.5×115 = 1162.5€

Resultado:
✅ Acepta: 800€, 850€, 900€, 920€, 950€, 980€, 1000€, 1050€
❌ Descarta: 5000€ (outlier superior)
```

### Modo Relajado

Si tras filtrar quedan **menos de 5 anuncios**, el filtro se vuelve a ejecutar con:
- Multiplicador = **2.0** (en vez de 1.5)
- Límites más amplios para conservar más anuncios

---

## 5️⃣ Filtros Adicionales (Implícitos)

### A. Precios Inválidos

Durante la normalización, se descartan anuncios con:
- Precio = 0€
- Precio = NaN (no es un número)
- Precio sin información

### B. URLs Inválidas en Wallapop

**Ubicación:** `lib/scraper/wallapop.ts`

Se descartan URLs que no son anuncios específicos:
- ❌ `https://es.wallapop.com` (página principal)
- ❌ URLs sin `/item/` en la ruta
- ✅ `https://es.wallapop.com/item/producto-123456` (válido)

### C. Campos Obligatorios Vacíos

Si un anuncio no tiene:
- Título
- Precio
- URL

No se puede procesar y se descarta implícitamente.

---

## 🎯 Casos Prácticos

### Caso 1: "iPhone 17 Pro 512GB"

**Anuncio descartado:** "iPhone 15 Pro Max 512GB"

```
Cálculo de relevancia:
  Token "iphone" (peso 1): ✅ presente → +1 punto
  Token "17" (peso 3): ❌ ausente (hay "15") → +0 puntos (penalización total)
  Token "pro" (peso 2): ✅ presente → +2 puntos
  Token "512gb" (peso 3): ✅ presente → +3 puntos
  
  Peso total: 1 + 3 + 2 + 3 = 9
  Puntos obtenidos: 1 + 0 + 2 + 3 = 6
  Score: (6/9) × 100 = 66.67%
  
  Umbral: 70% (búsqueda con números)
  Resultado: 66.67% < 70% → ❌ DESCARTADO
```

**Por qué:** El número de modelo es crítico. Un iPhone 15 no es un iPhone 17.

---

### Caso 2: "Bañera Flexible Stokke con Patas"

**Anuncio aceptado:** "Stokke Flexi Bath (bañera flexible)"

```
Cálculo de relevancia:
  Token "banera" (peso 1): ✅ presente (normalizado) → +1 punto
  Token "flexible" (peso 1): ✅ presente → +1 punto
  Token "stokke" (peso 1): ✅ presente → +1 punto
  Token "con" (peso 1): ❌ ausente → +0.5 puntos (50% del peso)
  Token "patas" (peso 1): ❌ ausente → +0.5 puntos (50% del peso)
  
  Peso total: 5
  Puntos obtenidos: 1 + 1 + 1 + 0.5 + 0.5 = 4
  Score: (4/5) × 100 = 80%
  
  Umbral: 60% (búsqueda sin números)
  Resultado: 80% > 60% → ✅ ACEPTADO
```

**Por qué:** No tiene números críticos, el umbral es más bajo (60%), y las palabras clave principales están presentes.

---

### Caso 3: Precio Outlier

**Anuncio descartado:** "iPhone 17 Pro 512GB - 5000€"

```
Precios del mercado:
  800€, 850€, 900€, 920€, 950€, 980€, 1000€, 1050€, 5000€
  
Estadísticas:
  Q1 = 875€
  Q3 = 990€
  IQR = 115€
  Límite superior = 1162.5€
  
Precio del anuncio: 5000€ > 1162.5€
Resultado: ❌ DESCARTADO (outlier superior)
```

**Por qué:** El precio está muy por encima del rango normal del mercado (posible error, edición coleccionista, o estafa).

---

## 🛠️ Cómo Debugear Anuncios Descartados

### 1. Revisa los Logs de Relevancia

Busca líneas como:
```
⚠️ [Relevancia] Descartado (69.2%): "iPhone 15 Pro Max 512GB..."
```

Esto te dirá:
- **Score obtenido:** 69.2%
- **Título del anuncio descartado**
- **Umbral usado:** (se muestra en otra línea)

### 2. Identifica el Tipo de Descarte

| Log | Motivo |
|-----|--------|
| `⚠️ [Relevancia] Descartado` | Score < umbral (70% o 60%) |
| `✅ [Processor] Filtro por condición` | Estado del producto no cumple condición mínima |
| `✅ [Processor] Deduplicación` | Anuncio duplicado (título + precio + URL) |
| `✅ [Processor] Filtro de outliers` | Precio extremo (muy bajo o muy alto) |

### 3. Calcula Manualmente la Relevancia

Usa el script de prueba:
```bash
cd /Users/a.olmedo/Documents/Git/backend/pricofy-landing
node lib/scraper/test-relevancia.js
```

### 4. Ajusta Parámetros si es Necesario

#### Reducir el Umbral de Relevancia

En `lib/scraper/utils.ts`, línea 416:
```typescript
// Cambiar de 70%/60% a valores más bajos
umbralFinal = tieneNumerosCriticos(terminoBusqueda) ? 65 : 55
```

⚠️ **Advertencia:** Reducir el umbral puede incluir anuncios menos relevantes.

#### Relajar el Filtro de Outliers

En `lib/scraper/utils.ts`, línea 200:
```typescript
// Cambiar multiplicador de 1.5 a 2.0 (más permisivo)
const multiplicador = relajado ? 2.5 : 2.0
```

---

## 📈 Mejores Prácticas

### ✅ Para Obtener Más Resultados

1. **Usa búsquedas más genéricas** (ej: "iphone 17" en vez de "iphone 17 pro max 512gb titanio azul")
2. **Aumenta el radio de búsqueda** (`radio_km: 50` en vez de `30`)
3. **Reduce la condición mínima** (`buen_estado` en vez de `como_nuevo`)
4. **Baja el umbral de relevancia** (solo si aceptas más ruido)

### ✅ Para Obtener Resultados Más Precisos

1. **Usa búsquedas específicas con números** (ej: "iphone 17 pro 512gb")
2. **Mantén el umbral alto** (70% para números, 60% sin números)
3. **Especifica condición mínima alta** (`nuevo`, `como_nuevo`)
4. **Mantén el filtro de outliers activo**

---

## 🔗 Archivos Relacionados

| Archivo | Descripción |
|---------|-------------|
| `lib/scraper/utils.ts` | Funciones de filtrado y relevancia |
| `lib/scraper/processor.ts` | Orquestación de filtros |
| `lib/scraper/test-relevancia.js` | Script de prueba de relevancia |
| `MEJORAS_RELEVANCIA_IMPLEMENTADAS.md` | Documentación del sistema de relevancia |
| `UMBRALES_ADAPTATIVOS.md` | Explicación de umbrales dinámicos |

---

## 💡 Conclusión

El sistema descarta anuncios por **buenas razones**:
1. **No son relevantes** (score < umbral)
2. **No cumplen condición mínima** (estado insuficiente)
3. **Son duplicados** (ya tenemos ese anuncio)
4. **Precios anormales** (outliers estadísticos)

Si crees que un anuncio fue descartado incorrectamente:
1. Revisa los logs para ver el **score de relevancia**
2. Verifica que los **números/modelos coincidan**
3. Ajusta el **umbral o parámetros** si es necesario

El objetivo es **calidad sobre cantidad**: mejor tener 10 anuncios muy relevantes que 100 anuncios mediocres.

