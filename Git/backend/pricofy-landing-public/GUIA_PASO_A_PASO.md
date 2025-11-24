# 📘 Guía Paso a Paso: Deploy Gratis en Vercel + Railway + Backblaze B2

Esta guía te llevará paso a paso para configurar tu aplicación Pricofy completamente gratis.

> ⚠️ **Nota:** PlanetScale ya no ofrece plan gratuito. Usaremos **Railway** que ofrece MySQL gratis.

---

## 🎯 PASO 1: Configurar Railway (Base de Datos MySQL Gratis)

### 1.1 Crear cuenta en Railway

1. **Ve a:** https://railway.app
2. **Click en:** "Start a New Project" o "Login" (arriba a la derecha)
3. **Elige:** "Login with GitHub" (recomendado) o "Login with Email"
4. **Autoriza** Railway para acceder a tu GitHub (si usas GitHub)
5. **Completa** el registro

### 1.2 Crear una nueva base de datos MySQL

1. **Una vez dentro del dashboard de Railway, verás:**
   - En el centro: "New Project" o "Create New Project"
   - O un botón "+ New" en la parte superior

2. **Click en:** "New Project" o "+ New"

3. **Se abrirá un menú con opciones:**
   - **Click en:** "Database"
   - O busca: "MySQL" o "Provision MySQL"

4. **Railway creará automáticamente una base de datos MySQL**
   - Esto puede tardar 1-2 minutos
   - Verás un mensaje de "Provisioning..."

### 1.3 Obtener las credenciales de conexión

1. **Una vez creada la base de datos, verás:**
   - Un card o tarjeta con el nombre "MySQL" o similar
   - **Click en:** El card de la base de datos

2. **Se abrirá la página de configuración de la base de datos**

3. **Busca la pestaña "Connect" o "Public Network":**
   - En el menú superior, busca: "Connect" o "Public Network"
   - **Click en:** "Connect"
   - ⚠️ **IMPORTANTE:** Necesitas el host PÚBLICO, no el proxy interno

4. **En la pestaña "Connect", verás varias opciones:**
   - **"Public Network"** o **"Public Connection"** ← **USA ESTA OPCIÓN**
   - Puede haber también "Private Network" o "Internal" - NO uses esas

5. **En "Public Network", verás algo como:**
   ```
   Host: xxxxxx.railway.app  (o similar)
   Port: 3306 (o el puerto que indique)
   User: root
   Password: xxxxxxxxxxxxxx
   Database: railway
   ```

6. **⚠️ IMPORTANTE - Si solo ves "Private Network":**
   - Railway puede mostrar un proxy interno tipo: `gondola.proxy.rlwy.net:36353`
   - **Este NO funciona desde Vercel** (solo funciona dentro de Railway)
   - Necesitas habilitar "Public Network" en Railway:
     - Ve a tu base de datos MySQL en Railway
     - Busca "Settings" o "Network"
     - Habilita "Public Network" o "Public Access"
     - Espera unos minutos a que se configure

7. **Si no puedes habilitar Public Network:**
   - Railway puede requerir un plan de pago para acceso público
   - Considera usar **Supabase** (PostgreSQL gratuito) como alternativa
   - O usa **Neon.tech** (PostgreSQL gratuito)

8. **¡COPIA ESTOS VALORES!** Los necesitarás después:
   - **Host:** El valor del host público (ej: `xxxxxx.railway.app`)
   - **Port:** El puerto que indique (normalmente `3306`)
   - **User:** El valor de `MYSQLUSER` o `User`
   - **Password:** El valor de `MYSQLPASSWORD` o `Password`
   - **Database:** El valor de `MYSQLDATABASE` o `Database` (puede ser `railway` o similar)

### 1.4 Crear las tablas en Railway

1. **En Railway, ve a tu base de datos MySQL**
2. **Busca la pestaña "Data" o "Query":**
   - En el menú superior, busca: "Data" o "Query" o "SQL"
   - **Click en:** "Query" o "SQL Editor"

3. **Si no ves un editor SQL directamente:**
   - **Opción A:** Usa un cliente MySQL local (MySQL Workbench, TablePlus, etc.)
     - Conecta usando las credenciales que copiaste
   - **Opción B:** Usa Railway CLI (más avanzado)

4. **Abre el archivo** `CREATE_DATABASE_RAILWAY.sql` de tu proyecto local
   - Este archivo ya está preparado para Railway (sin CREATE DATABASE)

