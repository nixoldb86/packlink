import { NextRequest, NextResponse } from 'next/server'
import { saveContacto } from '@/lib/db'
import { validateEmail } from '@/lib/emailValidator'
import { sendContactConfirmationEmail } from '@/lib/email'

// Evitar que Next.js intente pre-renderizar esta ruta durante el build
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    console.log('=== Inicio de procesamiento de contacto ===')
    const body = await request.json()
    console.log('Body recibido:', { nombre: body.nombre, email: body.email })

    const { nombre, email, telefono, comentario } = body
    
    if (!nombre || !email || !telefono || !comentario) {
      console.log('Datos faltantes:', { nombre: !!nombre, email: !!email, telefono: !!telefono, comentario: !!comentario })
    }

    // Validar email
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: emailValidation.error || 'El email no es válido' },
        { status: 400 }
      )
    }

    // Validar datos requeridos
    if (!nombre || !nombre.trim()) {
      return NextResponse.json(
        { error: 'El nombre es obligatorio' },
        { status: 400 }
      )
    }

    if (!telefono || !telefono.trim()) {
      return NextResponse.json(
        { error: 'El número de teléfono es obligatorio' },
        { status: 400 }
      )
    }

    if (!comentario || !comentario.trim()) {
      return NextResponse.json(
        { error: 'El comentario es obligatorio' },
        { status: 400 }
      )
    }

    if (comentario.trim().length < 10) {
      return NextResponse.json(
        { error: 'El comentario debe tener al menos 10 caracteres' },
        { status: 400 }
      )
    }

    // Validar formato de teléfono
    if (!/^[\d\s\-\+\(\)]+$/.test(telefono)) {
      return NextResponse.json(
        { error: 'El formato del teléfono no es válido' },
        { status: 400 }
      )
    }

    // Guardar en base de datos SQL
    console.log('Guardando contacto en BD...')
    const result = await saveContacto({
      nombre: nombre.trim(),
      email: email.trim(),
      telefono: telefono.trim(),
      comentario: comentario.trim(),
    })
    console.log('Contacto guardado, resultado:', result)

    // Extraer el ID del resultado (MySQL retorna OkPacket o ResultSetHeader)
    const resultAny = result as any
    const insertId = resultAny.insertId || resultAny.id || (Array.isArray(resultAny) ? resultAny[0]?.insertId : null)

    // Detectar idioma desde headers (Accept-Language)
    const acceptLanguage = request.headers.get('accept-language') || ''
    const language: 'es' | 'en' = acceptLanguage.includes('en') && !acceptLanguage.includes('es') ? 'en' : 'es'
    
    // Enviar email de confirmación de contacto (no bloquea el flujo si falla)
    try {
      await sendContactConfirmationEmail(email.trim(), language)
    } catch (emailError) {
      console.error('Error enviando email de confirmación (no crítico):', emailError)
      // No bloqueamos el flujo si falla el email
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Mensaje de contacto guardado correctamente',
        id: insertId || null
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('=== Error al procesar el contacto ===')
    console.error('Error completo:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

