// Validación de email para uso en frontend y backend
// Lista expandida de dominios temporales y desechables (más de 200 dominios)
const TEMPORARY_EMAIL_DOMAINS = [
  // Temp mail services
  'tempmail.com', 'tempmail.net', 'tempmail.org', 'tempmail.co', 'tempmail.io',
  'temp-mail.org', 'temp-mail.io', 'temp-mail.ru', 'temp-mail.com', 'temp-mail.net',
  'tempinbox.com', 'tempmailo.com', 'tmpmail.org', 'tmpmail.net', 'tmpmail.com',
  'mytemp.email', 'tempr.email', 'tempail.com', 'tempmail.de',
  
  // 10 minute mail (10minutemail.com)
  '10minutemail.com', '10minutemail.net', '10minutemail.org', '10minutemail.co.uk',
  '10minutemail.de', '10minutemail.es', '10minutemail.fr',
  '10minutemail.ml', '10minutemail.ga', '10minutemail.tk',
  // Nota: 10minutemail.com permite usar cualquier dominio personalizado
  
  // Guerrilla mail
  'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org', 'guerrillamailblock.com',
  'guerrillamail.biz', 'guerrillamail.de', 'guerrillamail.info',
  
  // Mailinator
  'mailinator.com', 'mailinator.net', 'mailinator.org',
  
  // Throwaway
  'throwaway.email', 'throwawaymail.com', 'throwawaymail.net', 'throwawaymail.org',
  
  // Yopmail
  'yopmail.com', 'yopmail.net', 'yopmail.fr', 'yopmail.org',
  
  // Mohmal
  'mohmal.com', 'mohmal.im', 'mohmal.in',
  
  // Fake inbox
  'fakeinbox.com', 'fakeinbox.net', 'fakeinbox.org',
  
  // Fakemail.net (fakemail.net)
  'fakemail.net', 'fakemail.com', 'fakemail.org', 'fakemail.co',
  'fakemail.io', 'fakemail.me', 'fakemail.tk', 'fakemail.ga',
  // Nota: fakemail.net permite usar cualquier dominio personalizado
  
  // Trash mail
  'trashmail.com', 'trashmail.net', 'trashmail.org', 'trashmail.fr',
  'dispostable.com', 'dispostable.net',
  
  // Spam services
  'spamgourmet.com', 'spamhole.com', 'spam4.me', 'spamfree24.org',
  'spambox.us', 'spam.la', 'spambog.com', 'spambog.de', 'spambog.ru',
  
  // Other common disposable
  'getnada.com', 'mintemail.com', 'meltmail.com',
  'emailondeck.com', 'sharklasers.com', 'grr.la', 'pokemail.net',
  'bccto.me', 'chacuo.net', 'anonymbox.com', 'mytrashmail.com',
  '33mail.com', 'maildrop.cc', 'mailcatch.com', 'mailmoat.com',
  'mailnull.com', 'mailtemp.info', 'mailtothis.com',
  
  // Suntuy y similares
  'suntuy.com', 'suntuy.net', 'suntuy.org',
  
  // Emailfake.com y dominios relacionados
  'emailfake.com', 'code-gmail.com', 'wotomail.com', 'dmxs8.com',
  'tiktokngon.com', 'nowpodbid.com', 'jagomail.com', 'dsantoro.es',
  
  // Otros dominios temporales comunes
  'mailinator.pl', 'mailinator2.com', 'mailinator3.com',
  'mintemail.com', 'meltmail.com', 'emailondeck.com',
  'sharklasers.com', 'guerrillamailblock.com', 'grr.la',
  'pokemail.net', 'spam4.me', 'bccto.me', 'chacuo.net',
  'mytemp.email', 'tempr.email', 'anonymbox.com',
  'mytrashmail.com', '33mail.com', 'maildrop.cc',
  'mailcatch.com', 'mailmoat.com', 'mailnull.com',
  'spamfree24.org', 'dispostable.com', 'dispostable.net',
  'mailtemp.info', 'mailtothis.com', 'mailzi.ru',
  'mintemail.com', 'meltmail.com', 'emailondeck.com',
  'sharklasers.com', 'guerrillamailblock.com',
  'grr.la', 'pokemail.net', 'spam4.me', 'bccto.me',
  'chacuo.net', 'mytemp.email', 'tempr.email',
  'anonymbox.com', 'mytrashmail.com', '33mail.com',
  'maildrop.cc', 'mailcatch.com', 'mailmoat.com',
  'mailnull.com', 'spamfree24.org', 'dispostable.com',
  
  // Más dominios temporales
  'mailnesia.com', 'mailforspam.com', 'meltmail.com',
  'mailme.lv', 'mailmetrash.com', 'mailscrap.com',
  'mailshell.com', 'mailsiphon.com', 'mailtemp.info',
  'mailtothis.com', 'mailzi.ru', 'minuteinbox.com',
  'mintemail.com', 'moburl.com', 'monemail.fr',
  'mvrht.com', 'mytrashmail.com', 'neomailbox.com',
  'nospam.ze.tc', 'nowmymail.com', 'objectmail.com',
  'obobbo.com', 'onewaymail.com', 'online.ms',
  'opayq.com', 'ordinaryamerican.net', 'otherinbox.com',
  'owlpic.com', 'pimpedupmyspace.com', 'plexolan.de',
  'pookmail.com', 'privacy.net', 'privymail.de',
  'proxymail.eu', 'punkass.com', 'putthisinyourspamdatabase.com',
  'quickinbox.com', 'rcpt.at', 'recode.me',
  'recursor.net', 'regbypass.com', 'regbypass.comsafe-mail.net',
  'safetymail.info', 'safetypost.de', 'sandelf.de',
  'saynotospams.com', 'selfdestructingmail.com', 'sendspamhere.com',
  'sharklasers.com', 'shiftmail.com', 'shmail.net',
  'shortmail.net', 'sibmail.com', 'sinnlos-mail.de',
  'slapsfromlastnight.com', 'slaskpost.se', 'smashmail.de',
  'smellfear.com', 'snakemail.com', 'sneakemail.com',
  'sofort-mail.de', 'sogetthis.com', 'soodonims.com',
  'spam.la', 'spamavert.com', 'spambob.com',
  'spambob.org', 'spambog.com', 'spambog.de',
  'spambog.ru', 'spambox.us', 'spamex.com',
  'spamfree24.org', 'spamfree24.de', 'spamfree24.eu',
  'spamfree24.net', 'spamfree24.org', 'spamgourmet.com',
  'spamgourmet.net', 'spamgourmet.org', 'spamherelots.com',
  'spamhereplease.com', 'spamhole.com', 'spamify.com',
  'spaminator.de', 'spamkill.info', 'spaml.com',
  'spaml.de', 'spammotel.com', 'spamobox.com',
  'spamspot.com', 'spamthis.co.uk', 'spamthisplease.com',
  'speed.1s.fr', 'stuffmail.de', 'super-auswahl.de',
  'supergreatmail.com', 'supermailer.jp', 'superrito.com',
  'tagyourself.com', 'teewars.org', 'teleosaurs.xyz',
  'teleworm.com', 'temp-mail.org', 'temp-mail.ru',
  'tempalias.com', 'tempe-mail.com', 'tempemail.biz',
  'tempemail.com', 'tempinbox.co.uk', 'tempinbox.com',
  'tempmail.com', 'tempmail.de', 'tempmail.it',
  'tempmail.net', 'tempmail.org', 'tempmail.us',
  'tempmail2.com', 'tempmailer.com', 'tempmailer.de',
  'tempomail.fr', 'temporarily.de', 'temporarioemail.com.br',
  'tempthe.net', 'thankyou2010.com', 'thisisnotmyrealemail.com',
  'throwaway.email', 'throwawaymail.com', 'tilien.com',
  'tmail.ws', 'tmailinator.com', 'toiea.com',
  'tradermail.info', 'trash-amil.com', 'trash-mail.at',
  'trash-mail.com', 'trash-mail.de', 'trash2009.com',
  'trashemail.de', 'trashmail.at', 'trashmail.com',
  'trashmail.de', 'trashmail.me', 'trashmail.net',
  'trashmail.org', 'trashymail.com', 'turual.com',
  'twinmail.de', 'tyldd.com', 'uggsrock.com',
  'umail.net', 'upliftnow.com', 'uplipht.com',
  'uroid.com', 'us.af', 'venompen.com',
  'veryrealemail.com', 'viditag.com', 'viewcastmedia.com',
  'viewcastmedia.net', 'viewcastmedia.org', 'webemail.me',
  'webm4il.info', 'wh4f.org', 'whyspam.me',
  'willselfdestruct.com', 'winemaven.info', 'wronghead.com',
  'wuzup.net', 'wuzupmail.net', 'xagloo.com',
  'xemaps.com', 'xents.com', 'xmaily.com',
  'xoxy.net', 'yapped.net', 'yeah.net',
  'yep.it', 'yogamaven.com', 'yopmail.com',
  'yopmail.fr', 'yopmail.net', 'youmailr.com',
  'ypmail.webyn.com', 'zippymail.info', 'zoemail.com',
  'zoemail.net', 'zoemail.org',
]