5. **Copia TODO el contenido** del archivo SQL

6. **Pega el contenido** en el editor SQL de Railway

7. **Click en:** "Run" o "Execute" (botón verde)

8. **Deberías ver:** "Success" o mensaje de confirmación

**✅ ¡Listo! Railway está configurado**

---

## 🗄️ PASO 2: Configurar Backblaze B2 (Almacenamiento de Archivos Gratis)

### 2.1 Crear cuenta en Backblaze

1. **Ve a:** https://www.backblaze.com/b2/sign-up.html
2. **Completa el formulario:**
   - Email
   - Contraseña
   - Nombre
3. **Click en:** "Sign Up" o "Create Account"
4. **Verifica tu email** (revisa tu bandeja de entrada)

### 2.2 Crear un Bucket

1. **Una vez dentro del dashboard de Backblaze:**
   - En el menú superior, busca: "B2 Cloud Storage"
   - O directamente: https://secure.backblaze.com/b2_buckets.htm

2. **Click en:** "Create a Bucket" (botón azul)

3. **Completa el formulario:**
   - **Bucket Name:** `pricofy-uploads` (o el nombre que prefieras)
   - **Files in Bucket:** Selecciona "Public" (importante para que las imágenes sean accesibles)
   - **Default Encryption:** Puedes dejarlo como está
   - **Bucket Type:** Selecciona una región cercana (ej: "US West")

4. **Click en:** "Create a Bucket"

5. **¡Anota el nombre del bucket!** Lo necesitarás después

### 2.3 Generar Application Keys (Credenciales)

1. **En el dashboard de Backblaze, en el menú lateral izquierdo:**
   - Busca: "App Keys" o "Application Keys"
   - Click en: "App Keys"

2. **Click en:** "Add a New Application Key" (botón azul)

3. **Completa el formulario:**
   - **Name:** `pricofy-uploads-key`
   - **Allow access to Bucket(s):** Selecciona "Specific Bucket" y elige tu bucket `pricofy-uploads`
   - **Capabilities:** Marca:
     - ✅ Read Files
     - ✅ Write Files
     - ✅ Delete Files
     - ✅ List Files
     - ✅ List Buckets
   - **File name prefix:** Déjalo vacío
   - **Duration:** Déjalo en "None" (sin expiración)

4. **Click en:** "Create New Key"

5. **¡IMPORTANTE! Se mostrarán dos valores:**
   ```
   keyID: 001234567890abcdef1234567890
   applicationKey: K001234567890abcdef1234567890abcdef
   ```
   
   **¡COPIA AMBOS VALORES!** El `applicationKey` solo se muestra una vez.

### 2.4 Obtener las URLs necesarias

#### Obtener el S3 Endpoint:

1. **En el dashboard de Backblaze, en el menú lateral izquierdo:**
   - Busca: "App Keys" o "Application Keys"
   - **Click en:** "App Keys"

2. **En la parte superior de la página, verás información sobre tu cuenta:**
   - Busca: "S3 Compatible API" o "S3 Endpoint"
   - O busca: "Endpoint" seguido de una URL
   - **Ejemplo:** `https://s3.us-west-000.backblazeb2.com`
   - **¡Anota esta URL!** Este es tu `S3_ENDPOINT`

3. **Si no la ves ahí:**
   - Ve a "Account" → "B2 Cloud Storage Settings"
   - O busca en la documentación de Backblaze: https://www.backblaze.com/b2/docs/s3_compatible_api.html
   - La URL sigue el formato: `https://s3.[tu-region].backblazeb2.com`
   - Ejemplo de regiones: `us-west-000`, `us-west-001`, `eu-central-003`, etc.

#### Obtener la Public URL (URL pública del bucket):

1. **En el dashboard de Backblaze, ve a:** "B2 Cloud Storage" → "Buckets"
2. **Click en:** Tu bucket `pricofy-uploads` (o el nombre que le diste)

