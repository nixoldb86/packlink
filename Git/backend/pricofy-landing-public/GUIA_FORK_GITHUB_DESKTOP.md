# Guía: Crear Fork Público usando GitHub Desktop

Esta guía te explica cómo crear un fork público de tu proyecto usando GitHub Desktop en lugar de la línea de comandos.

## 📋 Paso 1: Crear el Nuevo Repositorio en GitHub

1. **Ve a GitHub.com** (en tu navegador)
2. **Crea un nuevo repositorio:**
   - Haz clic en el botón **"+"** (arriba a la derecha) → **"New repository"**
   - Nombre: `pricofy-landing-public` (o el nombre que prefieras)
   - Descripción: "Versión pública de Pricofy - Solo landing page, características y precios"
   - **NO marques** "Initialize this repository with a README"
   - **NO agregues** .gitignore ni licencia
   - Haz clic en **"Create repository"**

## 📋 Paso 2: Clonar el Repositorio Original en GitHub Desktop

1. **Abre GitHub Desktop**
2. **Clona el repositorio original:**
   - Ve a **File** → **Clone Repository** (o `Cmd+O` en Mac)
   - Selecciona la pestaña **"GitHub.com"**
   - Busca tu repositorio original (`pricofy-landing`)
   - Elige dónde guardarlo (por ejemplo: `/Users/a.olmedo/Documents/Git/backend/pricofy-landing-public`)
   - Haz clic en **"Clone"**

## 📋 Paso 3: Limpiar el Proyecto

### Opción A: Usar el Script Automatizado

1. **Abre Terminal** desde GitHub Desktop:
   - Ve a **Repository** → **Open in Terminal** (o `Ctrl+` en Windows/Linux, `Cmd+` en Mac)

2. **Ejecuta el script:**
   ```bash
   chmod +x create-public-fork.sh
   ./create-public-fork.sh
   ```

3. **Reemplaza los archivos con versiones públicas:**
   ```bash
   cp FORK_PUBLICO_Providers.tsx components/Providers.tsx
   cp FORK_PUBLICO_Navbar.tsx components/Navbar.tsx
   cp FORK_PUBLICO_middleware.ts middleware.ts
   cp FORK_PUBLICO_env.example .env.example
   ```

### Opción B: Limpiar Manualmente desde GitHub Desktop

1. **Elimina carpetas y archivos:**
   - En GitHub Desktop, ve a **Repository** → **Show in Finder** (Mac) o **Show in Explorer** (Windows)
   - Elimina manualmente las carpetas y archivos listados en `GUIA_CREAR_FORK_PUBLICO.md` (Paso 2)

2. **Reemplaza archivos:**
   - Copia el contenido de `FORK_PUBLICO_Providers.tsx` a `components/Providers.tsx`
   - Copia el contenido de `FORK_PUBLICO_Navbar.tsx` a `components/Navbar.tsx`
   - Copia el contenido de `FORK_PUBLICO_middleware.ts` a `middleware.ts`
   - Copia el contenido de `FORK_PUBLICO_env.example` a `.env.example`

## 📋 Paso 4: Limpiar package.json

1. **Abre `package.json`** en tu editor
2. **Elimina las dependencias** relacionadas con:
   - `@supabase/supabase-js`
   - `pg` o `postgres`
   - `nodemailer` (si no se usa en contacto)
   - `pdfkit` o `@react-pdf/renderer`
   - Cualquier dependencia de scraping o base de datos

3. **Guarda el archivo**

4. **Instala dependencias:**
   - Abre Terminal desde GitHub Desktop
   - Ejecuta: `npm install`

## 📋 Paso 5: Hacer Commit de los Cambios

1. **En GitHub Desktop**, verás todos los cambios en la pestaña **"Changes"**
2. **Revisa los cambios** para asegurarte de que todo esté correcto
3. **Escribe un mensaje de commit:**
   ```
   feat: versión pública - solo home, características y precios
   
   - Eliminada funcionalidad de dashboard y autenticación
   - Eliminadas APIs privadas
   - Simplificados Providers y Navbar
   - Limpiadas dependencias no necesarias
   ```
