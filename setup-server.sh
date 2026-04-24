#!/bin/bash

# --- 1. LEER CONFIGURACIÓN DESDE config.json ---
CONFIG_FILE="config.json"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Error: No se encontró config.json"
    exit 1
fi

# Extraer valores del JSON (usando grep/sed para máxima compatibilidad)
NUEVA_IP=$(grep '"serverIp":' $CONFIG_FILE | sed -E 's/.*"serverIp": "([^"]+)".*/\1/')
BACKEND_PORT=$(grep '"backendPort":' $CONFIG_FILE | sed -E 's/.*"backendPort": ([0-9]+).*/\1/')
FRONTEND_PORT=$(grep '"frontendPort":' $CONFIG_FILE | sed -E 's/.*"frontendPort": ([0-9]+).*/\1/')

if [ -z "$NUEVA_IP" ]; then
    echo "❌ Error: No se pudo leer la IP de config.json"
    exit 1
fi

echo "🚀 Iniciando despliegue maestro en: http://$NUEVA_IP"

# --- 2. SINCRONIZAR ARCHIVOS ---

# Actualizar backend/.env
if [ -f "backend/.env" ]; then
    sed -i "s|BASE_URL=\"http://[^\"]*\"|BASE_URL=\"http://$NUEVA_IP:$BACKEND_PORT\"|g" backend/.env
    sed -i "s|FRONTEND_URL=\"http://[^\"]*\"|FRONTEND_URL=\"http://$NUEVA_IP:$FRONTEND_PORT\"|g" backend/.env
    sed -i "s/[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}/$NUEVA_IP/g" backend/.env
    echo "✅ backend/.env actualizado."
fi

# Actualizar frontend environments
for ENV_FILE in "frontend/src/environments/environment.ts" "frontend/src/environments/environment.prod.ts"; do
    if [ -f "$ENV_FILE" ]; then
        sed -i "s|apiUrl: 'http://[^/]*/api'|apiUrl: 'http://$NUEVA_IP:$BACKEND_PORT/api'|g" "$ENV_FILE"
        sed -i "s|redirectUrl: 'http://[^/]*/recuperar-password'|redirectUrl: 'http://$NUEVA_IP:$FRONTEND_PORT/recuperar-password'|g" "$ENV_FILE"
        sed -i "s/[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}/$NUEVA_IP/g" "$ENV_FILE"
        echo "✅ $ENV_FILE actualizado."
    fi
done

# Actualizar Nginx si existe
if [ -f "nginx/cnc-app.conf" ]; then
    sed -i "s/tu-dominio\.com/$NUEVA_IP/g" nginx/cnc-app.conf
    echo "✅ nginx/cnc-app.conf actualizado."
fi

# --- 3. DESPLIEGUE CON DOCKER ---
echo "📦 Levantando servicios con Docker Compose..."
docker-compose up -d --build

# --- 4. CONFIGURACIÓN DE MANTENIMIENTO (CRON) ---
PROYECTO_DIR=$(pwd)
BACKUP_SCRIPT="$PROYECTO_DIR/scripts/backup-db.sh"
CLEAN_SCRIPT="$PROYECTO_DIR/scripts/limpiar-servidor.sh"

chmod +x "$BACKUP_SCRIPT" 2>/dev/null
chmod +x "$CLEAN_SCRIPT" 2>/dev/null

# Configurar crontab si los scripts existen
if [ -f "$BACKUP_SCRIPT" ]; then
    (crontab -l 2>/dev/null | grep -v "backup-db.sh"; echo "0 2 * * * /bin/bash $BACKUP_SCRIPT") | crontab -
    echo "✅ Backup diario configurado (2:00 AM)."
fi

echo ""
echo "✨ ¡DESPLIEGUE COMPLETADO EXITOSAMENTE! ✨"
echo "Servidor listo en: http://$NUEVA_IP"
echo "Puertos: Backend ($BACKEND_PORT), Frontend ($FRONTEND_PORT)"
