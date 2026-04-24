# 🚀 Guía de Despliegue en Producción - CnCApp

Este sistema utiliza un modelo de **Configuración Centralizada** para facilitar el despliegue tanto en entornos de desarrollo local como en servidores de producción.

## ⚙️ 1. Fuente de Verdad Única: `config.json`

Todo el proyecto (Frontend, Backend y Android) se configura desde un solo archivo en la raíz: **`config.json`**.

```json
{
  "serverIp": "192.168.1.223",
  "backendPort": 3005,
  "frontendPort": 4200
}
```

---

## 💻 2. Desarrollo (Windows)

Si cambias de red o quieres probar en un dispositivo físico Android:

1.  Edita la IP en `config.json`.
2.  Sincroniza el proyecto ejecutando en PowerShell:
    ```powershell
    .\actualizar-ip.ps1
    ```
3.  **Para Android (Live Reload):** El script te dará el comando exacto al finalizar, similar a este:
    ```powershell
    npx cap run android --live-reload --port 4200 --host 192.168.1.223
    ```

---

## 🌐 3. Despliegue en Servidor (Linux)

Para poner el sistema en marcha en un servidor Linux (vía Docker):

1.  Sube el código al servidor.
2.  Edita `config.json` con la IP pública o el Dominio del servidor.
3.  Ejecuta el **Comando Maestro**:
    ```bash
    bash setup-server.sh
    ```

### ¿Qué hace `setup-server.sh` por ti?
*   **Sincronización Total**: Lee `config.json` y actualiza automáticamente los archivos `.env`, `environment.ts` y configuraciones de Nginx.
*   **Docker**: Levanta todos los servicios (`docker-compose`) con límites de memoria y rotación de logs.
*   **Auto-Mantenimiento**:
    *   **Backups**: Configura una tarea diaria a las 2:00 AM (`scripts/backup-db.sh`).
    *   **Limpieza**: Configura una tarea semanal de archivos temporales (`scripts/limpiar-servidor.sh`).

---

## 🔒 4. Seguridad Recomendada

Para producción real, se recomienda usar **SSL (HTTPS)**:
1.  Apunta un dominio a tu IP.
2.  Instala Certbot: `sudo apt install certbot python3-certbot-nginx`.
3.  Genera el certificado: `sudo certbot --nginx -d tu-dominio.com`.
4.  Usa la plantilla de configuración en `nginx/cnc-app.conf`.

---

## 🛠️ 5. Mantenimiento de Espacio
*   **Logs**: Limitados a 30MB por servicio.
*   **Certificados PDF**: Se limpian automáticamente cada 30 días. El sistema los regenera bajo demanda si el usuario los solicita de nuevo.
*   **Subidas**: Límite estricto de **5MB** por archivo (configurable en `config.json` y `.env`).
