# Pricofy Landing Page

Landing page moderna para Pricofy, una plataforma de optimización de precios con inteligencia artificial.

## 🚀 Deployment

Este proyecto está configurado para desplegarse en:
- **Vercel (Hobby - Gratis)** para el hosting
- **PlanetScale (Gratis)** para la base de datos MySQL
- **Backblaze B2 (Gratis)** para almacenamiento de archivos

Para instrucciones detalladas de deployment, consulta [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)

## 🚀 Tecnologías

- **Next.js 14** - Framework de React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utilitarios
- **React 18** - Biblioteca de UI

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Iniciar en producción
npm start
```

## 🏗️ Estructura del Proyecto

```
pricofy-landing/
├── app/
│   ├── layout.tsx      # Layout principal
│   ├── page.tsx        # Página principal
│   └── globals.css     # Estilos globales
├── components/
│   ├── Navbar.tsx      # Barra de navegación
│   ├── Hero.tsx        # Sección hero
│   ├── Features.tsx    # Características
│   ├── CTA.tsx         # Call to action
│   └── Footer.tsx      # Pie de página
├── public/             # Archivos estáticos
└── package.json        # Dependencias
```

## 🎨 Características

- ✅ Diseño responsive
- ✅ Navegación suave
- ✅ Menú móvil
- ✅ SEO optimizado
- ✅ Performance optimizado

## 📝 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter

## 🗄️ Configuración de Base de Datos

El formulario guarda los datos en una base de datos SQL. Para producción, se recomienda usar **PlanetScale** (MySQL compatible).

### Configuración Local (Desarrollo)

1. **Usa MySQL local o Docker** (ver `SETUP_DB.md`)
2. **Configura las variables de entorno** en `.env.local`:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=tu_contraseña
   DB_NAME=pricofy_db
   DB_SSL=false
   ```

### Configuración para Producción (PlanetScale)

1. **Crea una cuenta en PlanetScale** (gratis)
2. **Crea la base de datos** y ejecuta el esquema SQL
3. **Configura las variables de entorno** (ver `ENV_VARIABLES.md`):
   ```
   DB_HOST=aws.connect.psdb.cloud
   DB_PORT=3306
   DB_USER=tu_usuario_planetscale
   DB_PASSWORD=tu_password_planetscale
   DB_NAME=pricofy_db
   DB_SSL=true
   ```

## 📋 Características del Formulario

- ✅ Validación de email (evita emails temporales o incorrectos)
- ✅ Campo de fotos obligatorio cuando se selecciona "quiero vender un producto"
- ✅ Todos los campos requeridos están validados
- ✅ Subida de archivos (hasta 6 fotos) - Almacenamiento en Backblaze B2 o S3
- ✅ Almacenamiento en base de datos SQL (PlanetScale)
- ✅ Límite de una solicitud por email al día
- ✅ Mensajes de éxito/error claros
- ✅ Soporte multiidioma (ES/EN)

## 🔍 Ver Solicitudes Guardadas

Para ver todas las solicitudes guardadas en la base de datos:

1. **Página de Administración**: Accede a `http://localhost:3001/admin`
   - Muestra todas las solicitudes en formato tabla
   - Incluye vista detallada con todos los campos
   - Permite ver las fotos subidas
   - Botón para actualizar la lista

2. **API Endpoint**: `GET /api/solicitudes`
   - Retorna todas las solicitudes en formato JSON
   - Útil para integrar con otros sistemas

**Nota**: Cuando configures tu base de datos, descomenta la función `getAllSolicitudes()` en `lib/db.ts` según tu tipo de base de datos (MySQL o PostgreSQL).

## 🌐 Próximos Pasos

- [x] Implementar formulario de contacto
- [ ] Agregar sección de testimonios
- [ ] Agregar animaciones
- [ ] Integrar con backend completo
- [ ] Agregar analytics