4. **Haz clic en "Commit to main"** (o la rama que estés usando)

## 📋 Paso 6: Conectar con el Nuevo Repositorio Remoto

1. **En GitHub Desktop**, ve a **Repository** → **Repository Settings** (o `Cmd+,` en Mac)
2. **En la pestaña "Remote":**
   - Haz clic en **"Remove"** para eliminar el remote original
   - Haz clic en **"Add"**
   - Nombre: `origin`
   - URL: `https://github.com/TU_USUARIO/pricofy-landing-public.git` (reemplaza TU_USUARIO)
   - Haz clic en **"Save"**

## 📋 Paso 7: Publicar el Repositorio

1. **En GitHub Desktop**, haz clic en **"Publish repository"** (si aparece)
   - O ve a **Repository** → **Push** (o `Cmd+P` en Mac)
2. **Marca la casilla** "Keep this code private" si quieres que sea privado (o déjala sin marcar para público)
3. **Haz clic en "Push"**

## 📋 Paso 8: Verificar que Todo Funciona

1. **Abre Terminal** desde GitHub Desktop
2. **Ejecuta el proyecto:**
   ```bash
   npm run dev
   ```
3. **Verifica que estas páginas funcionen:**
   - `http://localhost:3000/` (Home)
   - `http://localhost:3000/caracteristicas`
   - `http://localhost:3000/pricing`
   - `http://localhost:3000/contacto` (si lo mantienes)

## 📋 Paso 9: Actualizar README.md

1. **Abre `README.md`** en tu editor
2. **Actualiza el contenido** para reflejar que es la versión pública:
   ```markdown
   # Pricofy Landing - Versión Pública
   
   Versión pública del sitio web de Pricofy que incluye:
   - Página de inicio
   - Características
   - Precios
   - Contacto
   
   ## Instalación
   
   ```bash
   npm install
   npm run dev
   ```
   
   ## Nota
   
   Esta versión NO incluye:
   - Dashboard de usuario
   - Funcionalidad de autenticación
   - APIs privadas
   - Funcionalidad de scraping
   ```
3. **Guarda y haz commit** en GitHub Desktop

## 📋 Paso 10: Deploy (Opcional)

Si quieres desplegar en Vercel:

1. **Ve a vercel.com**
2. **Importa el nuevo repositorio** (`pricofy-landing-public`)
3. **Configura solo las variables de entorno públicas** necesarias
4. **Haz deploy**

## ✅ Checklist Final

- [ ] Repositorio creado en GitHub
- [ ] Proyecto clonado en GitHub Desktop
- [ ] Archivos de dashboard/auth eliminados
- [ ] Archivos reemplazados con versiones públicas
- [ ] `package.json` limpiado
- [ ] `npm install` ejecutado sin errores
- [ ] Cambios commiteados
- [ ] Repositorio conectado al nuevo remote
- [ ] Cambios pusheados a GitHub
- [ ] Proyecto funciona localmente (`npm run dev`)
- [ ] README.md actualizado
- [ ] (Opcional) Deploy en Vercel configurado

## 🆘 Solución de Problemas

### Si GitHub Desktop no muestra los cambios:

1. **Refresca la vista:**
   - Ve a **Repository** → **Refresh** (o `Cmd+R` en Mac)

### Si hay errores al hacer push:

1. **Verifica que el remote esté configurado correctamente:**
   - Ve a **Repository** → **Repository Settings** → **Remote**
   - Asegúrate de que la URL sea correcta

### Si hay conflictos:

1. **Asegúrate de estar en la rama correcta** (generalmente `main` o `master`)
2. **Haz pull antes de push** si es necesario

## 📝 Notas Adicionales

- **No elimines** el repositorio original, este es solo un fork para la versión pública
- Puedes mantener ambos repositorios y trabajar en ellos independientemente
- Si necesitas actualizar la versión pública con cambios del original, puedes hacerlo manualmente copiando los archivos relevantes


