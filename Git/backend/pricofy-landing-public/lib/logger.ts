// Sistema de logging que escribe tanto en consola como en archivo
// En Vercel: acumula logs en memoria y los sube a Backblaze B2 al finalizar
// En local: escribe directamente en archivo .log
import { appendFile, mkdir, writeFile, readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { uploadFileToS3, isCloudStorageConfigured } from './storage'

let logFile: string | null = null
let logDir: string | null = null
let logBuffer: string[] = []
let isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true'
let isInitialized = false
let isIntercepting = false // Bandera para evitar recursión infinita
let originalConsole: {
  log: typeof console.log
  error: typeof console.error
  warn: typeof console.warn
  info: typeof console.info
} | null = null

/**
 * Inicializa el sistema de logging
 */
async function initializeLogger(): Promise<void> {
  if (isInitialized) {
    return // Ya inicializado
  }

  try {
    if (isVercel) {
      // En Vercel: solo inicializar el buffer en memoria
      logBuffer = []
      logBuffer.push(`${'='.repeat(80)}\n`)
      logBuffer.push(`SCRAPING LOG - ${new Date().toISOString()}\n`)
      logBuffer.push(`${'='.repeat(80)}\n\n`)
      console.log(`📝 [Logger] Modo Vercel: logs se guardarán en Backblaze B2 al finalizar`)
    } else {
      // En local: crear archivo físico
      logDir = join(process.cwd(), 'logs')
      if (!existsSync(logDir)) {
        await mkdir(logDir, { recursive: true })
      }

      // Crear nombre de archivo con timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]
      const time = new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, '-')
      logFile = join(logDir, `scraping-${timestamp}-${time}.log`)

      // Escribir encabezado en el archivo
      await appendFile(logFile, `\n${'='.repeat(80)}\n`)
      await appendFile(logFile, `SCRAPING LOG - ${new Date().toISOString()}\n`)
      await appendFile(logFile, `${'='.repeat(80)}\n\n`)
      console.log(`📝 [Logger] Archivo de log inicializado: ${logFile}`)
    }
    
    isInitialized = true
  } catch (error) {
    console.error('Error inicializando logger:', error)
    // Continuar sin logging a archivo si falla
  }
}

/**
 * Escribe un mensaje tanto en consola como en archivo/buffer
 */