3. **En la página del bucket, hay varias formas de encontrar la Public URL:**

   **Opción A - Desde la página del bucket:**
   - En la parte superior de la página del bucket, busca una sección llamada:
     - "Friendly URL" o "Public URL" o "Download URL"
   - Deberías ver algo como: `https://f000.backblazeb2.com/file/pricofy-uploads/[nombre-archivo]`
   - La parte base es: `https://f000.backblazeb2.com/file/pricofy-uploads`

   **Opción B - Desde el bucket público:**
   - Si el bucket es público (lo configuraste así en el paso 2.2)
   - La URL pública sigue este formato:
     ```
     https://f000.backblazeb2.com/file/[nombre-del-bucket]
     ```
   - Reemplaza `[nombre-del-bucket]` con el nombre de tu bucket (ej: `pricofy-uploads`)
   - **Ejemplo completo:** `https://f000.backblazeb2.com/file/pricofy-uploads`

   **Opción C - Verificar la URL:**
   - Si subes un archivo de prueba al bucket
   - Click derecho en el archivo → "Copy download link"
   - La URL será algo como: `https://f000.backblazeb2.com/file/pricofy-uploads/uploads/archivo.jpg`
   - La parte base (sin el nombre del archivo) es tu `S3_PUBLIC_URL`

4. **Formato de la Public URL:**
   - La URL base es: `https://f000.backblazeb2.com/file/[nombre-del-bucket]`
   - O puede ser: `https://[tu-friendname].backblazeb2.com/file/[nombre-del-bucket]`
   - Donde `[nombre-del-bucket]` es el nombre que le diste (ej: `pricofy-uploads`)

5. **¡Anota ambas URLs!**
   - **S3 Endpoint:** `https://s3.[region].backblazeb2.com`
   - **Public URL:** `https://f000.backblazeb2.com/file/[nombre-del-bucket]`

**✅ ¡Listo! Backblaze B2 está configurado**

---

## 🚀 PASO 3: Preparar el código localmente

### 3.1 Crear archivo de variables de entorno

1. **En tu proyecto local, en la raíz del proyecto** (donde está `package.json`)
2. **Crea un archivo llamado:** `.env.local`
3. **Abre el archivo** con un editor de texto
4. **Pega el siguiente contenido y COMPLETA los valores:**

```env
# Base de datos - Railway
DB_HOST=tu_host_de_railway_aqui.railway.app
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password_de_railway_aqui
DB_NAME=railway
DB_SSL=false

# Almacenamiento - Backblaze B2
S3_ENDPOINT=https://s3.us-west-000.backblazeb2.com
S3_REGION=us-west-000
S3_ACCESS_KEY_ID=tu_key_id_de_backblaze_aqui
S3_SECRET_ACCESS_KEY=tu_application_key_de_backblaze_aqui
S3_BUCKET_NAME=pricofy-uploads
S3_FORCE_PATH_STYLE=true
S3_PUBLIC_URL=https://f000.backblazeb2.com/file/pricofy-uploads
S3_MAKE_PUBLIC=true
```

5. **Reemplaza los valores:**
   - `tu_usuario_de_planetscale_aqui` → El Username que copiaste de PlanetScale
   - `tu_password_de_planetscale_aqui` → El Password que copiaste de PlanetScale
   - `https://s3.us-west-000.backblazeb2.com` → Tu S3 Endpoint de Backblaze
   - `us-west-000` → Tu región de Backblaze (puede ser diferente)
   - `tu_key_id_de_backblaze_aqui` → El keyID que copiaste de Backblaze
   - `tu_application_key_de_backblaze_aqui` → El applicationKey que copiaste
   - `pricofy-uploads` → El nombre de tu bucket
   - `https://f000.backblazeb2.com/file/pricofy-uploads` → Tu Public URL de Backblaze

6. **Guarda el archivo**

### 3.2 Probar localmente (opcional pero recomendado)

1. **Abre una terminal en la raíz del proyecto**
2. **Ejecuta:**
   ```bash
   npm install
   npm run dev
   ```
3. **Abre:** http://localhost:3001
4. **Prueba enviar un formulario con fotos**
5. **Verifica que todo funcione**

**✅ ¡Listo! Tu código está preparado**

---

## ☁️ PASO 4: Configurar Vercel (Hosting Gratis)

### 4.1 Crear cuenta en Vercel

1. **Ve a:** https://vercel.com
2. **Click en:** "Sign Up" (arriba a la derecha)
3. **Elige:** "Continue with GitHub" (recomendado)
4. **Autoriza** Vercel para acceder a tu GitHub

### 4.2 Conectar tu repositorio

1. **Una vez dentro del dashboard de Vercel:**
   - En el centro verás: "Add New..." → "Project"
   - O en la parte superior: "Add New Project"

2. **Click en:** "Add New Project"

