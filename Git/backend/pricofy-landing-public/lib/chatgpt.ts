// Integración con OpenAI ChatGPT para generar variantes de búsqueda optimizadas

import OpenAI from 'openai'

/**
 * Genera variantes de búsqueda optimizadas usando ChatGPT
 * 
 * @param productoText Texto del producto a buscar
 * @param idioma Idioma de la búsqueda ('es' o 'en')
 * @returns Array con 5 variantes de búsqueda optimizadas
 */
export async function generateSearchVariants(
  productoText: string,
  idioma: 'es' | 'en' = 'es'
): Promise<{
  success: boolean
  variants?: string[]
  error?: string
}> {
  try {
    // Verificar que existe la API Key
    if (!process.env.OPENAI_API_KEY) {
      console.warn('⚠️ OPENAI_API_KEY no configurada - usando variantes por defecto')
      return {
        success: false,
        error: 'OPENAI_API_KEY no configurada',
      }
    }

    // Inicializar cliente de OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Construir el prompt
    const prompt = `Actúa como experto en búsqueda de anuncios de segunda mano. A partir de product_text="${productoText}" e idioma="${idioma}", genera exactamente 2 cadenas de búsqueda distintas, optimizadas para títulos/listados.

Reglas:

Solo texto plano (palabras separadas por espacios), sin operadores booleanos, comillas, signos "+/-", ni paréntesis.

Incluye variantes de marca/modelo, abreviaturas y errores comunes; normaliza a minúsculas y sin acentos.

Prioriza tokens de alto valor (marca, modelo, medida/talla/capacidad, color clave).

Evita stopwords y relleno ("de", "para", etc.).

Cobertura sugerida:

versión literal depurada,

marca+modelo+atributo clave,

modelo+atributo sin marca,

sinónimo/alias del modelo,

color/versión relevante.

Si el input que te dan es una sola palabra con hasta 5 caracteres, deberías buscar opciones que complementen la búsqueda, por ejemplo , si te dan "z906", deberas devolver algo que haga la búsqueda mas exacta, por ejemplo "altavoces z906" o "home cinme z906"

Salida: solo 2 líneas, cada línea una cadena; sin numeración ni texto extra.`

    console.log(`🤖 [ChatGPT] Generando variantes de búsqueda para: "${productoText}"`)
    
    const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
    const systemMessage = 'Eres un experto en búsqueda de anuncios de segunda mano. Generas variantes de búsqueda optimizadas siguiendo estrictamente el formato solicitado.'
    
    // Generar comando curl equivalente para logs
    const curlCommand = `curl https://api.openai.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${process.env.OPENAI_API_KEY?.substring(0, 10)}...${process.env.OPENAI_API_KEY?.substring(process.env.OPENAI_API_KEY.length - 4)}" \\
  -d '{
    "model": "${model}",
    "messages": [
      {
        "role": "system",
        "content": "${systemMessage.replace(/"/g, '\\"')}"
      },
      {
        "role": "user",
        "content": "${prompt.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"
      }
    ],
    "temperature": 0.7,
    "max_tokens": 200
  }'`
    
    console.log(`\n📋 [ChatGPT] Comando curl equivalente para generar variantes:`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(curlCommand)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

    // Llamar a la API de OpenAI
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: systemMessage,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 200, // Suficiente para 5 líneas cortas
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      throw new Error('ChatGPT no retornó una respuesta')
    }

    // Procesar la respuesta: separar por líneas y limpiar
    const variants = response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.match(/^\d+\./)) // Filtrar líneas vacías y numeración
      .slice(0, 2) // Asegurar máximo 5 variantes

    if (variants.length === 0) {
      throw new Error('ChatGPT no generó variantes válidas')
    }

    console.log(`✅ [ChatGPT] Generadas ${variants.length} variantes de búsqueda:`)
    variants.forEach((v, i) => console.log(`   ${i + 1}. "${v}"`))

    return {
      success: true,
      variants,
    }
  } catch (error) {
    console.error('❌ [ChatGPT] Error generando variantes de búsqueda:', error)
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Error desconocido al llamar a ChatGPT'
    
    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Infiere el estado del producto usando ChatGPT
 * 
 * @param titulo Título del anuncio
 * @param descripcion Descripción del anuncio
 * @returns Estado inferido: 'nuevo' | 'como_nuevo' | 'muy_buen_estado' | 'buen_estado' | 'usado' | 'aceptable' | 'ND' | null
 */
/**
 * Determina la categoría del producto usando ChatGPT
 * 
 * @param nombreProducto Nombre del producto (puede ser una variante generada)
 * @returns Categoría determinada o null si falla
 */
export async function determinarCategoriaProducto(
  nombreProducto: string
): Promise<{
  success: boolean
  categoria?: string | null
  error?: string
}> {
  try {
    // Verificar que existe la API Key
    if (!process.env.OPENAI_API_KEY) {
      console.warn('⚠️ OPENAI_API_KEY no configurada - no se puede determinar categoría con ChatGPT')
      return {
        success: false,
        categoria: null,
        error: 'OPENAI_API_KEY no configurada',
      }
    }

    // Inicializar cliente de OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Construir el prompt según las especificaciones
    const prompt = `A partir del campo "nombre_producto", determina el tipo de producto y devuelve solo una de estas categorías: Electrónica, Móviles y Tablets, Informática, Audio y Video, Electrodomésticos, Hogar y Jardín, Ropa y Accesorios, Deportes y Ocio, Coches, Motos, Libros y Música, Juguetes y Bebés, Otros. Responde solo con una categoría, sin añadir nada más.

nombre_producto="${nombreProducto}"`

    console.log(`🤖 [ChatGPT] Determinando categoría para: "${nombreProducto}"`)
    
    const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
    const systemMessage = 'Eres un clasificador experto en categorización de productos. Respondes únicamente con una de las categorías especificadas, sin texto adicional.'
    
    // Llamar a la API de OpenAI
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: systemMessage,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3, // Baja temperatura para respuestas más consistentes
      max_tokens: 50,
    })

    const respuesta = completion.choices[0]?.message?.content?.trim() || null
    
    if (!respuesta) {
      console.warn('⚠️ [ChatGPT] No se recibió respuesta para determinar categoría')
      return {
        success: false,
        categoria: null,
        error: 'No se recibió respuesta de ChatGPT',
      }
    }

    // Normalizar la respuesta (eliminar espacios, convertir a formato estándar)
    const categoriaNormalizada = respuesta.trim()
    
    // Validar que sea una de las categorías permitidas
    const categoriasPermitidas = [
      'Electrónica',
      'Móviles y Tablets',
      'Informática',
      'Audio y Video',
      'Electrodomésticos',
      'Hogar y Jardín',
      'Ropa y Accesorios',
      'Deportes y Ocio',
      'Coches',
      'Motos',
      'Libros y Música',
      'Juguetes y Bebés',
      'Otros',
    ]

    // Buscar coincidencia (case-insensitive)
    const categoriaEncontrada = categoriasPermitidas.find(
      cat => cat.toLowerCase() === categoriaNormalizada.toLowerCase()
    )

    if (categoriaEncontrada) {
      console.log(`✅ [ChatGPT] Categoría determinada: "${categoriaEncontrada}"`)
      return {
        success: true,
        categoria: categoriaEncontrada,
      }
    } else {
      console.warn(`⚠️ [ChatGPT] Categoría no reconocida: "${categoriaNormalizada}", usando "Otros"`)
      return {
        success: true,
        categoria: 'Otros', // Fallback a "Otros" si no coincide
      }
    }
  } catch (error: any) {
    console.error('❌ [ChatGPT] Error determinando categoría:', error)
    return {
      success: false,
      categoria: null,
      error: error.message || 'Error desconocido',
    }
  }
}

