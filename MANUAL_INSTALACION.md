# Manual de Instalación Completa — CnCApp (CNC Portal)

**Sistema:** Gestión de capacitaciones y certificaciones CNC  
**Proyecto:** `CnCApp`  
**Desarrollador:** Jorge Doicela  
**Versión del documento:** 1.3 (marzo 2026)  
**Audiencia:** DevOps, backend/frontend, infraestructura, soporte técnico.

---

## Tabla de contenidos

1. [Objetivo y alcance](#1-objetivo-y-alcance)
2. [Arquitecturas de despliegue soportadas](#2-arquitecturas-de-despliegue-soportadas)
3. [Requisitos generales](#3-requisitos-generales)
4. [Variables de entorno](#4-variables-de-entorno)
5. [Instalación local sin Docker](#5-instalación-local-sin-docker)
6. [Instalación con Docker Compose](#6-instalación-con-docker-compose)
7. [Instalación en servidor propio (VPS/dedicado)](#7-instalación-en-servidor-propio-vpsdedicado)
8. [Instalación con dominio y SSL (Nginx + Let's Encrypt)](#8-instalación-con-dominio-y-ssl-nginx--lets-encrypt)
9. [Instalación de base de datos gestionada externa](#9-instalación-de-base-de-datos-gestionada-externa)
10. [Inicialización de datos (migraciones + seed)](#10-inicialización-de-datos-migraciones--seed)
11. [Android/Capacitor (opcional)](#11-androidcapacitor-opcional)
12. [Verificación post-instalación](#12-verificación-post-instalación)
13. [Operación y mantenimiento](#13-operación-y-mantenimiento)
14. [Backups y recuperación](#14-backups-y-recuperación)
15. [Actualización de versión (upgrade)](#15-actualización-de-versión-upgrade)
16. [Troubleshooting de instalación](#16-troubleshooting-de-instalación)
17. [Checklist final de salida a producción](#17-checklist-final-de-salida-a-producción)
18. [Caso real A: Oracle Cloud (Ubuntu + Docker)](#18-caso-real-a-oracle-cloud-ubuntu--docker)
19. [Caso real B: AWS EC2 + RDS PostgreSQL](#19-caso-real-b-aws-ec2--rds-postgresql)
20. [Caso real C: Servidor on-premise institucional](#20-caso-real-c-servidor-on-premise-institucional)
21. [Plantilla 100% parametrizable (copiar/pegar)](#21-plantilla-100-parametrizable-copiarpegar)
22. [Matriz de entornos (DEV/QA/UAT/PROD)](#22-matriz-de-entornos-devqauatprod)
23. [Hardening de servidor y red](#23-hardening-de-servidor-y-red)
24. [Alta disponibilidad y escalabilidad](#24-alta-disponibilidad-y-escalabilidad)
25. [Monitoreo, métricas y alertas](#25-monitoreo-métricas-y-alertas)
26. [Plan de continuidad y recuperación (BCP/DRP)](#26-plan-de-continuidad-y-recuperación-bcpdrp)
27. [Pipeline de despliegue seguro (GitOps/CI-CD)](#27-pipeline-de-despliegue-seguro-gitopscicd)
28. [Runbooks operativos de incidentes](#28-runbooks-operativos-de-incidentes)
29. [Matriz de validación técnica post-deploy](#29-matriz-de-validación-técnica-post-deploy)
30. [Cumplimiento operativo y evidencia de instalación](#30-cumplimiento-operativo-y-evidencia-de-instalación)
31. [Diagramas de red por escenario](#31-diagramas-de-red-por-escenario)
32. [Matriz de capacidad y dimensionamiento](#32-matriz-de-capacidad-y-dimensionamiento)

---

## 1. Objetivo y alcance

Este manual describe cómo instalar y poner en marcha `CnCApp` en distintos escenarios:

- Desarrollo local sin contenedores.
- Docker Compose en host local o servidor.
- Servidor propio (VPS o dedicado) con `Nginx` y `systemd`.
- Configuración con dominio y certificados SSL.
- Uso de base de datos externa gestionada.

---

## 2. Arquitecturas de despliegue soportadas

```mermaid
flowchart LR
  U[Usuarios] --> N[Nginx/Proxy]
  N --> F[Frontend Angular-Ionic]
  N --> B[Backend Node.js]
  B --> D[(PostgreSQL)]
```

### Modalidades

1. **Local dev (sin Docker)**  
   Backend y frontend corren con `npm`, DB local.

2. **Docker Compose**  
   Servicios en contenedores (frontend/backend/db/proxy según configuración).

3. **Servidor propio**  
   Backend y frontend construidos y ejecutados como servicios (`systemd`) detrás de Nginx.

4. **Servidor propio + DB externa**  
   Igual que 3, pero `DATABASE_URL` apunta a proveedor gestionado (RDS, Cloud SQL, etc.).

---

## 3. Requisitos generales

### 3.1 Software mínimo

- **Node.js** 18+
- **npm** 9+
- **PostgreSQL** 14+ (si no usa DB externa)
- **Git**
- **Docker + Docker Compose** (si usa contenedores)

### 3.2 Recursos recomendados (producción inicial)

- 2 vCPU
- 4 GB RAM (mínimo funcional), recomendado 8 GB
- 40 GB SSD
- Ubuntu 22.04 LTS (o equivalente Linux)

### 3.3 Puertos típicos

- Frontend: `4200` (dev) / `80`/`443` (proxy)
- Backend: `3000`
- PostgreSQL: `5432` (interno, no público recomendado)

---

## 4. Variables de entorno

> Ajuste los nombres según los `.env.example` reales del proyecto.

### 4.1 Backend (`backend/.env`)

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://usuario:password@host:5432/cncapp
JWT_SECRET=CAMBIAR_POR_SECRETO_FUERTE
CORS_ORIGIN=https://tu-dominio.gob.ec
```

### 4.2 Frontend (`frontend/src/environments/*`)

```ts
export const environment = {
  production: true,
  apiUrl: 'https://tu-dominio.gob.ec/api'
};
```

> Si el frontend consume backend en el mismo dominio vía proxy, ajuste `apiUrl` al path correcto.

---

## 5. Instalación local sin Docker

### 5.1 Clonar repositorio

```bash
git clone <URL_REPOSITORIO>
cd CnCApp
```

### 5.2 Instalar dependencias

```bash
npm run install:all
```

### 5.3 Configurar backend

```bash
cd backend
cp .env.example .env
```

Editar `.env` con `DATABASE_URL`, `JWT_SECRET`, etc.

### 5.4 Preparar base de datos

```bash
npm run prisma:migrate
npm run prisma:seed
```

### 5.5 Levantar servicios

Terminal 1:

```bash
cd backend
npm run dev
```

Terminal 2:

```bash
cd frontend
npm start
```

### 5.6 Acceso

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:3000`

---

## 6. Instalación con Docker Compose

### 6.1 Preparación

```bash
git clone <URL_REPOSITORIO>
cd CnCApp
cp .env.docker .env
```

Editar `.env` (claves, contraseñas y dominio).

### 6.2 Levantar stack

```bash
docker compose up -d
```

### 6.3 Ver estado

```bash
docker compose ps
docker compose logs -f
```

### 6.4 Migraciones/seed dentro del contenedor backend

```bash
docker compose exec backend npm run prisma:migrate
docker compose exec backend npm run prisma:seed
```

### 6.5 Detener

```bash
docker compose down
```

---

## 7. Instalación en servidor propio (VPS/dedicado)

## 7.1 Escenario recomendado

- Ubuntu 22.04
- Backend como servicio `systemd`
- Frontend compilado y servido por Nginx
- PostgreSQL local o externo

### 7.2 Paquetes base

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl nginx postgresql postgresql-contrib
```

Instalar Node 18+ (NodeSource o `nvm`), luego verificar:

```bash
node -v
npm -v
```

### 7.3 Crear usuario de despliegue

```bash
sudo adduser cncapp
sudo usermod -aG sudo cncapp
```

### 7.4 Desplegar código

```bash
sudo su - cncapp
git clone <URL_REPOSITORIO> app
cd app
npm run install:all
```

### 7.5 Configurar PostgreSQL local (si aplica)

```bash
sudo -u postgres psql
```

Dentro de `psql`:

```sql
CREATE DATABASE cncapp;
CREATE USER cncuser WITH ENCRYPTED PASSWORD 'cambiar_password';
GRANT ALL PRIVILEGES ON DATABASE cncapp TO cncuser;
```

### 7.6 Configurar backend

```bash
cd /home/cncapp/app/backend
cp .env.example .env
```

Completar `.env` y ejecutar:

```bash
npm run prisma:migrate
npm run prisma:seed
npm run build
```

### 7.7 Configurar frontend

```bash
cd /home/cncapp/app/frontend
npm run build
```

### 7.8 Crear servicio systemd para backend

Archivo: `/etc/systemd/system/cncapp-backend.service`

```ini
[Unit]
Description=CnCApp Backend
After=network.target

[Service]
Type=simple
User=cncapp
WorkingDirectory=/home/cncapp/app/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Activar servicio:

```bash
sudo systemctl daemon-reload
sudo systemctl enable cncapp-backend
sudo systemctl start cncapp-backend
sudo systemctl status cncapp-backend
```

---

## 8. Instalación con dominio y SSL (Nginx + Let's Encrypt)

### 8.1 DNS

Configurar registros:

- `A` → IP del servidor (`tu-dominio.gob.ec`)
- opcional `www` o subdominios.

### 8.2 Nginx (frontend + proxy backend)

Archivo: `/etc/nginx/sites-available/cncapp`

```nginx
server {
    listen 80;
    server_name tu-dominio.gob.ec;

    root /home/cncapp/app/frontend/www;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Habilitar sitio:

```bash
sudo ln -s /etc/nginx/sites-available/cncapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 8.3 Certificado SSL

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.gob.ec
```

Verificar renovación automática:

```bash
sudo certbot renew --dry-run
```

---

## 9. Instalación de base de datos gestionada externa

### 9.1 Caso de uso

Ideal cuando se requiere:

- alta disponibilidad administrada,
- backups automáticos,
- menor carga operativa local.

### 9.2 Pasos

1. Crear instancia PostgreSQL administrada.
2. Permitir IP del servidor en firewall del proveedor.
3. Obtener cadena de conexión TLS.
4. Configurar `DATABASE_URL` en backend.
5. Ejecutar migraciones y seed desde servidor app:

```bash
cd /home/cncapp/app/backend
npm run prisma:migrate
npm run prisma:seed
```

### 9.3 Recomendaciones

- Exigir SSL/TLS en conexión.
- Usuario DB con privilegios mínimos.
- Monitorear conexiones y latencia.

---

## 10. Inicialización de datos (migraciones + seed)

### 10.1 Orden recomendado

1. Migraciones.
2. Seed de catálogos y roles.
3. Validación de datos iniciales.

```mermaid
flowchart LR
  M[Migraciones] --> S[Seed]
  S --> V[Validación funcional]
```

### 10.2 Comandos

```bash
cd backend
npm run prisma:migrate
npm run prisma:seed
```

### 10.3 Validaciones mínimas

- Existen roles base.
- Existen entidades/catálogos principales.
- Login funcional.
- Módulos visibles por rol.

---

## 11. Android/Capacitor (opcional)

### 11.1 Construcción

```bash
cd frontend
npm run build
cd ..
npx cap sync android
npx cap open android
```

### 11.2 Recomendaciones

- Probar cámara para QR en dispositivos reales.
- Verificar permisos y deep links.
- Sincronizar cada vez que cambie frontend.

---

## 12. Verificación post-instalación

### 12.1 Smoke test técnico

1. Cargar home.
2. Login con usuario válido.
3. Abrir módulo admin/conferencista/usuario.
4. Crear capacitación de prueba.
5. Inscribir participante.
6. Confirmar asistencia QR.
7. Generar y validar certificado.
8. Exportar reporte PDF.

### 12.2 Health checks sugeridos

- `GET /health` (si implementado)
- `GET /api/...` básico autenticado/no autenticado
- estado `systemd` y Nginx

---

## 13. Operación y mantenimiento

### 13.1 Servicios

```bash
sudo systemctl status cncapp-backend
sudo systemctl restart cncapp-backend
sudo systemctl status nginx
```

### 13.2 Logs

```bash
sudo journalctl -u cncapp-backend -f
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 13.3 Rotación de logs

Configurar `logrotate` para backend/nginx según política institucional.

---

## 14. Backups y recuperación

### 14.1 Backup PostgreSQL (ejemplo)

```bash
pg_dump -U cncuser -h 127.0.0.1 -d cncapp > backup_cncapp_$(date +%F).sql
```

### 14.2 Restauración

```bash
psql -U cncuser -h 127.0.0.1 -d cncapp < backup_cncapp_2026-03-24.sql
```

### 14.3 Política recomendada

- Backup diario incremental + semanal completo.
- Retención mínima 30 días.
- Prueba de restauración mensual.

---

## 15. Actualización de versión (upgrade)

### 15.1 Flujo seguro

```mermaid
flowchart LR
  B[Backup DB] --> C[Deploy nuevo código]
  C --> M[Migraciones]
  M --> R[Restart servicios]
  R --> S[Smoke tests]
  S --> O[Operación normal]
```

### 15.2 Pasos

1. Realizar backup.
2. `git pull` o desplegar nueva release.
3. `npm install` (si cambia lock).
4. `npm run prisma:migrate`.
5. `npm run build` backend/frontend.
6. Reiniciar servicios.
7. Ejecutar smoke tests.

### 15.3 Rollback (mínimo)

- Restaurar backup DB si migración no reversible.
- Volver a versión anterior de código.
- Reiniciar servicios.

---

## 16. Troubleshooting de instalación

| Problema | Causa probable | Solución |
|----------|----------------|----------|
| `npm install` falla | versión Node incompatible | usar Node 18+ |
| Prisma no conecta DB | `DATABASE_URL` incorrecta | validar host/usuario/password/puerto |
| Error `P2021` | tabla inexistente | ejecutar migraciones correctas |
| Front no llega a API | `apiUrl`/proxy mal configurado | revisar `environment` y Nginx `/api` |
| 502 Bad Gateway | backend caído | revisar `systemctl status` y logs |
| Certbot falla | DNS mal configurado | validar A record y propagación |
| CORS bloqueado | origen no permitido | actualizar `CORS_ORIGIN` backend |

---

## 17. Checklist final de salida a producción

- [ ] Dominio configurado y SSL activo.
- [ ] Variables de entorno seguras.
- [ ] `JWT_SECRET` robusto y protegido.
- [ ] Migraciones ejecutadas.
- [ ] Seed inicial aplicado (si corresponde).
- [ ] Servicios activos (`backend`, `nginx`, `db`/externa).
- [ ] Backups automáticos configurados.
- [ ] Smoke tests funcionales aprobados.
- [ ] Monitoreo y alertas definidos.
- [ ] Documentación entregada (`MANUAL_DE_USUARIO.md`, `MANUAL_TECNICO.md`, `MANUAL_INSTALACION.md`).

---

## 18. Caso real A: Oracle Cloud (Ubuntu + Docker)

### 18.1 Supuestos

- VM Ubuntu 22.04 en Oracle Cloud.
- Dominio apuntando a IP pública de la VM.
- Docker/Compose como runtime principal.

### 18.2 Apertura de puertos

En Oracle Cloud (Security List o NSG), habilitar:

- `22/tcp` (SSH)
- `80/tcp` (HTTP)
- `443/tcp` (HTTPS)

### 18.3 Provisionamiento rápido

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl ca-certificates gnupg
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker
docker --version
docker compose version
```

### 18.4 Despliegue aplicación

```bash
git clone <URL_REPOSITORIO>
cd CnCApp
cp .env.docker .env
# editar .env con dominio, claves y credenciales
docker compose up -d
docker compose exec backend npm run prisma:migrate
docker compose exec backend npm run prisma:seed
```

### 18.5 SSL en Oracle

Si Nginx está en host:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.gob.ec
```

Si Nginx está en contenedor, usar reverse proxy externo o certificado montado por volumen.

### 18.6 Recomendaciones Oracle

- Habilitar backups de volumen de la instancia.
- Restringir SSH por IP administrativa.
- Activar monitoreo de métricas (CPU, RAM, red) y alertas.

---

## 19. Caso real B: AWS EC2 + RDS PostgreSQL

### 19.1 Arquitectura recomendada

```mermaid
flowchart LR
  U[Usuarios] --> ALB[ALB/Nginx]
  ALB --> EC2[EC2 Ubuntu - App]
  EC2 --> RDS[(RDS PostgreSQL)]
```

### 19.2 Componentes

- EC2 para frontend/backend.
- RDS PostgreSQL administrado.
- Security Groups:
  - EC2: 22 (restringido), 80, 443.
  - RDS: 5432 solo desde SG de EC2.

### 19.3 Pasos resumidos

1. Crear RDS PostgreSQL.
2. Crear EC2 Ubuntu.
3. Instalar Node/Docker según estrategia.
4. Configurar `DATABASE_URL` hacia endpoint RDS.
5. Ejecutar migraciones y seed.
6. Configurar Nginx + SSL.

### 19.4 Variables ejemplo RDS

```env
DATABASE_URL=postgresql://cncuser:password@cncapp-rds.abc123.us-east-1.rds.amazonaws.com:5432/cncapp?schema=public
```

### 19.5 Buenas prácticas AWS

- Activar Multi-AZ en RDS (si presupuesto lo permite).
- Activar backups automáticos de RDS.
- Usar IAM/SSM para gestión segura (evitar llaves SSH abiertas).
- Guardar secretos en AWS Secrets Manager o SSM Parameter Store.

---

## 20. Caso real C: Servidor on-premise institucional

### 20.1 Escenario

- Datacenter interno CNC/GAD.
- Virtualización local (VMware/Proxmox/Hyper-V).
- Sin dependencia de nube pública.

### 20.2 Requisitos adicionales

- UPS y redundancia eléctrica.
- Política institucional de backup offline.
- Segmentación de red (VLAN app/db/admin).
- Integración con monitoreo interno (Zabbix/Prometheus/Grafana).

### 20.3 Topología sugerida

```mermaid
flowchart LR
  FW[Firewall institucional]
  RP[Reverse Proxy Nginx]
  APP[Servidor App CnCApp]
  DB[(Servidor PostgreSQL)]
  BKP[Repositorio de Backups]

  FW --> RP --> APP --> DB
  DB --> BKP
  APP --> BKP
```

### 20.4 Checklist on-premise

- [ ] Política de acceso administrativo aprobada.
- [ ] Segmentación de red implementada.
- [ ] Copias de seguridad locales + externas.
- [ ] Procedimiento de DRP probado.
- [ ] Inventario de activos y parches actualizado.

---

## 21. Plantilla 100% parametrizable (copiar/pegar)

Este bloque está diseñado para ejecutar instalación real cambiando solo variables.

### 21.1 Variables (edite antes de ejecutar)

```bash
export APP_NAME="cncapp"
export APP_USER="cncapp"
export APP_DIR="/home/${APP_USER}/app"
export REPO_URL="<URL_REPOSITORIO_GIT>"
export DOMAIN="tu-dominio.gob.ec"
export EMAIL_SSL="admin@competencias.gob.ec"

export DB_HOST="127.0.0.1"
export DB_PORT="5432"
export DB_NAME="cncapp"
export DB_USER="cncuser"
export DB_PASS="CAMBIAR_PASSWORD_DB"
export JWT_SECRET="CAMBIAR_SECRETO_SUPER_FUERTE"
```

### 21.2 Script base de provisión (Ubuntu 22.04)

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl nginx certbot python3-certbot-nginx ca-certificates gnupg
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node -v && npm -v
```

### 21.3 Crear usuario de despliegue

```bash
id -u "${APP_USER}" >/dev/null 2>&1 || sudo adduser --disabled-password --gecos "" "${APP_USER}"
sudo usermod -aG sudo "${APP_USER}"
```

### 21.4 Clonar y preparar proyecto

```bash
sudo -u "${APP_USER}" -H bash -lc "
  git clone ${REPO_URL} ${APP_DIR} || true
  cd ${APP_DIR}
  npm run install:all
"
```

### 21.5 Configurar backend `.env` (template)

```bash
sudo -u "${APP_USER}" -H bash -lc "
cat > ${APP_DIR}/backend/.env <<EOF
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}
JWT_SECRET=${JWT_SECRET}
CORS_ORIGIN=https://${DOMAIN}
EOF
"
```

### 21.6 Migraciones, seed y build

```bash
sudo -u "${APP_USER}" -H bash -lc "
  cd ${APP_DIR}/backend
  npm run prisma:migrate
  npm run prisma:seed
  npm run build
"

sudo -u "${APP_USER}" -H bash -lc "
  cd ${APP_DIR}/frontend
  npm run build
"
```

### 21.7 Servicio systemd backend

```bash
sudo tee /etc/systemd/system/${APP_NAME}-backend.service > /dev/null <<EOF
[Unit]
Description=${APP_NAME} Backend
After=network.target

[Service]
Type=simple
User=${APP_USER}
WorkingDirectory=${APP_DIR}/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable ${APP_NAME}-backend
sudo systemctl restart ${APP_NAME}-backend
sudo systemctl status ${APP_NAME}-backend --no-pager
```

### 21.8 Nginx + proxy `/api`

```bash
sudo tee /etc/nginx/sites-available/${APP_NAME} > /dev/null <<EOF
server {
    listen 80;
    server_name ${DOMAIN};

    root ${APP_DIR}/frontend/www;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/${APP_NAME} /etc/nginx/sites-enabled/${APP_NAME}
sudo nginx -t
sudo systemctl reload nginx
```

### 21.9 SSL Let's Encrypt

```bash
sudo certbot --nginx -d "${DOMAIN}" -m "${EMAIL_SSL}" --agree-tos --no-eff-email -n
sudo certbot renew --dry-run
```

### 21.10 Verificación final

```bash
curl -I https://${DOMAIN}
sudo systemctl status ${APP_NAME}-backend --no-pager
sudo systemctl status nginx --no-pager
```

### 21.11 Variante Docker (parametrizable)

```bash
export REPO_URL="<URL_REPOSITORIO_GIT>"
git clone "${REPO_URL}" cncapp && cd cncapp
cp .env.docker .env
# editar .env: dominio, JWT, DB, CORS
docker compose up -d
docker compose exec backend npm run prisma:migrate
docker compose exec backend npm run prisma:seed
docker compose ps
```

### 21.12 Comandos de soporte rápido

```bash
sudo journalctl -u ${APP_NAME}-backend -f
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

---

## 22. Matriz de entornos (DEV/QA/UAT/PROD)

### 22.1 Objetivo

Definir una estrategia de promoción controlada por ambientes, evitando “saltos” directos a producción.

| Entorno | Propósito | Datos | Frecuencia despliegue | Responsable |
|---------|-----------|-------|------------------------|-------------|
| DEV | Desarrollo e integración rápida | Sintéticos | Diaria | Equipo dev |
| QA | Pruebas funcionales/regresión | Semilla + pruebas | Varias veces por sprint | QA + Dev |
| UAT | Validación de negocio | Dataset anonimizado cercano a real | Antes de release | Funcional + QA |
| PROD | Operación oficial | Reales | Según calendario aprobado | DevOps + dueño sistema |

### 22.2 Reglas de promoción

```mermaid
flowchart LR
  DEV --> QA --> UAT --> PROD
```

- No promover cambios sin pruebas mínimas del entorno previo.
- Migraciones de DB deben probarse en QA/UAT antes de PROD.
- Cada promoción debe generar evidencia (build, tests, aprobación).

### 22.3 Convenciones recomendadas

- Rama `main`: solo código listo para producción.
- Tags de release: `vX.Y.Z`.
- Archivo de release notes por versión.

---

## 23. Hardening de servidor y red

### 23.1 Sistema operativo

- Mantener parches de seguridad al día.
- Deshabilitar login root por SSH.
- Forzar autenticación por llave.
- Activar `ufw` o firewall equivalente.
- Sincronizar hora (`chrony`/`systemd-timesyncd`).

### 23.2 SSH (ejemplo mínimo)

Archivo `/etc/ssh/sshd_config`:

```text
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

Aplicar:

```bash
sudo systemctl restart ssh
```

### 23.3 Firewall recomendado

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

### 23.4 Hardening de base de datos

- No exponer `5432` públicamente.
- Usuario de aplicación con privilegios mínimos.
- Rotación de contraseña DB.
- SSL obligatorio a DB externa.

### 23.5 Hardening de app

- `JWT_SECRET` >= 32 chars aleatorio.
- CORS restringido a dominios permitidos.
- Limitar tamaño de payload HTTP.
- Rate limiting en endpoints de autenticación.

---

## 24. Alta disponibilidad y escalabilidad

### 24.1 Escenario inicial (single node)

Adecuado para arranque y cargas moderadas.

### 24.2 Escenario HA recomendado

```mermaid
flowchart LR
  U[Usuarios] --> LB[Load Balancer]
  LB --> APP1[Backend node 1]
  LB --> APP2[Backend node 2]
  APP1 --> DB[(PostgreSQL primario)]
  APP2 --> DB
  DB --> REPL[(Replica lectura/opcional)]
```

### 24.3 Estrategias de escalado

- **Vertical:** aumentar CPU/RAM.
- **Horizontal:** múltiples instancias backend.
- **Cache:** incorporar Redis para lecturas intensivas (futuro).
- **CDN:** para assets estáticos frontend.

### 24.4 Recomendaciones de session/stateless

- Backend stateless (sin sesiones en memoria local).
- Tokens JWT para evitar afinidad estricta de sesión.
- Archivos y PDFs en storage compartido u objeto.

---

## 25. Monitoreo, métricas y alertas

### 25.1 Pilares de observabilidad

1. Logs
2. Métricas
3. Trazas

### 25.2 Métricas mínimas

| Servicio | Métrica | Umbral alerta |
|----------|---------|---------------|
| Backend | 5xx rate | > 1% 5 min |
| Backend | p95 latencia | > 1200 ms 5 min |
| Nginx | 502/504 | > 10/min |
| DB | conexiones activas | > 80% pool |
| Host | CPU | > 85% 10 min |
| Host | RAM | > 85% 10 min |
| Disco | uso | > 80% |

### 25.3 Stack sugerido

- Prometheus + Grafana
- Loki/ELK para logs
- Alertmanager (correo/Teams/Slack)

### 25.4 SLI/SLO operativos

- Disponibilidad mensual >= 99.5%
- Error budget controlado por release
- Tiempo medio de recuperación (MTTR) < 60 minutos objetivo inicial

---

## 26. Plan de continuidad y recuperación (BCP/DRP)

### 26.1 Objetivos

- **RTO:** tiempo máximo de recuperación
- **RPO:** pérdida máxima de datos tolerada

Recomendación inicial:

- RTO <= 4h
- RPO <= 24h

### 26.2 Estrategia de respaldo

```mermaid
flowchart LR
  DB[(DB)] --> BK1[Backup diario]
  BK1 --> BK2[Retención 30 días]
  BK2 --> OFF[Replica externa/offsite]
```

### 26.3 Prueba de recuperación

- Simular caída de backend.
- Restaurar DB desde backup reciente.
- Ejecutar smoke test completo.
- Documentar tiempos reales vs RTO/RPO.

### 26.4 Clasificación de incidentes

| Severidad | Ejemplo | Tiempo de respuesta objetivo |
|-----------|---------|------------------------------|
| SEV1 | Sistema fuera de servicio | inmediato (< 15 min) |
| SEV2 | Módulo crítico degradado | < 30 min |
| SEV3 | Error funcional parcial | < 4h |
| SEV4 | incidencia menor | < 1 día hábil |

---

## 27. Pipeline de despliegue seguro (GitOps/CI-CD)

### 27.1 Flujo recomendado

```mermaid
flowchart LR
  Commit --> PR[Pull Request]
  PR --> Lint[Lint/Typecheck]
  Lint --> Tests[Unit/Integration]
  Tests --> Sec[SAST/SCA]
  Sec --> Build[Build artifacts]
  Build --> DeployQA[Deploy QA]
  DeployQA --> UAT[UAT approval]
  UAT --> DeployProd[Deploy PROD]
```

### 27.2 Gates obligatorios

- Lint y typecheck sin errores.
- Pruebas críticas de auth/certificados/reportes.
- Escaneo de dependencias sin CVE crítica abierta.
- Aprobación funcional para pasar a PROD.

### 27.3 Estrategias de despliegue

- Rolling update (preferido).
- Blue/Green (para cero downtime, si infraestructura lo permite).
- Canary (cuando haya observabilidad madura).

### 27.4 Gestión de secretos en pipeline

- Nunca inyectar secretos en repositorio.
- Usar secret manager del CI/CD.
- Rotación periódica y trazabilidad de cambios.

---

## 28. Runbooks operativos de incidentes

### 28.1 Runbook: 502 Bad Gateway

1. Verificar estado backend.
2. Revisar logs backend y nginx.
3. Validar conectividad local `127.0.0.1:3000`.
4. Reiniciar backend si procede.
5. Confirmar recuperación con smoke test rápido.

### 28.2 Runbook: Error de migración en deploy

1. Congelar tráfico de cambios.
2. Revisar error exacto prisma.
3. Aplicar corrección/migración complementaria en QA.
4. Si no hay solución inmediata, rollback controlado.
5. Documentar postmortem.

### 28.3 Runbook: CORS bloqueado en producción

1. Validar `CORS_ORIGIN`.
2. Confirmar dominio real y protocolo HTTPS.
3. Reiniciar backend.
4. Limpiar cache del navegador y repetir prueba.

### 28.4 Runbook: Saturación de DB

1. Identificar consulta lenta.
2. Revisar índice/filtro correspondiente.
3. Reducir carga (rate-limit temporal).
4. Escalar recursos DB si necesario.

---

## 29. Matriz de validación técnica post-deploy

### 29.1 Validación por capa

| Capa | Prueba | Resultado esperado |
|------|--------|--------------------|
| DNS/SSL | acceso HTTPS dominio | certificado válido |
| Nginx | respuesta frontend | 200 + assets cargan |
| API | endpoint auth | login exitoso/fallido controlado |
| DB | consulta prisma | conexión estable |
| Seguridad | ruta admin con usuario no admin | 403/denegado |
| Funcional | generación certificado | certificado emitido |
| Público | validación QR | respuesta válida/no válida correcta |

### 29.2 Script de smoke test (ejemplo conceptual)

```bash
#!/usr/bin/env bash
set -e
DOMAIN="https://tu-dominio.gob.ec"
echo "1) Home"
curl -fsS "${DOMAIN}" >/dev/null
echo "2) API health (si existe)"
curl -fsS "${DOMAIN}/api/health" >/dev/null || true
echo "3) Finalizado"
```

---

## 30. Cumplimiento operativo y evidencia de instalación

### 30.1 Paquete de evidencia mínimo

- Acta de instalación (fecha, responsables, versión).
- Evidencia de seguridad (firewall, SSL, secretos).
- Evidencia de migraciones y seed.
- Evidencia de smoke tests.
- Evidencia de backup/restore.
- Evidencia de monitoreo y alertas.

### 30.2 Estructura sugerida de evidencias

```text
docs/
  auditoria/
    2026-03-release-1.0/
      instalacion/
      seguridad/
      pruebas/
      backups/
      monitoreo/
      acta-final.md
```

### 30.3 Acta técnica de instalación (plantilla)

| Campo | Valor |
|------|-------|
| Fecha/hora | |
| Entorno | DEV/QA/UAT/PROD |
| Versión desplegada | |
| Responsable técnico | |
| Responsable funcional | |
| Resultado smoke tests | |
| Observaciones | |
| Aprobación | |

---

## 31. Diagramas de red por escenario

### 31.1 Oracle Cloud (VM Ubuntu + Docker + Nginx)

```mermaid
flowchart LR
  Internet[Internet]
  DNS[DNS dominio]
  OCIFW[OCI NSG / Security List]
  VM[VM Ubuntu]
  Nginx[Nginx reverse proxy]
  App[Contenedores App<br/>frontend + backend]
  PG[(PostgreSQL local o gestionada)]

  Internet --> DNS --> OCIFW --> VM
  VM --> Nginx --> App
  App --> PG
```

Notas:

- Abrir solo `22`, `80`, `443`.
- Evitar exponer `5432` públicamente.
- Si DB es externa, permitir solo salida desde VM a endpoint DB.

### 31.2 AWS (EC2 + RDS + ALB opcional)

```mermaid
flowchart LR
  U[Usuarios]
  R53[Route53]
  ALB[ALB opcional]
  EC2[EC2 App]
  RDS[(RDS PostgreSQL)]
  CW[CloudWatch]

  U --> R53 --> ALB --> EC2 --> RDS
  EC2 --> CW
  RDS --> CW
```

Notas:

- Security Group de RDS debe aceptar `5432` solo desde SG de EC2/ALB app tier.
- Idealmente usar Secrets Manager para credenciales.

### 31.3 On-premise institucional (DMZ + red interna)

```mermaid
flowchart LR
  Internet[Internet] --> FW[Firewall perimetral]
  FW --> DMZ[DMZ: Reverse Proxy]
  DMZ --> APP[Red interna: App Server]
  APP --> DB[(Red interna: PostgreSQL)]
  APP --> MON[Monitoreo interno]
  DB --> BKP[Repositorio backup]
```

Notas:

- Separación de zonas (DMZ, app, DB).
- Acceso administrativo por red segura/VPN.
- Trazabilidad de cambios y accesos.

### 31.4 Flujo de puertos recomendado

| Origen | Destino | Puerto | Motivo |
|--------|---------|--------|--------|
| Internet | Reverse proxy | 80/443 | acceso web |
| Reverse proxy | Backend app | 3000 (interno) | API |
| Backend app | PostgreSQL | 5432 (interno) | persistencia |
| Admin IP | Servidor | 22 | administración segura |

---

## 32. Matriz de capacidad y dimensionamiento

### 32.1 Supuestos de cálculo

- Carga mixta: navegación, operaciones CRUD, generación puntual de certificados/PDF.
- Usuarios concurrentes = sesiones activas simultáneas.
- Base de datos PostgreSQL con índices adecuados.

### 32.2 Dimensionamiento base por concurrencia

| Perfil de carga | Usuarios concurrentes | App (vCPU/RAM) | DB (vCPU/RAM) | Recomendaciones |
|-----------------|-----------------------|----------------|---------------|-----------------|
| Pequeño | 50-100 | 2 vCPU / 4 GB | 2 vCPU / 4 GB | single node, backups diarios |
| Medio | 100-300 | 4 vCPU / 8 GB | 4 vCPU / 8 GB | separar app y db, monitoreo activo |
| Alto | 300-800 | 8 vCPU / 16 GB (2 nodos) | 8 vCPU / 16 GB | balanceador, réplica lectura |
| Muy alto | 800+ | 2-4 nodos app (autoscaling) | cluster gestionado | CDN/cache, tuning avanzado |

### 32.3 IOPS y almacenamiento sugerido

| Componente | Tipo sugerido | Tamaño inicial | Escalado |
|------------|---------------|----------------|----------|
| App server | SSD estándar | 40-80 GB | según logs y artefactos |
| DB server | SSD alto IOPS | 100+ GB | crecimiento por datos y auditoría |
| Backup | almacenamiento objeto/bloque | política 30-90 días | por cumplimiento |

### 32.4 Capacidad por módulo sensible

| Módulo | Patrón de carga | Riesgo | Mitigación |
|--------|------------------|--------|------------|
| Login/Auth | ráfagas en horario laboral | saturación auth | rate-limit + cache de metadatos |
| Reportes/PDF | CPU intensivo puntual | latencia alta | colas/asíncrono en alta carga |
| Validación QR pública | consultas rápidas repetitivas | picos por campañas | caching lectura + escalado horizontal |
| CRUD maestros | baja-media | bloqueos por edición concurrente | transacciones cortas + índices |

### 32.5 Señales para escalar

- CPU app > 75% sostenido 15 min.
- p95 API > 1.2s sostenido.
- conexiones DB > 80% pool.
- tasa de error > 1% sostenido.

### 32.6 Estrategia de prueba de carga recomendada

1. Definir escenarios (login, listado, inscripción, validación QR).
2. Ejecutar baseline en QA.
3. Incrementar carga por tramos (50, 100, 200, 400 concurrencia).
4. Registrar latencia p50/p95, errores y consumo de recursos.
5. Ajustar y repetir hasta cumplir SLO.

---

## Anexo A — Comandos rápidos

### A.1 Local

```bash
npm run dev:backend
npm run dev:frontend
```

### A.2 Docker

```bash
docker compose up -d
docker compose logs -f
docker compose down
```

### A.3 Backend Prisma

```bash
cd backend
npm run prisma:migrate
npm run prisma:seed
npm run prisma:studio
```

---

## Anexo B — Seguridad mínima recomendada en producción

- Firewall activo (solo 80/443 públicos).
- PostgreSQL sin exposición pública.
- SSH con llave, sin password.
- Fail2ban/WAF (según política).
- Rotación de secretos y contraseñas.
- Escaneo de vulnerabilidades periódico.

---

## Cierre

Este manual debe actualizarse ante cualquier cambio de arquitectura, infraestructura, flujo de despliegue o seguridad operativa.

