# 📱 Guía de Publicación en Tiendas (Android e iOS)

Esta guía detalla los requisitos técnicos, legales y económicos para publicar la aplicación del CNC en Google Play Store y Apple App Store.

## 1. Requisitos de Infraestructura (Obligatorio)

Antes de iniciar cualquier proceso en las tiendas, el sistema **DEBE** cumplir con:

*   **Dominio Público:** Una URL oficial (ej: `https://capacitacion.competencias.gob.ec`). No se pueden publicar apps que apunten a IPs (`192.168.x.x`).
*   **Certificado SSL (HTTPS):** Tanto Google como Apple prohíben conexiones no cifradas en apps de producción.
*   **Política de Privacidad:** Una página web simple donde se explique qué datos recolecta la app (Cédula, Email, etc.) y para qué se usan.

---

## 2. Google Play Store (Android)

### Costos y Cuentas
*   **Costo:** **$25 USD** (Pago único de por vida).
*   **Tipo de Cuenta:** Se recomienda crear una cuenta de **Organización** a nombre del Consejo Nacional de Competencias.

### Requisitos Técnicos
1.  **Iconos y Splash:** Diseñar el icono de la app (512x512px) y la imagen de carga.
2.  **Firma Digital (Keystore):** Se debe generar un archivo de firma único. **IMPORTANTE:** Si este archivo se pierde, no se puede volver a actualizar la app nunca más.
3.  **Archivo AAB:** Generar el "Android App Bundle" desde Android Studio.

### Proceso de Revisión
*   Google suele tardar de **3 a 7 días** en revisar la primera versión.
*   Pueden pedir una cuenta de prueba para que los revisores entren a la app.

---

## 3. Apple App Store (iOS)

### Costos y Cuentas
*   **Costo:** **$99 USD** (Suscripción **ANUAL**). Si se deja de pagar, la app desaparece de la tienda.
*   **Tipo de Cuenta:** Debe ser cuenta de **Organización**. Para esto, Apple exige un número **D-U-N-S** (un identificador internacional de empresas que el CNC debe tramitar si no lo tiene, es gratuito pero tarda unos días).

### Requisitos Técnicos
1.  **Hardware Apple:** Para generar el archivo final (`.ipa`) de iOS, es obligatorio usar una computadora **Mac** con el software **Xcode**. No se puede hacer desde Windows.
2.  **Capacitor iOS:** Ejecutar `npx cap add ios` en el proyecto y configurar los permisos de cámara/galería en el archivo `Info.plist`.

### Proceso de Revisión
*   Apple es muy estricto. La app debe ser fluida y no tener errores visuales.
*   Tiempo de revisión: **2 a 5 días**.

---

## 4. Resumen de Pasos a Seguir por el CNC

| Paso | Acción | Responsable |
| :--- | :--- | :--- |
| 1 | Comprar dominio y configurar SSL (HTTPS) | TI - CNC |
| 2 | Tramitar Número D-U-N-S (para Apple) | Administrativo - CNC |
| 3 | Crear cuentas de Desarrollador (Google y Apple) | TI - CNC |
| 4 | Redactar Política de Privacidad (URL pública) | Legal / Comunicación |
| 5 | Generar compilados finales (AAB e IPA) | Desarrollador |
| 6 | Subir a consolas y esperar aprobación | Desarrollador / TI |

## 💡 Recomendación Final
Si el CNC no cuenta con una computadora Mac para la versión de iOS, se puede alquilar un "Mac Cloud" por unos días para realizar la compilación final, o usar servicios de integración continua como GitHub Actions, aunque lo ideal es tener un equipo físico para pruebas reales.

---
*Este documento es una guía informativa. Los precios y políticas están sujetos a cambios por parte de Google y Apple.*
