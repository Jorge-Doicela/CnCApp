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
- `DOCKER_POSTGRES.md`: Guía para levantar la base de datos con Docker.
- `seed-data.sql`: Datos semilla para inicializar la base de datos.
- Guías de arquitectura y contribución.

## Licencia

Derechos Reservados © 2025 Consejo Nacional de Competencias.
