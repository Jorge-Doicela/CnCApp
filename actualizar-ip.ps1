# Este script lee de config.json y sincroniza todo el proyecto
$configPath = "config.json"

if (-not (Test-Path $configPath)) {
    Write-Host "❌ No se encontró config.json en la raíz." -ForegroundColor Red
    exit
}

$config = Get-Content $configPath | ConvertFrom-Json
$NuevaIP = $config.serverIp
$BackendPort = $config.backendPort
$FrontendPort = $config.frontendPort

Write-Host "🔄 Sincronizando proyecto con IP: $NuevaIP ..." -ForegroundColor Cyan

# --- 1. BACKEND (.env) ---
$envPath = "backend/.env"
if (Test-Path $envPath) {
    $content = Get-Content $envPath
    $content = $content -replace 'BASE_URL="http://[^"]+"', "BASE_URL=`"http://$($NuevaIP):$($BackendPort)`""
    $content = $content -replace 'FRONTEND_URL="http://[^"]+"', "FRONTEND_URL=`"http://$($NuevaIP):$($FrontendPort)`""
    $content = $content -replace '192\.168\.\d+\.\d+', $NuevaIP
    $content = $content -replace '26\.184\.\d+\.\d+', $NuevaIP
    $content | Set-Content $envPath
    Write-Host "✅ backend/.env sincronizado." -ForegroundColor Green
}

# --- 2. FRONTEND (environment.ts) ---
$envTsPaths = @("frontend/src/environments/environment.ts", "frontend/src/environments/environment.prod.ts")
foreach ($path in $envTsPaths) {
    if (Test-Path $path) {
        $content = Get-Content $path
        $content = $content -replace "apiUrl: 'http://[^/]+/api'", "apiUrl: 'http://$($NuevaIP):$($BackendPort)/api'"
        $content = $content -replace "redirectUrl: 'http://[^/]+/recuperar-password'", "redirectUrl: 'http://$($NuevaIP):$($FrontendPort)/recuperar-password'"
        $content = $content -replace '192\.168\.\d+\.\d+', $NuevaIP
        $content | Set-Content $path
        Write-Host "✅ $path sincronizado." -ForegroundColor Green
    }
}

# --- 3. DOCUMENTACIÓN ---
$guidePath = "DEPLOY_GUIDE.md"
if (Test-Path $guidePath) {
    $content = Get-Content $guidePath
    $content = $content -replace '192\.168\.\d+\.\d+', $NuevaIP
    $content | Set-Content $guidePath
    Write-Host "✅ DEPLOY_GUIDE.md sincronizado." -ForegroundColor Green
}

Write-Host "`n✨ ¡Sincronización terminada! ✨" -ForegroundColor Yellow
Write-Host "Ahora todos los archivos usan la IP $NuevaIP definida en config.json"
Write-Host "`nRecuerda:"
Write-Host "1. Reiniciar Backend: docker-compose up -d --build backend"
Write-Host "2. Reiniciar Android: npx cap run android --live-reload --port $FrontendPort --host $NuevaIP" -ForegroundColor White
