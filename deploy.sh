#!/bin/bash

# Script de despliegue automático para CnCApp
# Uso: ./deploy.sh [rama]

BRANCH=${1:-main}

echo "🚀 Iniciando despliegue de CnCApp (Rama: $BRANCH)..."

# 1. Bajar los últimos cambios de Git
echo "📥 Actualizando código desde Git..."
git pull origin $BRANCH

# 2. Construir y levantar los contenedores
echo "🏗️  Construyendo imágenes y levantando servicios..."
docker compose up -d --build

# 3. Limpiar imágenes huérfanas
echo "🧹 Limpiando imágenes antiguas..."
docker image prune -f

# 4. Sembrar la base de datos (Ejecutar seeders)
echo "⏳ Esperando 15 segundos a que la base de datos esté lista..."
sleep 15
echo "🏗️  Aplicando migraciones (Esquema de BD)..."
docker compose exec -T backend npx prisma migrate deploy
echo "🌱 Sembrando la base de datos..."
docker compose exec -T backend npx prisma db seed

echo "✅ Despliegue y Semillado completado con éxito!"
echo "🌐 Frontend: http://localhost:80 (o la IP de tu servidor)"
echo "⚙️  Backend: http://localhost:3000"
