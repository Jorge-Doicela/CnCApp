# Etapa de construcción
FROM node:18-alpine AS builder

WORKDIR /app

# Instalar dependencias necesarias para Prisma y node-gyp
RUN apk add --no-cache openssl python3 make g++

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar todas las dependencias (incluyendo dev)
RUN npm install

# Generar cliente de Prisma
RUN npx prisma generate

# Copiar el resto del código
COPY . .

# Compilar TypeScript
RUN npm run build

# Etapa de producción
FROM node:18-alpine AS production

WORKDIR /app

# Instalar openssl para Prisma
RUN apk add --no-cache openssl

# Copiar archivos necesarios desde la etapa de construcción
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Instalar solo dependencias de producción para ahorrar espacio
RUN npm install --omit=dev && npx prisma generate

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Exponer el puerto del backend
EXPOSE 3000

# Comando para iniciar la aplicación (migraciones y luego app)
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/app.js"]
