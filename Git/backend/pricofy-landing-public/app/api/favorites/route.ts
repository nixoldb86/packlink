import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPostgresConnection } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/favorites
 * Obtiene los favoritos del usuario autenticado (búsquedas y anuncios)
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener usuario autenticado
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    const pool = await getPostgresConnection()
    
    // Obtener favoritos de búsquedas
    const evaluacionesFavoritasResult = await pool.query(
      `SELECT evaluacion_id FROM user_favorites 
       WHERE user_id = $1 AND tipo = 'evaluacion'`,
      [user.id]
    )
    const evaluacionesFavoritas = evaluacionesFavoritasResult.rows.map(row => row.evaluacion_id)
    
    // Obtener favoritos de anuncios
    const anunciosFavoritosResult = await pool.query(
      `SELECT url_anuncio FROM user_favorites 
       WHERE user_id = $1 AND tipo = 'anuncio'`,
      [user.id]
    )
    const anunciosFavoritos = anunciosFavoritosResult.rows.map(row => row.url_anuncio)
    
    return NextResponse.json({
      evaluaciones: evaluacionesFavoritas,
      anuncios: anunciosFavoritos
    })
  } catch (error) {
    console.error('Error al obtener favoritos:', error)
    return NextResponse.json(
      { error: 'Error al obtener favoritos' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/favorites
 * Guarda o elimina un favorito (búsqueda o anuncio)
 * Body: { tipo: 'evaluacion' | 'anuncio', id: number | string, agregar: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    // Obtener usuario autenticado
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { tipo, id, agregar } = body
    
    if (!tipo || (tipo !== 'evaluacion' && tipo !== 'anuncio') || id === undefined || typeof agregar !== 'boolean') {
      return NextResponse.json(
        { error: 'Datos inválidos' },
        { status: 400 }
      )
    }

    const pool = await getPostgresConnection()
    
    // Crear tabla si no existe
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS user_favorites (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          tipo TEXT NOT NULL CHECK (tipo IN ('evaluacion', 'anuncio')),
          evaluacion_id INTEGER,
          url_anuncio TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `)
      
      // Crear índices únicos si no existen (evita errores si ya existen)
      try {
        await pool.query(`
          CREATE UNIQUE INDEX IF NOT EXISTS user_favorites_evaluacion_unique 
          ON user_favorites(user_id, tipo, evaluacion_id) 
          WHERE evaluacion_id IS NOT NULL
        `)
      } catch (idxError: any) {
        // Ignorar si el índice ya existe
        if (!idxError.message.includes('already exists') && !idxError.message.includes('duplicate')) {
          console.error('Error al crear índice para evaluaciones:', idxError)
        }
      }
      
      try {
        await pool.query(`
          CREATE UNIQUE INDEX IF NOT EXISTS user_favorites_anuncio_unique 
          ON user_favorites(user_id, tipo, url_anuncio) 
          WHERE url_anuncio IS NOT NULL
        `)
      } catch (idxError: any) {
        // Ignorar si el índice ya existe
        if (!idxError.message.includes('already exists') && !idxError.message.includes('duplicate')) {
          console.error('Error al crear índice para anuncios:', idxError)
        }
      }
    } catch (createError: any) {
      // Si la tabla ya existe o hay otro error, continuar
      if (!createError.message.includes('already exists')) {
        console.error('Error al crear tabla user_favorites:', createError)
      }
    }
    
    if (agregar) {
      // Agregar favorito
      if (tipo === 'evaluacion') {
        try {
          // Verificar si ya existe antes de insertar
          const existe = await pool.query(
            `SELECT id FROM user_favorites 
             WHERE user_id = $1 AND tipo = $2 AND evaluacion_id = $3`,
            [user.id, tipo, id]
          )
          
          if (existe.rows.length === 0) {
            await pool.query(
              `INSERT INTO user_favorites (user_id, tipo, evaluacion_id) 
               VALUES ($1, $2, $3)`,
              [user.id, tipo, id]
            )
          }
        } catch (insertError: any) {
          // Si falla por constraint único, ignorar (ya existe)
          if (!insertError.message.includes('duplicate key') && !insertError.message.includes('unique')) {
            throw insertError
          }
        }
      } else {
        try {
          // Verificar si ya existe antes de insertar
          const existe = await pool.query(
            `SELECT id FROM user_favorites 
             WHERE user_id = $1 AND tipo = $2 AND url_anuncio = $3`,
            [user.id, tipo, id]
          )
          
          if (existe.rows.length === 0) {
            await pool.query(
              `INSERT INTO user_favorites (user_id, tipo, url_anuncio) 
               VALUES ($1, $2, $3)`,
              [user.id, tipo, id]
            )
          }
        } catch (insertError: any) {
          // Si falla por constraint único, ignorar (ya existe)
          if (!insertError.message.includes('duplicate key') && !insertError.message.includes('unique')) {
            throw insertError
          }
        }
      }
    } else {
      // Eliminar favorito
      if (tipo === 'evaluacion') {
        await pool.query(
          `DELETE FROM user_favorites 
           WHERE user_id = $1 AND tipo = $2 AND evaluacion_id = $3`,
          [user.id, tipo, id]
        )
      } else {
        await pool.query(
          `DELETE FROM user_favorites 
           WHERE user_id = $1 AND tipo = $2 AND url_anuncio = $3`,
          [user.id, tipo, id]
        )
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al guardar favorito:', error)
    return NextResponse.json(
      { error: 'Error al guardar favorito' },
      { status: 500 }
    )
  }
}

