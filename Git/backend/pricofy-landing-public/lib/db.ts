// Configuración de base de datos
// IMPORTANTE: Ahora usa PostgreSQL (Supabase) por defecto

// ============================================
// CONFIGURACIÓN PARA POSTGRESQL (Supabase)
// ============================================
import { Pool } from 'pg'

let pool: Pool | null = null

export async function getPostgresConnection() {
  // NO ejecutar durante el build - solo en runtime
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    throw new Error('Database connection should not be initialized during build time. This is a dynamic route.')
  }

  if (!pool) {
    // Parsear URL de conexión si está presente (formato: postgresql://user:pass@host:port/db)
    // Soporta tanto DB_* como POSTGRES_* para compatibilidad
    let host = process.env.DB_HOST || process.env.POSTGRES_HOST
    let port = parseInt(process.env.DB_PORT || process.env.POSTGRES_PORT || '5432')
    let user = process.env.DB_USER || process.env.POSTGRES_USER
    let password = process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD
    let database = process.env.DB_NAME || process.env.POSTGRES_DB || 'postgres'

    // Log detallado de variables disponibles
    console.log('🔍 Variables de entorno detectadas:', {
      VERCEL: !!process.env.VERCEL,
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PHASE: process.env.NEXT_PHASE,
      hasDB_HOST: !!process.env.DB_HOST,
      hasPOSTGRES_HOST: !!process.env.POSTGRES_HOST,
      hasDB_USER: !!process.env.DB_USER,
      hasPOSTGRES_USER: !!process.env.POSTGRES_USER,
      hasDB_PASSWORD: !!process.env.DB_PASSWORD,
      hasPOSTGRES_PASSWORD: !!process.env.POSTGRES_PASSWORD,
      DB_PORT: process.env.DB_PORT,
      POSTGRES_PORT: process.env.POSTGRES_PORT,
    })

    // En Vercel, las variables de entorno son CRÍTICAS - no permitir fallback a localhost
    if (process.env.VERCEL && (!host || !user || !password)) {
      const missing = []
      if (!host) missing.push('DB_HOST o POSTGRES_HOST')
      if (!user) missing.push('DB_USER o POSTGRES_USER')
      if (!password) missing.push('DB_PASSWORD o POSTGRES_PASSWORD')
      
      console.error('❌ ERROR CRÍTICO: Variables de entorno faltantes en Vercel:', missing)
      console.error('Variables disponibles:', {
        DB_HOST: process.env.DB_HOST,
        POSTGRES_HOST: process.env.POSTGRES_HOST,
        DB_USER: process.env.DB_USER,
        POSTGRES_USER: process.env.POSTGRES_USER,
        DB_PASSWORD: !!process.env.DB_PASSWORD,
        POSTGRES_PASSWORD: !!process.env.POSTGRES_PASSWORD,
        DB_PORT: process.env.DB_PORT,
        POSTGRES_PORT: process.env.POSTGRES_PORT,
      })
      throw new Error(`Variables de entorno faltantes en Vercel: ${missing.join(', ')}. Por favor, configura las variables en Vercel Dashboard → Settings → Environment Variables`)
    }
    
    // Fallback solo para desarrollo local (NO en Vercel)
    if (!host && !process.env.VERCEL) {
      host = 'localhost'
      console.warn('⚠️  Usando localhost como fallback (solo para desarrollo local)')
    } else if (!host) {
      throw new Error('DB_HOST o POSTGRES_HOST debe estar configurado en Vercel')
    }

    // Si DB_HOST es una URL completa de PostgreSQL, parsearla
    if (host.startsWith('postgresql://') || host.startsWith('postgres://')) {
      try {
        const url = new URL(host)
        host = url.hostname
        port = parseInt(url.port || '5432')
        user = url.username || user
        password = url.password || password
        // Extraer el nombre de la base de datos de la URL
        const pathname = url.pathname.replace('/', '')
        // Si hay parámetros de query, extraer el nombre de la BD antes de ellos
        database = pathname.split('?')[0] || database
      } catch (error) {
        console.error('Error parsing DB_HOST URL:', error)
      }
    }

    // Validar que tenemos las credenciales necesarias
    if (!user || !password || !database) {
      console.error('Variables de entorno faltantes:', {
        user: !!user,
        password: !!password,
        database: !!database,
        host,
        port
      })
      throw new Error('Configuración de base de datos incompleta. Verifica las variables de entorno DB_USER, DB_PASSWORD y DB_NAME.')
    }

    // Para Supabase, siempre requerimos SSL cuando no es localhost
    const isSupabase = host.includes('.supabase.co') || host.includes('pooler.supabase.com') || host.includes('supabase.com')
    const isLocalhost = host === 'localhost' || host === '127.0.0.1'
    
    // Log para debugging en Vercel
    console.log('🔍 Configuración de conexión:', {
      host,
      port,
      user: user?.substring(0, 10) + '...',
      database: database?.substring(0, 10) + '...',
      isSupabase,
      isLocalhost,
      sslEnv: process.env.DB_SSL
    })
    
    const poolConfig: any = {
      host: host,
      port: port,
      user: user,
      password: password,
      database: database,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000, // 15 segundos timeout (aumentado)
      statement_timeout: 20000, // 20 segundos para queries
    }

    // Configurar SSL: Supabase siempre requiere SSL, localhost no
    if (process.env.DB_SSL === 'true' || (isSupabase && !isLocalhost)) {
      poolConfig.ssl = { 
        rejectUnauthorized: false // Supabase usa certificados autofirmados
      }
      console.log('SSL habilitado para conexión a Supabase')
    } else if (isLocalhost) {
      poolConfig.ssl = false
      console.log('SSL deshabilitado para localhost')
    }

    console.log('Configurando pool con:', {
      host,
      port,
      user,
      database: database.substring(0, 10) + '...',
      ssl: !!poolConfig.ssl,
      isSupabase,
      isLocalhost
    })

    pool = new Pool(poolConfig)

    // Manejar errores del pool para evitar crashes
    pool.on('error', (err, client) => {
      console.error('Unexpected error on idle client', err)
      // No cerrar el pool aquí, solo registrar el error
    })

    // Manejar errores de conexión
    pool.on('connect', (client) => {
      console.log('Nueva conexión establecida a PostgreSQL')
      client.on('error', (err) => {
        console.error('Error en cliente PostgreSQL:', err)
      })
    })

    // Intentar una conexión de prueba (solo en desarrollo, no en build time)
    if (process.env.NODE_ENV !== 'production' || process.env.VERCEL_ENV === 'development') {
      pool.query('SELECT NOW()')
        .then(() => {
          console.log('✅ Conexión de prueba a PostgreSQL exitosa')
        })
        .catch((err) => {
          console.error('❌ Error en conexión de prueba:', err.message)
          console.error('Verifica tus variables de entorno:', {
            host: host,
            port: port,
            hasUser: !!user,
            hasPassword: !!password,
            hasDatabase: !!database,
            ssl: poolConfig.ssl
          })
        })
    }
  }
  return pool
}

