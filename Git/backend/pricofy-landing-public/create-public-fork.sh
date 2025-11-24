#!/bin/bash

# Script para crear un fork público del proyecto
# Este script crea una copia limpia solo con la parte pública

set -e

echo "🚀 Creando fork público del proyecto..."
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Directorio base
BASE_DIR="/Users/a.olmedo/Documents/Git/backend"
ORIGINAL_DIR="$BASE_DIR/pricofy-landing"
NEW_DIR="$BASE_DIR/pricofy-landing-public"

# Verificar que el directorio original existe
if [ ! -d "$ORIGINAL_DIR" ]; then
    echo -e "${RED}❌ Error: No se encuentra el directorio original en $ORIGINAL_DIR${NC}"
    exit 1
fi

# Crear directorio nuevo si no existe
if [ -d "$NEW_DIR" ]; then
    echo -e "${YELLOW}⚠️  El directorio $NEW_DIR ya existe${NC}"
    read -p "¿Deseas eliminarlo y crear uno nuevo? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🗑️  Eliminando directorio existente...${NC}"
        rm -rf "$NEW_DIR"
    else
        echo -e "${RED}❌ Operación cancelada${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}📦 Copiando proyecto...${NC}"
cp -r "$ORIGINAL_DIR" "$NEW_DIR"

cd "$NEW_DIR"

echo -e "${GREEN}🧹 Limpiando archivos relacionados con dashboard/auth...${NC}"

# Eliminar carpetas
rm -rf app/dashboard
rm -rf app/admin
rm -rf database
rm -rf logs
rm -rf public/uploads
rm -rf lib/scraper
rm -rf lib/supabase

# Eliminar APIs privadas
rm -rf app/api/evaluation
rm -rf app/api/favorites
rm -rf app/api/my-evaluations
rm -rf app/api/scrape
rm -rf app/api/solicitudes
rm -rf app/api/submit-request
rm -rf app/api/submit-request-direct
rm -rf app/api/limite-diario

# Eliminar componentes
rm -f components/AuthModal.tsx
rm -f components/DashboardSidebar.tsx
rm -f components/ProductForm.tsx
rm -f components/UserMenu.tsx

# Eliminar contextos
rm -f contexts/AuthContext.tsx
rm -f contexts/FormContext.tsx

# Eliminar librerías
rm -f lib/db.ts
rm -f lib/chatgpt.ts
rm -f lib/email.ts
rm -f lib/pdf-generator.ts
rm -f lib/storage.ts

# Eliminar archivos SQL y scripts
rm -f *.sql
rm -f setup-database.sh

# Eliminar documentación
rm -f CONFIGURAR_*.md
rm -f GUIA_*.md
rm -f MIGRAR_*.md
rm -f SOLUCION_*.md
rm -f VERIFICAR_*.md
rm -f ACTUALIZAR_ENV.md
rm -f DEPLOY_VERCEL.md
rm -f ENV_VARIABLES.md
rm -f INSTALL_INSTRUCTIONS.md
rm -f SETUP_DB.md
rm -f TEST_*.md
rm -f VARIANTES_*.md
rm -f UMBRALES_*.md
rm -f MEJORAS_*.md
rm -f DETECCION_*.md
rm -f REVERTIR_*.md
rm -f cloud.md

# Eliminar archivos de backup
rm -f app/dashboard/page.tsx.backup
rm -f app/dashboard/page.tsx.broken

echo -e "${GREEN}✅ Archivos eliminados${NC}"
echo ""
echo -e "${YELLOW}📝 Pasos siguientes:${NC}"
echo "1. Modifica components/Providers.tsx para eliminar AuthProvider y FormProvider"
echo "2. Modifica components/Navbar.tsx para eliminar referencias a auth"
echo "3. Simplifica o elimina middleware.ts"
echo "4. Limpia package.json de dependencias no necesarias"
echo "5. Crea un nuevo .env.example solo con variables públicas"
echo "6. Actualiza README.md"
echo ""
echo -e "${GREEN}✨ Fork público creado en: $NEW_DIR${NC}"
echo ""
echo "Para continuar:"
echo "  cd $NEW_DIR"
echo "  git init"
echo "  git add ."
echo "  git commit -m 'feat: versión pública - solo home, características y precios'"


