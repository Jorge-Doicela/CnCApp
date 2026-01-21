# Script de Reorganización del Backend por Módulos
# Este script reorganiza el backend siguiendo Clean Architecture con separación por módulos

Write-Host "=== Iniciando Reorganización del Backend ===" -ForegroundColor Cyan

# 1. Crear estructura de carpetas
Write-Host "`n1. Creando estructura de carpetas..." -ForegroundColor Yellow

$folders = @(
    "src\domain\user\entities",
    "src\domain\user\repositories",
    "src\domain\user\mappers",
    "src\domain\capacitacion\entities",
    "src\domain\capacitacion\repositories",
    "src\domain\capacitacion\mappers",
    "src\domain\certificado\entities",
    "src\domain\certificado\repositories",
    "src\domain\certificado\mappers",
    "src\domain\shared\errors",
    "src\application\auth\use-cases",
    "src\application\auth\dtos",
    "src\application\user\use-cases",
    "src\application\capacitacion\use-cases",
    "src\application\certificado\use-cases",
    "src\application\shared\interfaces",
    "src\infrastructure\database\repositories\user",
    "src\infrastructure\database\repositories\capacitacion",
    "src\infrastructure\database\repositories\certificado"
)

foreach ($folder in $folders) {
    $fullPath = Join-Path $PSScriptRoot $folder
    if (!(Test-Path $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        Write-Host "  ✓ Creado: $folder" -ForegroundColor Green
    }
}

# 2. Mover archivos del dominio
Write-Host "`n2. Moviendo archivos del dominio..." -ForegroundColor Yellow

# User domain
Copy-Item "src\domain\entities\user.entity.ts" "src\domain\user\entities\user.entity.ts" -Force
Copy-Item "src\domain\repositories\user.repository.ts" "src\domain\user\repositories\user.repository.ts" -Force
Copy-Item "src\domain\mappers\user.mapper.ts" "src\domain\user\mappers\user.mapper.ts" -Force

# Capacitacion domain
Copy-Item "src\domain\entities\capacitacion.entity.ts" "src\domain\capacitacion\entities\capacitacion.entity.ts" -Force
Copy-Item "src\domain\repositories\capacitacion.repository.ts" "src\domain\capacitacion\repositories\capacitacion.repository.ts" -Force
Copy-Item "src\domain\mappers\capacitacion.mapper.ts" "src\domain\capacitacion\mappers\capacitacion.mapper.ts" -Force

# Certificado domain
Copy-Item "src\domain\entities\certificado.entity.ts" "src\domain\certificado\entities\certificado.entity.ts" -Force
Copy-Item "src\domain\repositories\certificado.repository.ts" "src\domain\certificado\repositories\certificado.repository.ts" -Force
Copy-Item "src\domain\mappers\certificado.mapper.ts" "src\domain\certificado\mappers\certificado.mapper.ts" -Force

# Shared domain
Copy-Item "src\domain\errors\index.ts" "src\domain\shared\errors\index.ts" -Force

Write-Host "  ✓ Archivos del dominio movidos" -ForegroundColor Green

# 3. Mover archivos de application
Write-Host "`n3. Moviendo archivos de application..." -ForegroundColor Yellow

# Auth
Copy-Item "src\application\dtos\auth.dtos.ts" "src\application\auth\dtos\auth.dtos.ts" -Force
Copy-Item "src\application\use-cases\login-user.use-case.ts" "src\application\auth\use-cases\login-user.use-case.ts" -Force
Copy-Item "src\application\use-cases\register-user.use-case.ts" "src\application\auth\use-cases\register-user.use-case.ts" -Force

# User
Copy-Item "src\application\use-cases\get-all-users.use-case.ts" "src\application\user\use-cases\get-all-users.use-case.ts" -Force
Copy-Item "src\application\use-cases\get-user-profile.use-case.ts" "src\application\user\use-cases\get-user-profile.use-case.ts" -Force
Copy-Item "src\application\use-cases\update-user.use-case.ts" "src\application\user\use-cases\update-user.use-case.ts" -Force
Copy-Item "src\application\use-cases\delete-user.use-case.ts" "src\application\user\use-cases\delete-user.use-case.ts" -Force

# Capacitacion
Copy-Item "src\application\use-cases\create-capacitacion.use-case.ts" "src\application\capacitacion\use-cases\create-capacitacion.use-case.ts" -Force
Copy-Item "src\application\use-cases\get-all-capacitaciones.use-case.ts" "src\application\capacitacion\use-cases\get-all-capacitaciones.use-case.ts" -Force
Copy-Item "src\application\use-cases\update-capacitacion.use-case.ts" "src\application\capacitacion\use-cases\update-capacitacion.use-case.ts" -Force
Copy-Item "src\application\use-cases\delete-capacitacion.use-case.ts" "src\application\capacitacion\use-cases\delete-capacitacion.use-case.ts" -Force

# Certificado
Copy-Item "src\application\use-cases\create-certificado.use-case.ts" "src\application\certificado\use-cases\create-certificado.use-case.ts" -Force
Copy-Item "src\application\use-cases\get-certificado-by-qr.use-case.ts" "src\application\certificado\use-cases\get-certificado-by-qr.use-case.ts" -Force
Copy-Item "src\application\use-cases\get-user-certificados.use-case.ts" "src\application\certificado\use-cases\get-user-certificados.use-case.ts" -Force

# Shared
Copy-Item "src\application\interfaces\password-hasher.interface.ts" "src\application\shared\interfaces\password-hasher.interface.ts" -Force
Copy-Item "src\application\interfaces\token-provider.interface.ts" "src\application\shared\interfaces\token-provider.interface.ts" -Force

Write-Host "  ✓ Archivos de application movidos" -ForegroundColor Green

# 4. Mover archivos de infrastructure
Write-Host "`n4. Moviendo archivos de infrastructure..." -ForegroundColor Yellow

Copy-Item "src\infrastructure\database\repositories\prisma-user.repository.ts" "src\infrastructure\database\repositories\user\prisma-user.repository.ts" -Force
Copy-Item "src\infrastructure\database\repositories\prisma-capacitacion.repository.ts" "src\infrastructure\database\repositories\capacitacion\prisma-capacitacion.repository.ts" -Force
Copy-Item "src\infrastructure\database\repositories\prisma-certificado.repository.ts" "src\infrastructure\database\repositories\certificado\prisma-certificado.repository.ts" -Force

Write-Host "  ✓ Archivos de infrastructure movidos" -ForegroundColor Green

Write-Host "`n=== Reorganización Completada ===" -ForegroundColor Cyan
Write-Host "Ahora ejecuta el script de actualización de imports..." -ForegroundColor Yellow
