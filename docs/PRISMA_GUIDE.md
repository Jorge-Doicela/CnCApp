# Guía de Prisma - CNC App

Esta guía explica cómo trabajar con Prisma en diferentes entornos y cómo evitar problemas comunes.

## Tabla de Contenidos

- [Entornos de Desarrollo](#entornos-de-desarrollo)
- [Comandos Esenciales](#comandos-esenciales)
- [Flujo de Trabajo](#flujo-de-trabajo)
- [Solución de Problemas](#solución-de-problemas)

---

## Entornos de Desarrollo

### 1. Desarrollo Local (PostgreSQL en tu máquina)

**Configuración:**

```bash
cd backend
cp .env.example .env
# Edita .env con tus credenciales locales
```

**`.env` para desarrollo local:**
```env
DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/cnc_db?schema=public"
NODE_ENV=development
PORT=3000
JWT_SECRET=cnc-jwt-secret-key-development-mode-only
```

**Inicialización:**
```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

### 2. Docker (Desarrollo con contenedores)

**Configuración:**

El archivo `.env.docker` ya está configurado. Solo necesitas:

```bash
# Desde la raíz del proyecto
docker-compose up -d
```

Docker automáticamente:
- Crea la base de datos PostgreSQL
- Ejecuta las migraciones (`prisma migrate deploy`)
- Inicia el backend

**⚠️ Nota:** Docker usa `prisma migrate deploy` (no `dev`) porque es un entorno de producción simulado.

### 3. Producción (Vercel, Railway, etc.)

**Variables de entorno requeridas:**
```env
DATABASE_URL="postgresql://USER:PASS@HOST:5432/DB?schema=public"
NODE_ENV=production
JWT_SECRET=SECRETO_SUPER_SEGURO_UNICO
```

**Comandos de despliegue:**
```bash
npm run build
npx prisma migrate deploy  # NO uses 'migrate dev' en producción
node dist/app.js
```

---

## Comandos Esenciales

### Generación del Cliente

```bash
npm run prisma:generate
```

**Cuándo usar:** Después de cambiar `schema.prisma` o al instalar dependencias por primera vez.

### Migraciones

#### Desarrollo Local

```bash
# Crear y aplicar una nueva migración
npm run prisma:migrate

# O con nombre personalizado
npx prisma migrate dev --name nombre_descriptivo
```

**Qué hace:**
1. Compara el schema con la base de datos
2. Genera archivos SQL de migración
3. Aplica los cambios a la base de datos
4. Regenera el cliente de Prisma

#### Producción/Docker

```bash
npx prisma migrate deploy
```

**Qué hace:**
- Aplica migraciones pendientes sin crear nuevas
- No requiere interacción del usuario
- Ideal para CI/CD y contenedores

### Seed (Datos de Prueba)

```bash
npm run prisma:seed
```

**Qué hace:**
- Ejecuta `prisma/seed.ts`
- Crea usuarios, roles, capacitaciones de ejemplo
- Es **idempotente** (puedes ejecutarlo varias veces sin duplicar datos)

### Prisma Studio (GUI)

```bash
npm run prisma:studio
```

Abre una interfaz web en `http://localhost:5555` para ver y editar datos.

### Reset (⚠️ PELIGROSO)

```bash
npx prisma migrate reset
```

**Qué hace:**
1. **BORRA TODA LA BASE DE DATOS**
2. Vuelve a aplicar todas las migraciones
3. Ejecuta el seed automáticamente

**Cuándo usar:** Solo en desarrollo cuando quieres empezar completamente de cero.

---

## Flujo de Trabajo

### Cambiar el Schema

1. **Edita `prisma/schema.prisma`**
   ```prisma
   model NuevoModelo {
     id   Int    @id @default(autoincrement())
     name String
   }
   ```

2. **Crea una migración**
   ```bash
   npx prisma migrate dev --name agregar_nuevo_modelo
   ```

3. **Verifica los cambios**
   ```bash
   npm run prisma:studio
   ```

### Trabajar en Equipo

1. **Alguien hizo cambios en el schema:**
   ```bash
   git pull
   cd backend
   npm install
   npm run prisma:migrate  # Aplica las nuevas migraciones
   ```

2. **Tú haces cambios:**
   ```bash
   # Edita schema.prisma
   npx prisma migrate dev --name mi_cambio
   git add prisma/
   git commit -m "feat: agregar campo X al modelo Y"
   git push
   ```

### Desplegar a Producción

```bash
# 1. Compilar
npm run build

# 2. Aplicar migraciones (sin crear nuevas)
npx prisma migrate deploy

# 3. Iniciar
node dist/app.js
```

---

## Solución de Problemas

### Error: "P3006 - Migration failed to apply"

**Causa:** Migraciones corruptas o conflictos.

**Solución:**
```bash
# Opción 1: Reset completo (solo desarrollo)
npx prisma migrate reset

# Opción 2: Empezar de cero con las migraciones
rm -rf prisma/migrations
npx prisma migrate dev --name init
```

### Error: "Prisma Client not generated"

**Solución:**
```bash
npm run prisma:generate
```

### Error: "Can't reach database server"

**Verifica:**
1. PostgreSQL está corriendo
2. Credenciales en `.env` son correctas
3. La base de datos existe:
   ```sql
   CREATE DATABASE cnc_db;
   ```

### Error: "relation does not exist"

**Causa:** Las tablas no existen en la base de datos.

**Solución:**
```bash
npm run prisma:migrate
```

### Migraciones no se aplican en Docker

**Verifica `docker-compose.yml`:**
```yaml
command: sh -c "npx prisma migrate deploy && node dist/app.js"
```

**Ver logs:**
```bash
docker-compose logs backend
```

### Diferencias entre `migrate dev` y `migrate deploy`

| Comando | Entorno | Qué hace |
|---------|---------|----------|
| `migrate dev` | Desarrollo | Crea nuevas migraciones, puede resetear DB |
| `migrate deploy` | Producción/Docker | Solo aplica migraciones existentes |

**Regla de oro:**
- **Local:** `migrate dev`
- **Docker/Producción:** `migrate deploy`

### Seed no funciona

**Verifica que `package.json` tenga:**
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

**Ejecuta manualmente:**
```bash
npx tsx prisma/seed.ts
```

---

## Mejores Prácticas

###  DO (Hacer)

- Usa `migrate dev` en desarrollo local
- Usa `migrate deploy` en producción/Docker
- Crea migraciones con nombres descriptivos
- Haz commit de la carpeta `prisma/migrations/`
- Ejecuta `prisma generate` después de `npm install`

### ❌ DON'T (No hacer)

- No uses `migrate dev` en producción
- No edites archivos de migración manualmente
- No borres la carpeta `migrations/` en producción
- No hagas `migrate reset` en producción
- No compartas contraseñas en `.env` (usa `.env.example`)

---

## Recursos Adicionales

- [Documentación oficial de Prisma](https://www.prisma.io/docs)
- [Prisma Migrate Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Troubleshooting](https://www.prisma.io/docs/guides/database/developing-with-prisma-migrate/troubleshooting-development)

---

**Autor:** Jorge Doicela  
**Última actualización:** 2026-01-29
