# 🚀 Guía de Despliegue en Producción (Linux) - CnCApp

Este sistema ha sido diseñado bajo una arquitectura de **"Soberanía de Datos"**: todo es interno, independiente y automatizado.

## 1. Requisitos del Servidor Linux
*   **SO**: Ubuntu 22.04 LTS o superior (recomendado).
*   **Docker**: Docker Engine y Docker Compose instalados.
*   **Firewall (UFW)**: Abrir puertos esenciales:
    ```bash
    sudo ufw allow 80/tcp   # HTTP
    sudo ufw allow 443/tcp  # HTTPS
    sudo ufw allow 22/tcp   # SSH
    ```

## 2. Instalación por Primera Vez
1.  **Clonar el repositorio** (en privado):
    ```bash
    git clone https://github.com/tu-usuario/tu-repo.git /opt/cnc-app
    cd /opt/cnc-app
    ```
2.  **Configurar Variables de Entorno**:
    *   Crea el archivo `backend/.env` (puedes copiar el de desarrollo).
    *   Asegúrate de que `NODE_ENV=production` y de usar claves JWT seguras (ya configuradas).

## 3. El Comando Maestro (Automatización Total)
Para configurar el servidor, actualizar la IP y activar el mantenimiento automático, solo ejecuta:
```bash
chmod +x setup-server.sh
./setup-server.sh tu-dominio.com  # O tu IP pública
```

### ¿Qué hace este comando por ti?
*   **Sincronización**: Actualiza las URLs en el Frontend y Backend instantáneamente.
*   **Auto-Mantenimiento**: Instala tareas en el sistema para:
    *   **Backups**: Cada noche a las 2:00 AM (`scripts/backup-db.sh`).
    *   **Limpieza**: Cada domingo a las 3:00 AM (`scripts/limpiar-servidor.sh`).
*   **Docker**: Levanta todos los servicios con límites de memoria y rotación de logs.

## 4. Política de Archivos y Espacio
*   **Logs**: Limitados a 30MB totales por servicio (rotación automática de Docker).
*   **Certificados (PDF)**: Se borran automáticamente cada 30 días para ahorrar espacio. **No te preocupes:** si un usuario pide su certificado un año después, el sistema lo regenera al instante desde la base de datos.
*   **Subidas**: Límite estricto de **5MB** por archivo para evitar saturación.

## 5. La App (APK Inmortal)
Para que no tengas que reinstalar la App si cambias de servidor:
1.  Usa un **Dominio** (ej: `api.tu-app.com`) en lugar de una IP.
2.  Ejecuta `.\actualizar-ip.ps1 api.tu-app.com` en tu máquina Windows.
3.  Genera el APK firmado en Android Studio.
4.  **Si cambias de servidor**, solo apunta el dominio a la nueva IP. ¡La App seguirá funcionando!

## 6. Seguridad y SSL
Recomendamos usar Nginx en el host (fuera de Docker) con Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```
(Usa la plantilla `nginx/cnc-app.conf` que ya está lista en el proyecto).
