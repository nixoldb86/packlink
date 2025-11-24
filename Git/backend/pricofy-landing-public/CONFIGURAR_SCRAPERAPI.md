# 🔐 Configuración de ScraperAPI

Esta guía te ayudará a configurar ScraperAPI para evitar bloqueos de Wallapop desde Vercel.

## 📋 ¿Qué es ScraperAPI?

ScraperAPI es un servicio de proxy que permite hacer scraping sin ser bloqueado. Usa IPs rotativas y maneja automáticamente headers, cookies, y JavaScript.

## 🎁 Plan Gratuito

- **5,000 requests/mes** (suficiente para ~10-20 evaluaciones/día)
- Sin tarjeta de crédito requerida
- Registro en 2 minutos

## 🚀 Pasos para Configurar

### 1. Crear Cuenta en ScraperAPI

1. Ve a https://www.scraperapi.com/signup
2. Completa el formulario de registro
3. Verifica tu email
4. Inicia sesión en el dashboard

### 2. Obtener tu API Key

1. Una vez en el dashboard, verás tu **API Key** en la parte superior
2. Copia la API Key (formato: `tu_api_key_aqui`)

### 3. Configurar en `.env.local`

Abre tu archivo `.env.local` y agrega:

```env
SCRAPERAPI_KEY=tu_api_key_aqui
```

**Ejemplo:**
```env
SCRAPERAPI_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### 4. Configurar en Vercel

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Selecciona tu proyecto **pricofy-landing**
3. Ve a **Settings** → **Environment Variables**
4. Agrega una nueva variable:
   - **Name:** `SCRAPERAPI_KEY`
   - **Value:** Tu API key de ScraperAPI
   - **Environments:** Marca todas (Production, Preview, Development)
5. Click en **Save**
6. **Re-deploy** tu aplicación para que tome efecto

### 5. Verificar que Funciona

Después de configurar, cuando ejecutes un scraping verás en los logs:

```
🔐 [Wallapop] Usando ScraperAPI para evitar bloqueos
🌍 [Wallapop] País configurado: ES (España)
📡 [Wallapop] Iniciando fetch vía ScraperAPI con timeout de 15000ms...
```

Si no está configurado, verás:

```
⚠️ [Wallapop] SCRAPERAPI_KEY no configurada, usando fetch directo (puede fallar en Vercel)
```

## 📊 Monitorear Uso

1. Ve a https://www.scraperapi.com/dashboard
2. En el dashboard verás:
   - Requests usados este mes
   - Requests restantes
   - Historial de uso

## ⚠️ Límites del Plan Gratuito

- **5,000 requests/mes**
- Si excedes el límite, ScraperAPI retornará un error
- El sistema continuará funcionando pero sin resultados de Wallapop
- Considera actualizar a un plan de pago si necesitas más

## 🔄 ¿Qué Pasa si no Configuro ScraperAPI?

Si no configuras `SCRAPERAPI_KEY`:
- El sistema intentará hacer fetch directo a Wallapop
- **Puede fallar en Vercel** porque Wallapop bloquea peticiones desde IPs de cloud providers
- El scraping continuará con otras plataformas (Milanuncios, etc.)
- Verás un warning en los logs

## 💡 Tips

1. **Monitorea tu uso:** Revisa el dashboard de ScraperAPI regularmente
2. **Optimiza requests:** Cada evaluación usa ~1-10 requests (dependiendo de páginas)
3. **Plan de pago:** Si necesitas más, el plan Starter ($29/mes) da 25,000 requests
4. **Fallback automático:** Si ScraperAPI falla, el sistema continúa sin bloquear

## 🆘 Solución de Problemas

### Error: "account" o "quota" o "limit"
- **Causa:** Has excedido el límite de 5,000 requests/mes
- **Solución:** Espera al siguiente mes o actualiza a un plan de pago

### Error: "API key inválida"
- **Causa:** La API key está mal configurada
- **Solución:** Verifica que copiaste correctamente la API key en `.env.local` y Vercel

### Timeout con ScraperAPI
- **Causa:** ScraperAPI puede ser más lento que fetch directo (1-3 segundos extra)
- **Solución:** Es normal, el timeout está configurado a 15 segundos cuando usas ScraperAPI

## 📚 Recursos

- Dashboard: https://www.scraperapi.com/dashboard
- Documentación: https://www.scraperapi.com/documentation
- Soporte: https://www.scraperapi.com/contact