export async function saveSolicitud(data: any, photoPaths: string[], userId: string | null = null) {
  try {
    const pool = await getPostgresConnection()
    
    // photoPaths contiene las URLs públicas de Backblaze
    // Las guardamos tanto en fotos_paths (para compatibilidad) como en fotos_urls (nuevo campo)
    const fotosUrls = photoPaths.length > 0 ? photoPaths : null
    
    // Verificar y agregar columnas si no existen (solo en PostgreSQL/Supabase)
    try {
      await pool.query(`
        ALTER TABLE solicitudes 
        ADD COLUMN IF NOT EXISTS fotos_urls JSONB
      `)
    } catch (alterError) {
      console.log('Nota: No se pudo agregar la columna fotos_urls (puede que ya exista)')
    }
    
    try {
      await pool.query(`
        ALTER TABLE solicitudes 
        ADD COLUMN IF NOT EXISTS user_id UUID
      `)
      // Crear índice para mejorar búsquedas por user_id
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_solicitudes_user_id ON solicitudes(user_id)
      `)
    } catch (alterError) {
      console.log('Nota: No se pudo agregar la columna user_id (puede que ya exista)')
    }
    
    // Intentar insertar con todas las columnas (user_id, fotos_urls)
    try {
      const result = await pool.query(
        `INSERT INTO solicitudes 
        (email, pais, ciudad, accion, tipo_producto, modelo_marca, estado, accesorios, urgencia, fotos_paths, fotos_urls, user_id, created_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW()) 
        RETURNING id`,
        [
          data.email,
          data.pais,
          data.ciudad,
          data.accion,
          data.tipoProducto,
          data.modeloMarca,
          data.estado,
          data.accesorios || null,
          data.urgencia || null,
          JSON.stringify(photoPaths), // Mantener compatibilidad con fotos_paths
          fotosUrls ? JSON.stringify(fotosUrls) : null, // Nuevo campo fotos_urls con URLs de Backblaze
          userId, // user_id del usuario autenticado (puede ser null)
        ]
      )
      return { insertId: result.rows[0].id }
    } catch (insertError: any) {
      // Si falla porque alguna columna no existe, intentar sin esas columnas (compatibilidad hacia atrás)
      if (insertError.message && (insertError.message.includes('fotos_urls') || insertError.message.includes('user_id'))) {
        console.log('Alguna columna no existe, intentando INSERT sin columnas opcionales (modo compatibilidad)')
        
        // Intentar con user_id pero sin fotos_urls
        try {
          const result = await pool.query(
            `INSERT INTO solicitudes 
            (email, pais, ciudad, accion, tipo_producto, modelo_marca, estado, accesorios, urgencia, fotos_paths, user_id, created_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW()) 
            RETURNING id`,
            [
              data.email,
              data.pais,
              data.ciudad,
              data.accion,
              data.tipoProducto,
              data.modeloMarca,
              data.estado,
              data.accesorios || null,
              data.urgencia || null,
              JSON.stringify(photoPaths),
              userId,
            ]
          )
          return { insertId: result.rows[0].id }
        } catch (insertError2: any) {
          // Si aún falla, intentar sin user_id ni fotos_urls (máxima compatibilidad)
          if (insertError2.message && insertError2.message.includes('user_id')) {
            console.log('Columna user_id no existe, usando solo campos básicos (modo compatibilidad máxima)')
            const result = await pool.query(
              `INSERT INTO solicitudes 
              (email, pais, ciudad, accion, tipo_producto, modelo_marca, estado, accesorios, urgencia, fotos_paths, created_at) 
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) 
              RETURNING id`,
              [
                data.email,
                data.pais,
                data.ciudad,
                data.accion,
                data.tipoProducto,
                data.modeloMarca,
                data.estado,
                data.accesorios || null,
                data.urgencia || null,
                JSON.stringify(photoPaths),
              ]
            )
            return { insertId: result.rows[0].id }
          }
          throw insertError2
        }
      }
      throw insertError
    }
  } catch (error) {
    console.error('Error en saveSolicitud:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
    }
    throw error
  }
}

/**
 * Actualiza el campo tipo_producto de una solicitud
 */
export async function updateSolicitudTipoProducto(
  solicitudId: number,
  tipoProducto: string
): Promise<void> {
  try {
    const pool = await getPostgresConnection()
    await pool.query(
      `UPDATE solicitudes 
       SET tipo_producto = $1, updated_at = NOW() 
       WHERE id = $2`,
      [tipoProducto, solicitudId]
    )
    console.log(`✅ [DB] Actualizado tipo_producto de solicitud ${solicitudId} a "${tipoProducto}"`)
  } catch (error) {
    console.error('Error actualizando tipo_producto:', error)
    throw error
  }
}

export async function getAllSolicitudes() {
  try {
    const pool = await getPostgresConnection()
    const result = await pool.query(
      `SELECT * FROM solicitudes ORDER BY created_at DESC`
    )
    return result.rows
  } catch (error) {
    console.error('Error en getAllSolicitudes:', error)
    throw error
  }
}

export async function saveContacto(data: { nombre: string; email: string; telefono: string; comentario: string }) {
  try {
    console.log('=== saveContacto: Inicio ===')
    console.log('Datos recibidos:', { 
      nombre: data.nombre?.substring(0, 20), 
      email: data.email, 
      telefono: data.telefono?.substring(0, 10),
      comentarioLength: data.comentario?.length 
    })
    
    // Validar que los datos no estén vacíos
    if (!data.nombre || !data.email || !data.telefono || !data.comentario) {
      throw new Error('Datos incompletos para guardar contacto')
    }
    
    console.log('Obteniendo conexión a BD...')
    const pool = await getPostgresConnection()
    console.log('Conexión a BD obtenida')
    
    console.log('Ejecutando query INSERT...')
    const result = await pool.query(
      `INSERT INTO contactos 
      (nombre, email, telefono, comentario, created_at) 
      VALUES ($1, $2, $3, $4, NOW()) 
      RETURNING id`,
      [
        data.nombre.trim(),
        data.email.trim(),
        data.telefono.trim(),
        data.comentario.trim(),
      ]
    )
    
    console.log('Query ejecutado exitosamente')
    console.log('Resultado:', result.rows[0])
    return { insertId: result.rows[0]?.id }
  } catch (error) {
    console.error('=== Error en saveContacto ===')
    console.error('Error completo:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error code:', (error as any).code)
      console.error('Error detail:', (error as any).detail)
      console.error('Error hint:', (error as any).hint)
      console.error('Error stack:', error.stack)
    }
    throw error
  }
}

export async function getAllContactos() {
  try {
    const pool = await getPostgresConnection()
    const result = await pool.query(
      `SELECT * FROM contactos ORDER BY created_at DESC`
    )
    return result.rows
  } catch (error) {
    console.error('Error en getAllContactos:', error)
    throw error
  }
}

/**
 * Verifica si un email ha alcanzado el límite diario de evaluaciones
 * 
 * @param email Email del usuario a verificar
 * @param limiteDiario Límite máximo de evaluaciones por día (por defecto 1)
 * @returns true si el email ha alcanzado el límite, false en caso contrario
 */
export async function checkSolicitudToday(email: string, limiteDiario: number = 1): Promise<boolean> {
  try {
    const pool = await getPostgresConnection()
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM solicitudes 
       WHERE email = $1 
       AND DATE(created_at) = CURRENT_DATE`,
      [email]
    )
    const count = Number(result.rows[0]?.count || 0)
    const hasReachedLimit = count >= limiteDiario
    
    if (hasReachedLimit) {
      console.log(`⚠️ [checkSolicitudToday] Email ${email.substring(0, 3)}*** ha alcanzado el límite diario: ${count}/${limiteDiario}`)
    }
    
    return hasReachedLimit
  } catch (error) {
    console.error('Error checking solicitud today:', error)
    // En caso de error, permitir el envío para no bloquear usuarios
    return false
  }
}

