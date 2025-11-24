# Guía para Crear Fork Público (Solo Home, Características y Precios)

Esta guía te ayudará a crear un fork de tu proyecto que solo contenga la parte pública del sitio web, sin funcionalidad de login ni dashboard.

## 🚀 Resumen Rápido

1. **Ejecutar script automatizado** (opcional pero recomendado):
   ```bash
   ./create-public-fork.sh
   ```

2. **O hacerlo manualmente:**
   - Crear copia del proyecto
   - Eliminar carpetas/archivos relacionados con dashboard/auth
   - Reemplazar archivos con versiones públicas (usar archivos `FORK_PUBLICO_*.tsx`)
   - Limpiar `package.json`
   - Crear nuevo repositorio remoto

## 📋 Paso 1: Crear un Nuevo Repositorio Local

```bash
# 1. Crear un nuevo directorio para el fork público
cd /Users/a.olmedo/Documents/Git/backend
git clone <URL_DEL_REPO_ORIGINAL> pricofy-landing-public
cd pricofy-landing-public

# 2. Crear una nueva rama para el fork público
git checkout -b public-version
```

## Paso 2: Eliminar Archivos y Carpetas Relacionados con Dashboard/Auth

### Archivos y Carpetas a ELIMINAR:

```bash
# Eliminar carpeta dashboard completa
rm -rf app/dashboard

# Eliminar carpeta admin
rm -rf app/admin

# Eliminar APIs privadas (mantener solo las públicas)
rm -rf app/api/evaluation
rm -rf app/api/favorites
rm -rf app/api/my-evaluations
rm -rf app/api/scrape
rm -rf app/api/solicitudes
rm -rf app/api/submit-request
rm -rf app/api/submit-request-direct
rm -rf app/api/limite-diario

# Eliminar componentes relacionados con auth/dashboard
rm -rf components/AuthModal.tsx
rm -rf components/DashboardSidebar.tsx
rm -rf components/ProductForm.tsx
rm -rf components/UserMenu.tsx

# Eliminar contextos de autenticación
rm -rf contexts/AuthContext.tsx
rm -rf contexts/FormContext.tsx

# Eliminar librerías relacionadas con scraping y base de datos
rm -rf lib/scraper
rm -rf lib/db.ts
rm -rf lib/chatgpt.ts
rm -rf lib/email.ts
rm -rf lib/pdf-generator.ts
rm -rf lib/storage.ts
rm -rf lib/supabase

# Eliminar archivos de configuración de base de datos
rm -rf database
rm -rf *.sql
rm -rf setup-database.sh

# Eliminar documentación relacionada con backend
rm -rf CONFIGURAR_*.md
rm -rf GUIA_*.md
rm -rf MIGRAR_*.md
rm -rf SOLUCION_*.md
rm -rf VERIFICAR_*.md
rm -rf ACTUALIZAR_ENV.md
rm -rf DEPLOY_VERCEL.md
rm -rf ENV_VARIABLES.md
rm -rf INSTALL_INSTRUCTIONS.md
rm -rf SETUP_DB.md
rm -rf TEST_*.md
rm -rf VARIANTES_*.md
rm -rf UMBRALES_*.md
rm -rf MEJORAS_*.md
rm -rf DETECCION_*.md
rm -rf REVERTIR_*.md
rm -rf cloud.md

# Eliminar logs
rm -rf logs

# Eliminar uploads (PDFs generados)
rm -rf public/uploads

# Eliminar archivos de backup
rm -rf app/dashboard/page.tsx.backup
rm -rf app/dashboard/page.tsx.broken
```

## Paso 3: Modificar Archivos para Eliminar Dependencias de Auth

### 3.1 Modificar `components/Providers.tsx`

**Usa el archivo de ejemplo:** `FORK_PUBLICO_Providers.tsx`

```bash
cp FORK_PUBLICO_Providers.tsx components/Providers.tsx
```

Este archivo elimina `AuthProvider` y `FormProvider`, dejando solo `LanguageProvider`.

### 3.2 Modificar `components/Navbar.tsx`

**Usa el archivo de ejemplo:** `FORK_PUBLICO_Navbar.tsx`

```bash
cp FORK_PUBLICO_Navbar.tsx components/Navbar.tsx
```

Este archivo:
- Elimina referencias a `useAuth()` y `UserMenu`
- Elimina referencias a `useForm()` y `openForm()`
- Cambia el botón "Empezar" para que redirija a `/contacto` en lugar de abrir el formulario
- Elimina enlaces al dashboard

### 3.3 Modificar `app/layout.tsx`

Ya está bien, solo usa Providers que ahora solo tiene LanguageProvider.

### 3.4 Simplificar `middleware.ts`

