# 💻 Guía de Desarrollo Profesional - CnCApp

Bienvenido al manual de ingeniería y desarrollo del Sistema de Gestión de Capacitaciones (CnCApp). Esta guía está diseñada para proporcionar un entendimiento profundo del entorno de trabajo, flujos de desarrollo y estándares de calidad.

---

## 📋 Tabla de Contenidos

1.  [Filosofía de Desarrollo](#1-filosofía-de-desarrollo)
2.  [Configuración del Entorno (Deep Dive)](#2-configuración-del-entorno-deep-dive)
3.  [Arquitectura del Proyecto a Nivel de Código](#3-arquitectura-del-proyecto-a-nivel-de-código)
4.  [Flujo de Trabajo Diario](#4-flujo-de-trabajo-diario)
5.  [Debugging Avanzado](#5-debugging-avanzado)
6.  [Estándares de Calidad y Testing](#6-estándares-de-calidad-y-testing)
7.  [Scripts y Herramientas de Utilidad](#7-scripts-y-herramientas-de-utilidad)

---

## 1. Filosofía de Desarrollo

Este proyecto sigue estrictamente:
- **Clean Architecture** en el Backend: Independencia de frameworks, testabilidad e independencia de la UI.
- **Standalone Components** en el Frontend (Angular 19+): Arquitectura moderna sin NgModules, enfocada en modularidad y lazy loading.
- **Type Safety**: TypeScript estricto en todo el stack. `any` está prohibido salvo excepciones documentadas.

---

## 2. Configuración del Entorno (Deep Dive)

### IDE Recomendado: VS Code

Para una experiencia óptima, recomendamos usar Visual Studio Code con el siguiente `settings.json` de espacio de trabajo (crear en `.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/node_modules": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/coverage": true
  }
}
```

### Extensiones Esenciales

Instala estas extensiones (id):
- `angular.ng-template` (Angular Language Service)
- `dbaeumer.vscode-eslint` (ESLint)
- `esbenp.prettier-vscode` (Prettier)
- `prisma.prisma` (Prisma)
- `firsttris.vscode-jest-runner` (Jest Runner)

### Variables de Entorno (.env)

El archivo `.env` del backend es crítico. Aquí explicamos cada variable:

| Variable | Propósito | Valor Desarrollo Recomendado |
|----------|-----------|------------------------------|
| `DATABASE_URL` | String de conexión a PostgreSQL | `postgresql://user:pass@localhost:5432/cnc_db` |
| `JWT_SECRET` | Llave para firmar tokens | Una cadena larga aleatoria (min 32 chars) |
| `JWT_EXPIRES_IN` | Tiempo de vida del token | `1d` (para desarrollo cómodo), `15m` (prod) |
| `PORT` | Puerto del servidor Express | `3000` |
| `NODE_ENV` | Entorno de ejecución | `development` |

---

## 3. Arquitectura del Proyecto a Nivel de Código

### Backend: Inyección de Dependencias (DI)

No usamos un framework de DI pesado como NestJS, sino una implementación ligera y explícita en `src/config/di.container.ts`.

**Patrón de Registro:**

```typescript
// 1. Importar implementaciones
import { PrismaUserRepository } from '../infrastructure/database/repositories/user/prisma-user.repository';
import { UserUseCase } from '../application/user/user.use-case';

// 2. Registrar en el contenedor
const userRepository = new PrismaUserRepository(prismaClient);
const userUseCase = new UserUseCase(userRepository);

// 3. Exportar instancias para los controladores
export const userController = new UserController(userUseCase);
```

### Frontend: Servicios y Estado

Usamos **Signals** de Angular para gestión de estado local y global ligero.

**Ejemplo de Servicio con Signal:**

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  // Estado reactivo
  private _currentUser = signal<User | null>(null);
  readonly currentUser = this._currentUser.asReadonly();

  login(credentials: LoginDto) {
    return this.http.post<AuthResponse>(...).pipe(
      tap(response => {
        // Actualizar señal
        this._currentUser.set(response.user);
      })
    );
  }
}
```

---

## 4. Flujo de Trabajo Diario

### Paso 1: Levantar Servicios

Recomendamos usar terminales divididas:

**Terminal 1 (Base de Datos):**
```bash
docker-compose up postgres
```

**Terminal 2 (Backend):**
```bash
cd backend
npm run dev
# Salida esperada: "Server running on port 3000"
```

**Terminal 3 (Frontend):**
```bash
cd frontend
npm start
# Salida esperada: "Application bundle generation complete. Live reload enabled."
```

### Paso 2: Crear una Nueva Funcionalidad (Feature)

Supongamos que vas a crear "Reportes de Asistencia".

1.  **Backend**:
    *   Define la entidad en `schema.prisma`.
    *   Corre `npm run prisma:migrate`.
    *   Crea `domain/reporte/reporte.entity.ts`.
    *   Crea `infrastructure/database/repositories/reporte/prisma-reporte.repo.ts`.
    *   Crea `application/reporte/generar-reporte.use-case.ts`.
    *   Crea `infrastructure/web/controllers/reporte.controller.ts`.
    *   Registra todo en `di.container.ts` y `routes/index.ts`.

2.  **Frontend**:
    *   Genera el servicio: `ng g s pages/admin/reportes/services/reporte`.
    *   Genera la página: `ng g c pages/admin/reportes --standalone`.
    *   Agrega la ruta en `app.routes.ts`.

---

## 5. Debugging Avanzado

### Debugging Backend en VS Code

No uses `console.log` para todo. Usa el debugger real.

1.  Ve a la pestaña "Run and Debug" en VS Code.
2.  Selecciona "Debug Backend" (si creaste el `launch.json` sugerido).
3.  Pon un breakpoint (punto rojo) en cualquier línea de un controlador o caso de uso.
4.  Haz la petición desde el Frontend o Postman.
5.  VS Code se detendrá y podrás inspeccionar variables, call stack y closures en tiempo real.

### Debugging Frontend

1.  Abre Chrome DevTools (F12).
2.  Ve a la pestaña **Sources**.
3.  Presiona `Ctrl+P` (o `Cmd+P`) y busca tu archivo `.ts` (ej: `login.page.ts`).
4.  Pon un breakpoint.
5.  Interactúa con la UI.
6.  Disfruta del debugging completo con sourcemaps de TypeScript.

---

## 6. Estándares de Calidad y Testing

### Linting Estricto

Nuestro ESLint está configurado para no permitir:
- Variables no usadas.
- `any` explícito.
- `console.log` en producción.

Corre el linter antes de cada commit:
```bash
npm run lint --prefix backend
npm run lint --prefix frontend
```

### Testing Unitario

**Backend (Jest):**
Los tests deben ubicarse junto al archivo que prueban o en `__tests__`.
```bash
npm test
```

**Frontend (Karma/Jasmine):**
```bash
npm test
```

---

## 7. Scripts y Herramientas de Utilidad

### Generador de Seeds
Si necesitas reiniciar la base de datos con datos frescos:
```bash
cd backend
npm run prisma:seed
```

### Verificación de Tipos (Sin Compilar)
Útil para verificar errores TS en todo el proyecto rápidamente:
```bash
cd backend && tsc --noEmit
cd frontend && npx ng build --watch --no-write
```

### Análisis de Bundle (Frontend)
Para ver qué librerías ocupan más espacio:
```bash
cd frontend
npm run build -- --stats-json
npx webpack-bundle-analyzer dist/stats.json
```

---

<div align="center">

**[⬆ Volver al Índice](INDEX.md)**

</div>
