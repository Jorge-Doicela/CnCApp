# CnCApp - Sistema de Gestión de Capacitaciones

<div align="center">

![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/typescript-5.0-blue)
![Angular](https://img.shields.io/badge/angular-19-red)
![Ionic](https://img.shields.io/badge/ionic-8-blue)
![PostgreSQL](https://img.shields.io/badge/postgresql-14+-blue)
![License](https://img.shields.io/badge/license-Proprietary-yellow)

**Sistema oficial de gestión de capacitaciones y certificaciones del Consejo Nacional de Competencias (CNC) del Ecuador**

[Inicio Rápido](#inicio-rápido-5-minutos) •
[Documentación](#documentación) •
[Stack Tecnológico](#stack-tecnológico) •
[Características](#características-principales)

</div>

---

## Tabla de Contenidos

- [Inicio Rápido (5 minutos)](#inicio-rápido-5-minutos)
- [Características Principales](#características-principales)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Documentación](#documentación)
- [Credenciales de Prueba](#credenciales-de-prueba)
- [Aplicación Móvil](#aplicación-móvil-android)
- [Contribución](#contribución)
- [Licencia](#licencia)

---

## Inicio Rápido (5 minutos)

### Requisitos Previos

- **Node.js** v18+ | **PostgreSQL** v14+ | **npm** v9+
- **Docker** (opcional, recomendado)

### Opción 1: Con Docker (Recomendado)

```bash
# 1. Clonar repositorio
git clone <repository-url>
cd CnCApp

# 2. Configurar variables de entorno
cp .env.docker .env
# Editar .env y cambiar POSTGRES_PASSWORD y JWT_SECRET

# 3. Iniciar todos los servicios
docker-compose up -d

# 4. Configurar IP y Puertos
# Edita el archivo config.json en la raíz
# serverIp: tu IP local o dominio del servidor

# 5. Sincronizar y Lanzar
.\actualizar-ip.ps1        # En Windows
# O en el servidor:
bash setup-server.sh
```

**Documentación completa**: [`docs/DOCKER_SETUP.md`](docs/DOCKER_SETUP.md)

### Opción 2: Instalación Local

```bash
# 1. Configurar Backend
cd backend
npm install
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL
npm run prisma:migrate
npm run prisma:seed
npm run dev

# 2. Configurar IP (Obligatorio)
# Edita config.json con tu IP local (ej. 192.168.1.223)
.\actualizar-ip.ps1

# 3. Configurar Frontend (nueva terminal)
cd frontend
npm install
npm start
```

**Guía detallada**: [`docs/QUICK_START.md`](docs/QUICK_START.md)

---

## Características Principales

- **Gestión de Capacitaciones**: Registro, inscripción, modalidades (presencial/virtual/híbrida), control de asistencia
- **Certificados Digitales**: Generación automática en PDF con códigos QR únicos para validación
- **Sistema de Roles**: Administrador, Coordinador, Participante, Autoridad, Funcionario GAD
- **Panel Administrativo**: CRUD completo de catálogos, reportes y estadísticas
- **Seguridad**: Autenticación JWT, contraseñas hasheadas (bcrypt), rate limiting, CORS
- **Aplicación Móvil**: Android nativo con Capacitor

---

## Stack Tecnológico

### Backend (Clean Architecture)

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | 18+ | Runtime |
| TypeScript | 5.0 | Lenguaje tipado |
| Express | 4.x | Framework web |
| Prisma | 5.x | ORM |
| PostgreSQL | 14+ | Base de datos |
| JWT + Bcrypt | - | Autenticación y seguridad |

### Frontend (Standalone Components)

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Angular | 19 | Framework |
| Ionic | 8 | UI Components |
| TypeScript | 5.0 | Lenguaje tipado |
| Signals | - | Estado reactivo |
| Capacitor | 7 | Bridge móvil |

### DevOps

- **Docker** + **Docker Compose**: Containerización
- **Nginx**: Proxy reverso
- **Git**: Control de versiones

---

## Estructura del Proyecto

```
CnCApp/
├── backend/                 # API RESTful (Clean Architecture)
│   ├── src/
│   │   ├── application/     # Casos de uso
│   │   ├── domain/          # Entidades y lógica de negocio
│   │   ├── infrastructure/  # Implementaciones técnicas
│   │   └── config/          # Configuración
│   ├── prisma/              # Schema, migraciones, seed
│   └── Dockerfile
│
├── frontend/                # Aplicación Web/Móvil (Angular + Ionic)
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/        # Servicios singleton, guards
│   │   │   ├── shared/      # Código compartido
│   │   │   ├── features/    # Módulos por funcionalidad
│   │   │   └── app.routes.ts
│   │   └── environments/    # Configuración por entorno
│   └── Dockerfile
│
├── android/                 # Proyecto Capacitor Android
├── docs/                    # Documentación técnica completa
├── docker-compose.yml       # Orquestación de servicios
└── README.md               # Este archivo
```

---

## Documentación

Toda la documentación técnica está en [`/docs`](docs/):

### Guías Esenciales

| Documento | Descripción |
|-----------|-------------|
| **[Despliegue CNC](docs/DESPLIEGUE_CNC.md)** | Guía para servidor 192.168.1.223 |
| **[Publicación Tiendas](docs/PUBLICACION_TIENDAS.md)** | Requisitos Play Store y App Store |
| **[Generación de APK](docs/GENERACION_APK.md)** | Manual para crear APK y firmar con licencia |
| **[Configuración SMTP](docs/CONFIGURACION_SMTP.md)** | Guía para Office 365 |
| **[Sincronización IP](docs/DEPLOY_GUIDE.md)** | Uso de config.json para cambios de red |
| **[Catálogos Registro](docs/LISTAS_FORMULARIO_REGISTRO.md)** | IDs para formularios de registro |
| **[Inicio Rápido](docs/QUICK_START.md)** | Configuración en 5 minutos |
| **[Backend](docs/BACKEND.md)** | Configuración completa del backend |
| **[Docker Setup](docs/DOCKER_SETUP.md)** | Despliegue con Docker |

### Documentación Técnica

| Documento | Descripción |
|-----------|-------------|
| [Índice Completo](docs/INDEX.md) | Navegación de toda la documentación |
| [Arquitectura](docs/ARCHITECTURE.md) | Diseño del sistema y patrones |
| [API](docs/API.md) | Endpoints y ejemplos |
| [Base de Datos](docs/DATABASE.md) | Schema y migraciones |
| [Desarrollo](docs/DEVELOPMENT.md) | Setup y convenciones |
| [Deployment](docs/DEPLOYMENT.md) | Despliegue en producción |
| [Seguridad](docs/SECURITY.md) | Políticas de seguridad |
| [Testing](docs/TESTING.md) | Guía de pruebas |
| [Troubleshooting](docs/TROUBLESHOOTING.md) | Solución de problemas |
| [Contribución](docs/CONTRIBUTING.md) | Cómo contribuir |

---

## Credenciales de Prueba

Después de ejecutar `npm run prisma:seed`:

**Password para todos:** `AdminPassword123!`

| Rol | Cédula | Email |
|-----|--------|-------|
| Administrador | 1234567890 | admin@cnc.gob.ec |
| Coordinador | 0987654321 | coord@cnc.gob.ec |
| Participante | 1122334455 | juan.perez@example.com |

---

### Root (Gestión del Proyecto)

```bash
npm run install:all      # Instala dependencias en todo el proyecto
npm run system:check     # Ejecuta verificación completa del sistema
npm run db:sync          # Sincroniza esquema de base de datos
npm run build:backend    # Compila el backend
npm run build:frontend   # Compila el frontend
npm run test:all         # Ejecuta pruebas de compilación totales
```

### Backend (Clean Architecture)

```bash
cd backend
npm run dev              # Desarrollo con hot reload
npm run build            # Compilar TypeScript
npm start                # Producción
npm run prisma:migrate   # Ejecutar migraciones
npm run prisma:seed      # Cargar datos de prueba
```

### Frontend (Standalone Components)

```bash
cd frontend
npm start                # Desarrollo (http://localhost:4200)
npm run build            # Compilar para producción
npm test                 # Ejecutar tests
```

### Docker

```bash
docker-compose up -d     # Iniciar todos los servicios
docker-compose logs -f   # Ver logs
docker-compose down      # Detener servicios
```

---

## Aplicación Móvil (Android)

### Compilar APK

```bash
# 1. Compilar frontend
cd frontend
npm run build

# 2. Sincronizar con Capacitor
cd ..
npx cap sync android

# 3. Abrir en Android Studio
npx cap open android

# 4. Build > Build Bundle(s) / APK(s) > Build APK(s)
```

**Configuración:**
- App ID: `ec.gob.cnc.app`
- App Name: CNC App
- Version: 1.0.0

---

## Contribución

¡Las contribuciones son bienvenidas! Lee nuestra [Guía de Contribución](docs/CONTRIBUTING.md).

### Flujo de Trabajo y Calidad

El proyecto utiliza **Husky** para asegurar la calidad del código antes de cada commit. Al intentar realizar un commit, se ejecutarán automáticamente:
- `system:check`: Verificación de salud del sistema.
- `lint`: Verificación de reglas de estilo en backend y frontend.

### Path Aliases (Rutas Limpias)

Se utilizan alias de rutas para evitar imports relativos complejos:
- `@application/*`: Capa de aplicación del backend.
- `@domain/*`: Capa de dominio del backend.
- `@infrastructure/*`: Capa de infraestructura del backend.
- `@app/*`: Raíz de la aplicación frontend.
- `@core/*`: Módulo core del frontend.

1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## Seguridad

Si descubres una vulnerabilidad, **NO** abras un issue público. Contacta a **Jorge Doicela** directamente.

Ver [SECURITY.md](docs/SECURITY.md) para más información.

---

## Licencia

**Derechos Reservados © 2025 Consejo Nacional de Competencias del Ecuador**

Este software es propiedad del Consejo Nacional de Competencias (CNC) del Ecuador. Todos los derechos reservados.

El uso, copia, modificación y/o distribución de este software está estrictamente prohibido sin autorización expresa por escrito del CNC.

---

## Autor y Desarrollo

Desarrollado por **Jorge Doicela**

---

## Soporte

- **Email**: soporte@competencias.gob.ec
- **Sitio Web**: https://www.competencias.gob.ec
- **Documentación**: [docs/](docs/)

---

<div align="center">

**[⬆ Volver arriba](#cncapp---sistema-de-gestión-de-capacitaciones)**

Desarrollado por **Jorge Ismael Doicela Molina** | © 2026 CNC Ecuador

</div>