export function validateEmail(email: string): { valid: boolean; error?: string } {
  // Validación de formato básico
  if (!email || email.trim().length === 0) {
    return { valid: false, error: 'El email es obligatorio' }
  }

  // Validación de formato más estricta (RFC 5322 simplificado)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'El formato del email no es válido' }
  }

  // Validar longitud (máximo 254 caracteres según RFC)
  if (email.length > 254) {
    return { valid: false, error: 'El email es demasiado largo' }
  }

  // Validar que no tenga espacios
  if (email.includes(' ')) {
    return { valid: false, error: 'El email no puede contener espacios' }
  }

  // Validar que tenga exactamente un @
  const atCount = (email.match(/@/g) || []).length
  if (atCount !== 1) {
    return { valid: false, error: 'El email debe contener exactamente un símbolo @' }
  }

  // Extraer dominio
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) {
    return { valid: false, error: 'El dominio del email no es válido' }
  }

  // Validar que el dominio tenga al menos un punto
  if (!domain.includes('.')) {
    return { valid: false, error: 'El dominio del email debe contener un punto' }
  }

  // Validar que el dominio no termine en punto
  if (domain.endsWith('.')) {
    return { valid: false, error: 'El dominio del email no puede terminar en punto' }
  }

  // Extraer partes del dominio para validaciones adicionales
  const domainParts = domain.split('.')
  const domainName = domainParts[0]

  // Verificar dominios temporales conocidos
  if (TEMPORARY_EMAIL_DOMAINS.some(temp => domain === temp || domain.endsWith('.' + temp))) {
    return { valid: false, error: 'No se permiten emails temporales o desechables' }
  }

  // Patrones sospechosos en el dominio (más agresivos)
  const suspiciousPatterns = [
    /^temp/i,                    // temp*
    /^fake/i,                    // fake*
    /^test/i,                    // test*
    /^throwaway/i,               // throwaway*
    /^disposable/i,             // disposable*
    /^spam/i,                    // spam*
    /^trash/i,                   // trash*
    /^dummy/i,                   // dummy*
    /^example/i,                 // example*
    /^invalid/i,                 // invalid*
    /^noreply/i,                 // noreply*
    /^no-reply/i,                // no-reply*
    /^donotreply/i,             // donotreply*
    /^do-not-reply/i,           // do-not-reply*
    /temp/i,                     // *temp* (cualquier parte)
    /fake/i,                     // *fake* (cualquier parte)
    /throwaway/i,               // *throwaway* (cualquier parte)
    /disposable/i,              // *disposable* (cualquier parte)
    /spam/i,                     // *spam* (cualquier parte)
    /trash/i,                    // *trash* (cualquier parte)
    /^tmp/i,                     // tmp*
    /^tmpmail/i,                 // tmpmail*
    /^tempmail/i,                // tempmail*
    /^mohmal/i,                  // mohmal*
    /^yopmail/i,                 // yopmail*
    /^mailinator/i,              // mailinator*
    /^guerrilla/i,               // guerrilla*
    /^10minute/i,                // 10minute*
    /^minutemail/i,              // minutemail*
    /^suntuy/i,                  // suntuy* (el dominio que reportaste)
    /^maildrop/i,                // maildrop*
    /^bccto/i,                   // bccto*
    /^chacuo/i,                  // chacuo*
    /^anonym/i,                  // anonym*
    /^meltmail/i,                // meltmail*
    /^mintemail/i,               // mintemail*
    /^getnada/i,                 // getnada*
    /^emailfake/i,               // emailfake*
    /^code-gmail/i,              // code-gmail* (dominio común de emailfake)
    /^wotomail/i,                // wotomail*
    /^dmxs/i,                    // dmxs* (patrón común)
    /^tiktokngon/i,              // tiktokngon*
    /^nowpodbid/i,               // nowpodbid*
    /^jagomail/i,                // jagomail*
    /^dsantoro/i,                // dsantoro*
    /^fakemail/i,                // fakemail* (fakemail.net)
    /^10minutemail/i,            // 10minutemail* (10minutemail.com)
  ]
  
  // Verificar si el dominio contiene algún patrón sospechoso
  if (suspiciousPatterns.some(pattern => pattern.test(domain))) {
    return { valid: false, error: 'No se permiten emails temporales o desechables' }
  }
  
  // Detectar dominios que parecen generados aleatoriamente (muy poco comunes)
  // Primero definimos qué dominios son conocidos y legítimos
  const commonDomains = ['gmail', 'yahoo', 'hotmail', 'outlook', 'icloud', 'protonmail', 'aol', 'mail', 'live', 'msn', 'proton', 'zoho', 'mailbox', 'gmx', 'yandex', 'me', 'co', 'edu', 'gov']
  const isKnownDomain = commonDomains.some(common => domainName.includes(common))
  
  // Detectar dominios sospechosos: dominios muy cortos o con caracteres aleatorios
  // Los servicios de email temporal (emailfake, 10minutemail, fakemail) suelen generar dominios con patrones específicos
  const suspiciousDomainPatterns = [
    /^[a-z]{4,6}\d{1,3}\.(com|net|org|es|co|io|me|tk|ga|ml)$/i,  // Ej: dmxs8.com, code123.net
    /^[a-z]{8,12}(ngon|bid|mail|gmail|fake|minute)\.(com|net|org|es|co|io|me|tk|ga|ml)$/i,  // Ej: tiktokngon.com, nowpodbid.com
    /^[a-z]{6,10}[-_]?(gmail|mail|fake|temp|minute)\.(com|net|org|es|co|io|me|tk|ga|ml)$/i,  // Ej: code-gmail.com, fake-mail.com
    /^[a-z]{5,10}\d{2,4}\.(com|net|org|es|co|io|me|tk|ga|ml)$/i,  // Ej: wotomail24.com
    /^[a-z]{6,10}(santoro|ngon|bid|podbid|minute|fake)\.(com|net|org|es|co|io|me|tk|ga|ml)$/i,  // Ej: dsantoro.es, tiktokngon.com
    // Patrones específicos para 10minutemail y fakemail
    /^[a-z]{6,12}(minute|minutemail|fakemail)\.(com|net|org|es|co|io|me|tk|ga|ml)$/i,  // Ej: testminutemail.com
    /^[a-z]{4,8}[0-9]{1,4}(minute|fake|temp)\.(com|net|org|es|co|io|me|tk|ga|ml)$/i,  // Ej: test123minute.com
  ]
  
  if (suspiciousDomainPatterns.some(pattern => pattern.test(domain))) {
    return { valid: false, error: 'No se permiten emails temporales o desechables' }
  }
  
  // Detectar dominios con caracteres aleatorios seguidos (patrón común de emailfake, 10minutemail, fakemail)
  // Ejemplos: dmxs8, tiktokngon, nowpodbid - tienen secuencias aleatorias de letras
  const randomCharPattern = /^[a-z]{4,8}[a-z]{4,8}\d{0,3}\.(com|net|org|es|co|io|me|tk|ga|ml)$/i
  if (randomCharPattern.test(domain) && !isKnownDomain) {
    // Si el dominio parece tener caracteres aleatorios y no es conocido, es sospechoso
    const hasRepeatingPattern = /([a-z])\1{2,}/i.test(domainName) // 3 o más caracteres repetidos
    const hasRandomSequence = /[a-z]{6,}[^aeiou]{4,}/i.test(domainName) // Muchas consonantes seguidas
    // Detectar patrones comunes de 10minutemail y fakemail (combinaciones de números y letras)
    const hasNumberLetterPattern = /[0-9]{2,}[a-z]{3,}|[a-z]{3,}[0-9]{2,}/i.test(domainName) // Números seguidos de letras o viceversa
    if (hasRandomSequence || (hasRepeatingPattern && domainName.length < 8) || hasNumberLetterPattern) {
      return { valid: false, error: 'No se permiten emails temporales o desechables' }
    }
  }
  
  // Detección adicional para servicios que permiten dominios personalizados
  // 10minutemail.com y fakemail.net permiten usar cualquier dominio
  // Detectamos dominios que terminan con patrones sospechosos pero no son conocidos
  const suspiciousSuffixes = ['minute', 'fakemail', 'tempemail', 'tmpmail', 'disposable']
  const hasSuspiciousSuffix = suspiciousSuffixes.some(suffix => domainName.toLowerCase().includes(suffix))
  if (hasSuspiciousSuffix && !isKnownDomain) {
    return { valid: false, error: 'No se permiten emails temporales o desechables' }
  }
  
  // Si un dominio tiene menos de 4 caracteres antes del TLD y no es conocido, es sospechoso
  
  if (!isKnownDomain && domainName.length < 4 && domainParts.length === 2) {
    // Dominio muy corto y no conocido = probablemente temporal
    return { valid: false, error: 'No se permiten emails temporales o desechables' }
  }

  // Validar estructura del dominio (debe tener TLD válido)
  if (domainParts.length < 2) {
    return { valid: false, error: 'El dominio del email no es válido' }
  }

  const tld = domainParts[domainParts.length - 1]
  if (tld.length < 2 || tld.length > 63) {
    return { valid: false, error: 'El dominio del email no es válido' }
  }

  // Validar que el dominio no contenga caracteres inválidos
  if (!/^[a-z0-9.-]+$/.test(domain)) {
    return { valid: false, error: 'El dominio contiene caracteres inválidos' }
  }

  // Validar que no tenga puntos consecutivos
  if (domain.includes('..')) {
    return { valid: false, error: 'El dominio no puede tener puntos consecutivos' }
  }

  // Validar que no empiece o termine con guión o punto
  const domainWithoutTLD = domain.substring(0, domain.lastIndexOf('.'))
  if (domainWithoutTLD.startsWith('-') || domainWithoutTLD.startsWith('.') ||
      domainWithoutTLD.endsWith('-') || domainWithoutTLD.endsWith('.')) {
    return { valid: false, error: 'El formato del dominio no es válido' }
  }

  return { valid: true }
}

