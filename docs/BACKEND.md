# Backend - CNC App

API RESTful para el sistema de gestión de capacitaciones del Consejo Nacional de Competencias.

## Configuración Inicial

### 1. Instalación de Dependencias

```bash
npm install
```

### 2. Configuración de Variables de Entorno

Copia el archivo de ejemplo y configúralo según tu entorno:

```bash
cp .env.example .env
```

Edita `.env` y configura tu `DATABASE_URL` con tus credenciales de PostgreSQL:

```env
DATABASE_URL="postgresql://USUARIO:PASSWORD@localhost:5432/cnc_db?schema=public"
```

### 3. Configuración de Base de Datos

#### Opción A: Primera vez (Base de datos vacía)

```bash
# Genera el cliente de Prisma
npm run prisma:generate

# Crea las tablas en la base de datos
npm run prisma:migrate

# Carga datos de prueba (usuarios, roles, etc.)
npm run prisma:seed
```

#### Opción B: Resetear base de datos existente

Si necesitas empezar de cero:

```bash
# Elimina todas las tablas y vuelve a crearlas con datos de prueba
npx prisma migrate reset
```

**⚠️ ADVERTENCIA:** `migrate reset` borrará TODOS los datos de tu base de datos.

### 4. Iniciar el Servidor

```bash
# Modo desarrollo (con hot reload)
npm run dev

# Modo producción
npm run build
npm start
```

El servidor estará disponible en `http://localhost:3000`

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor en modo desarrollo con hot reload |
| `npm run build` | Compila TypeScript a JavaScript |
| `npm start` | Inicia el servidor en modo producción |
| `npm run prisma:generate` | Genera el cliente de Prisma |
| `npm run prisma:migrate` | Ejecuta migraciones pendientes |
| `npm run prisma:seed` | Carga datos de prueba |
| `npm run prisma:studio` | Abre Prisma Studio (GUI para ver/editar datos) |
| `npm test` | Ejecuta tests |
| `npm run lint` | Ejecuta el linter |

## Credenciales de Prueba

Después de ejecutar `npm run prisma:seed`, puedes usar estas credenciales:

**Password para todos:** `CncSecure2025!`

| Rol | Cédula | Email |
|-----|--------|-------|
| Administrador | 1234567890 | admin@cnc.gob.ec |
| Coordinador | 0987654321 | coord@cnc.gob.ec |
| Participante 1 | 1122334455 | juan.perez@example.com |
| Participante 2 | 5544332211 | maria.rod@example.com |

## Solución de Problemas

### Error: "relation does not exist"

Significa que las tablas no existen en la base de datos. Ejecuta:

```bash
npm run prisma:migrate
```

### Error: "P3006" o problemas con migraciones

Si las migraciones están corruptas:

```bash
# Elimina la carpeta de migraciones
rm -rf prisma/migrations

# Crea una migración limpia desde el schema
npx prisma migrate dev --name init
```

### Error de conexión a la base de datos

Verifica que:
1. PostgreSQL esté corriendo
2. Las credenciales en `.env` sean correctas
3. La base de datos `cnc_db` exista

### Ver los datos en la base de datos

```bash
npm run prisma:studio
```

Esto abrirá una interfaz web en `http://localhost:5555` donde puedes ver y editar los datos.

## Estructura del Proyecto

```
backend/
├── src/
│   ├── application/      # Casos de uso y DTOs
│   ├── domain/           # Entidades y lógica de negocio
│   ├── infrastructure/   # Implementaciones (DB, Web, Security)
│   ├── config/           # Configuración
│   └── app.ts            # Punto de entrada
├── prisma/
│   ├── schema.prisma     # Schema de base de datos
│   ├── migrations/       # Migraciones
│   └── seed.ts           # Datos de prueba
└── package.json
```

## Arquitectura

Este backend sigue los principios de **Clean Architecture**:

- **Domain**: Entidades y lógica de negocio pura
- **Application**: Casos de uso (orquestación)
- **Infrastructure**: Detalles técnicos (Prisma, Express, JWT)

Para más información, consulta [/docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)
