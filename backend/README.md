# Backend - CNC API

API del Consejo Nacional de Competencias con Clean Architecture.

## 🏗️ Arquitectura

```
src/
├── domain/              # Lógica de negocio pura
│   ├── entities/        # Entidades del dominio
│   ├── repositories/    # Interfaces de repositorios
│   └── errors/          # Errores personalizados
│
├── application/         # Casos de uso
│   ├── use-cases/       # Lógica de aplicación
│   ├── interfaces/      # Interfaces de servicios
│   └── dtos/            # Data Transfer Objects
│
└── infrastructure/      # Implementaciones técnicas
    ├── database/        # Prisma + Repositorios
    ├── security/        # Bcrypt, JWT
    └── web/             # Express (Controllers, Routes, Middleware)
```

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Configurar base de datos
cp .env.example .env
# Editar .env con tus credenciales

# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Iniciar servidor de desarrollo
npm run dev
```

## 📡 Endpoints

- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil (requiere auth)

## 🛠️ Scripts

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Compilar TypeScript
- `npm start` - Iniciar producción
- `npm run prisma:studio` - Abrir Prisma Studio

## 🔒 Seguridad

- Helmet para headers HTTP
- Rate limiting
- CORS configurado
- JWT para autenticación
- Bcrypt para passwords
