# 📧 Configurar Envío de Emails

## Resumen

Cuando un usuario solicita una evaluación de producto, automáticamente se envía un email de confirmación agradeciéndole su interés y notificándole que próximamente nos pondremos en contacto.

## 🚀 Configuración con Resend (Recomendado)

Resend ofrece un plan gratuito de **3,000 emails/mes**, perfecto para empezar.

### Paso 1: Crear cuenta en Resend

1. Ve a [resend.com](https://resend.com)
2. Crea una cuenta gratuita
3. Verifica tu email

### Paso 2: Obtener API Key

1. Una vez dentro de Resend, ve a **API Keys**
2. Haz clic en **Create API Key**
3. Dale un nombre (ej: "Pricofy Production")
4. Copia la API Key (solo se muestra una vez)

### Paso 3: Configurar dominio (Opcional pero recomendado)

Para usar un dominio personalizado (ej: `noreply@pricofy.com`):

1. Ve a **Domains** en Resend
2. Haz clic en **Add Domain**
3. Agrega tu dominio (ej: `pricofy.com`)
4. Sigue las instrucciones para verificar el dominio (agregar registros DNS)
5. Una vez verificado, podrás usar emails como `noreply@pricofy.com`

**Nota**: Si no configuras un dominio, puedes usar el dominio de prueba de Resend (limitado a desarrollo).

### Paso 4: Configurar variables de entorno

#### En `.env.local` (desarrollo):

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL="Pricofy <noreply@pricofy.com>"
```

O si no tienes dominio verificado:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL="onboarding@resend.dev"
```

#### En Vercel (producción):

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega:
   - `RESEND_API_KEY` = `re_xxxxxxxxxxxxxxxxxxxxx`
   - `RESEND_FROM_EMAIL` = `"Pricofy <noreply@pricofy.com>"` (o `"onboarding@resend.dev"` si no tienes dominio)

### Paso 5: Instalar dependencia

La dependencia `resend` ya está instalada. Si necesitas reinstalarla:

```bash
npm install resend
```

## ✅ Verificación

### En desarrollo:

1. Envía una solicitud de evaluación desde el formulario
2. Revisa la consola del servidor - deberías ver:
   - Si `RESEND_API_KEY` no está configurado: `📧 Email no enviado (RESEND_API_KEY no configurado)` - esto es normal en desarrollo
   - Si está configurado: `✅ Email enviado correctamente a: usuario@ejemplo.com`

### En producción:

1. Envía una solicitud de evaluación
2. Revisa el email del cliente
3. Debería recibir el email de confirmación con el diseño personalizado

## 📝 Contenido del Email

El email incluye:
- **Asunto**: "Gracias por tu interés en Pricofy" (ES) / "Thank you for your interest in Pricofy" (EN)
- **Mensaje**: Agradecimiento y confirmación de que se pondrán en contacto próximamente
- **Diseño**: Email HTML responsive con gradientes y estilo moderno
- **Idioma**: Se detecta automáticamente según el idioma del usuario

## 🔧 Funcionamiento Técnico

1. Cuando un usuario envía el formulario de evaluación:
   - Se guarda la solicitud en la base de datos
   - Se detecta el idioma del usuario (ES/EN)
   - Se envía automáticamente el email de confirmación
   - Si el email falla, no se bloquea el flujo (se registra el error)

2. El envío de email es **asíncrono y no bloqueante**:
   - Si falla, la solicitud se guarda igual
   - Los errores se registran en los logs pero no afectan al usuario

## 🛠️ Personalización

### Cambiar el contenido del email

Edita `lib/email.ts`, función `getEvaluationEmailTemplate()`.

### Cambiar el remitente

Actualiza la variable `RESEND_FROM_EMAIL` en tus variables de entorno.

### Cambiar el servicio de email

Si prefieres usar otro servicio (SendGrid, Mailgun, etc.), modifica `lib/email.ts` para usar su SDK.

## 📊 Límites de Resend

- **Plan gratuito**: 3,000 emails/mes
- **Plan Pro ($20/mes)**: 50,000 emails/mes
- **Ver más en**: [resend.com/pricing](https://resend.com/pricing)

## ⚠️ Notas Importantes

1. **Sin API Key configurada**: En desarrollo, si no configuras `RESEND_API_KEY`, el sistema solo logueará el email en consola (no se enviará realmente). Esto es útil para desarrollo local.

2. **Dominio verificado**: Si usas un dominio personalizado, mejora la deliverabilidad y la imagen profesional.

3. **Spam**: El email está diseñado para evitar filtros de spam, pero siempre revisa la carpeta de spam si no recibes emails.

4. **Errores**: Si hay errores al enviar el email, se registran en los logs pero no afectan la experiencia del usuario.

