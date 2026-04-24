param (
    [Parameter(Mandatory=$true)]
    [string]$NuevaIP
)

Write-Host "🚀 Actualizando IP a: $NuevaIP en todo el proyecto..." -ForegroundColor Cyan

# 1. Actualizar backend/.env (BASE_URL y ALLOWED_ORIGINS)
$envPath = "backend/.env"
if (Test-Path $envPath) {
    $content = Get-Content $envPath
    # Reemplaza el valor de BASE_URL y busca IPs/Dominios en ALLOWED_ORIGINS
    $content = $content -replace 'BASE_URL="http://[^"]+"', "BASE_URL=`"http://$NuevaIP`""
    $content = $content -replace '192\.168\.\d+\.\d+', $NuevaIP
    $content | Set-Content $envPath
    Write-Host "✅ backend/.env actualizado." -ForegroundColor Green
}

# 2. Actualizar environment.ts (apiUrl y redirectUrl)
$envTsPath = "frontend/src/environments/environment.ts"
if (Test-Path $envTsPath) {
    $content = Get-Content $envTsPath
    $content = $content -replace "apiUrl: 'http://[^/]+/api'", "apiUrl: 'http://$NuevaIP/api'"
    $content = $content -replace "redirectUrl: 'http://[^/]+/recuperar-password'", "redirectUrl: 'http://$NuevaIP/recuperar-password'"
    $content | Set-Content $envTsPath
    Write-Host "✅ environment.ts actualizado." -ForegroundColor Green
}

# 3. Actualizar environment.prod.ts
$envProdTsPath = "frontend/src/environments/environment.prod.ts"
if (Test-Path $envProdTsPath) {
    $content = Get-Content $envProdTsPath
    $content = $content -replace "apiUrl: 'http://[^/]+/api'", "apiUrl: 'http://$NuevaIP/api'"
    $content | Set-Content $envProdTsPath
    Write-Host "✅ environment.prod.ts actualizado." -ForegroundColor Green
}

# 4. Actualizar Guía de Despliegue (para que la documentación coincida)
$guidePath = "DEPLOY_GUIDE.md"
if (Test-Path $guidePath) {
    $content = Get-Content $guidePath
    $content = $content -replace '192\.168\.\d+\.\d+', $NuevaIP
    $content | Set-Content $guidePath
    Write-Host "✅ DEPLOY_GUIDE.md actualizado." -ForegroundColor Green
}

Write-Host "`n✨ ¡Listo! Todos los archivos apuntan ahora a $NuevaIP" -ForegroundColor Yellow
Write-Host "Recuerda reiniciar los contenedores y el live-reload para aplicar los cambios."
