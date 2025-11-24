import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Proteger solo la ruta /admin
  if (pathname.startsWith('/admin')) {
    // Verificar si hay una variable de entorno para la contraseña
    // Limpiar espacios y saltos de línea que puedan venir del .env.local
    const adminPassword = process.env.ADMIN_PASSWORD?.trim() || ''
    const adminUsername = (process.env.ADMIN_USERNAME || 'admin').trim()
    
    // Log para debugging (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔒 Middleware ejecutado para:', pathname)
      console.log('🔍 Variables detectadas:', {
        hasPassword: !!adminPassword,
        hasUsername: !!process.env.ADMIN_USERNAME,
        username: adminUsername,
      })
      console.log('🔍 ADMIN_PASSWORD crudo (primeros 20):', process.env.ADMIN_PASSWORD?.substring(0, 20))
      console.log('🔍 ADMIN_PASSWORD después de trim (primeros 20):', adminPassword.substring(0, 20))
      console.log('🔍 ADMIN_PASSWORD length:', adminPassword.length)
    }
    
    if (!adminPassword) {
      // Si no hay contraseña configurada, denegar acceso
      console.error('❌ ADMIN_PASSWORD no está configurada')
      return new NextResponse('Admin access not configured. Please set ADMIN_PASSWORD environment variable.', { 
        status: 503,
        headers: {
          'Content-Type': 'text/plain',
        },
      })
    }

    // Verificar autenticación básica
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      // Retornar respuesta 401 con header de autenticación
      if (process.env.NODE_ENV === 'development') {
        console.log('🔒 No hay header de autenticación, solicitando credenciales')
      }
      return new NextResponse('Authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Area", charset="UTF-8"',
          'Content-Type': 'text/plain',
        },
      })
    }

    // Decodificar las credenciales
    try {
      const base64Credentials = authHeader.split(' ')[1]
      const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8')
      const [username, password] = credentials.split(':')

      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Credenciales recibidas:', {
          username,
          passwordLength: password?.length,
          expectedUsername: adminUsername,
        })
      }

      // Verificar credenciales
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Comparando credenciales:')
        console.log('  Username recibido:', JSON.stringify(username))
        console.log('  Username esperado:', JSON.stringify(adminUsername))
        console.log('  Username coincide:', username === adminUsername)
        console.log('  Password recibida length:', password.length)
        console.log('  Password esperada length:', adminPassword.length)
        console.log('  Password recibida (primeros 5):', password.substring(0, 5))
        console.log('  Password esperada (primeros 5):', adminPassword.substring(0, 5))
        console.log('  Password recibida (últimos 5):', password.substring(password.length - 5))
        console.log('  Password esperada (últimos 5):', adminPassword.substring(adminPassword.length - 5))
        console.log('  Password coincide:', password === adminPassword)
        console.log('  Password contiene espacios:', password.includes(' ') || adminPassword.includes(' '))
        console.log('  Password contiene saltos de línea:', password.includes('\n') || password.includes('\r'))
      }

      if (username !== adminUsername || password !== adminPassword) {
        if (process.env.NODE_ENV === 'development') {
          console.log('❌ Credenciales incorrectas')
          if (username !== adminUsername) {
            console.log('  ❌ Username no coincide')
          }
          if (password !== adminPassword) {
            console.log('  ❌ Password no coincide')
          }
        }
        return new NextResponse('Invalid credentials', {
          status: 401,
          headers: {
            'WWW-Authenticate': 'Basic realm="Admin Area", charset="UTF-8"',
            'Content-Type': 'text/plain',
          },
        })
      }

      // Credenciales correctas
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Credenciales correctas, permitiendo acceso')
      }
    } catch (error) {
      console.error('Error decodificando credenciales:', error)
      return new NextResponse('Invalid authentication format', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Area", charset="UTF-8"',
          'Content-Type': 'text/plain',
        },
      })
    }
  }

  // Permitir acceso si pasa la autenticación
  return NextResponse.next()
}

// Aplicar middleware solo a la ruta /admin
export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
  ],
}

