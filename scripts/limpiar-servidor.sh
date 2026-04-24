#!/bin/bash

# Script de Limpieza Maestra para Producción
echo "🧹 Iniciando limpieza de mantenimiento..."

# 1. Limpieza de Docker
echo "📦 Limpiando recursos de Docker..."
docker image prune -f
docker container prune -f

# 2. Limpieza de archivos temporales de subida (más de 30 días)
# Si los certificados se pueden regenerar, no hace falta guardarlos para siempre.
UPLOADS_DIR="./backend/uploads"
if [ -d "$UPLOADS_DIR" ]; then
    echo "📂 Limpiando archivos temporales en uploads (mayores a 30 días)..."
    # Borra solo archivos .pdf viejos si quieres conservar las fotos de perfil
    find $UPLOADS_DIR -name "*.pdf" -type f -mtime +30 -delete
fi

# 3. Limpieza de logs del sistema Linux (opcional)
if [ -d "/var/log" ]; then
    echo "📄 Rotando logs del sistema..."
    sudo journalctl --vacuum-time=7d
fi

echo "✨ Limpieza completada con éxito."