3. **Si tu repositorio no aparece:**
   - Click en: "Adjust GitHub App Permissions"
   - O busca: "Import Git Repository"
   - Selecciona tu repositorio de GitHub

4. **Selecciona tu repositorio** `pricofy-landing` (o el nombre que tenga)

5. **Click en:** "Import"

### 4.3 Configurar el proyecto

1. **En la página de configuración, verás:**
   - **Project Name:** `pricofy-landing` (puedes cambiarlo)
   - **Framework Preset:** Debería detectar "Next.js" automáticamente
   - **Root Directory:** `./` (déjalo así)
   - **Build Command:** `npm run build` (debería estar automático)
   - **Output Directory:** `.next` (debería estar automático)
   - **Install Command:** `npm install` (debería estar automático)

2. **NO hagas click en "Deploy" todavía** ⚠️

### 4.4 Configurar Variables de Entorno en Vercel

1. **En la misma página de configuración, busca:**
   - "Environment Variables" (en el menú lateral o abajo)
   - O haz scroll hacia abajo

2. **Click en:** "Environment Variables" o el botón "+"

3. **Agrega cada variable UNA POR UNA:**

   **Variable 1:**
   - **Key:** `DB_HOST`
   - **Value:** [Tu Host de Railway, ej: `xxxxxx.railway.app`]
   - **Environment:** Marca todas (Production, Preview, Development)
   - **Click en:** "Add"

   **Variable 2:**
   - **Key:** `DB_PORT`
   - **Value:** `3306`
   - **Environment:** Marca todas
   - **Click en:** "Add"

   **Variable 3:**
   - **Key:** `DB_USER`
   - **Value:** `root` (o el valor de MYSQLUSER de Railway)
   - **Environment:** Marca todas
   - **Click en:** "Add"

   **Variable 4:**
   - **Key:** `DB_PASSWORD`
   - **Value:** [Tu Password de Railway - valor de MYSQLPASSWORD]
   - **Environment:** Marca todas
   - **Click en:** "Add"

   **Variable 5:**
   - **Key:** `DB_NAME`
   - **Value:** `railway` (o el valor de MYSQLDATABASE de Railway)
   - **Environment:** Marca todas
   - **Click en:** "Add"

   **Variable 6:**
   - **Key:** `DB_SSL`
   - **Value:** `false`
   - **Environment:** Marca todas
   - **Click en:** "Add"

   **Variable 7:**
   - **Key:** `S3_ENDPOINT`
   - **Value:** [Tu S3 Endpoint de Backblaze, ej: `https://s3.us-west-000.backblazeb2.com`]
   - **Environment:** Marca todas
   - **Click en:** "Add"

   **Variable 8:**
   - **Key:** `S3_REGION`
   - **Value:** [Tu región de Backblaze, ej: `us-west-000`]
   - **Environment:** Marca todas
   - **Click en:** "Add"

   **Variable 9:**
   - **Key:** `S3_ACCESS_KEY_ID`
   - **Value:** [Tu keyID de Backblaze]
   - **Environment:** Marca todas
   - **Click en:** "Add"

   **Variable 10:**
   - **Key:** `S3_SECRET_ACCESS_KEY`
   - **Value:** [Tu applicationKey de Backblaze]
   - **Environment:** Marca todas
   - **Click en:** "Add"

   **Variable 11:**
   - **Key:** `S3_BUCKET_NAME`
   - **Value:** [Tu nombre de bucket, ej: `pricofy-uploads`]
   - **Environment:** Marca todas
   - **Click en:** "Add"

   **Variable 12:**
   - **Key:** `S3_FORCE_PATH_STYLE`
   - **Value:** `true`
   - **Environment:** Marca todas
   - **Click en:** "Add"

   **Variable 13:**
   - **Key:** `S3_PUBLIC_URL`
   - **Value:** [Tu Public URL de Backblaze, ej: `https://f000.backblazeb2.com/file/pricofy-uploads`]
   - **Environment:** Marca todas
   - **Click en:** "Add"

   **Variable 14:**
   - **Key:** `S3_MAKE_PUBLIC`
   - **Value:** `true`
   - **Environment:** Marca todas
   - **Click en:** "Add"

4. **Verifica que todas las variables estén agregadas**
   - Deberías ver 14 variables en la lista

### 4.5 Hacer el Deploy

