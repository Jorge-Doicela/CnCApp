# Script de Setup Automático para CNC Backend
# Ejecuta este script para configurar todo de una vez

Write-Host "🚀 Configurando Backend CNC..." -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Docker
Write-Host "📦 Verificando Docker..." -ForegroundColor Yellow
$dockerRunning = docker ps 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker no está corriendo. Por favor inicia Docker Desktop." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker está corriendo" -ForegroundColor Green

# 2. Iniciar PostgreSQL
Write-Host ""
Write-Host "🐘 Iniciando PostgreSQL..." -ForegroundColor Yellow
$existing = docker ps -a --filter "name=cnc-postgres" --format "{{.Names}}"
if ($existing -eq "cnc-postgres") {
    Write-Host "⚠️  Contenedor cnc-postgres ya existe. Eliminando..." -ForegroundColor Yellow
    docker rm -f cnc-postgres | Out-Null
}

docker run --name cnc-postgres `
    -e POSTGRES_PASSWORD=postgres `
    -e POSTGRES_DB=cnc_db `
    -p 5432:5432 `
    -d postgres:15 | Out-Null

Write-Host "✅ PostgreSQL iniciado" -ForegroundColor Green

# 3. Esperar a que PostgreSQL esté listo
Write-Host ""
Write-Host "⏳ Esperando a que PostgreSQL esté listo..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$ready = $false

while (-not $ready -and $attempt -lt $maxAttempts) {
    $attempt++
    Start-Sleep -Seconds 1
    $result = docker exec cnc-postgres pg_isready -U postgres 2>$null
    if ($LASTEXITCODE -eq 0) {
        $ready = $true
    }
    Write-Host "." -NoNewline
}

if ($ready) {
    Write-Host ""
    Write-Host "✅ PostgreSQL está listo" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ PostgreSQL no respondió a tiempo" -ForegroundColor Red
    exit 1
}

# 4. Ejecutar migraciones
Write-Host ""
Write-Host "📊 Ejecutando migraciones..." -ForegroundColor Yellow
npx prisma migrate deploy 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migraciones ejecutadas" -ForegroundColor Green
} else {
    Write-Host "⚠️  Intentando con migrate dev..." -ForegroundColor Yellow
    echo "init" | npx prisma migrate dev
}

# 5. Insertar datos de prueba
Write-Host ""
Write-Host "🌱 Insertando datos de prueba..." -ForegroundColor Yellow
npm run prisma:seed
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Datos insertados" -ForegroundColor Green
} else {
    Write-Host "⚠️  Error insertando datos" -ForegroundColor Yellow
}

# 6. Resumen
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🎉 ¡Setup completado!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Credenciales de prueba:" -ForegroundColor White
Write-Host "   👤 Admin: CI 1234567890, Password: 123456" -ForegroundColor Cyan
Write-Host "   👤 Usuario: CI 0987654321, Password: 123456" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Para iniciar el backend:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔍 Para verificar:" -ForegroundColor White
Write-Host "   curl http://localhost:3000/health" -ForegroundColor Yellow
Write-Host ""
