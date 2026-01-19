# Backend CNC - API REST

Backend optimizado para el Consejo Nacional de Competencias de Ecuador.

## 🚀 Características

- ✅ Node.js 20 + TypeScript
- ✅ Express.js con seguridad (Helmet, CORS, Rate Limiting)
- ✅ PostgreSQL con Prisma ORM
- ✅ Autenticación JWT
- ✅ Validación con Zod
- ✅ Compresión de respuestas
- ✅ Logs de auditoría

## 📋 Requisitos

- Node.js 20 o superior
- PostgreSQL 15 o superior
- npm o yarn

## 🔧 Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.example .env

# 3. Configurar base de datos en .env
DATABASE_URL="postgresql://usuario:password@localhost:5432/cnc_db"
JWT_SECRET="tu-secreto-super-seguro"

# 4. Generar cliente de Prisma
npm run prisma:generate

# 5. Ejecutar migraciones
npm run prisma:migrate

# 6. Iniciar en desarrollo
npm run dev
```

## 📁 Estructura del Proyecto

```
cnc-backend/
├── src/
│   ├── config/          # Configuración (DB, etc)
│   ├── controllers/     # Controladores de rutas
│   ├── middleware/      # Middleware (auth, errors, etc)
│   ├── routes/          # Definición de rutas
│   └── app.ts           # Aplicación principal
├── prisma/
│   └── schema.prisma    # Esquema de base de datos
├── .env.example         # Ejemplo de variables de entorno
└── package.json
```

## 🔐 Endpoints Disponibles

### Autenticación

```
POST   /api/auth/register    - Registrar nuevo usuario
POST   /api/auth/login       - Iniciar sesión
GET    /api/auth/profile     - Obtener perfil (requiere auth)
```

### Health Check

```
GET    /health               - Estado del servidor
```

## 🧪 Testing

```bash
npm test
```

## 🚀 Despliegue

```bash
# 1. Compilar TypeScript
npm run build

# 2. Iniciar en producción
npm start

# O con PM2 (recomendado)
pm2 start dist/app.js --name cnc-backend
```

## 📊 Métricas de Rendimiento

- Tiempo de respuesta promedio: <100ms
- Uso de RAM: ~700 MB
- Conexiones concurrentes: 1000+

## 👥 Autor

Desarrollado para el Consejo Nacional de Competencias - Ecuador

## 📄 Licencia

MIT