1. **Después de agregar todas las variables, haz scroll hacia arriba**
2. **Click en:** "Deploy" (botón azul grande)
3. **Espera** a que termine el build (puede tardar 2-5 minutos)
4. **Cuando termine, verás:**
   - "Congratulations! Your deployment is ready"
   - O un enlace tipo: `https://pricofy-landing.vercel.app`

5. **Click en:** "Visit" o en el enlace

**✅ ¡Listo! Tu aplicación está desplegada**

---

## ✅ PASO 5: Verificar que todo funciona

### 5.1 Probar el formulario

1. **Ve a tu URL de Vercel:** `https://tu-proyecto.vercel.app`
2. **Intenta enviar un formulario** con fotos
3. **Verifica que:**
   - El formulario se envíe correctamente
   - Las fotos se suban (puedes verificar en Backblaze B2)
   - Los datos se guarden en PlanetScale

### 5.2 Verificar la base de datos

1. **Ve a:** `https://tu-proyecto.vercel.app/admin`
2. **Deberías ver** las solicitudes guardadas
3. **Si no hay datos, envía un formulario de prueba primero**

### 5.3 Verificar las fotos en Backblaze

1. **Ve al dashboard de Backblaze**
2. **Click en:** Tu bucket `pricofy-uploads`
3. **Deberías ver** las fotos subidas en la carpeta `uploads/`

---

## 🔧 Troubleshooting (Solución de Problemas)

### Error: "Unable to connect to database"

**Causa:** Credenciales incorrectas de Railway

**Solución:**
1. Ve a Railway → Tu base de datos → "Variables"
2. Verifica que las credenciales sean correctas
3. En Vercel → Settings → Environment Variables
4. Actualiza `DB_HOST`, `DB_USER`, `DB_PASSWORD` y `DB_NAME`
5. Haz un nuevo deploy

### Error: "Access Denied" al subir archivos

**Causa:** Credenciales incorrectas de Backblaze o bucket no público

**Solución:**
1. Verifica las Application Keys en Backblaze
2. En Vercel, actualiza `S3_ACCESS_KEY_ID` y `S3_SECRET_ACCESS_KEY`
3. En Backblaze, asegúrate de que el bucket sea "Public"
4. Haz un nuevo deploy

### Las imágenes no se muestran

**Causa:** URL pública incorrecta

**Solución:**
1. En Backblaze, verifica la Public URL de tu bucket
2. En Vercel, actualiza `S3_PUBLIC_URL`
3. Haz un nuevo deploy

### Error al hacer build en Vercel

**Causa:** Dependencias faltantes o errores de TypeScript

**Solución:**
1. Prueba localmente: `npm run build`
2. Si hay errores, corrígelos localmente
3. Haz commit y push a GitHub
4. Vercel desplegará automáticamente

---

## 📊 Resumen de URLs y Credenciales

Guarda esta información en un lugar seguro:

### Railway:
- **Host:** [Tu Host, ej: `xxxxxx.railway.app`]
- **Usuario:** `root` (o el valor de MYSQLUSER)
- **Password:** [Tu Password - valor de MYSQLPASSWORD]
- **Base de datos:** `railway` (o el valor de MYSQLDATABASE)

### Backblaze B2:
- **Endpoint:** `https://s3.us-west-000.backblazeb2.com`
- **Key ID:** [Tu Key ID]
- **Application Key:** [Tu Application Key]
- **Bucket:** `pricofy-uploads`
- **Public URL:** `https://f000.backblazeb2.com/file/pricofy-uploads`

### Vercel:
- **URL:** `https://tu-proyecto.vercel.app`

---

## 💰 Costos

- ✅ **Vercel Hobby:** Gratis (con límites generosos)
- ✅ **Railway:** Gratis hasta $5 de crédito/mes (suficiente para base de datos pequeña)
- ✅ **Backblaze B2:** Gratis hasta 10GB de almacenamiento, luego $5/TB

**Total estimado:** $0/mes (mientras no excedas los límites gratuitos)

> 💡 **Nota sobre Railway:** El plan gratuito incluye $5 de crédito mensual. Una base de datos MySQL pequeña consume aproximadamente $2-3/mes, así que es completamente gratis para proyectos pequeños.

---

## 🎉 ¡Felicidades!

Tu aplicación Pricofy está ahora completamente desplegada y funcionando gratis en:
- ☁️ Vercel (hosting)
- 🗄️ Railway (base de datos MySQL)
- 📦 Backblaze B2 (almacenamiento)

¡Disfruta de tu aplicación en producción sin costos!