export async function inferirEstadoProducto(
  titulo: string,
  descripcion: string
): Promise<{
  success: boolean
  estado?: string | null
  error?: string
}> {
  try {
    // Verificar que existe la API Key
    if (!process.env.OPENAI_API_KEY) {
      console.warn('⚠️ OPENAI_API_KEY no configurada - no se puede inferir estado con ChatGPT')
      return {
        success: false,
        estado: null,
        error: 'OPENAI_API_KEY no configurada',
      }
    }

    // Inicializar cliente de OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Construir el prompt
    const prompt = `Actúa como un clasificador experto en productos de segunda mano. A partir del título y la descripción de un anuncio, devuelve únicamente uno de los siguientes valores:

Nuevo

Como nuevo

Buen estado

Usado

Necesita reparación

ND (No determinado)

Reglas de clasificación:

Nuevo: el producto está sin abrir, sin usar, precintado o se especifica que nunca ha sido utilizado.

Como nuevo: está usado pero sin signos visibles de uso, o se especifica como "impecable", "sin marcas", "apenas usado", etc.

Buen estado: tiene uso normal, sin daños importantes; puede tener marcas leves, pero está funcional.

Usado: uso evidente o prolongado; tiene marcas claras, desgaste, pero sigue funcionando.

Necesita reparación: no funciona, tiene piezas rotas, requiere arreglo, o presenta fallos técnicos.

ND: no se puede determinar claramente el estado por falta de información suficiente o por ambigüedad.

Entrada:

título: ${titulo}

descripción: ${descripcion}`

    console.log(`🤖 [ChatGPT] Infiriendo estado del producto: "${titulo.substring(0, 50)}..."`)
    
    const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
    const systemPrompt = 'Eres un clasificador experto en productos de segunda mano. Devuelves únicamente uno de los valores solicitados: Nuevo, Como nuevo, Buen estado, Usado, Necesita reparación, o ND.'
    
    // Generar comando curl equivalente para logs
    const curlCommand = `curl https://api.openai.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${process.env.OPENAI_API_KEY?.substring(0, 10)}...${process.env.OPENAI_API_KEY?.substring(process.env.OPENAI_API_KEY.length - 4)}" \\
  -d '{
    "model": "${model}",
    "messages": [
      {
        "role": "system",
        "content": "${systemPrompt.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"
      },
      {
        "role": "user",
        "content": "${prompt.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"
      }
    ],
    "temperature": 0.3,
    "max_tokens": 20
  }'`
    
    console.log(`\n📋 [ChatGPT] Comando curl equivalente para inferir estado:`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(curlCommand)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

    // Llamar a la API de OpenAI
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3, // Baja temperatura para respuestas más consistentes
      max_tokens: 20, // Solo necesitamos una palabra
    })

    const response = completion.choices[0]?.message?.content?.trim()

    if (!response) {
      throw new Error('ChatGPT no retornó una respuesta')
    }

    // Normalizar la respuesta
    const estadoNormalizado = response.toLowerCase().trim()

    // Mapear respuestas de ChatGPT a valores del sistema
    const mapeoEstados: Record<string, string> = {
      'nuevo': 'nuevo',
      'como nuevo': 'como_nuevo',
      'buen estado': 'buen_estado',
      'usado': 'usado',
      'necesita reparación': 'aceptable',
      'necesita reparacion': 'aceptable',
      'nd': 'ND',
      'no determinado': 'ND',
    }

    // Buscar coincidencia (puede haber variaciones en mayúsculas/minúsculas)
    let estadoInferido: string | null = null
    for (const [clave, valor] of Object.entries(mapeoEstados)) {
      if (estadoNormalizado.includes(clave.toLowerCase())) {
        estadoInferido = valor
        break
      }
    }

    // Si no se encontró coincidencia, intentar búsqueda parcial
    if (!estadoInferido) {
      if (estadoNormalizado.includes('nuevo') && !estadoNormalizado.includes('como')) {
        estadoInferido = 'nuevo'
      } else if (estadoNormalizado.includes('como nuevo') || estadoNormalizado.includes('casi nuevo')) {
        estadoInferido = 'como_nuevo'
      } else if (estadoNormalizado.includes('buen estado') || estadoNormalizado.includes('bien')) {
        estadoInferido = 'buen_estado'
      } else if (estadoNormalizado.includes('usado')) {
        estadoInferido = 'usado'
      } else if (estadoNormalizado.includes('reparación') || estadoNormalizado.includes('reparacion') || estadoNormalizado.includes('roto')) {
        estadoInferido = 'aceptable'
      } else {
        estadoInferido = 'ND'
      }
    }

    console.log(`✅ [ChatGPT] Estado inferido: "${estadoInferido}" (respuesta original: "${response}")`)

    return {
      success: true,
      estado: estadoInferido,
    }
  } catch (error) {
    console.error('❌ [ChatGPT] Error infiriendo estado del producto:', error)
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Error desconocido al llamar a ChatGPT'
    
    return {
      success: false,
      estado: null,
      error: errorMessage,
    }
  }
}

