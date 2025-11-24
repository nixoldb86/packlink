#!/usr/bin/env node

/**
 * Script de test para verificar la generación de variantes con ChatGPT
 * 
 * Uso:
 *   node test-variantes-chatgpt.js "iPhone 17 Pro 512GB"
 *   node test-variantes-chatgpt.js "bañera flexible stokke con patas"
 */

// Simular el import de dotenv para cargar variables de entorno
require('dotenv').config({ path: '.env.local' })

async function testChatGPTVariants() {
  const productText = process.argv[2] || 'iPhone 17 Pro 512GB'
  const idioma = process.argv[3] || 'es'

  console.log('\n' + '='.repeat(80))
  console.log('TEST DE GENERACIÓN DE VARIANTES CON CHATGPT')
  console.log('='.repeat(80))
  console.log(`Producto: "${productText}"`)
  console.log(`Idioma: ${idioma}`)
  console.log('='.repeat(80))

  // Verificar API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('\n❌ ERROR: OPENAI_API_KEY no configurada')
    console.error('   Configure la variable en .env.local:')
    console.error('   OPENAI_API_KEY=sk-...')
    console.error('\n')
    process.exit(1)
  }

  console.log('\n✅ OPENAI_API_KEY configurada')
  console.log(`📋 Modelo: ${process.env.OPENAI_MODEL || 'gpt-4o-mini (por defecto)'}`)

  // Importar la función (requiere que el proyecto esté compilado o use ts-node)
  try {
    console.log('\n🤖 Llamando a ChatGPT...\n')

    // Para este test, necesitamos usar el módulo compilado o ts-node
    // Como es JavaScript puro, aquí mostramos lo que haría:
    
    const { generateSearchVariants } = require('./lib/chatgpt')
    
    const result = await generateSearchVariants(productText, idioma)

    if (result.success && result.variants) {
      console.log('\n' + '='.repeat(80))
      console.log('✅ VARIANTES GENERADAS EXITOSAMENTE')
      console.log('='.repeat(80))
      console.log(`\nTotal de variantes: ${result.variants.length}\n`)
      
      result.variants.forEach((variant, i) => {
        console.log(`  ${i + 1}. "${variant}"`)
      })
      
      console.log('\n' + '='.repeat(80))
      console.log('ANÁLISIS DE VARIANTES')
      console.log('='.repeat(80))
      
      result.variants.forEach((variant, i) => {
        const tokens = variant.toLowerCase().split(/\s+/)
        console.log(`\nVariante ${i + 1}: "${variant}"`)
        console.log(`  - Tokens: ${tokens.length}`)
        console.log(`  - Palabras: ${tokens.join(', ')}`)
      })
      
      console.log('\n' + '='.repeat(80))
      console.log('✅ Test completado exitosamente')
      console.log('='.repeat(80) + '\n')
    } else {
      console.error('\n' + '='.repeat(80))
      console.error('❌ ERROR AL GENERAR VARIANTES')
      console.error('='.repeat(80))
      console.error(`\nRazón: ${result.error}`)
      console.error('\n' + '='.repeat(80) + '\n')
      process.exit(1)
    }
  } catch (error) {
    console.error('\n' + '='.repeat(80))
    console.error('❌ ERROR DURANTE LA EJECUCIÓN')
    console.error('='.repeat(80))
    console.error('\nDetalles:', error.message)
    console.error('\nStack:', error.stack)
    console.error('\n' + '='.repeat(80))
    console.error('NOTA: Este test requiere que el proyecto esté compilado.')
    console.error('Ejecuta primero: npm run build')
    console.error('O usa: npx ts-node test-variantes-chatgpt.ts')
    console.error('='.repeat(80) + '\n')
    process.exit(1)
  }
}

// Ejecutar el test
testChatGPTVariants().catch(error => {
  console.error('Error fatal:', error)
  process.exit(1)
})

