# Etapa de construcción
FROM node:18-alpine AS builder

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Asegurar que existan los archivos de entorno para evitar errores de compilación
RUN mkdir -p src/environments && \
    ( [ -f src/environments/environment.ts ] || echo "export const environment = { production: false, apiUrl: '/api' };" > src/environments/environment.ts ) && \
    ( [ -f src/environments/environment.prod.ts ] || echo "export const environment = { production: true, apiUrl: '/api' };" > src/environments/environment.prod.ts )

# Construir la aplicación Angular/Ionic para producción
RUN npm run build

# Etapa de producción
FROM nginx:alpine AS production

# Copiar la configuración de Nginx personalizada
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar los archivos construidos desde la etapa anterior
# Nota: La carpeta de salida configurada en angular.json es 'www'
COPY --from=builder /app/www /usr/share/nginx/html

# Exponer el puerto 8080 (según nginx.conf)
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
