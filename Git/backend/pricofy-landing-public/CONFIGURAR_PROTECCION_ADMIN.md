# 🔒 Configurar Protección para /admin

He implementado autenticación básica HTTP para proteger la ruta `/admin`.

## 📋 Cómo Funciona

La ruta `/admin` ahora requiere autenticación básica HTTP (usuario y contraseña) antes de permitir el acceso.

## 🔧 Configuración en Vercel

### Paso 1: Agregar Variables de Entorno

1. **Ve a:** Vercel Dashboard → Tu proyecto → Settings → Environment Variables
2. **Agrega estas dos variables:**

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=tu_contraseña_segura_aqui
```

**Ejemplo:**
```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=MiContraseñaSuperSegura123!
```

**Importante:**
- ✅ Usa una contraseña fuerte (mínimo 12 caracteres, con mayúsculas, minúsculas, números y símbolos)
- ✅ Configura ambas variables para **"All Environments"** (Production, Preview, Development)
- ✅ Guarda la contraseña en un lugar seguro (no la compartas)

### Paso 2: Configurar en Desarrollo Local

Agrega estas variables a tu `.env.local`:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=tu_contraseña_local
```

**Nota:** Puedes usar una contraseña diferente para desarrollo local si quieres.

## 🚀 Cómo Acceder a /admin

### Opción 1: Desde el Navegador

1. **Ve a:** `https://pricofy.vercel.app/admin`
2. **El navegador mostrará un diálogo** pidiendo usuario y contraseña
3. **Ingresa:**
   - **Usuario:** `admin` (o el valor de `ADMIN_USERNAME`)
   - **Contraseña:** La que configuraste en `ADMIN_PASSWORD`
4. **Click en "Sign in"** o "Aceptar"

### Opción 2: Desde la URL (No recomendado)

Puedes acceder directamente usando:
```
https://admin:tu_contraseña@pricofy.vercel.app/admin
```

**⚠️ No recomendado:** La contraseña será visible en el historial del navegador.

## 🔄 Actualizar la Contraseña

Para cambiar la contraseña:

1. **Ve a:** Vercel Dashboard → Settings → Environment Variables
2. **Edita** la variable `ADMIN_PASSWORD`
3. **Cambia** el valor a tu nueva contraseña
4. **Haz redeploy** o espera al siguiente deploy

## 🔐 Cambiar el Usuario

Si quieres cambiar el usuario (por defecto es `admin`):

1. **Agrega** la variable `ADMIN_USERNAME` en Vercel
2. **Configura** el valor que quieras (ej: `administrador`, `pricofy_admin`, etc.)
3. **Si no configuras `ADMIN_USERNAME`**, el usuario por defecto será `admin`

## 🆘 Troubleshooting

### Error: "Authentication required"

**Causa:** No has ingresado las credenciales o son incorrectas.

**Solución:**
- Verifica que estés usando el usuario y contraseña correctos
- Asegúrate de que las variables `ADMIN_USERNAME` y `ADMIN_PASSWORD` estén configuradas en Vercel

### Error: "Admin access not configured"

**Causa:** La variable `ADMIN_PASSWORD` no está configurada.

**Solución:**
- Agrega `ADMIN_PASSWORD` en Vercel Dashboard → Settings → Environment Variables
- Haz redeploy después de agregar la variable

### El navegador no muestra el diálogo de autenticación

**Causa:** Puede ser un problema de caché del navegador.

**Solución:**
- Limpia el caché del navegador
- O usa una ventana de incógnito
- O intenta acceder desde otro navegador

### No puedo acceder después de configurar

**Causa:** Puede que el middleware no se haya desplegado correctamente.

**Solución:**
1. Verifica que el archivo `middleware.ts` esté en la raíz del proyecto
2. Haz un redeploy en Vercel
3. Verifica los logs de Vercel para ver si hay errores

## ✅ Checklist de Seguridad

- [ ] `ADMIN_PASSWORD` configurada en Vercel con una contraseña fuerte
- [ ] `ADMIN_USERNAME` configurada (opcional, por defecto es `admin`)
- [ ] Variables configuradas para "All Environments"
- [ ] Contraseña guardada en un lugar seguro
- [ ] Probado que el acceso sin credenciales está bloqueado
- [ ] Probado que el acceso con credenciales correctas funciona

## 🔒 Recomendaciones de Seguridad

1. **Usa una contraseña fuerte:** Mínimo 12 caracteres, con mayúsculas, minúsculas, números y símbolos
2. **No compartas la contraseña:** Solo compártela con personas que realmente necesiten acceso
3. **Cambia la contraseña periódicamente:** Especialmente si alguien que tenía acceso ya no lo necesita
4. **Considera usar 2FA:** Para mayor seguridad, podrías implementar autenticación de dos factores en el futuro
5. **Monitorea el acceso:** Revisa los logs de Vercel periódicamente para ver quién accede

## 📝 Nota

Esta es una protección básica pero efectiva. Para aplicaciones con mayores requerimientos de seguridad, considera implementar:
- Autenticación con OAuth (Google, GitHub, etc.)
- Autenticación de dos factores (2FA)
- Sistema de roles y permisos
- Logging y auditoría de accesos

