#!/bin/bash

# Comprobar si se pasó la IP/Dominio como argumento
if [ -z "$1" ]; then
    echo "❌ Error: Debes proporcionar la IP o Dominio del servidor."
    echo "Uso: ./setup-server.sh <IP_O_DOMINIO>"
    exit 1
fi

NUEVA_IP=$1

echo "🚀 Iniciando actualización maestra para el servidor ($NUEVA_IP)..."

# 1. Actualizar backend/.env (CORS y BASE_URL)
if [ -f "backend/.env" ]; then
    # Usamos sed para buscar cualquier IP local vieja y poner la nueva
    sed -i "s/192\.168\.[0-9]\+\.[0-9]\+/$NUEVA_IP/g" backend/.env
    echo "✅ backend/.env actualizado."
fi

# 2. Actualizar frontend/src/environments/environment.ts
if [ -f "frontend/src/environments/environment.ts" ]; then
    sed -i "s/192\.168\.[0-9]\+\.[0-9]\+/$NUEVA_IP/g" frontend/src/environments/environment.ts
    echo "✅ environment.ts actualizado."
fi

# 3. Actualizar frontend/src/environments/environment.prod.ts
if [ -f "frontend/src/environments/environment.prod.ts" ]; then
    sed -i "s/192\.168\.[0-9]\+\.[0-9]\+/$NUEVA_IP/g" frontend/src/environments/environment.prod.ts
    echo "✅ environment.prod.ts actualizado."
fi

# 4. Actualizar Nginx (Opcional si usas el archivo que creamos)
if [ -f "nginx/cnc-app.conf" ]; then
    sed -i "s/tu-dominio\.com/$NUEVA_IP/g" nginx/cnc-app.conf
    echo "✅ nginx/cnc-app.conf actualizado."
fi

# 5. Reiniciar Docker Compose
echo "📦 Reconstruyendo contenedores Docker..."
docker-compose up -d --build

# 7. Configuración Automática de Crontab (Mantenimiento Pro)
echo "⏰ Configurando tareas de mantenimiento automático (Backups y Limpieza)..."

# Rutas absolutas para el cron
PROYECTO_DIR=$(pwd)
BACKUP_SCRIPT="$PROYECTO_DIR/scripts/backup-db.sh"
CLEAN_SCRIPT="$PROYECTO_DIR/scripts/limpiar-servidor.sh"

# Asegurar permisos de ejecución
chmod +x "$BACKUP_SCRIPT"
chmod +x "$CLEAN_SCRIPT"

# Crear crontab temporal
crontab -l > temp_cron 2>/dev/null

# Añadir Backup diario si no existe (2 AM)
if ! grep -q "backup-db.sh" temp_cron; then
    echo "0 2 * * * /bin/bash $BACKUP_SCRIPT" >> temp_cron
    echo "✅ Tarea de Backup añadida (Diaria 2:00 AM)"
fi

# Añadir Limpieza semanal si no existe (Domingo 3 AM)
if ! grep -q "limpiar-servidor.sh" temp_cron; then
    echo "0 3 * * 0 /bin/bash $CLEAN_SCRIPT" >> temp_cron
    echo "✅ Tarea de Limpieza añadida (Semanal Domingo 3:00 AM)"
fi

# Aplicar crontab y borrar temporal
crontab temp_cron
rm temp_cron

echo ""
echo "✨ ¡CONFIGURACIÓN TOTAL COMPLETADA! ✨"
echo "El servidor ahora es autónomo: se respalda y se limpia solo."
echo "URL actual: http://$NUEVA_IP"
