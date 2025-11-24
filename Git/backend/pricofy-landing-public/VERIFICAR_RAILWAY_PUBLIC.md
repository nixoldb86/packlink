# 🔍 Verificar Acceso Público en Railway

## Paso 1: Habilitar Public Network en Railway

1. **Ve a Railway:** https://railway.app
2. **Click en tu proyecto** → **Click en MySQL**
3. **En el menú superior, busca:**
   - "Settings" o "Network" o "Configuration"
   - **Click en:** "Settings" o "Network"

4. **Busca la opción "Public Network" o "Public Access":**
   - Debería haber un toggle o switch
   - **Habilítalo** (actívalo)
   - Espera 2-3 minutos a que se configure

5. **Vuelve a la pestaña "Connect":**
   - Ahora deberías ver una nueva sección "Public Network"
   - Copia el host público (NO el proxy interno)

## Paso 2: Obtener el Host Público

Una vez habilitado Public Network:

1. **En Railway, ve a tu MySQL** → **"Connect"**
2. **Busca la sección "Public Network"**
3. **Deberías ver algo como:**
   ```
   Host: [tu-host].railway.app
   Port: 3306
   ```
   O puede ser:
   ```
   Host: mysql.railway.app
   Port: [puerto-público]
   ```

4. **Copia este host público** (no el proxy interno)

## Paso 3: Actualizar Vercel

1. **Ve a Vercel:** https://vercel.com
2. **Tu proyecto** → **Settings** → **Environment Variables**
3. **Edita `DB_HOST`:**
   - Cambia de: `gondola.proxy.rlwy.net`
   - A: El host público que copiaste (ej: `xxxxxx.railway.app`)
4. **Edita `DB_PORT`:**
   - Si el host público usa un puerto diferente, cámbialo
   - Normalmente es `3306`
5. **Guarda los cambios**
6. **Haz un nuevo deploy**

## Si NO puedes habilitar Public Network

Si Railway no te permite habilitar Public Network (puede requerir plan de pago), entonces necesitas cambiar a otra base de datos.

