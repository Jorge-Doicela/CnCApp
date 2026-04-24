#!/bin/bash

# Configuración
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DATABASE_NAME="cnc_db"
CONTAINER_NAME="cnc-postgres"

# Crear directorio de backups si no existe
mkdir -p $BACKUP_DIR

# Ejecutar el dump
echo "Iniciando backup de la base de datos..."
docker exec $CONTAINER_NAME pg_dump -U postgres $DATABASE_NAME > $BACKUP_DIR/backup_$TIMESTAMP.sql

# Borrar backups antiguos (más de 7 días)
find $BACKUP_DIR -type f -name "*.sql" -mtime +7 -delete

echo "Backup completado: $BACKUP_DIR/backup_$TIMESTAMP.sql"
