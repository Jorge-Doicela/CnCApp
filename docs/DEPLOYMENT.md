# 🚢 Guía de Despliegue - CnCApp

Esta guía detalla los pasos para desplegar el Sistema de Gestión de Capacitaciones (CnCApp) en un entorno de producción utilizando Docker.

---

## 📋 Requisitos del Servidor

- **OS**: Linux (Ubuntu 22.04 LTS recomendado)
- **CPU**: 2 vCPU mínimo
- **RAM**: 4 GB mínimo (8 GB recomendado)
- **Disco**: 20 GB SSD libre
- **Software**:
  - Docker Engine 24+
  - Docker Compose v2+
  - Git

---

## 🏗️ Arquitectura de Despliegue

Utilizamos una arquitectura de contenedores orquestada por Docker Compose:

1.  **Nginx (Reverse Proxy)**: Maneja SSL, compresión Gzip y sirve el Frontend estático.
2.  **Backend (Node.js)**: API del sistema.
3.  **PostgreSQL**: Base de datos persistente.

```mermaid
graph LR
    Internet((Internet)) -->|HTTPS 443| Nginx[Nginx Proxy]
    Nginx -->|Static Files| Frontend[Frontend App]
    Nginx -->|Proxy /api| Backend[Backend API :3000]
    Backend -->|TCP 5432| DB[(PostgreSQL)]
```

---

## 🚀 Pasos de Despliegue

### 1. Preparación del Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker (ejemplo para Ubuntu)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### 2. Obtención del Código

```bash
git clone https://github.com/TU-REPO/CnCApp.git
cd CnCApp
```

### 3. Configuración de Variables de Entorno

Crear el archivo `.env` de producción. **IMPORTANTE**: Usar credenciales seguras.

```bash
cp .env.docker .env
nano .env
```

**Variables Críticas a Configurar:**

```ini
# Base de Datos
POSTGRES_USER=cnc_admin
POSTGRES_PASSWORD=COMPLEJA_PASSWORD_AQUI_!!!
POSTGRES_DB=cnc_prod

# Backend
NODE_ENV=production
JWT_SECRET=SECRET_EXTREMADAMENTE_LARGO_Y_ALEATORIO_!!!
ALLOWED_ORIGINS=https://tusitio.gob.ec

# URL de Base de Datos (Interna para Docker)
DATABASE_URL="postgresql://cnc_admin:COMPLEJA_PASSWORD_AQUI_!!!@postgres:5432/cnc_prod"
```

### 4. Configuración de Nginx (Opcional pero Recomendado)

Si no usas un Load Balancer externo, configura Nginx dentro del `docker-compose.prod.yml` o en el host.

#### Ejemplo básico `nginx.conf`

```nginx
server {
    listen 80;
    server_name tusitio.gob.ec;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name tusitio.gob.ec;

    ssl_certificate /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;

    # Frontend
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. Despliegue con Docker Compose

Utiliza el archivo de producción para levantar los servicios.

```bash
# Construir y levantar en segundo plano
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### 6. Ejecución de Migraciones y Seed

Una vez los contenedores estén arriba, inicializa la base de datos.

```bash
# Ejecutar migraciones
docker-compose exec backend npm run prisma:migrate:deploy

# (Opcional - Solo primera vez) Seed de datos iniciales
docker-compose exec backend npm run prisma:seed
```

---

## 🔄 Actualización (CI/CD Manual)

Para actualizar la aplicación a una nueva versión:

```bash
# 1. Traer últimos cambios
git pull origin main

# 2. Reconstruir contenedores
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# 3. Aplicar migraciones si hubo cambios en DB
docker-compose exec backend npm run prisma:migrate:deploy

# 4. Limpiar imágenes antiguas (opcional)
docker image prune -f
```

---

## 📈 Monitoreo y Logs

### Ver Logs en Tiempo Real

```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend
```

### Verificar Estado

```bash
docker-compose ps
```

---

## 💾 Backups

### Base de Datos

Script simple para backup de PostgreSQL desde el host:

```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
docker-compose exec -t postgres pg_dumpall -c -U cnc_admin > dump_$TIMESTAMP.sql
gzip dump_$TIMESTAMP.sql
```

---

<div align="center">

**[⬆ Volver al Índice](INDEX.md)**

</div>
