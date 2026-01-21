# Guía de Testing - CnCApp

## Estrategia de Pruebas

El proyecto implementa una estrategia de pruebas en varios niveles para asegurar la calidad y estabilidad del software.

### 1. Backend (Jest)

#### Unit Testing
- **Ubicación**: Archivos `*.spec.ts` junto al código fuente o en `__tests__`.
- **Cobertura**: Casos de uso, Servicios de Dominio, Utilidades.
- **Comando**: `npm test`

#### Integration Testing
- **Ubicación**: `test/integration/`.
- **Enfoque**: Repositorios con base de datos real (Docker), Endpoints API.

### 2. Frontend (Karma/Jasmine)

#### Unit Testing
- **Ubicación**: Archivos `*.spec.ts` en cada componente/servicio.
- **Comando**: `npm test`
- **Enfoque**: Lógica de componentes, Servicios aislados, Guards.

#### E2E Testing (Pendiente)
- Se recomienda usar **Cypress** o **Playwright**.

---

## Ejecución de Pruebas

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```