/**
 * Guarda los resultados del scraping en la base de datos
 *
 * @param solicitudId ID de la solicitud relacionada
 * @param searchParams Parámetros de búsqueda utilizados
 * @param results Resultados del scraping (tablas, JSONs y todas las URLs encontradas)
 * @returns ID del registro guardado
 */
export async function saveScrapingResults(
  solicitudId: number,
  searchParams: {
    producto_text: string
    categoria: string
    ubicacion: string
    radio_km: number
    condicion_objetivo: string
  },
  results: {
    tablaCompradores: any[]
    tablaVendedores: any[]
    jsonCompradores: any
    jsonVendedores: any
    todasUrlsEncontradas: string[]
    totalAnunciosAnalizados?: number
    totalAnunciosDescartados?: number
    totalAnunciosOutliers?: number
    totalAnunciosAnalizadosFiltrados?: number // Total de URLs que partió el análisis
    totalResultadosScrapping?: any // Para búsqueda directa: todos los resultados sin filtrar
    tipoBusqueda?: 'directa' | 'completa' // Tipo de búsqueda realizada
  }
): Promise<{ insertId: number }> {
  try {
    const pool = await getPostgresConnection()
    
    // Calcular metadatos
    // total_anuncios_analizados: Total de anuncios obtenidos de todas las búsquedas (antes de cualquier filtrado)
    const totalAnunciosAnalizados = results.totalAnunciosAnalizados ?? (results.tablaCompradores?.length || 0)
    // total_anuncios_descartados: Descartados por prefiltrado semántico + ChatGPT (antes de outliers)
    const totalAnunciosDescartados = results.totalAnunciosDescartados ?? 0
    // total_anuncios_outliers: Descartados por outliers
    const totalAnunciosOutliers = results.totalAnunciosOutliers ?? 0
    // total_anuncios_analizados_filtrados: Total de URLs que partió el análisis (todasUrlsEncontradas.length)
    const totalAnunciosAnalizadosFiltrados = results.totalAnunciosAnalizadosFiltrados ?? results.todasUrlsEncontradas?.length ?? 0
    // Mantener compatibilidad con campos antiguos
    const totalAnunciosEncontrados = results.tablaCompradores?.length || 0
    const totalAnunciosFiltrados = results.jsonCompradores?.compradores?.length || 0
    
    // Extraer plataformas únicas
    const plataformasSet = new Set<string>()
    if (results.tablaCompradores) {
      results.tablaCompradores.forEach((anuncio: any) => {
        if (anuncio.plataforma) plataformasSet.add(anuncio.plataforma)
      })
    }
    const plataformas = Array.from(plataformasSet)
    
    // Verificar si las columnas opcionales existen
    let hasTodasUrlsColumn = true
    let hasTotalAnunciosAnalizadosColumn = true
    let hasTotalAnunciosDescartadosColumn = true
    let hasTotalAnunciosOutliersColumn = true
    let hasTotalAnunciosAnalizadosFiltradosColumn = true
    let hasTotalResultadosScrappingColumn = true
    let hasTipoBusquedaColumn = true
    
    try {
      await pool.query(`
        SELECT todas_urls_encontradas, total_anuncios_analizados, total_anuncios_descartados, total_anuncios_outliers, total_resultados_scrapping, tipo_busqueda
        FROM scraping_results 
        LIMIT 1
      `)
    } catch {
      // Verificar cada columna individualmente
      try {
        await pool.query(`SELECT todas_urls_encontradas FROM scraping_results LIMIT 1`)
      } catch {
        hasTodasUrlsColumn = false
        console.log('⚠️ Columna todas_urls_encontradas no existe, omitiéndola del INSERT')
      }
      
      try {
        await pool.query(`SELECT total_anuncios_analizados FROM scraping_results LIMIT 1`)
      } catch {
        hasTotalAnunciosAnalizadosColumn = false
        console.log('⚠️ Columna total_anuncios_analizados no existe, omitiéndola del INSERT')
      }
      
      try {
        await pool.query(`SELECT total_anuncios_descartados FROM scraping_results LIMIT 1`)
      } catch {
        hasTotalAnunciosDescartadosColumn = false
        console.log('⚠️ Columna total_anuncios_descartados no existe, omitiéndola del INSERT')
      }
      
      try {
        await pool.query(`SELECT total_anuncios_outliers FROM scraping_results LIMIT 1`)
      } catch {
        hasTotalAnunciosOutliersColumn = false
        console.log('⚠️ Columna total_anuncios_outliers no existe, omitiéndola del INSERT')
      }
      
      try {
        await pool.query(`SELECT total_anuncios_analizados_filtrados FROM scraping_results LIMIT 1`)
      } catch {
        hasTotalAnunciosAnalizadosFiltradosColumn = false
        console.log('⚠️ Columna total_anuncios_analizados_filtrados no existe, omitiéndola del INSERT')
      }
      
      try {
        await pool.query(`SELECT total_resultados_scrapping FROM scraping_results LIMIT 1`)
      } catch {
        hasTotalResultadosScrappingColumn = false
        console.log('⚠️ Columna total_resultados_scrapping no existe, omitiéndola del INSERT')
      }
      
      try {
        await pool.query(`SELECT tipo_busqueda FROM scraping_results LIMIT 1`)
      } catch {
        hasTipoBusquedaColumn = false
        console.log('⚠️ Columna tipo_busqueda no existe, omitiéndola del INSERT')
      }
    }
    
    // Construir la query INSERT dinámicamente según las columnas disponibles
    const columnasBase = [
      'solicitud_id',
      'producto_text',
      'categoria',
      'ubicacion',
      'radio_km',
      'condicion_objetivo',
      'json_compradores',
      'json_vendedores',
      'tabla_compradores',
      'tabla_vendedores',
    ]
    
    const valoresBase = [
      solicitudId,
      searchParams.producto_text,
      searchParams.categoria,
      searchParams.ubicacion,
      searchParams.radio_km,
      searchParams.condicion_objetivo,
      JSON.stringify(results.jsonCompradores),
      JSON.stringify(results.jsonVendedores),
      JSON.stringify(results.tablaCompradores),
      JSON.stringify(results.tablaVendedores),
    ]
    
    // Agregar columnas opcionales
    const columnasOpcionales: string[] = []
    const valoresOpcionales: any[] = []
    let paramIndex = valoresBase.length + 1
    
    if (hasTodasUrlsColumn) {
      columnasOpcionales.push('todas_urls_encontradas')
      valoresOpcionales.push(results.todasUrlsEncontradas || [])
      paramIndex++
    }
    
    // Siempre incluir total_anuncios_encontrados y total_anuncios_filtrados (compatibilidad)
    columnasOpcionales.push('total_anuncios_encontrados', 'total_anuncios_filtrados')
    valoresOpcionales.push(totalAnunciosEncontrados, totalAnunciosFiltrados)
    paramIndex += 2
    
    // Agregar nuevas columnas si existen
    if (hasTotalAnunciosAnalizadosColumn) {
      columnasOpcionales.push('total_anuncios_analizados')
      valoresOpcionales.push(totalAnunciosAnalizados)
      paramIndex++
    }
    
    if (hasTotalAnunciosDescartadosColumn) {
      columnasOpcionales.push('total_anuncios_descartados')
      valoresOpcionales.push(totalAnunciosDescartados)
      paramIndex++
    }
    
    if (hasTotalAnunciosOutliersColumn) {
      columnasOpcionales.push('total_anuncios_outliers')
      valoresOpcionales.push(totalAnunciosOutliers)
      paramIndex++
    }
    
    if (hasTotalAnunciosAnalizadosFiltradosColumn) {
      columnasOpcionales.push('total_anuncios_analizados_filtrados')
      valoresOpcionales.push(totalAnunciosAnalizadosFiltrados)
      paramIndex++
    }
    
    // Agregar total_resultados_scrapping si existe y hay datos
    if (hasTotalResultadosScrappingColumn && results.totalResultadosScrapping) {
      columnasOpcionales.push('total_resultados_scrapping')
      valoresOpcionales.push(JSON.stringify(results.totalResultadosScrapping))
      paramIndex++
    }
    
    // Agregar tipo_busqueda si existe
    if (hasTipoBusquedaColumn && results.tipoBusqueda) {
      columnasOpcionales.push('tipo_busqueda')
      valoresOpcionales.push(results.tipoBusqueda)
      paramIndex++
    }
    
    // Agregar plataformas_consultadas y created_at
    columnasOpcionales.push('plataformas_consultadas', 'created_at')
    valoresOpcionales.push(plataformas, 'NOW()')
    
    // Construir query final
    const todasLasColumnas = [...columnasBase, ...columnasOpcionales]
    const todosLosValores = [...valoresBase, ...valoresOpcionales]
    
    // Construir placeholders ($1, $2, ...) pero usar NOW() directamente para created_at
    const placeholders = todosLosValores.map((_, index) => {
      if (index === todosLosValores.length - 1 && todasLasColumnas[todasLasColumnas.length - 1] === 'created_at') {
        return 'NOW()'
      }
      return `$${index + 1}`
    }).join(', ')
    
    // Remover el último valor si es 'NOW()' porque no es un parámetro
    const valoresParaQuery = todosLosValores.slice(0, -1)
    
    const query = `
      INSERT INTO scraping_results
      (${todasLasColumnas.join(', ')})
      VALUES (${placeholders})
      RETURNING id
    `
    
    const result = await pool.query(query, valoresParaQuery)
    
    console.log('✅ Resultados de scraping guardados en BD, ID:', result.rows[0].id)
    return { insertId: result.rows[0].id }
  } catch (error) {
    console.error('Error en saveScrapingResults:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
    }
    throw error
  }
}

