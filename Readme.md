# CnCApp - Sistema de Gestión de Capacitaciones

<div align="center">

![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/typescript-5.0-blue)
![Angular](https://img.shields.io/badge/angular-19-red)
![Ionic](https://img.shields.io/badge/ionic-8-blue)
![PostgreSQL](https://img.shields.io/badge/postgresql-14+-blue)
![License](https://img.shields.io/badge/license-Proprietary-yellow)

**Sistema oficial de gestión de capacitaciones y certificaciones del Consejo Nacional de Competencias (CNC) del Ecuador**

[Características](#-características) •
[Inicio Rápido](#-inicio-rápido) •
[Documentación](#-documentación) •
[Stack Tecnológico](#-stack-tecnológico)

</div>

---

## 📑 Tabla de Contenidos

- [Características](#-características)
- [Inicio Rápido](#-inicio-rápido)
  - [Con Docker (Recomendado)](#-con-docker-recomendado)
  - [Instalación Manual](#-instalación-manual)
- [Stack Tecnológico](#-stack-tecnológico)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Scripts Disponibles](#-scripts-disponibles)
- [Documentación](#-documentación)
- [Aplicación Móvil](#-aplicación-móvil-android)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

---

## ✨ Características

### 🎓 Gestión de Capacitaciones
- ✅ Registro y administración de eventos de capacitación
- ✅ Inscripción de participantes con validación de datos
- ✅ Modalidades: Presencial, Virtual e Híbrida
- ✅ Gestión de horarios y ubicaciones
- ✅ Control de asistencia y participación

### 📜 Certificados Digitales
- ✅ Generación automática de certificados en PDF
- ✅ Códigos QR únicos para validación
- ✅ Sistema de verificación pública de certificados
- ✅ Descarga y compartir en redes sociales
- ✅ Firma digital con hash criptográfico

### 👥 Gestión de Usuarios
- ✅ Sistema de roles: Administrador, Usuario, Autoridad, Funcionario GAD
- ✅ Perfiles personalizados por tipo de participante
- ✅ Autenticación segura con JWT
- ✅ Gestión de datos personales y profesionales
- ✅ Historial de capacitaciones y certificados

### 🎛️ Panel Administrativo
- ✅ CRUD completo de catálogos (roles, entidades, instituciones)
- ✅ Gestión geográfica (provincias, cantones, parroquias)
- ✅ Administración de competencias y cargos
- ✅ Reportes y estadísticas en tiempo real
- ✅ Gestión de usuarios inscritos por capacitación

### 🔒 Seguridad
- ✅ Autenticación JWT con tokens seguros
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Rate limiting para prevenir ataques
- ✅ Validación de datos en frontend y backend
- ✅ CORS configurado para producción

---

## 🚀 Inicio Rápido

### Requisitos Previos

- **Node.js**: v18 o superior
- **PostgreSQL**: v14 o superior
- **npm**: v9 o superior
- **Docker** (opcional, recomendado): Docker Desktop

### 🐳 Con Docker (Recomendado)

La forma más rápida de ejecutar la aplicación completa:

```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd CnCApp

# 2. Copiar configuración de ejemplo
cp .env.docker .env

# 3. Editar .env y configurar contraseñas seguras
# IMPORTANTE: Cambiar POSTGRES_PASSWORD y JWT_SECRET

# 4. Iniciar todos los servicios
docker-compose up -d

# 5. Esperar a que los servicios estén listos (30-60 segundos)
docker-compose logs -f

# 6. Acceder a la aplicación
# Frontend: http://localhost
# Backend API: http://localhost:3000
# Base de datos: localhost:5432
```

**Documentación completa de Docker**: Ver [`docs/DOCKER_SETUP.md`](docs/DOCKER_SETUP.md)

### 📦 Instalación Manual

#### 1. Configuración del Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL

# Generar Prisma Client
npm run prisma:generate

# Ejecutar migraciones de base de datos
npm run prisma:migrate

# (Opcional) Insertar datos iniciales
npm run prisma:seed

# Iniciar servidor de desarrollo
npm run dev
```

El servidor estará disponible en: `http://localhost:3000`

#### 2. Configuración del Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno (opcional)
# Editar src/environments/environment.ts si es necesario

# Iniciar servidor de desarrollo
npm start
```

La aplicación estará disponible en: `http://localhost:8100`

---

## 🛠️ Stack Tecnológico

### Backend (Clean Architecture)

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | 18+ | Runtime de JavaScript |
| **TypeScript** | 5.0 | Lenguaje tipado |
| **Express** | 4.x | Framework web |
| **Prisma** | 5.x | ORM moderno |
| **PostgreSQL** | 14+ | Base de datos relacional |
| **JWT** | - | Autenticación |
| **Bcrypt** | - | Hash de contraseñas |
| **Helmet** | - | Seguridad HTTP |
| **CORS** | - | Control de acceso |

**Arquitectura**: Clean Architecture con separación en capas (Domain, Application, Infrastructure)

### Frontend (Standalone Components)

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Angular** | 19 | Framework principal |
| **Ionic** | 8 | UI Components |
| **TypeScript** | 5.0 | Lenguaje tipado |
| **Signals** | - | Gestión de estado reactivo |
| **SCSS** | - | Estilos modulares |
| **Capacitor** | 7 | Bridge nativo para móvil |

**Arquitectura**: Modular con Standalone Components, sin NgModules

### DevOps & Deployment

- **Docker** & **Docker Compose**: Containerización
- **Nginx**: Proxy reverso (producción)
- **Git**: Control de versiones

---

## 📁 Estructura del Proyecto

```
CnCApp/
├── 📂 backend/                 # API RESTful
│   ├── 📂 src/
│   │   ├── 📂 application/     # Casos de uso y DTOs
│   │   │   ├── auth/          # Módulo de autenticación
│   │   │   ├── user/          # Módulo de usuarios
│   │   │   ├── capacitacion/  # Módulo de capacitaciones
│   │   │   ├── certificado/   # Módulo de certificados
│   │   │   └── shared/        # Compartido (errors, interfaces)
│   │   ├── 📂 domain/          # Entidades y lógica de negocio
│   │   │   ├── auth/
│   │   │   ├── user/
│   │   │   ├── capacitacion/
│   │   │   ├── certificado/
│   │   │   └── shared/
│   │   ├── 📂 infrastructure/  # Implementaciones técnicas
│   │   │   ├── database/      # Repositorios Prisma
│   │   │   ├── security/      # JWT, Bcrypt
│   │   │   └── web/           # Controllers, Middleware
│   │   ├── 📂 config/          # Configuración
│   │   └── app.ts             # Punto de entrada
│   ├── 📂 prisma/
│   │   ├── schema.prisma      # Schema de base de datos
│   │   ├── migrations/        # Migraciones
│   │   └── seed.ts            # Datos iniciales
│   └── package.json
│
├── 📂 frontend/                # Aplicación Web/Móvil
│   ├── 📂 src/
│   │   ├── 📂 app/
│   │   │   ├── 📂 core/       # Servicios singleton y guards
│   │   │   │   ├── guards/
│   │   │   │   └── services/
│   │   │   ├── 📂 shared/     # Código compartido
│   │   │   │   ├── models/
│   │   │   │   └── services/
│   │   │   ├── 📂 pages/      # Páginas por módulo
│   │   │   │   ├── auth/      # Login, registro, recuperación
│   │   │   │   ├── user/      # Perfil, conferencias
│   │   │   │   ├── admin/     # CRUDs administrativos
│   │   │   │   └── apps/      # Validación QR
│   │   │   ├── 📂 home/       # Página principal
│   │   │   ├── app.component.ts
│   │   │   └── app.routes.ts
│   │   ├── 📂 assets/         # Imágenes, iconos
│   │   └── 📂 environments/   # Configuración por entorno
│   └── package.json
│
├── 📂 android/                 # Proyecto Capacitor Android
│   └── app/
│
├── 📂 docs/                    # Documentación técnica
│   ├── ARCHITECTURE.md
│   ├── DEVELOPMENT.md
│   ├── API.md
│   ├── DOCKER_SETUP.md
│   └── ...
│
├── 📄 docker-compose.yml       # Orquestación de servicios
├── 📄 docker-compose.prod.yml  # Configuración de producción
├── 📄 .env.docker              # Variables de entorno Docker
├── 📄 capacitor.config.ts      # Configuración Capacitor
└── 📄 README.md                # Este archivo
```

---

## 📜 Scripts Disponibles

### Monorepo (Raíz)

```bash
npm run dev:backend          # Iniciar backend en desarrollo
npm run dev:frontend         # Iniciar frontend en desarrollo
npm run build:backend        # Compilar backend a JavaScript
npm run build:frontend       # Compilar frontend para producción
npm run install:all          # Instalar dependencias de todo el proyecto
```

### Backend

```bash
cd backend

# Desarrollo
npm run dev                  # Desarrollo con hot reload (tsx watch)
npm run build                # Compilar TypeScript a JavaScript
npm run start                # Iniciar servidor en producción

# Base de datos (Prisma)
npm run prisma:generate      # Generar Prisma Client
npm run prisma:migrate       # Ejecutar migraciones
npm run prisma:seed          # Insertar datos iniciales
npm run prisma:studio        # Abrir Prisma Studio (GUI)

# Calidad de código
npm run test                 # Ejecutar tests
npm run lint                 # Ejecutar linter
```

### Frontend

```bash
cd frontend

# Desarrollo
npm start                    # Servidor de desarrollo (http://localhost:8100)
npm run build                # Compilar para producción
npm run watch                # Compilar en modo watch

# Calidad de código
npm test                     # Ejecutar tests
npm run lint                 # Ejecutar linter
```

---

## 📚 Documentación

La documentación técnica completa se encuentra en el directorio [`/docs`](docs/):

| Documento | Descripción |
|-----------|-------------|
| [📖 Índice de Documentación](docs/INDEX.md) | Guía de navegación de toda la documentación |
| [🏗️ Arquitectura](docs/ARCHITECTURE.md) | Diseño del sistema y patrones arquitectónicos |
| [💻 Guía de Desarrollo](docs/DEVELOPMENT.md) | Setup, convenciones y flujo de trabajo |
| [🔌 Documentación de API](docs/API.md) | Endpoints, autenticación y ejemplos |
| [🗄️ Base de Datos](docs/DATABASE.md) | Schema, migraciones y relaciones |
| [🐳 Docker Setup](docs/DOCKER_SETUP.md) | Despliegue con Docker (completo) |
| [🚀 Deployment](docs/DEPLOYMENT.md) | Guía de despliegue en producción |
| [🔒 Seguridad](docs/SECURITY.md) | Consideraciones de seguridad |
| [🤝 Contribución](docs/CONTRIBUTING.md) | Cómo contribuir al proyecto |

---

## 📱 Aplicación Móvil (Android)

### Compilar para Android

```bash
# 1. Compilar el frontend
cd frontend
npm run build

# 2. Sincronizar con Capacitor
cd ..
npx cap sync android

# 3. Abrir en Android Studio
npx cap open android

# 4. Compilar APK desde Android Studio
# Build > Build Bundle(s) / APK(s) > Build APK(s)
```

### Configuración

- **App ID**: `ec.gob.cnc.app`
- **App Name**: CNC App
- **Version**: 1.0.0

**Nota**: El keystore para firma de APK no está incluido en el repositorio por seguridad. Ver [`docs/guides/mobile-build.md`](docs/guides/mobile-build.md) para instrucciones de generación.

---

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor lee nuestra [Guía de Contribución](docs/CONTRIBUTING.md) para conocer:

- Código de conducta
- Proceso de desarrollo
- Convenciones de código
- Proceso de pull requests
- Guías de estilo

### Flujo de Trabajo

1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 🔐 Seguridad

Si descubres una vulnerabilidad de seguridad, por favor **NO** abras un issue público. En su lugar, contacta al equipo de desarrollo directamente.

Ver [SECURITY.md](docs/SECURITY.md) para más información sobre nuestras políticas de seguridad.

---

## 📄 Licencia

**Derechos Reservados © 2025 Consejo Nacional de Competencias del Ecuador**

Este software es propiedad del Consejo Nacional de Competencias (CNC) del Ecuador. Todos los derechos reservados.

El uso, copia, modificación y/o distribución de este software está estrictamente prohibido sin autorización expresa por escrito del CNC.

---

## 👥 Equipo de Desarrollo

Desarrollado y mantenido por el equipo de tecnología del Consejo Nacional de Competencias.

---

## 📞 Soporte

Para soporte técnico o consultas:

- **Email**: soporte@competencias.gob.ec
- **Sitio Web**: https://www.competencias.gob.ec
- **Documentación**: [docs/](docs/)

---

<div align="center">

**[⬆ Volver arriba](#cncapp---sistema-de-gestión-de-capacitaciones)**

Hecho con ❤️ por el equipo CNC

</div>
