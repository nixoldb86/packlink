# 🔐 Configurar Login por OTP (One-Time Password) con Supabase

Esta guía explica cómo configurar el login por OTP (código de un solo uso) con Supabase.

## ✅ ¿Qué se ha implementado?

Se ha agregado la funcionalidad de login por OTP al proyecto:

1. **Funciones en AuthContext:**
   - `signInWithOtp(email)` - Envía un código OTP al email del usuario
   - `verifyOtp(email, token)` - Verifica el código OTP ingresado

2. **Interfaz en AuthModal:**
   - Opción para cambiar entre login con contraseña y login con código OTP
   - Campo para ingresar el código de 6 dígitos
   - Botón para reenviar el código

3. **Traducciones:**
   - Mensajes en español e inglés para todas las acciones relacionadas con OTP

## 📧 Configuración en Supabase

### Opción 1: Magic Link (Recomendado - Por defecto)

Supabase envía un **Magic Link** (enlace mágico) por defecto. El usuario hace clic en el enlace y se autentica automáticamente.

**Ventajas:**
- ✅ No requiere configuración adicional
- ✅ Más seguro (el enlace expira)
- ✅ Mejor experiencia de usuario

**Configuración:**
1. Ve a: Supabase Dashboard → Tu proyecto → **Authentication** → **Email Templates**
2. Edita la plantilla **"Magic Link"**
3. Personaliza el email si lo deseas
4. Guarda los cambios

### Opción 2: Código OTP Numérico

Si prefieres que se envíe un código numérico de 6 dígitos en lugar de un enlace:

**Configuración:**
1. Ve a: Supabase Dashboard → Tu proyecto → **Authentication** → **Email Templates**
2. Edita la plantilla **"Magic Link"**
3. Reemplaza el contenido del email para incluir el código:

```html
<h2>Código de inicio de sesión</h2>
<p>Tu código de verificación es: <strong>{{ .Token }}</strong></p>
<p>Este código expira en 1 hora.</p>
```

**Nota:** La variable `{{ .Token }}` contiene el código de 6 dígitos.

4. Guarda los cambios

### Opción 3: Ambos (Enlace + Código)

Puedes incluir tanto el enlace como el código en el mismo email:

```html
<h2>Iniciar sesión en Pricofy</h2>
<p>Tu código de verificación es: <strong>{{ .Token }}</strong></p>
<p>O haz clic en este enlace: <a href="{{ .ConfirmationURL }}">Iniciar sesión</a></p>
<p>Este código expira en 1 hora.</p>
```

## 🔧 Configuración de Email en Supabase

### Verificar que el email está configurado:

1. Ve a: Supabase Dashboard → Tu proyecto → **Settings** → **Auth**
2. Verifica que **"Enable email confirmations"** esté activado
3. Verifica que **"Enable email change confirmations"** esté activado (opcional)

### Configurar SMTP personalizado (Opcional):

Si quieres usar tu propio servidor SMTP en lugar del servicio de email de Supabase:

1. Ve a: Supabase Dashboard → Tu proyecto → **Settings** → **Auth** → **SMTP Settings**
2. Configura tu servidor SMTP:
   - **Host:** smtp.tu-dominio.com
   - **Port:** 587 (TLS) o 465 (SSL)
   - **User:** tu-usuario-smtp
   - **Password:** tu-contraseña-smtp
   - **Sender email:** noreply@tu-dominio.com
   - **Sender name:** Pricofy

## 🧪 Probar el Login por OTP

1. **Inicia el servidor:**
   ```bash
   npm run dev
   ```

2. **Abre la aplicación:**
   - Ve a: http://localhost:3001

3. **Prueba el login por OTP:**
   - Click en "Iniciar Sesión" en el navbar
   - Click en "Iniciar sesión con código"
   - Ingresa tu email
   - Click en "Enviar Código"
   - Revisa tu email (incluyendo la carpeta de spam)
   - Ingresa el código de 6 dígitos o haz clic en el enlace mágico
   - Deberías ser autenticado automáticamente

## 📝 Notas Importantes

### Magic Link vs Código OTP

- **Magic Link:** Supabase envía un enlace único que autentica al usuario al hacer clic. Es más seguro y fácil de usar.
- **Código OTP:** Supabase envía un código numérico que el usuario debe ingresar manualmente.

### Comportamiento Actual

El código implementado funciona con **ambos métodos**:
- Si Supabase está configurado para enviar Magic Link, el usuario puede hacer clic en el enlace
- Si Supabase está configurado para enviar código, el usuario puede ingresar el código en el formulario

### Seguridad

- Los códigos OTP expiran después de 1 hora por defecto
- Los códigos solo pueden usarse una vez
- Los enlaces mágicos también expiran después de 1 hora

### Límites de Rate Limiting

Supabase tiene límites de rate limiting para prevenir abuso:
- **Email OTP:** Máximo 3 intentos por hora por email
- **Magic Link:** Máximo 3 intentos por hora por email

Si se excede el límite, el usuario deberá esperar antes de solicitar un nuevo código.

## 🔍 Solución de Problemas

### Problema: No recibo el email con el código

**Soluciones:**
1. Revisa la carpeta de spam
2. Verifica que el email esté correctamente escrito
3. Verifica que el servicio de email de Supabase esté funcionando
4. Revisa los logs en Supabase Dashboard → Logs → Auth Logs

### Problema: El código no funciona

**Soluciones:**
1. Verifica que el código no haya expirado (1 hora)
2. Verifica que el código no haya sido usado ya
3. Solicita un nuevo código si es necesario

### Problema: Error "Email rate limit exceeded"

**Solución:**
- Espera 1 hora antes de solicitar un nuevo código
- O usa el método de login con contraseña temporalmente

## ✅ ¡Listo!

Ahora los usuarios pueden:
- ✅ Iniciar sesión con Google OAuth
- ✅ Iniciar sesión con email y contraseña
- ✅ Iniciar sesión con código OTP (Magic Link o código numérico)
- ✅ Cambiar entre métodos de autenticación fácilmente




