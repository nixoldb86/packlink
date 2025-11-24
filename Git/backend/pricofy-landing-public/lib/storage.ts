// Configuración de almacenamiento en la nube (S3/Backblaze B2)
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// Backblaze B2 es compatible con S3, solo necesitamos configurar el endpoint
const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT, // Para Backblaze B2: https://s3.us-west-000.backblazeb2.com
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true', // Necesario para Backblaze B2
})

const BUCKET_NAME = process.env.S3_BUCKET_NAME || ''

/**
 * Sube un archivo a S3/Backblaze B2
 * @param file Buffer del archivo
 * @param filename Nombre del archivo
 * @param contentType Tipo MIME del archivo
 * @returns URL pública del archivo
 */
export async function uploadFileToS3(
  file: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  try {
    const key = `uploads/${filename}`
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
      // Hacer el archivo público (opcional)
      ACL: process.env.S3_MAKE_PUBLIC === 'true' ? 'public-read' : undefined,
    })

    await s3Client.send(command)

    // Construir la URL pública
    // Para Backblaze B2: https://f000.backblazeb2.com/file/bucket-name/uploads/filename
    // Para S3: https://bucket-name.s3.region.amazonaws.com/uploads/filename
    if (process.env.S3_PUBLIC_URL) {
      // Si hay una URL pública configurada (típico en Backblaze B2)
      return `${process.env.S3_PUBLIC_URL}/${key}`
    } else if (process.env.S3_ENDPOINT) {
      // Usar el endpoint como base
      const baseUrl = process.env.S3_ENDPOINT.replace(/\/$/, '')
      return `${baseUrl}/${BUCKET_NAME}/${key}`
    } else {
      // S3 estándar
      const region = process.env.S3_REGION || 'us-east-1'
      return `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`
    }
  } catch (error) {
    console.error('Error uploading file to S3:', error)
    throw new Error('Error al subir el archivo')
  }
}

/**
 * Verifica si el almacenamiento en la nube está configurado
 */
export function isCloudStorageConfigured(): boolean {
  return !!(
    process.env.S3_ACCESS_KEY_ID &&
    process.env.S3_SECRET_ACCESS_KEY &&
    process.env.S3_BUCKET_NAME
  )
}

