# 📱 Guía de Generación de APK (Pruebas y Producción)

Esta guía explica cómo generar el archivo instalable para Android, tanto para pruebas internas como para la publicación oficial.

## 1. Preparación de Archivos
Antes de abrir Android Studio, siempre debes sincronizar los cambios realizados en el código del Frontend:

```powershell
# 1. Compilar el Frontend
cd frontend
npm run build

# 2. Copiar los archivos a la carpeta de Android
cd ..
npx cap copy android
npx cap sync android
```

---

## 2. Abrir el Proyecto en Android Studio
Abre la carpeta `android` de este proyecto con Android Studio. Espera a que el "Gradle Sync" termine (verás un check verde abajo).

---

## 3. Generar APK de Debug (Pruebas Rápidas)
Esta APK sirve para instalarla manualmente en teléfonos de la oficina por cable o enviándola por WhatsApp. No tiene firma de seguridad.

1.  En el menú superior, ve a: **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
2.  Espera a que aparezca un aviso abajo a la derecha.
3.  Haz clic en **locate** para encontrar el archivo `app-debug.apk`.

---

## 4. Generar APK Firmada (Con Licencia / Release)
Este es el proceso para la versión final que se sube a la Play Store o se entrega formalmente.

### Paso A: Iniciar el asistente
Ve a: **Build** > **Generate Signed Bundle / APK...**

### Paso B: Elegir Formato
*   **Android App Bundle (.aab):** Elige este para subir a la **Play Store** (Google lo exige ahora).
*   **APK:** Elige este si solo quieres un archivo `.apk` final con firma de seguridad.

### Paso C: Crear la Llave (Keystore)
Si es la primera vez, debes crear una licencia:
1.  Clic en **Create new...**
2.  **Key store path:** Elige una carpeta segura (fuera del proyecto) y ponle nombre (ej: `llave-cnc.jks`).
3.  **Password:** Pon una clave segura y **ANÓTALA**. Si se pierde, no podrás actualizar la App nunca más.
4.  **Alias:** Puedes poner `cnc-key`.
5.  **Validity:** Pon 25 años.
6.  Llena al menos un campo de "Certificate" (ej: CNC).

### Paso D: Generar archivo
1.  Selecciona la variante **release**.
2.  En **Signature Versions**, marca V1 y V2.
3.  Clic en **Finish**. El archivo final estará en `android/app/release/`.

---

## ⚠️ NOTA IMPORTANTE SOBRE SEGURIDAD
El archivo `.jks` (la llave) y las contraseñas son la identidad de la aplicación ante Google. **Nunca las compartas por correo público ni las subas a un repositorio de Git público.** El CNC debe guardar este archivo en un lugar seguro (ej: un disco duro externo o bóveda de claves).

---
*Manual técnico para el equipo de desarrollo del CNC.*
