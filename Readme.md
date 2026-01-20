# CNC Application

Aplicación del Consejo Nacional de Competencias del Ecuador.

## 📁 Estructura del Proyecto

```
CnCApp/
├── backend/          # Backend API (Node.js + Express + Prisma)
├── frontend/         # Frontend App (Angular 19 + Ionic)
├── android/          # Aplicación Android (Capacitor)
├── capacitor.config.ts
└── README.md
```

## 🚀 Backend

**Tecnologías:**
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Clean Architecture

**Iniciar:**
```bash
cd backend
npm install
npm run dev
```

**Puerto:** `http://localhost:3000`

## 🎨 Frontend

**Tecnologías:**
- Angular 19
- Ionic 8
- Standalone Components
- Signals (State Management)
- Capacitor

**Iniciar:**
```bash
cd frontend
npm install
npm start
```

**Puerto:** `http://localhost:8100`

## 📱 Android

**Compilar:**
```bash
cd frontend
npm run build
cd ..
npx cap sync android
npx cap open android
```

## 🗂️ Arquitectura

### Backend (Clean Architecture)
```
backend/src/
├── domain/           # Entidades e interfaces
├── application/      # Casos de uso
└── infrastructure/   # Implementaciones (DB, Web, Security)
```

### Frontend (Standalone Components)
```
frontend/src/app/
├── pages/           # Páginas de la aplicación
├── services/        # Servicios con Signals
├── guards/          # Guards funcionales
└── app.component.ts # Componente raíz standalone
```

## 📄 Licencia

MIT © 2025 Consejo Nacional de Competencias
