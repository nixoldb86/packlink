# 🛡️ Detección de Emails Temporales (EmailFake, 10MinuteMail, FakeMail)

## Problema

Los siguientes servicios permiten generar emails con **cualquier dominio**, lo que hace difícil detectarlos todos:
- [EmailFake.com](https://emailfake.com/)
- [10MinuteMail.com](https://10minutemail.com/)
- [FakeMail.net](https://www.fakemail.net/)

Sin embargo, he implementado varias capas de detección para estos servicios.

## ✅ Soluciones Implementadas

### 1. Lista de Dominios Conocidos

He agregado los dominios específicos de estos servicios:

**EmailFake.com:**
- `emailfake.com`
- `code-gmail.com`
- `wotomail.com`
- `dmxs8.com`
- `tiktokngon.com`
- `nowpodbid.com`
- `jagomail.com`
- `dsantoro.es`

**10MinuteMail.com:**
- `10minutemail.com`, `10minutemail.net`, `10minutemail.org`
- `10minutemail.co.uk`, `10minutemail.de`, `10minutemail.es`, `10minutemail.fr`
- `10minutemail.ml`, `10minutemail.ga`, `10minutemail.tk`

**FakeMail.net:**
- `fakemail.net`, `fakemail.com`, `fakemail.org`
- `fakemail.co`, `fakemail.io`, `fakemail.me`
- `fakemail.tk`, `fakemail.ga`

### 2. Patrones de Detección

He agregado patrones regex que detectan dominios con características comunes de estos servicios:

```typescript
// Patrones que detectan:
- dmxs8.com, code123.net (letras + números)
- tiktokngon.com, nowpodbid.com (patrones con "ngon", "bid", "mail")
- code-gmail.com (dominios que imitan Gmail)
- testminutemail.com (patrones con "minute", "minutemail")
- test123minute.com (números seguidos de "minute", "fake", "temp")
- Dominios con "fakemail", "minute", "tempemail" en el nombre
```

### 3. Detección de Dominios Aleatorios

El validador ahora detecta:
- Dominios muy cortos (< 4 caracteres) que no son conocidos
- Secuencias aleatorias de caracteres
- Muchas consonantes seguidas (patrón común de generadores aleatorios)
- Combinaciones de números y letras (ej: `test123minute.com`, `abc456fake.com`)
- Dominios que contienen palabras sospechosas: `minute`, `fakemail`, `tempemail`, `tmpmail`, `disposable`

### 4. Lista de Dominios Legítimos

Se mantiene una lista de dominios conocidos y legítimos:
- Gmail, Yahoo, Hotmail, Outlook, iCloud, ProtonMail, AOL, etc.

## 🔍 Cómo Funciona

1. **Primera capa:** Verifica si el dominio está en la lista de dominios temporales conocidos
2. **Segunda capa:** Verifica patrones sospechosos (temp, fake, spam, minute, fakemail, etc.)
3. **Tercera capa:** Verifica patrones específicos de estos servicios (letras+números, ngon, bid, minute, fakemail, etc.)
4. **Cuarta capa:** Verifica si el dominio parece generado aleatoriamente
5. **Quinta capa:** Detecta dominios que contienen palabras clave sospechosas (`minute`, `fakemail`, `tempemail`, etc.)

## ⚠️ Limitaciones

**Estos servicios permiten usar cualquier dominio**, por lo que:
- ❌ No podemos detectar **todos** los dominios posibles
- ✅ Pero podemos detectar la mayoría usando patrones comunes
- ✅ También detectamos dominios muy sospechosos
- ✅ Detectamos dominios que contienen palabras clave relacionadas con emails temporales

## 🚀 Mejoras Futuras

Para una detección más robusta, considera:

1. **API de verificación de emails:**
   - [ZeroBounce](https://www.zerobounce.net/) - Detecta emails temporales
   - [WhoisXML API](https://es.emailverification.whoisxmlapi.com/) - Lista de 159,000+ dominios temporales
   - [Debounce](https://debounce.io/) - API gratuita para verificar emails desechables

2. **Verificación de MX Records:**
   - Consultar DNS para verificar si el dominio tiene registros MX válidos
   - Los dominios temporales suelen tener registros MX específicos

3. **Lista blanca de dominios:**
   - Solo permitir dominios conocidos y legítimos
   - Más restrictivo pero más seguro

## 📝 Agregar Nuevos Dominios

Si encuentras un dominio de estos servicios que no se detecta:

1. **Agrégalo a la lista** `TEMPORARY_EMAIL_DOMAINS`
2. **O agrega un patrón** en `suspiciousPatterns` si es un patrón común
3. **O agrega una palabra clave** en `suspiciousSuffixes` si es un patrón común

Ejemplo:
```typescript
// En TEMPORARY_EMAIL_DOMAINS:
'elnuevodominio.com',

// O en suspiciousPatterns:
/^elnuevodominio/i,

// O en suspiciousSuffixes:
const suspiciousSuffixes = ['minute', 'fakemail', 'tempemail', 'tmpmail', 'disposable', 'elnuevopatron']
```

## ✅ Ejemplos de Detección

Ahora el sistema detecta y rechaza:
- `test@10minutemail.com` ✅
- `user@fakemail.net` ✅
- `test@emailfake.com` ✅
- `user@testminutemail.com` ✅ (patrón detectado)
- `test@abc123fake.com` ✅ (patrón detectado)
- `user@dmxs8.com` ✅ (patrón detectado)

