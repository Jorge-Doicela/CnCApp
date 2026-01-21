# CNC Application

Aplicación oficial del Consejo Nacional de Competencias (CNC) del Ecuador.

## Estructura del Proyecto

El proyecto está organizado como un monorepo que contiene tanto el backend como el frontend:

```
CnCApp/
├── docs/             # Documentación técnica y guías
├── backend/          # API RESTful (Node.js + Express + Prisma)
├── frontend/         # Aplicación Cliente (Angular 19 + Ionic 8)
├── android/          # Proyecto nativo Android (Capacitor)
└── README.md         # Documentación principal
```

## Inicio Rápido

### Requisitos Previos

- **Node.js**: v18 o superior
- **PostgreSQL**: v14 o superior
- **NPM**: v9 o superior
- **Docker** (opcional, recomendado): Docker Desktop

## 🐳 Inicio Rápido con Docker (Recomendado)

La forma más rápida de ejecutar la aplicación completa:

```bash
# 1. Copiar configuración de ejemplo
cp .env.docker .env

# 2. Editar .env y configurar contraseñas seguras
# (POSTGRES_PASSWORD, JWT_SECRET)

# 3. Iniciar todos los servicios
docker-compose up -d

# 4. Acceder a la aplicación
# Frontend: http://localhost
# Backend: http://localhost:3000
# Database: localhost:5432
```

**Documentación completa**: Ver [`docs/DOCKER_SETUP.md`](docs/DOCKER_SETUP.md)

---

## 📦 Instalación Manual

### Requisitos Previos

### 1. Configuración del Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# (Edita .env con tus credenciales de base de datos)

# Inicializar base de datos
npm run prisma:generate
npm run prisma:migrate

# Insertar datos iniciales (opcional)
npm run prisma:seed

# Iniciar servidor de desarrollo
npm run dev
```

El servidor estará disponible en: `http://localhost:3000`

### 2. Configuración del Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

La aplicación estará disponible en: `http://localhost:8100`

## Stack Tecnológico

### Backend (Clean Architecture)
- **Runtime**: Node.js
- **Framework**: Express
- **Lenguaje**: TypeScript
- **ORM**: Prisma
- **Base de Datos**: PostgreSQL
- **Seguridad**: JWT, Bcrypt, Helmet, Rate Limiting

### Frontend (Standalone Components)
- **Framework**: Angular 19
- **UI Toolkit**: Ionic 8
- **Estado**: Signals (Zero RxJS for state)
- **Móvil**: Capacitor 7
- **Estilos**: SCSS Modular

## Compilación Móvil (Android)

Para generar el APK o ejecutar en un dispositivo Android:

```bash
cd frontend
npm run build
cd ..
npx cap sync android
npx cap open android
```

## Documentación Adicional

Documentación técnica detallada se encuentra en el directorio `/docs`:
- **`DOCKER_SETUP.md`**: Guía completa para despliegue con Docker (recomendado)
- Guías de arquitectura y contribución

## 🚀 Despliegue en Producción

### Con Docker (Recomendado)

```bash
# Configurar variables de producción en .env
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Manual

Consulta la documentación específica de cada componente en sus respectivos directorios.

## Licencia

Derechos Reservados © 2025 Consejo Nacional de Competencias.
