# 🧪 Cómo Probar el Middleware

## Pasos para Verificar que Funciona

### 1. Reiniciar el Servidor

**IMPORTANTE:** Después de agregar las variables `ADMIN_USERNAME` y `ADMIN_PASSWORD` a `.env.local`, debes reiniciar el servidor:

```bash
# Detén el servidor (Ctrl+C)
# Luego reinícialo
npm run dev
```

### 2. Verificar los Logs

Cuando accedas a `/admin`, deberías ver en la terminal del servidor:

```
🔒 Middleware ejecutado para: /admin
🔍 Variables detectadas: {
  hasPassword: true,
  hasUsername: true,
  username: 'pricofyTeHaraMillonario'
}
```

### 3. Probar el Acceso

1. **Abre:** `http://localhost:3001/admin`
2. **Deberías ver** un diálogo del navegador pidiendo usuario y contraseña
3. **Ingresa:**
   - **Usuario:** `pricofyTeHaraMillonario`
   - **Contraseña:** `5$kG36H9aJNdk@XXS#v9K@6^D2Y#D5`
4. **Click en "Sign in"**

### 4. Si No Aparece el Diálogo

Si el navegador no muestra el diálogo de autenticación:

1. **Limpia el caché del navegador:**
   - Chrome/Edge: `Ctrl+Shift+Delete` (Windows) o `Cmd+Shift+Delete` (Mac)
   - Firefox: `Ctrl+Shift+Delete`
   - Safari: `Cmd+Option+E`

2. **O usa una ventana de incógnito:**
   - Chrome/Edge: `Ctrl+Shift+N` (Windows) o `Cmd+Shift+N` (Mac)
   - Firefox: `Ctrl+Shift+P` (Windows) o `Cmd+Shift+P` (Mac)
   - Safari: `Cmd+Shift+N`

3. **O intenta desde otro navegador**

### 5. Verificar en los Logs

Si ingresas credenciales incorrectas, deberías ver:

```
❌ Credenciales incorrectas
```

Si ingresas credenciales correctas, deberías ver:

```
✅ Credenciales correctas, permitiendo acceso
```

## 🔍 Diagnóstico

### Si NO ves logs del middleware:

1. **Verifica que el archivo `middleware.ts` esté en la raíz del proyecto**
2. **Verifica que el servidor se haya reiniciado después de crear/editar el middleware**
3. **Verifica que estés accediendo a `/admin` (no a otra ruta)**

### Si ves "ADMIN_PASSWORD no está configurada":

1. **Verifica que `.env.local` tenga las variables:**
   ```bash
   cat .env.local | grep ADMIN_
   ```

2. **Verifica que el servidor se haya reiniciado después de agregar las variables**

3. **Verifica que no haya espacios o caracteres especiales en las variables**

### Si el diálogo no aparece:

1. **Limpia el caché del navegador**
2. **Usa una ventana de incógnito**
3. **Verifica que no haya un bloqueador de pop-ups activo**
4. **Intenta desde otro navegador**

## 🚀 Próximos Pasos

Una vez que funcione en local:

1. **Configura las mismas variables en Vercel:**
   - `ADMIN_USERNAME=pricofyTeHaraMillonario`
   - `ADMIN_PASSWORD=5$kG36H9aJNdk@XXS#v9K@6^D2Y#D5`

2. **Haz commit y push:**
   ```bash
   git add middleware.ts
   git commit -m "Add: Protección de autenticación para /admin"
   git push
   ```

3. **Después del deploy en Vercel, prueba acceder a:**
   `https://pricofy.vercel.app/admin`

