// Generador de PDFs para reportes de scraping
// NOTA: Puppeteer se usa SOLO para generar PDFs desde HTML, NO para scraping
import puppeteer from 'puppeteer'
import { join } from 'path'
import { readFileSync } from 'fs'

interface ScrapingResultData {
  id: number
  solicitud_id: number
  producto_text: string
  categoria: string
  ubicacion: string
  radio_km: number
  condicion_objetivo: string
  json_compradores: any
  tabla_compradores: any[]
  todas_urls_encontradas: string[]
  total_anuncios_encontrados: number
  total_anuncios_filtrados: number
  plataformas_consultadas: string[]
  created_at: string
  // Datos del usuario
  email: string
  pais: string
  ciudad: string
  modelo_marca: string
  tipo_producto: string
  estado: string
}

/**
 * Genera un PDF con los resultados del scraping
 */
export async function generarPDFReporte(
  data: ScrapingResultData,
  outputPath: string
): Promise<string> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()
    
    // Leer el logo como base64
    const logoPath = join(process.cwd(), 'public', 'images', 'logo_sin_Fondo.png')
    let logoBase64 = ''
    try {
      const logoBuffer = readFileSync(logoPath)
      logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`
    } catch (error) {
      console.warn('⚠️ No se pudo cargar el logo, continuando sin él')
    }

    // Generar HTML del reporte
    const html = generarHTMLReporte(data, logoBase64)

    // Configurar el contenido
    await page.setContent(html, { waitUntil: 'networkidle0' })

    // Generar PDF
    await page.pdf({
      path: outputPath,
      format: 'A4',
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
      printBackground: true,
    })

    return outputPath
  } finally {
    await browser.close()
  }
}

/**
 * Genera el HTML del reporte con el diseño de la web
 */
function generarHTMLReporte(data: ScrapingResultData, logoBase64: string): string {
  // Obtener todos los compradores
  const todosCompradores = data.json_compradores?.compradores || []
  
  // Aplicar límite si está configurado (por defecto 20)
  const maxResultadosPDF = parseInt(process.env.PDF_MAX_RESULTADOS || '20', 10)
  const compradores = todosCompradores.slice(0, maxResultadosPDF)
  
  // Log si se aplicó el límite
  if (todosCompradores.length > maxResultadosPDF) {
    console.log(`📄 [PDF] Limitando resultados: ${todosCompradores.length} → ${compradores.length} (límite: ${maxResultadosPDF})`)
  }
  
  const fecha = new Date(data.created_at).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  // Mapear condición a texto legible
  const condicionMap: Record<string, string> = {
    nuevo: 'Nuevo',
    como_nuevo: 'Como nuevo',
    muy_buen_estado: 'Muy buen estado',
    buen_estado: 'Buen estado',
    usado: 'Usado',
    aceptable: 'Aceptable',
  }

  const condicionTexto = condicionMap[data.condicion_objetivo] || data.condicion_objetivo

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte de Evaluación - Pricofy</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Poppins', sans-serif;
      color: #1f2937;
      line-height: 1.6;
      background: #ffffff;
    }

    .header {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #667eea;
    }

    .logo {
      height: 60px;
      margin-bottom: 15px;
    }

    .header-text {
      flex: 1;
    }

    .header h1 {
      font-size: 28px;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 5px;
    }

    .header p {
      color: #6b7280;
      font-size: 14px;
    }

    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }

    .section-title {
      font-size: 20px;
      font-weight: 600;
      color: #667eea;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }

    .info-item {
      background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }

    .info-label {
      font-size: 12px;
      font-weight: 500;
      color: #764ba2;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }

    .info-value {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
    }

    .compradores-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      background: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      overflow: hidden;
    }

    .compradores-table thead {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .compradores-table th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .compradores-table td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 13px;
    }

    .compradores-table tbody tr:hover {
      background: #f5f3ff;
    }

    .compradores-table tbody tr:last-child td {
      border-bottom: none;
    }

    .precio {
      font-weight: 600;
      color: #667eea;
      font-size: 14px;
    }

    .estado-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
      text-transform: capitalize;
    }

    .estado-nuevo { background: #d1fae5; color: #065f46; }
    .estado-como_nuevo { background: #dbeafe; color: #1e40af; }
    .estado-muy_buen_estado { background: #e0e7ff; color: #3730a3; }
    .estado-buen_estado { background: #fef3c7; color: #92400e; }
    .estado-usado { background: #fee2e2; color: #991b1b; }
    .estado-aceptable { background: #f3f4f6; color: #374151; }

    .url-link {
      color: #667eea;
      text-decoration: none;
      font-size: 11px;
      word-break: break-all;
    }

    .url-link:hover {
      text-decoration: underline;
    }

    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }

    .no-data {
      text-align: center;
      padding: 40px;
      color: #9ca3af;
      font-style: italic;
    }

    @media print {
      .section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    ${logoBase64 ? `<img src="${logoBase64}" alt="Pricofy Logo" class="logo">` : ''}
    <div class="header-text">
      <h1>Reporte de Evaluación de Mercado</h1>
      <p>Generado el ${fecha}</p>
    </div>
  </div>

  <!-- Información del Producto -->
  <div class="section">
    <h2 class="section-title">Información del Producto</h2>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Producto</div>
        <div class="info-value">${escapeHtml(data.producto_text)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Categoría</div>
        <div class="info-value">${escapeHtml(data.tipo_producto || data.categoria)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Ubicación</div>
        <div class="info-value">${escapeHtml(data.ciudad)}, ${escapeHtml(data.pais)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Condición Objetivo</div>
        <div class="info-value">${escapeHtml(condicionTexto)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Radio de Búsqueda</div>
        <div class="info-value">${data.radio_km} km</div>
      </div>
      <div class="info-item">
        <div class="info-label">Plataformas Consultadas</div>
        <div class="info-value">${data.plataformas_consultadas?.join(', ') || 'N/A'}</div>
      </div>
    </div>
  </div>

  <!-- Anuncios para Compradores -->
  <div class="section">
    <h2 class="section-title">Anuncios Disponibles para Compradores</h2>
    ${compradores.length > 0 ? `
      <table class="compradores-table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Precio</th>
            <th>Estado</th>
            <th>Ciudad</th>
            <th>URL</th>
          </tr>
        </thead>
        <tbody>
          ${compradores.map((comprador: any) => `
            <tr>
              <td><strong>${escapeHtml(comprador.titulo || 'N/A')}</strong></td>
              <td><span class="precio">${formatPrice(comprador.precio_eur)}</span></td>
              <td><span class="estado-badge estado-${comprador.estado_declarado?.toLowerCase().replace(/\s+/g, '_') || 'usado'}">${escapeHtml(comprador.estado_declarado || 'N/A')}</span></td>
              <td>${escapeHtml(comprador.ciudad_o_zona || 'N/A')}</td>
              <td><a href="${escapeHtml(comprador.url_anuncio || '#')}" class="url-link">Ver anuncio</a></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : `
      <div class="no-data">
        No se encontraron anuncios disponibles para este producto.
      </div>
    `}
  </div>

  <!-- Footer -->
  <div class="footer">
    <p>Este reporte fue generado automáticamente por Pricofy</p>
    <p>Para más información, visita <strong>pricofy.com</strong></p>
  </div>
</body>
</html>
  `
}

/**
 * Escapa HTML para prevenir XSS
 */
function escapeHtml(text: string | null | undefined): string {
  if (!text) return 'N/A'
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Formatea el precio con formato de moneda
 */
function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) return 'N/A'
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(price)
}