/**
 * Obtiene los datos completos de scraping_results junto con la solicitud
 */
export async function getScrapingResultById(scrapingResultId: number): Promise<any | null> {
  try {
    const pool = await getPostgresConnection()
    
    const result = await pool.query(
      `SELECT 
        sr.*,
        s.email,
        s.pais,
        s.ciudad,
        s.modelo_marca,
        s.tipo_producto,
        s.estado
      FROM scraping_results sr
      JOIN solicitudes s ON sr.solicitud_id = s.id
      WHERE sr.id = $1`,
      [scrapingResultId]
    )
    
    if (result.rows.length === 0) {
      return null
    }
    
    return result.rows[0]
  } catch (error) {
    console.error('Error en getScrapingResultById:', error)
    throw error
  }
}

/**
 * Obtiene el último scraping_result de una solicitud
 */
export async function getScrapingResultBySolicitudId(solicitudId: number): Promise<any | null> {
  try {
    const pool = await getPostgresConnection()
    
    const result = await pool.query(
      `SELECT 
        sr.*,
        s.email,
        s.pais,
        s.ciudad,
        s.modelo_marca,
        s.tipo_producto,
        s.estado
      FROM scraping_results sr
      JOIN solicitudes s ON sr.solicitud_id = s.id
      WHERE sr.solicitud_id = $1
      ORDER BY sr.created_at DESC
      LIMIT 1`,
      [solicitudId]
    )
    
    if (result.rows.length === 0) {
      return null
    }
    
    return result.rows[0]
  } catch (error) {
    console.error('Error en getScrapingResultBySolicitudId:', error)
    throw error
  }
}

