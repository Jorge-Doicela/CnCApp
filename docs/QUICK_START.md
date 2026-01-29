# Guía Rápida de Inicio - CNC App

Esta guía te ayudará a poner en marcha el proyecto rápidamente en tu entorno local.

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** v18 o superior
- **PostgreSQL** v14 o superior
- **npm** v9 o superior
- **Git**

### Verificar instalaciones

```bash
node --version   # Debe ser v18+
npm --version    # Debe ser v9+
psql --version   # Debe ser v14+
```

---

## 🚀 Inicio Rápido (5 minutos)

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd CnCApp
```

### 2. Configurar PostgreSQL

Crea una base de datos vacía:

```bash
# Opción A: Usando psql
psql -U postgres
CREATE DATABASE cnc_db;
\q

# Opción B: Usando pgAdmin
# Clic derecho en Databases > Create > Database
# Nombre: cnc_db
```

### 3. Configurar el Backend

```bash
cd backend

# Copiar archivo de configuración
cp .env.example .env

# IMPORTANTE: Edita .env y cambia la línea DATABASE_URL con tus credenciales
# Ejemplo: DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/cnc_db?schema=public"
```

**Edita `backend/.env`:**
```env
DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/cnc_db?schema=public"
```

### 4. Instalar y Configurar Base de Datos

```bash
# Instalar dependencias
npm install

# Crear tablas en la base de datos
npx prisma migrate dev --name init

# Cargar datos de prueba
npm run prisma:seed
```

### 5. Iniciar el Backend

```bash
npm run dev
```

El backend estará corriendo en `http://localhost:3000`

### 6. Configurar el Frontend (Nueva terminal)

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

El frontend estará disponible en `http://localhost:8100`

---

## 🔑 Credenciales de Prueba

Después del seed, puedes iniciar sesión con:

**Password para todos:** `AdminPassword123!`

| Rol | Cédula | Email |
|-----|--------|-------|
| **Administrador** | 1234567890 | admin@cnc.gob.ec |
| **Coordinador** | 0987654321 | coord@cnc.gob.ec |
| **Participante** | 1122334455 | juan.perez@example.com |

---

## 🐳 Alternativa: Usar Docker

Si prefieres usar Docker (más fácil, no necesitas instalar PostgreSQL):

```bash
# Desde la raíz del proyecto
docker-compose up -d

# Esperar 30-60 segundos para que todo inicie
docker-compose logs -f

# Acceder a:
# Frontend: http://localhost
# Backend: http://localhost:3000
```

---

## 🛠️ Comandos Útiles

### Backend

```bash
cd backend

# Desarrollo
npm run dev              # Iniciar con hot reload
npm run build            # Compilar a JavaScript
npm start                # Iniciar en producción

# Base de datos
npm run prisma:studio    # Ver datos en GUI (http://localhost:5555)
npm run prisma:seed      # Volver a cargar datos de prueba
npx prisma migrate reset # ⚠️ RESETEAR TODO (borra datos)
```

### Frontend

```bash
cd frontend

npm start                # Desarrollo (http://localhost:8100)
npm run build            # Compilar para producción
npm test                 # Ejecutar tests
```

---

## ❌ Solución de Problemas Comunes

### Error: "Can't reach database server"

**Solución:**
1. Verifica que PostgreSQL esté corriendo
2. Revisa las credenciales en `backend/.env`
3. Asegúrate de que la base de datos `cnc_db` existe

### Error: "relation does not exist"

**Solución:**
```bash
cd backend
npm run prisma:migrate
```

### Error: "Port 3000 already in use"

**Solución:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# O cambia el puerto en backend/.env
PORT=3001
```

### Error: "Prisma Client not generated"

**Solución:**
```bash
cd backend
npm run prisma:generate
```

### Migraciones corruptas

**Solución:**
```bash
cd backend
rm -rf prisma/migrations
npx prisma migrate dev --name init
npm run prisma:seed
```

---

## 📚 Documentación Adicional

Para información más detallada, consulta:

- [README Principal](README.md)
- [Guía de Prisma](docs/PRISMA_GUIDE.md) - Configuración de base de datos
- [Backend README](backend/README.md) - Detalles del backend
- [Arquitectura](docs/ARCHITECTURE.md) - Diseño del sistema
- [API Documentation](docs/API.md) - Endpoints disponibles
- [Docker Setup](docs/DOCKER_SETUP.md) - Despliegue con Docker

---

## 🆘 ¿Necesitas Ayuda?

Si encuentras problemas:

1. Revisa la sección de [Solución de Problemas](#-solución-de-problemas-comunes)
2. Consulta [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
3. Revisa los logs del backend: `cd backend && npm run dev`
4. Verifica la base de datos: `cd backend && npm run prisma:studio`

---

**¡Listo!** Ahora deberías tener el proyecto corriendo localmente. 🎉
