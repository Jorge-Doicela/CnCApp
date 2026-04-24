# Guía de Configuración SMTP para Office 365 (CNC)

Para que el Sistema CNC pueda enviar correos electrónicos utilizando la cuenta institucional de Office 365 (`soporte@competencias.gob.ec`), se deben seguir los siguientes pasos técnicos por parte del administrador de TI de la institución.

### ⚠️ ¿Por qué falla el correo actualmente?
Microsoft bloquea por defecto el envío de correos desde aplicaciones externas por "seguridad" (autenticación básica). Para habilitarlo, su administrador de TI debe realizar estas 3 acciones críticas:

1.  **Habilitar "SMTP Autenticado":** En el Centro de Administración de M365 para el usuario soporte.
2.  **Excepción de Seguridad:** Desactivar los "Security Defaults" o crear una excepción para esta cuenta.
3.  **Contraseña de Aplicación:** Si usan MFA (celular), deben generar una contraseña especial de 16 caracteres.

---

## 1. Habilitar SMTP Autenticado (SMTP AUTH)
Microsoft desactiva por defecto el protocolo SMTP en las cuentas de Microsoft 365. Es necesario habilitarlo específicamente para la cuenta del sistema:

1.  Inicie sesión en el **Centro de administración de Microsoft 365**.
2.  Vaya a **Usuarios** > **Usuarios activos**.
3.  Seleccione el usuario `soporte@competencias.gob.ec`.
4.  Haga clic en la pestaña **Correo**.
5.  Haga clic en **Administrar aplicaciones de correo electrónico**.
6.  Marque la casilla **SMTP autenticado**.
7.  Haga clic en **Guardar cambios**.

## 2. Ajustar Directivas de Seguridad (Entra ID / Azure AD)
Si la organización tiene habilitados los **"Valores predeterminados de seguridad" (Security Defaults)**, se bloqueará cualquier intento de conexión SMTP por considerarse "autenticación heredada".

Existen dos formas de manejar esto:

### Opción A: Crear una directiva de Acceso Condicional (Recomendado)
Si tienen licencias Premium (P1/P2), pueden crear una política que excluya a esta cuenta específica del requisito de MFA (Autenticación Multifactor) solo para el protocolo SMTP desde la IP del servidor.

### Opción B: Generar una Contraseña de Aplicación (Si MFA está activo)
Si la cuenta tiene MFA activo y no se pueden cambiar las políticas globales:
1.  Vaya a la configuración de seguridad de la cuenta del usuario.
2.  Busque **Verificación de seguridad adicional**.
3.  Seleccione **Contraseñas de aplicación**.
4.  Genere una nueva contraseña y úsela en el archivo `.env` en lugar de la contraseña normal de la cuenta.

## 3. Configuración en el archivo `.env` del Backend
Una vez realizados los pasos anteriores, la configuración en el archivo `.env` debe ser:

```env
SMTP_HOST="smtp.office365.com"
SMTP_PORT=587
SMTP_USER="soporte@competencias.gob.ec"
SMTP_PASS="LA_CONTRASEÑA_O_PASSWORD_DE_APP"
SMTP_SECURE="false"
```

> **Nota:** El valor `SMTP_SECURE="false"` es correcto para el puerto 587, ya que Nodemailer iniciará la conexión de forma segura mediante **STARTTLS**.

## 4. Verificación de Red
Asegúrese de que el servidor donde corre el sistema tenga salida permitida por el puerto **587** hacia internet. Algunos firewalls corporativos bloquean este puerto por defecto.