/**
 * Guarda productos nuevos de ciao.es en la base de datos
 * Agrupa todos los productos en un solo registro y aplica filtro de outliers
 */
export async function saveProductosNuevos(
  scrapingResultId: number,
  nombreProducto: string,
  productosNuevos: Array<{
    title: string
    description: string
    price: number
    currency: string
    offerUrl: string
    images: Array<{ url: string; zoomUrl: string }>
  }>
): Promise<void> {
  try {
    const pool = await getPostgresConnection()
    
    // Verificar si la tabla existe
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'productos_nuevos'
      )
    `)
    
    if (!tableCheck.rows[0].exists) {
      console.warn('⚠️ [DB] La tabla productos_nuevos no existe. Por favor ejecuta CREATE_TABLE_PRODUCTOS_NUEVOS.sql')
      return
    }
    
    if (productosNuevos.length === 0) {
      console.log(`ℹ️ [DB] No hay productos nuevos para guardar`)
      return
    }
    
    // Aplicar filtro de outliers sobre los precios
    const { filtrarOutliers } = await import('./scraper/utils')
    
    // Convertir productos nuevos a formato compatible con filtrarOutliers (AnuncioNormalizado)
    const productosComoAnuncios = productosNuevos.map(producto => {
      // Extraer URL: puede ser string o objeto con landingUrl/url
      const urlAnuncio = typeof producto.offerUrl === 'string' 
        ? producto.offerUrl 
        : (producto.offerUrl as any)?.landingUrl || (producto.offerUrl as any)?.url || ''
      
      return {
        plataforma: 'ciao',
        titulo: producto.title,
        precio: producto.price.toString(),
        precio_eur: producto.price,
        precio_normalizado: producto.price,
        titulo_normalizado: producto.title.toLowerCase(),
        estado_normalizado: 'nuevo' as const,
        moneda_original: producto.currency,
        estado_declarado: 'nuevo',
        ciudad_o_zona: null,
        url_anuncio: urlAnuncio,
        descripcion: producto.description,
        product_image: producto.images && producto.images.length > 0 ? producto.images[0].url : null,
      }
    })
    
    console.log(`🔍 [DB] Aplicando filtro de outliers a ${productosComoAnuncios.length} productos nuevos...`)
    const resultadoOutliers = filtrarOutliers(productosComoAnuncios)
    const productosFiltrados = resultadoOutliers.filtrados
    
    console.log(`✅ [DB] Filtro de outliers: ${productosComoAnuncios.length} → ${productosFiltrados.length} productos (${resultadoOutliers.eliminados.length} outliers eliminados)`)
    
    if (resultadoOutliers.eliminados.length > 0) {
      console.log(`   ❌ Productos eliminados por outliers (${resultadoOutliers.eliminados.length}):`)
      resultadoOutliers.eliminados.forEach(({ anuncio, razon }) => {
        console.log(`      - ${anuncio.titulo}: ${anuncio.precio_eur}€ (${razon})`)
      })
    }
    
    // Convertir de vuelta al formato de productos nuevos
    const productosFinales = productosFiltrados.map(anuncio => {
      const productoOriginal = productosNuevos.find(p => {
        // Comparar URLs: puede ser string o objeto con landingUrl/url
        const urlOriginal = typeof p.offerUrl === 'string' 
          ? p.offerUrl 
          : (p.offerUrl as any)?.landingUrl || (p.offerUrl as any)?.url || ''
        return urlOriginal === anuncio.url_anuncio
      })
      return {
        title: anuncio.titulo,
        description: anuncio.descripcion || '',
        price: anuncio.precio_eur || 0,
        currency: anuncio.moneda_original || 'EUR',
        offerUrl: productoOriginal?.offerUrl || anuncio.url_anuncio, // Mantener la estructura original (puede ser objeto)
        images: productoOriginal?.images || []
      }
    })
    
    // Aplicar filtro de GPT para verificar que el producto coincide con el anuncio
    console.log(`\n🤖 [GPT] Aplicando verificación de GPT a ${productosFinales.length} productos nuevos...`)
    const { generateSearchVariants, verificarCoincidenciaAnuncio } = await import('./chatgpt')
    
    // Generar variantes del producto buscado
    const variantesResult = await generateSearchVariants(nombreProducto, 'es')
    const variantes = variantesResult.success && variantesResult.variants 
      ? [nombreProducto, ...variantesResult.variants]
      : [nombreProducto]
    
    console.log(`📋 [GPT] Variantes generadas: ${variantes.length}`)
    
    // Verificar cada producto con GPT
    const productosFiltradosGPT: typeof productosFinales = []
    for (const producto of productosFinales) {
      try {
        const verificacion = await verificarCoincidenciaAnuncio(producto.title, variantes)
        if (verificacion.success && verificacion.coincide === true) {
          productosFiltradosGPT.push(producto)
          console.log(`✅ [GPT] Producto aceptado: "${producto.title.substring(0, 60)}..."`)
        } else {
          console.log(`❌ [GPT] Producto descartado: "${producto.title.substring(0, 60)}..."`)
        }
      } catch (error) {
        console.error(`⚠️ [GPT] Error al verificar producto "${producto.title}":`, error)
        // En caso de error, no incluir el producto en los filtrados
      }
    }
    
    console.log(`✅ [GPT] Filtro de GPT: ${productosFinales.length} → ${productosFiltradosGPT.length} productos (${productosFinales.length - productosFiltradosGPT.length} descartados)`)
    
    // Ordenar productos filtrados por GPT por precio ascendente
    productosFiltradosGPT.sort((a, b) => a.price - b.price)
    
    // Verificar si existe la columna datos_producto_nuevo_filtrado
    let hasFiltradoColumn = false
    try {
      await pool.query(`SELECT datos_producto_nuevo_filtrado FROM productos_nuevos LIMIT 1`)
      hasFiltradoColumn = true
    } catch {
      hasFiltradoColumn = false
      console.log('⚠️ [DB] Columna datos_producto_nuevo_filtrado no existe, omitiéndola del INSERT')
    }
    
    // Eliminar productos nuevos existentes para este scraping_result_id
    await pool.query(
      'DELETE FROM productos_nuevos WHERE scraping_result_id = $1',
      [scrapingResultId]
    )
    
    // Insertar un solo registro con todos los productos en JSON
    if (productosFinales.length > 0) {
      const columnas = ['scraping_result_id', 'nombre_del_producto', 'datos_producto_nuevo']
      const valores = [scrapingResultId, nombreProducto, JSON.stringify(productosFinales)]
      const placeholders = ['$1', '$2', '$3']
      
      if (hasFiltradoColumn && productosFiltradosGPT.length > 0) {
        columnas.push('datos_producto_nuevo_filtrado')
        valores.push(JSON.stringify(productosFiltradosGPT))
        placeholders.push('$4')
      }
      
      const query = `
        INSERT INTO productos_nuevos (${columnas.join(', ')})
        VALUES (${placeholders.join(', ')})
      `
      
      await pool.query(query, valores)
      
      console.log(`✅ [DB] ${productosFinales.length} productos nuevos guardados (agrupados en 1 registro) para scraping_result_id ${scrapingResultId}`)
      if (hasFiltradoColumn && productosFiltradosGPT.length > 0) {
        console.log(`✅ [DB] ${productosFiltradosGPT.length} productos nuevos filtrados por GPT guardados en datos_producto_nuevo_filtrado`)
      }
    } else {
      console.log(`ℹ️ [DB] No hay productos nuevos para guardar después del filtro de outliers`)
    }
  } catch (error) {
    console.error('❌ [DB] Error al guardar productos nuevos:', error)
    // No lanzar error para no interrumpir el flujo principal
    if (error instanceof Error) {
      console.error('❌ [DB] Mensaje:', error.message)
    }
  }
}

/**
 * Obtiene productos nuevos de ciao.es para un scraping_result_id
 * Retorna un array de productos desde el JSON almacenado
 */
export async function getProductosNuevos(scrapingResultId: number): Promise<Array<{
  id: number
  nombre_del_producto: string
  datos_producto_nuevo: {
    title: string
    description: string
    price: number
    currency: string
    offerUrl: string | { landingUrl?: string; url?: string }
    images: Array<{ url: string; zoomUrl: string }>
  }
  datos_producto_nuevo_filtrado?: Array<{
    title: string
    description: string
    price: number
    currency: string
    offerUrl: string | { landingUrl?: string; url?: string }
    images: Array<{ url: string; zoomUrl: string }>
  }>
  created_at: string
}> | null> {
  try {
    const pool = await getPostgresConnection()
    
    // Verificar si la tabla existe
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'productos_nuevos'
      )
    `)
    
    if (!tableCheck.rows[0].exists) {
      return null
    }
    
    // Verificar si existe la columna datos_producto_nuevo_filtrado
    let hasFiltradoColumn = false
    try {
      await pool.query(`SELECT datos_producto_nuevo_filtrado FROM productos_nuevos LIMIT 1`)
      hasFiltradoColumn = true
    } catch {
      hasFiltradoColumn = false
    }
    
    const columnas = ['id', 'nombre_del_producto', 'datos_producto_nuevo', 'created_at']
    if (hasFiltradoColumn) {
      columnas.push('datos_producto_nuevo_filtrado')
    }
    
    const result = await pool.query(
      `SELECT ${columnas.join(', ')}
       FROM productos_nuevos
       WHERE scraping_result_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [scrapingResultId]
    )
    
    if (result.rows.length === 0) {
      return null
    }
    
    const row = result.rows[0]
    const productosArray = typeof row.datos_producto_nuevo === 'string' 
      ? JSON.parse(row.datos_producto_nuevo) 
      : row.datos_producto_nuevo
    
    // Verificar que es un array
    if (!Array.isArray(productosArray)) {
      console.warn('⚠️ [DB] datos_producto_nuevo no es un array, retornando null')
      return null
    }
    
    // Obtener productos filtrados si existen
    let productosFiltradosArray: any[] = []
    if (hasFiltradoColumn && row.datos_producto_nuevo_filtrado) {
      productosFiltradosArray = typeof row.datos_producto_nuevo_filtrado === 'string'
        ? JSON.parse(row.datos_producto_nuevo_filtrado)
        : row.datos_producto_nuevo_filtrado
      
      if (!Array.isArray(productosFiltradosArray)) {
        productosFiltradosArray = []
      }
    }
    
    // Retornar un array donde cada elemento representa un producto individual
    // pero con acceso a los datos filtrados del registro completo (solo en el primer elemento)
    return productosArray.map((producto: any, index: number) => ({
      id: row.id * 1000 + index, // ID único para cada producto dentro del registro
      nombre_del_producto: row.nombre_del_producto,
      datos_producto_nuevo: {
        title: producto.title || '',
        description: producto.description || '',
        price: producto.price || 0,
        currency: producto.currency || 'EUR',
        offerUrl: producto.offerUrl || '',
        images: producto.images || []
      },
      // Solo incluir datos_producto_nuevo_filtrado en el primer elemento para evitar duplicación
      datos_producto_nuevo_filtrado: index === 0 && productosFiltradosArray.length > 0 ? productosFiltradosArray.map((p: any) => ({
        title: p.title || '',
        description: p.description || '',
        price: p.price || 0,
        currency: p.currency || 'EUR',
        offerUrl: p.offerUrl || '',
        images: p.images || []
      })) : undefined,
      created_at: row.created_at
    }))
  } catch (error) {
    console.error('Error en getProductosNuevos:', error)
    return null
  }
}
