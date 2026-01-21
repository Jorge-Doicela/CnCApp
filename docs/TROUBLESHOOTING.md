# Solución de Problemas (Troubleshooting) - CnCApp

## Problemas Comunes y Soluciones

### 1. Base de Datos

#### "Connection refused to Postgres"
- **Causa**: El contenedor de docker no está corriendo o el puerto está bloqueado.
- **Solución**:
  ```bash
  docker-compose up -d postgres
  ```

#### "Prisma Client not initialized"
- **Causa**: No se ha generado el cliente de Prisma tras un cambio de schema.
- **Solución**:
  ```bash
  cd backend
  npx prisma generate
  ```

### 2. Docker

#### "Bind for 0.0.0.0:3000 failed: port is already allocated"
- **Causa**: Otro servicio (quizás un backend local sin docker) está usando el puerto 3000.
- **Solución**: Detén el proceso local de Node.js o cambia el puerto en `.env`.

### 3. Frontend

#### "Error: NG0203: inject() must be called from an injection context"
- **Causa**: Uso incorrecto de `inject()` fuera del constructor o campos de clase.
- **Solución**: Mover la llamada a una propiedad de la clase o al constructor.

---


