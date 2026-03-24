#!/bin/bash

# Script de configuración inicial para el servidor
# Instala Docker y Docker Compose en Ubuntu/Debian

echo "🛠️ Actualizando el sistema..."
sudo apt-get update
sudo apt-get upgrade -y

echo "🐳 Instalando Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

echo "📦 Instalando Docker Compose..."
sudo apt-get install -y docker-compose-plugin

echo "👤 Agregando el usuario al grupo docker..."
sudo usermod -aG docker $USER

echo "🚀 Docker instalado con éxito!"
docker --version
docker compose version

echo "⚠️  Nota: Es posible que necesites cerrar sesión y volver a entrar para que los cambios de permisos surtan efecto."
