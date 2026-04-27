# Guía de Implementación y Producción - Sistema CNC

Este documento detalla los pasos necesarios para el despliegue del sistema en el servidor institucional y la preparación para la publicación en la Play Store.

## 1. Despliegue en el Servidor Institucional

El servidor asignado es `192.168.1.223`. Para poner el sistema en marcha:

1.  **Copiar el proyecto:** Subir la carpeta completa `CnCApp` al servidor Linux.
2.  **Preparación del servidor:** Asegurarse de tener instalado Docker y Docker Compose.
3.  **Ejecución del despliegue:**
    ```bash
    cd CnCApp
    bash setup-server.sh
    ```
    *Este script hará todo el trabajo: configurará las bases de datos, aplicará las migraciones, compilará el frontend y levantará los servicios.*

## 2. Requisitos para la Google Play Store

Para que la aplicación sea aceptada en la Play Store y funcione en dispositivos móviles fuera de la oficina, se deben cumplir obligatoriamente estos requisitos:

1.  **Dominio Público:** Se requiere una URL (ejemplo: `https://capacitacion.competencias.gob.ec`) apuntando a la IP pública del servidor.
2.  **Certificado SSL (HTTPS):** Android bloquea por defecto conexiones `http` en producción. El servidor debe estar configurado con HTTPS.
3.  **Configuración de Correo:** Seguir los pasos en `docs/CONFIGURACION_SMTP.md` para habilitar el envío desde Office 365 institucional.

## 3. Cambio a Entorno de Producción Final

Cuando el CNC asigne el dominio público, el desarrollador deberá:

1.  Editar el archivo `config.json` en la raíz del proyecto:
    ```json
    {
      "serverIp": "capacitacion.competencias.gob.ec",
      "backendPort": 443,
      "frontendPort": 443
    }
    ```
2.  Ejecutar el script de sincronización en Windows: `.\actualizar-ip.ps1`.
3.  Generar el APK de producción en Android Studio (**Build > Generate Signed Bundle / APK**).

## 4. Mantenimiento Automático

El sistema ya incluye tareas programadas (cron jobs) que se configuran solas al ejecutar `setup-server.sh`:
*   **Backups:** Copia de seguridad de la base de datos todos los días a las 2:00 AM.
*   **Limpieza:** Borrado de archivos temporales y certificados antiguos cada semana para ahorrar espacio.

## 5. Actualización del Sistema (Flujo Git)

Para seguir actualizando el sistema después del despliegue inicial, se recomienda seguir este flujo de trabajo basado en Git:

### Paso A: Subir cambios desde el PC de Desarrollo
Una vez realizados los cambios en el código localmente:
1.  Abre una terminal en la carpeta del proyecto.
2.  Sube los cambios al repositorio:
    ```bash
    git add .
    git commit -m "Descripción de los cambios realizados"
    git push origin main
    ```

### Paso B: Actualizar el Servidor (Producción)
Conéctate al servidor vía SSH y ejecuta los siguientes comandos para aplicar las actualizaciones:
1.  Entra en la carpeta del proyecto:
    ```bash
    cd CnCApp
    ```
2.  Descarga los nuevos cambios:
    ```bash
    git pull origin main
    ```
3.  Ejecuta el script de despliegue para reconstruir los contenedores y aplicar migraciones:
    ```bash
    bash setup-server.sh
    ```
    *Este comando se encargará de detectar los cambios, recompilar el frontend/backend y asegurar que la base de datos esté al día.*

---
*Documento generado automáticamente para el equipo técnico del CNC.*
