# Guía de Deployment en Vercel + PlanetScale + Backblaze B2

Esta guía te ayudará a desplegar tu aplicación Pricofy en Vercel (plan gratuito) con PlanetScale como base de datos y Backblaze B2 para almacenamiento de archivos.

## Prerequisitos

1. Cuenta en [Vercel](https://vercel.com) (gratuita)
2. Cuenta en [PlanetScale](https://planetscale.com) (plan gratuito)
3. Cuenta en [Backblaze B2](https://www.backblaze.com/b2/sign-up.html) (gratuita)

## Paso 1: Configurar PlanetScale

1. **Crear cuenta en PlanetScale:**
   - Ve a https://planetscale.com
   - Crea una cuenta gratuita
   - Crea una nueva base de datos llamada `pricofy_db`

2. **Obtener credenciales:**
   - En el dashboard de PlanetScale, ve a tu base de datos
   - Click en "Connect"
   - Selecciona "General" y copia:
     - Host
     - Username
     - Password
     - Database name

3. **Crear las tablas:**
   - En PlanetScale, ve a "Branches" → "main" → "Console"
   - Ejecuta el script SQL desde `CREATE_DATABASE.sql` o `database/schema.sql`
   - O usa el CLI de PlanetScale:
     ```bash
     psql -h aws.connect.psdb.cloud -u usuario -p contraseña -d pricofy_db < CREATE_DATABASE.sql
     ```

## Paso 2: Configurar Backblaze B2

1. **Crear cuenta:**
   - Ve a https://www.backblaze.com/b2/sign-up.html
   - Crea una cuenta gratuita

2. **Crear un bucket:**
   - En el dashboard, click en "Buckets"
   - Click en "Create a Bucket"
   - Nombre: `pricofy-uploads` (o el que prefieras)
   - Tipo: Public (para acceso directo a las imágenes)
   - Región: Selecciona la más cercana (ej: US West)

3. **Generar Application Keys:**
   - Ve a "App Keys" en el menú
   - Click en "Add a New Application Key"
   - Nombre: `pricofy-uploads-key`
   - Permite acceso al bucket que creaste
   - Copia el `keyID` y `applicationKey`

4. **Obtener URLs:**
   - En la configuración del bucket, encontrarás:
     - **Endpoint S3:** `https://s3.us-west-000.backblazeb2.com` (ejemplo)
     - **Public URL:** `https://f000.backblazeb2.com/file/tu-bucket-name` (ejemplo)

## Paso 3: Configurar el proyecto localmente

1. **Clonar/actualizar el proyecto:**
   ```bash
   git clone <tu-repo>
   cd pricofy-landing
   npm install
   ```

2. **Crear archivo `.env.local`:**
   ```env
   # PlanetScale
   DB_HOST=aws.connect.psdb.cloud
   DB_PORT=3306
   DB_USER=tu_usuario_planetscale
   DB_PASSWORD=tu_password_planetscale
   DB_NAME=pricofy_db
   DB_SSL=true

   # Backblaze B2
   S3_ENDPOINT=https://s3.us-west-000.backblazeb2.com
   S3_REGION=us-west-000
   S3_ACCESS_KEY_ID=tu_key_id
   S3_SECRET_ACCESS_KEY=tu_application_key
   S3_BUCKET_NAME=pricofy-uploads
   S3_FORCE_PATH_STYLE=true
   S3_PUBLIC_URL=https://f000.backblazeb2.com/file/pricofy-uploads
   S3_MAKE_PUBLIC=true
   ```

3. **Probar localmente:**
   ```bash
   npm run dev
   ```

## Paso 4: Desplegar en Vercel

1. **Conectar con GitHub/GitLab:**
   - Ve a https://vercel.com
   - Click en "Add New Project"
   - Conecta tu repositorio

2. **Configurar variables de entorno:**
   - En el paso de configuración, ve a "Environment Variables"
   - Agrega todas las variables del `.env.local`:
     - `DB_HOST`
     - `DB_PORT`
     - `DB_USER`
     - `DB_PASSWORD`
     - `DB_NAME`
     - `DB_SSL`
     - `S3_ENDPOINT`
     - `S3_REGION`
     - `S3_ACCESS_KEY_ID`
     - `S3_SECRET_ACCESS_KEY`
     - `S3_BUCKET_NAME`
     - `S3_FORCE_PATH_STYLE`
     - `S3_PUBLIC_URL`
     - `S3_MAKE_PUBLIC`

3. **Configurar Build Settings:**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Deploy:**
   - Click en "Deploy"
   - Espera a que termine el build
   - Tu aplicación estará disponible en `https://tu-proyecto.vercel.app`

## Paso 5: Verificar el deployment

1. **Probar el formulario:**
   - Ve a tu URL de Vercel
   - Intenta enviar un formulario con fotos
   - Verifica que las fotos se suban correctamente a Backblaze B2

2. **Verificar la base de datos:**
   - Ve a `https://tu-proyecto.vercel.app/admin`
   - Deberías ver las solicitudes guardadas

## Troubleshooting

### Error: "Unable to connect to database"
- Verifica que las credenciales de PlanetScale sean correctas
- Asegúrate de que `DB_SSL=true` esté configurado
- Verifica que el host de PlanetScale sea correcto

### Error: "Access Denied" al subir archivos
- Verifica las Application Keys de Backblaze B2
- Asegúrate de que el bucket tenga permisos públicos si usas `S3_MAKE_PUBLIC=true`
- Verifica que `S3_BUCKET_NAME` sea correcto

### Las imágenes no se muestran
- Verifica que `S3_PUBLIC_URL` sea correcta
- Asegúrate de que el bucket sea público en Backblaze B2
- Verifica que las URLs en la base de datos sean correctas

## Costos

- **Vercel Hobby:** Gratis (con límites)
- **PlanetScale:** Gratis hasta 5GB de almacenamiento
- **Backblaze B2:** Gratis hasta 10GB de almacenamiento, luego $5/TB

## Recursos adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de PlanetScale](https://planetscale.com/docs)
- [Documentación de Backblaze B2](https://www.backblaze.com/b2/docs/)