**Usa el archivo de ejemplo:** `FORK_PUBLICO_middleware.ts`

```bash
cp FORK_PUBLICO_middleware.ts middleware.ts
```

Este archivo elimina toda la protección de admin ya que no hay rutas protegidas.

## Paso 4: Limpiar `package.json`

Revisa `FORK_PUBLICO_package.json.example` para ver qué dependencias eliminar.

**Dependencias a ELIMINAR:**
- `@supabase/supabase-js` (si no se usa en contacto)
- `pg` o `postgres` (PostgreSQL)
- `nodemailer` (si no se usa en contacto)
- `pdfkit` o `@react-pdf/renderer` (PDF generation)
- Cualquier dependencia de scraping
- Cualquier dependencia de base de datos

**Dependencias a MANTENER:**
- `next`
- `react`
- `react-dom`
- `tailwindcss`
- `typescript`
- `@types/node`
- `@types/react`
- `@types/react-dom`

Después de limpiar, ejecuta:
```bash
npm install
```

## Paso 5: Limpiar Variables de Entorno

**Usa el archivo de ejemplo:** `FORK_PUBLICO_env.example`

```bash
cp FORK_PUBLICO_env.example .env.example
```

Crea un nuevo `.env.local` solo con las variables públicas necesarias.

## Paso 6: Actualizar `README.md`

Crear un README específico para la versión pública explicando:
- Qué es el proyecto
- Cómo instalar y ejecutar
- Qué páginas incluye (Home, Características, Precios)
- Que NO incluye funcionalidad de dashboard

## Paso 7: Verificar que las Páginas Públicas Funcionen

Verificar que estas páginas funcionen correctamente:
- `/` (Home)
- `/caracteristicas`
- `/pricing`
- `/contacto` (si quieres mantenerlo)

## Paso 8: Crear el Nuevo Repositorio Remoto

```bash
# 1. Crear un nuevo repositorio en GitHub/GitLab (vacío, sin README)

# 2. Conectar el repositorio local con el remoto
git remote remove origin
git remote add origin <URL_DEL_NUEVO_REPO_PUBLICO>

# 3. Hacer commit de todos los cambios
git add .
git commit -m "feat: versión pública - solo home, características y precios"

# 4. Subir a la nueva rama
git push -u origin public-version

# 5. (Opcional) Hacer public-version la rama principal
git checkout -b main
git merge public-version
git push -u origin main
```

## Paso 9: Configurar Vercel/Deploy

1. Conectar el nuevo repositorio con Vercel
2. Configurar solo las variables de entorno públicas necesarias
3. Deploy

## Resumen de Archivos a MANTENER:

### Páginas:
- ✅ `app/page.tsx` (Home)
- ✅ `app/caracteristicas/page.tsx`
- ✅ `app/pricing/page.tsx`
- ✅ `app/contacto/page.tsx` (opcional)

### Componentes:
- ✅ `components/Hero.tsx`
- ✅ `components/Features.tsx`
- ✅ `components/UseCases.tsx`
- ✅ `components/ProblemsAndSolutions.tsx`
- ✅ `components/CTA.tsx`
- ✅ `components/Footer.tsx`
- ✅ `components/Navbar.tsx` (modificado)
- ✅ `components/LanguageSelector.tsx`
- ✅ `components/ContactForm.tsx` (si mantienes contacto)

### Contextos:
- ✅ `contexts/LanguageContext.tsx`

### Librerías:
- ✅ `lib/translations.ts`
- ✅ `lib/geocoding.ts` (si se usa en contacto)
- ✅ `lib/utils/ip-geolocation.ts` (si se usa)

### APIs Públicas (opcional):
- ✅ `app/api/contact/route.ts` (si mantienes contacto)
- ✅ `app/api/contactos/route.ts` (si mantienes contacto)
- ✅ `app/api/detect-country/route.ts` (si se usa)
- ✅ `app/api/geocode/route.ts` (si se usa en contacto)

### Configuración:
- ✅ `app/layout.tsx` (modificado)
- ✅ `app/globals.css`
- ✅ `tailwind.config.ts`
- ✅ `next.config.js`
- ✅ `tsconfig.json`
- ✅ `package.json` (limpiado)
- ✅ `postcss.config.js`
- ✅ `public/images/` (todas las imágenes)

## Notas Importantes:

1. **No elimines** `components/Providers.tsx`, solo modifícalo para que no use AuthProvider ni FormProvider
2. **Revisa** `components/Navbar.tsx` para eliminar referencias a dashboard y auth
3. **Verifica** que todas las traducciones estén en `lib/translations.ts`
4. **Prueba** que todas las páginas públicas funcionen sin errores
5. **Limpia** cualquier import que haga referencia a archivos eliminados