/**
 * Verifica si un anuncio coincide con alguna de las variantes de descripción del producto buscado por el usuario
 * IMPORTANTE: Solo usa el TÍTULO del anuncio, NO la descripción
 * 
 * @param titulo Título del anuncio
 * @param variantesProducto Array de variantes de descripción del producto (input original + variantes generadas por ChatGPT)
 * @returns true si el anuncio coincide con alguna variante, false si no
 */
export async function verificarCoincidenciaAnuncio(
  titulo: string,
  variantesProducto: string[]
): Promise<{
  success: boolean
  coincide?: boolean
  varianteAceptada?: string
  error?: string
}> {
  try {
    // Verificar que existe la API Key
    if (!process.env.OPENAI_API_KEY) {
      console.warn('⚠️ OPENAI_API_KEY no configurada - no se puede verificar coincidencia con ChatGPT')
      return {
        success: false,
        coincide: true, // Si no hay API key, aceptar por defecto para no bloquear
        error: 'OPENAI_API_KEY no configurada',
      }
    }

    // Verificar que hay variantes
    if (!variantesProducto || variantesProducto.length === 0) {
      return {
        success: false,
        coincide: false,
        error: 'No se proporcionaron variantes del producto',
      }
    }

    // Inicializar cliente de OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Construir lista de variantes para el prompt
    const listaVariantes = variantesProducto.map((v, i) => {
      const tipo = i === 0 ? '(input original del usuario)' : `(variante ${i})`
      return `${i + 1}. "${v}" ${tipo}`
    }).join('\n')

    // Construir el prompt para validar si el producto buscado por el usuario encaja con el anuncio encontrado
    // IMPORTANTE: Solo se usa el TÍTULO del anuncio, NO la descripción
    const prompt = `Actúa como un sistema de verificación experto. Tienes todo el conocimiento para determinar de un texto introducido por el usuario qué es la marca y que es el modelo, para determinar si alguna de las variantes de producto proporcionadas es lo mismo que el título del anuncio.

Tienes que ser capaz de separar el grano de la paja, es decir, quedarte con la idea principal. Si por ejemplo el usuario busca un "Logitech z906", una respuesta inválida será un complemento a ese producto buscado (por ejemplo, "Mando de Logitech z906" o "altavoces Logitech" sin el modelo z906). Si el usuario busca un "iPhone 17", un resultado no deseado como "true" no será "carcasa iPhone 17".

IMPORTANTE: Si el título se refiere a accesorios, soportes, fundas, mandos, repuestos o complementos de otro producto, responde siempre "false" aunque compartan marca o modelo.
Acepta variantes del productos, si al menos lo que busca el cliente {listaVariantes} esta contenido en el titulo del anuncio o con especificaciones adicionales (256GB, Max, colores, etc.).
Evita siempre que el titulo contenga COMPRAR o COMPRAMOS, devolviendo false.
Recibirás:
- Un título de un producto (SOLO el título, sin descripción)
- Una lista de variantes de producto (input original del usuario + variantes generadas)

Tu tarea es determinar si ALGUNA de las variantes de producto describe correctamente lo mismo que el título del anuncio.

Reglas:
- Compara semánticamente: acepta equivalencias, sinónimos, abreviaciones o lenguaje coloquial
- Si hay una coincidencia clara o razonable con ALGUNA variante, responde "true"
- Si ninguna variante encaja, es incorrecta o está relacionada con otro producto, responde "false"
- Si no puedes estar seguro por falta de información o ambigüedad, responde "false"
- SOLO usa el título proporcionado, ignora cualquier descripción que pueda aparecer en el título

Entrada:
título: ${titulo}
variantes de producto:
${listaVariantes}

Responde únicamente con "true" o "false" (sin comillas, sin explicaciones, solo la palabra).`

    console.log(`🤖 [ChatGPT] Verificando coincidencia para: "${titulo.substring(0, 50)}..."`)
    console.log(`   📋 Variantes a verificar (${variantesProducto.length}):`)
    variantesProducto.forEach((v, i) => {
      const tipo = i === 0 ? '(original)' : '(variante)'
      console.log(`      ${i + 1}. "${v}" ${tipo}`)
    })
    
    const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
    const systemPrompt = 'Eres un sistema de verificación experto. Comparas semánticamente descripciones de productos y respondes únicamente con "true" o "false" sin explicaciones.'
    
    // Generar comando curl equivalente para logs
    const curlCommand = `curl https://api.openai.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${process.env.OPENAI_API_KEY?.substring(0, 10)}...${process.env.OPENAI_API_KEY?.substring(process.env.OPENAI_API_KEY.length - 4)}" \\
  -d '{
    "model": "${model}",
    "messages": [
      {
        "role": "system",
        "content": "${systemPrompt.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"
      },
      {
        "role": "user",
        "content": "${prompt.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"
      }
    ],
    "temperature": 0.2,
    "max_tokens": 10
  }'`
    
    console.log(`\n📋 [ChatGPT] Comando curl equivalente para verificar coincidencia:`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(curlCommand)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

    // Llamar a la API de OpenAI
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.2, // Baja temperatura para respuestas más consistentes y precisas
      max_tokens: 10, // Solo necesitamos "true" o "false"
    })

    const response = completion.choices[0]?.message?.content?.trim().toLowerCase()

    if (!response) {
      throw new Error('ChatGPT no retornó una respuesta')
    }

    // Parsear la respuesta
    let coincide = false
    if (response.includes('true')) {
      coincide = true
    } else if (response.includes('false')) {
      coincide = false
    } else {
      // Si la respuesta no es clara, ser conservador y rechazar
      console.warn(`⚠️ [ChatGPT] Respuesta ambigua: "${response}", rechazando por seguridad`)
      coincide = false
    }

    console.log(`✅ [ChatGPT] Coincidencia verificada: ${coincide ? 'SÍ' : 'NO'} (respuesta: "${response}")`)
    
    // Si hay coincidencia, intentar determinar qué variante fue la que coincidió
    // (aunque ChatGPT no lo especifica, podemos inferirlo del contexto)
    let varianteAceptada: string | undefined = undefined
    if (coincide) {
      // Por defecto, asumimos que la primera variante (original) fue la que coincidió
      // o podemos intentar inferirlo de la respuesta si ChatGPT lo especifica
      varianteAceptada = variantesProducto[0] // Por ahora, usamos la primera
    }

    return {
      success: true,
      coincide,
      varianteAceptada,
    }
  } catch (error) {
    console.error('❌ [ChatGPT] Error verificando coincidencia:', error)
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Error desconocido al llamar a ChatGPT'
    
    // En caso de error, ser conservador y rechazar el anuncio
    return {
      success: false,
      coincide: false,
      error: errorMessage,
    }
  }
}

