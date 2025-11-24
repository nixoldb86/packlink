// Función para enviar emails usando Resend (o otro servicio de email)
// Resend es gratuito hasta 3,000 emails/mes: https://resend.com

interface EmailOptions {
  to: string
  subject: string
  html: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

export interface EvaluationData {
  accion: string
  tipoProducto: string
  modeloMarca: string
  estado: string
  pais: string
  ciudad: string
  urgencia?: string | null
  accesorios?: string | null
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Si no hay API key configurada, solo logueamos (modo desarrollo)
    if (!process.env.RESEND_API_KEY) {
      console.log('📧 Email no enviado (RESEND_API_KEY no configurado):')
      console.log('To:', options.to)
      console.log('Subject:', options.subject)
      console.log('HTML:', options.html.substring(0, 200) + '...')
      return true // Retornamos true para no bloquear el flujo en desarrollo
    }

    // Importar Resend dinámicamente
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Validar y formatear el email "from"
    let fromEmail = process.env.RESEND_FROM_EMAIL || 'Pricofy <noreply@pricofy.com>'
    
    // Limpiar espacios y comillas extra
    fromEmail = fromEmail.trim().replace(/^["']|["']$/g, '')
    
    // Validar formato: debe ser email@domain.com o Name <email@domain.com>
    const emailRegex = /^[^\s<>]+@[^\s<>]+\.[^\s<>]+$/
    const nameEmailRegex = /^[^<]+<[^\s<>]+@[^\s<>]+\.[^\s<>]+>$/
    
    // Si no tiene formato válido, intentar extraer solo el email
    if (!emailRegex.test(fromEmail) && !nameEmailRegex.test(fromEmail)) {
      // Intentar extraer email del formato actual
      const emailMatch = fromEmail.match(/([^\s<>]+@[^\s<>]+\.[^\s<>]+)/)
      if (emailMatch) {
        fromEmail = emailMatch[1] // Usar solo el email sin nombre
        console.warn(`⚠️ [Email] Formato de RESEND_FROM_EMAIL inválido, usando solo email: ${fromEmail}`)
      } else {
        // Fallback a un email válido
        fromEmail = 'onboarding@resend.dev'
        console.warn(`⚠️ [Email] RESEND_FROM_EMAIL inválido, usando fallback: ${fromEmail}`)
      }
    }
    
    console.log(`📧 [Email] Enviando email desde: ${fromEmail}`)
    
    const result = await resend.emails.send({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments?.map(att => ({
        filename: att.filename,
        content: typeof att.content === 'string' 
          ? Buffer.from(att.content).toString('base64')
          : att.content.toString('base64'),
        content_type: att.contentType || 'application/pdf',
      })),
    })

    if (result.error) {
      console.error('Error enviando email:', result.error)
      return false
    }

    console.log('✅ Email enviado correctamente a:', options.to)
    return true
  } catch (error) {
    console.error('Error en sendEmail:', error)
    // No lanzamos el error para no bloquear el flujo principal
    return false
  }
}

// Función para enviar email de confirmación de contacto
export async function sendContactConfirmationEmail(
  email: string,
  language: 'es' | 'en' = 'es'
): Promise<boolean> {
  const subject = language === 'es' 
    ? 'Gracias por tu interés en Pricofy'
    : 'Thank you for your interest in Pricofy'

  const html = getContactEmailTemplate(language)

  return await sendEmail({
    to: email,
    subject,
    html,
  })
}

// Función para enviar email de confirmación de evaluación con resumen
export async function sendEvaluationConfirmationEmail(
  email: string,
  evaluationData: EvaluationData,
  language: 'es' | 'en' = 'es'
): Promise<boolean> {
  const subject = language === 'es' 
    ? 'Resumen de tu evaluación - Pricofy'
    : 'Your evaluation summary - Pricofy'

  const html = getEvaluationEmailTemplate(evaluationData, language)

  return await sendEmail({
    to: email,
    subject,
    html,
  })
}

function getContactEmailTemplate(language: 'es' | 'en'): string {
  if (language === 'es') {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gracias por tu interés</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Poppins', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">¡Gracias por tu interés!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Hola,
              </p>
              
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Gracias por contactarnos en <strong style="color: #667eea;">Pricofy</strong>. Hemos recibido tu mensaje correctamente.
              </p>
              
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Nuestro equipo revisará tu solicitud y <strong>próximamente nos pondremos en contacto contigo</strong> para proporcionarte la información que necesitas.
              </p>
              
              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                Mientras tanto, si tienes alguna pregunta, no dudes en contactarnos a través de nuestro <a href="https://pricofy.vercel.app/contacto" style="color: #667eea; text-decoration: none;">formulario de contacto</a>.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="https://pricofy.vercel.app" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Visitar Pricofy</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Saludos,<br>
                <strong>El equipo de Pricofy</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9f9f9; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 10px; color: #666666; font-size: 12px;">
                © ${new Date().getFullYear()} Pricofy. Todos los derechos reservados.
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                Este es un email automático, por favor no respondas directamente.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  } else {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank you for your interest</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Poppins', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Thank you for your interest!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Hello,
              </p>
              
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Thank you for contacting <strong style="color: #667eea;">Pricofy</strong>. We have received your message successfully.
              </p>
              
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Our team will review your request and <strong>we will contact you soon</strong> to provide you with the information you need.
              </p>
              
              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                In the meantime, if you have any questions, please feel free to contact us through our <a href="https://pricofy.vercel.app/contacto" style="color: #667eea; text-decoration: none;">contact form</a>.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="https://pricofy.vercel.app" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Visit Pricofy</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Best regards,<br>
                <strong>The Pricofy Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9f9f9; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 10px; color: #666666; font-size: 12px;">
                © ${new Date().getFullYear()} Pricofy. All rights reserved.
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                This is an automated email, please do not reply directly.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  }
}

/**
 * Envía el PDF del reporte por email al cliente
 */
export async function sendPDFReportEmail(
  email: string,
  pdfPath: string,
  language: 'es' | 'en' = 'es'
): Promise<boolean> {
  try {
    const { readFileSync } = await import('fs')
    const pdfBuffer = readFileSync(pdfPath)
    
    const subject = language === 'es'
      ? 'Tu informe de evaluación de mercado - Pricofy'
      : 'Your market evaluation report - Pricofy'

    const html = language === 'es'
      ? `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu informe de evaluación</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Poppins', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">¡Tu informe está listo!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Hola,
              </p>
              
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Hemos completado el análisis de mercado para tu producto. Adjunto encontrarás tu <strong style="color: #667eea;">informe completo en PDF</strong> con todos los detalles y recomendaciones.
              </p>
              
              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                El informe incluye:
              </p>
              
              <ul style="margin: 0 0 30px; padding-left: 20px; color: #333333; font-size: 16px; line-height: 1.8;">
                <li>Información detallada del producto</li>
                <li>Anuncios disponibles para compradores</li>
                <li>Análisis de precios y condiciones</li>
                <li>Recomendaciones personalizadas</li>
              </ul>
              
              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                Si tienes alguna pregunta sobre el informe, no dudes en contactarnos a través de nuestro <a href="https://pricofy.vercel.app/contacto" style="color: #667eea; text-decoration: none;">formulario de contacto</a>.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="https://pricofy.vercel.app" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Visitar Pricofy</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Saludos,<br>
                <strong>El equipo de Pricofy</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9f9f9; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 10px; color: #666666; font-size: 12px;">
                © ${new Date().getFullYear()} Pricofy. Todos los derechos reservados.
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                Este es un email automático, por favor no respondas directamente.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `
      : `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your evaluation report</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Poppins', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Your report is ready!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Hello,
              </p>
              
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                We have completed the market analysis for your product. Attached you will find your <strong style="color: #667eea;">complete PDF report</strong> with all the details and recommendations.
              </p>
              
              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                The report includes:
              </p>
              
              <ul style="margin: 0 0 30px; padding-left: 20px; color: #333333; font-size: 16px; line-height: 1.8;">
                <li>Detailed product information</li>
                <li>Available listings for buyers</li>
                <li>Price and condition analysis</li>
                <li>Personalized recommendations</li>
              </ul>
              
              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                If you have any questions about the report, please feel free to contact us through our <a href="https://pricofy.vercel.app/contacto" style="color: #667eea; text-decoration: none;">contact form</a>.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="https://pricofy.vercel.app" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Visit Pricofy</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Best regards,<br>
                <strong>The Pricofy Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9f9f9; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 10px; color: #666666; font-size: 12px;">
                © ${new Date().getFullYear()} Pricofy. All rights reserved.
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                This is an automated email, please do not reply directly.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `

    return await sendEmail({
      to: email,
      subject,
      html,
      attachments: [
        {
          filename: 'reporte-evaluacion-pricofy.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    })
  } catch (error) {
    console.error('Error enviando PDF por email:', error)
    return false
  }
}

function getEvaluationEmailTemplate(data: EvaluationData, language: 'es' | 'en'): string {
  // Traducir valores
  const actionText = data.accion.includes('vender') || data.accion.includes('sell') 
    ? (language === 'es' ? 'Vender' : 'Sell') 
    : (language === 'es' ? 'Comprar' : 'Buy')
  
  const conditionText = data.estado || '-'
  const urgencyText = data.urgencia || '-'
  const accessoriesText = data.accesorios || (language === 'es' ? 'Ninguno' : 'None')
  
  if (language === 'es') {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resumen de tu evaluación</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Poppins', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Resumen de tu evaluación</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Hola,
              </p>
              
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Gracias por solicitar una evaluación en <strong style="color: #667eea;">Pricofy</strong>. Hemos recibido tu solicitud. No te haremos esperar mucho, Revisa tu email dentro 5 minutos.
              </p>
              
              <!-- Resumen de datos -->
              <div style="background-color: #f9f9f9; border-radius: 8px; padding: 24px; margin: 30px 0;">
                <h2 style="margin: 0 0 20px; color: #333333; font-size: 20px; font-weight: bold;">Resumen de tu solicitud</h2>
                
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                      <strong style="color: #667eea;">Acción:</strong>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; text-align: right; color: #333333;">
                      ${actionText}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                      <strong style="color: #667eea;">Tipo de producto:</strong>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; text-align: right; color: #333333;">
                      ${data.tipoProducto || '-'}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                      <strong style="color: #667eea;">Modelo / Marca:</strong>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; text-align: right; color: #333333;">
                      ${data.modeloMarca || '-'}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                      <strong style="color: #667eea;">Estado:</strong>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; text-align: right; color: #333333;">
                      ${conditionText}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                      <strong style="color: #667eea;">Ubicación:</strong>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; text-align: right; color: #333333;">
                      ${data.ciudad}, ${data.pais}
                    </td>
                  </tr>
                  ${data.urgencia ? `
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                      <strong style="color: #667eea;">Urgencia:</strong>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; text-align: right; color: #333333;">
                      ${urgencyText}
                    </td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 10px 0;">
                      <strong style="color: #667eea;">Accesorios:</strong>
                    </td>
                    <td style="padding: 10px 0; text-align: right; color: #333333;">
                      ${accessoriesText}
                    </td>
                  </tr>
                </table>
              </div>
              
              <p style="margin: 30px 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Nuestro equipo está procesando tu solicitud y <strong>próximamente recibirás tu informe en PDF</strong> con todas las recomendaciones y análisis detallados.
              </p>
              
              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                Si tienes alguna pregunta, no dudes en contactarnos a través de nuestro <a href="https://pricofy.vercel.app/contacto" style="color: #667eea; text-decoration: none;">formulario de contacto</a>.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="https://pricofy.vercel.app" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Visitar Pricofy</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Saludos,<br>
                <strong>El equipo de Pricofy</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9f9f9; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 10px; color: #666666; font-size: 12px;">
                © ${new Date().getFullYear()} Pricofy. Todos los derechos reservados.
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                Este es un email automático, por favor no respondas directamente.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  } else {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your evaluation summary</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Poppins', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Your evaluation summary</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Hello,
              </p>
              
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Thank you for requesting an evaluation from <strong style="color: #667eea;">Pricofy</strong>. We have received your request successfully.
              </p>
              
              <!-- Resumen de datos -->
              <div style="background-color: #f9f9f9; border-radius: 8px; padding: 24px; margin: 30px 0;">
                <h2 style="margin: 0 0 20px; color: #333333; font-size: 20px; font-weight: bold;">Request summary</h2>
                
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                      <strong style="color: #667eea;">Action:</strong>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; text-align: right; color: #333333;">
                      ${actionText}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                      <strong style="color: #667eea;">Product type:</strong>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; text-align: right; color: #333333;">
                      ${data.tipoProducto || '-'}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                      <strong style="color: #667eea;">Model / Brand:</strong>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; text-align: right; color: #333333;">
                      ${data.modeloMarca || '-'}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                      <strong style="color: #667eea;">Condition:</strong>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; text-align: right; color: #333333;">
                      ${conditionText}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                      <strong style="color: #667eea;">Location:</strong>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; text-align: right; color: #333333;">
                      ${data.ciudad}, ${data.pais}
                    </td>
                  </tr>
                  ${data.urgencia ? `
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                      <strong style="color: #667eea;">Urgency:</strong>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; text-align: right; color: #333333;">
                      ${urgencyText}
                    </td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 10px 0;">
                      <strong style="color: #667eea;">Accessories:</strong>
                    </td>
                    <td style="padding: 10px 0; text-align: right; color: #333333;">
                      ${accessoriesText}
                    </td>
                  </tr>
                </table>
              </div>
              
              <p style="margin: 30px 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Our team is processing your request and <strong>you will receive your PDF report soon</strong> with all the recommendations and detailed analysis.
              </p>
              
              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                If you have any questions, please feel free to contact us through our <a href="https://pricofy.vercel.app/contacto" style="color: #667eea; text-decoration: none;">contact form</a>.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="https://pricofy.vercel.app" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Visit Pricofy</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Best regards,<br>
                <strong>The Pricofy Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9f9f9; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 10px; color: #666666; font-size: 12px;">
                © ${new Date().getFullYear()} Pricofy. All rights reserved.
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                This is an automated email, please do not reply directly.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  }
}
