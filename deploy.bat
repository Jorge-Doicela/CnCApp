@echo off
set BRANCH=%1
if "%BRANCH%"=="" set BRANCH=main

echo 🚀 Iniciando despliegue de CnCApp (Rama: %BRANCH%)...

:: 1. Bajar los últimos cambios de Git
echo 📥 Actualizando código desde Git...
git pull origin %BRANCH%

:: 2. Construir y levantar los contenedores
echo 🏗️  Construyendo imágenes y levantando servicios...
docker compose up -d --build

:: 3. Limpiar imágenes huérfanas
echo 🧹 Limpiando imágenes antiguas...
docker image prune -f

echo ✅ Despliegue completado con éxito!
echo 🌐 Frontend: http://localhost:80 (o la IP de este servidor: 192.168.3.2)
echo ⚙️  Backend: http://localhost:3000
pause
