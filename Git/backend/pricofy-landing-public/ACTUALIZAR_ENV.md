# 🔧 Actualizar .env.local con valores correctos de Railway

## Problema

Tu `.env.local` tiene `DB_HOST` con una URL completa:
```
DB_HOST=mysql://root:password@gondola.proxy.rlwy.net:36353/railway
```

Aunque el código ahora puede parsear esto, es mejor usar valores individuales.

## Solución: Actualizar .env.local

### Opción 1: Actualizar manualmente

Abre tu `.env.local` y cambia:

**De esto:**
```env
DB_HOST=mysql://root:UtPkmLVYUbaNYIstvAIvJfrmBrKysJYo@gondola.proxy.rlwy.net:36353/railway
DB_PORT=3306
DB_USER=root
DB_PASSWORD=UtPkmLVYUbaNYIstvAIvJfrmBrKysJYo
DB_NAME=railway
```

**A esto:**
```env
DB_HOST=gondola.proxy.rlwy.net
DB_PORT=36353
DB_USER=root
DB_PASSWORD=UtPkmLVYUbaNYIstvAIvJfrmBrKysJYo
DB_NAME=railway
DB_SSL=false
```

### Opción 2: Usar el script automático

Ejecuta en tu terminal:
```bash
# Extraer valores de la URL
HOST=$(grep "^DB_HOST=" .env.local | sed 's|.*@\([^:]*\):.*|\1|')
PORT=$(grep "^DB_HOST=" .env.local | sed 's|.*:\([0-9]*\)/.*|\1|')

# Actualizar .env.local
sed -i.bak "s|^DB_HOST=.*|DB_HOST=$HOST|" .env.local
sed -i.bak "s|^DB_PORT=.*|DB_PORT=$PORT|" .env.local
```

## Verificar que funciona

Después de actualizar:

1. **Reinicia el servidor:**
   ```bash
   # Detén el servidor (Ctrl+C)
   npm run dev
   ```

2. **Prueba enviar un formulario**

3. **Si sigue fallando, revisa los logs en la terminal** para ver el error específico