async function writeLog(level: string, message: string, skipConsole: boolean = false): Promise<void> {
  // Inicializar si es necesario
  if (!isInitialized) {
    await initializeLogger()
  }

  // Formatear mensaje con timestamp
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] [${level}] ${message}\n`

  // Escribir en consola solo si no estamos en modo de interceptación o si se solicita explícitamente
  if (!skipConsole && originalConsole) {
    // Usar la función original de console para evitar recursión
    switch (level) {
      case 'ERROR':
        originalConsole.error(message)
        break
      case 'WARN':
        originalConsole.warn(message)
        break
      default:
        originalConsole.log(message)
    }
  } else if (!skipConsole && !isIntercepting) {
    // Si no hay interceptación, usar console normal
    switch (level) {
      case 'ERROR':
        console.error(message)
        break
      case 'WARN':
        console.warn(message)
        break
      default:
        console.log(message)
    }
  }

  // Escribir en archivo o buffer
  if (isVercel) {
    // En Vercel: acumular en buffer
    logBuffer.push(logMessage)
  } else {
    // En local: escribir en archivo (sin bloquear)
    if (logFile) {
      appendFile(logFile, logMessage).catch((error) => {
        // Usar originalConsole para evitar recursión
        if (originalConsole) {
          originalConsole.error('Error escribiendo en archivo de log:', error)
        } else {
          console.error('Error escribiendo en archivo de log:', error)
        }
      })
    }
  }
}

/**
 * Sube los logs a Backblaze B2 (solo en Vercel)
 */
export async function uploadLogsToCloud(): Promise<string | null> {
  if (!isVercel || logBuffer.length === 0) {
    return null
  }

  try {
    const logContent = logBuffer.join('')
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `scraping-${timestamp}.log`
    
    // Subir a Backblaze B2
    if (isCloudStorageConfigured()) {
      const logBufferData = Buffer.from(logContent, 'utf-8')
      const logUrl = await uploadFileToS3(logBufferData, filename, 'text/plain')
      console.log(`📤 [Logger] Logs subidos a Backblaze B2: ${logUrl}`)
      return logUrl
    } else {
      console.warn(`⚠️ [Logger] Backblaze B2 no configurado, no se pueden subir logs`)
      return null
    }
  } catch (error) {
    console.error('❌ [Logger] Error subiendo logs a Backblaze B2:', error)
    return null
  }
}

/**
 * Guarda los logs en un archivo temporal y retorna la ruta (para Vercel)
 */
export async function saveLogsToFile(): Promise<string | null> {
  if (!isVercel || logBuffer.length === 0) {
    return null
  }

  try {
    const logContent = logBuffer.join('')
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `scraping-${timestamp}.log`
    
    // Crear directorio temporal si no existe
    const tempDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true })
    }
    
    const filePath = join(tempDir, filename)
    await writeFile(filePath, logContent, 'utf-8')
    
    console.log(`💾 [Logger] Logs guardados en archivo temporal: ${filePath}`)
    return filePath
  } catch (error) {
    console.error('❌ [Logger] Error guardando logs en archivo:', error)
    return null
  }
}

/**
 * Obtiene el contenido completo de los logs como string
 */
export function getLogsContent(): string {
  if (isVercel) {
    return logBuffer.join('')
  } else if (logFile) {
    // En local, leer el archivo (síncrono para evitar problemas)
    try {
      const fs = require('fs')
      return fs.readFileSync(logFile, 'utf-8')
    } catch {
      return ''
    }
  }
  return ''
}

/**
 * Logger personalizado que reemplaza console.log, console.error, etc.
 */
export const logger = {
  log: (message: string) => {
    writeLog('INFO', message)
  },
  error: (message: string) => {
    writeLog('ERROR', message)
  },
  warn: (message: string) => {
    writeLog('WARN', message)
  },
  info: (message: string) => {
    writeLog('INFO', message)
  },
  debug: (message: string) => {
    if (process.env.NODE_ENV === 'development') {
      writeLog('DEBUG', message)
    }
  },
}

/**
 * Intercepta console.log, console.error, etc. para escribir también en archivo
 */
export function interceptConsole(): void {
  // Guardar referencias originales solo una vez
  if (!originalConsole) {
    originalConsole = {
      log: console.log.bind(console),
      error: console.error.bind(console),
      warn: console.warn.bind(console),
      info: console.info.bind(console),
    }
  }

  // Evitar interceptar múltiples veces
  if (isIntercepting) {
    return
  }

  isIntercepting = true

  console.log = (...args: any[]) => {
    originalConsole!.log(...args)
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ')
    writeLog('INFO', message, true) // skipConsole=true para evitar recursión
  }

  console.error = (...args: any[]) => {
    originalConsole!.error(...args)
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ')
    writeLog('ERROR', message, true) // skipConsole=true para evitar recursión
  }

  console.warn = (...args: any[]) => {
    originalConsole!.warn(...args)
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ')
    writeLog('WARN', message, true) // skipConsole=true para evitar recursión
  }

  console.info = (...args: any[]) => {
    originalConsole!.info(...args)
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ')
    writeLog('INFO', message, true) // skipConsole=true para evitar recursión
  }
}

/**
 * Obtiene la ruta del archivo de log actual (solo en local)
 */
export function getLogFile(): string | null {
  return logFile
}

/**
 * Inicializa el logger e intercepta console
 */
export async function setupLogger(): Promise<void> {
  await initializeLogger()
  interceptConsole()
}

