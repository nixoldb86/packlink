/**
 * Rate limiter para Nominatim API
 * Nominatim solo permite 1 petición por segundo
 */

let lastRequestTime = 0
const MIN_DELAY_MS = 1000 // 1 segundo mínimo entre peticiones

/**
 * Espera el tiempo necesario para cumplir con el rate limiting de Nominatim
 */
export async function waitForRateLimit(): Promise<void> {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
  
  if (timeSinceLastRequest < MIN_DELAY_MS) {
    const waitTime = MIN_DELAY_MS - timeSinceLastRequest
    await new Promise(resolve => setTimeout(resolve, waitTime))
  }
  
  lastRequestTime = Date.now()
}




