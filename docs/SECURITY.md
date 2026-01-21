# 🔒 Seguridad - CnCApp

La seguridad es una prioridad fundamental en el Sistema de Gestión de Capacitaciones del CNC. Este documento describe las prácticas, políticas y configuraciones de seguridad implementadas en el proyecto.

---

## 🛡️ Autenticación y Autorización

### JWT (JSON Web Tokens)
El sistema utiliza JWT para la autenticación stateless.
- **Algoritmo**: HS256 (HMAC SHA-256).
- **Expiración**: Tokens de acceso con tiempo de vida corto configurable (`JWT_EXPIRES_IN`).
- **Storage**: En el frontend, los tokens deben almacenarse en `localStorage` (o preferiblemente memoria/cookies httpOnly si se implementa BFF).
- **Transporte**: Siempre vía HTTPS en el header `Authorization: Bearer <token>`.

### Control de Acceso (RBAC)
Implementamos Role-Based Access Control (RBAC) estricto.
- **Validación**: Se verifica el rol del usuario en cada petición a endpoints protegidos mediante Middleware (`auth.middleware.ts`) en el Backend y Guards (`auth.guard.ts`) en el Frontend.
- **Roles Definidos**:
    - `1`: Usuario Ciudadano (Acceso limitado a sus propios datos).
    - `2`: Administrador (Acceso total).
    - `3`: Autoridad / Funcionario (Permisos específicos).

---

## 🔐 Protección de Datos

### Contraseñas
- **Hashing**: Las contraseñas **nunca** se almacenan en texto plano.
- **Algoritmo**: Utilizamos **Bcrypt** con un Salt Round mínimo de 10.
- **Política**: Se recomienda forzar contraseñas fuertes (mínimo 8 caracteres, alfanuméricos) en el frontend.

### Datos Sensibles
- La información personal (Cédula, Correo, Teléfono) está resguardada y solo accesible por el propietario o administradores autorizados.
- Los logs del servidor no deben imprimir datos sensibles como contraseñas o tokens.

---

## 🌐 Seguridad de Red y API

### HTTPS
En producción, todo el tráfico debe estar cifrado mediante TLS/HTTPS.
- **Nginx**: Configurado como Reverse Proxy para manejar la terminación SSL.
- **Redirección**: HTTP debe redirigir siempre a HTTPS.

### Headers de Seguridad (Helmet)
El backend utiliza `helmet` para configurar headers HTTP seguros:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` (Protección contra Clickjacking)
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (HSTS) en producción.

### CORS (Cross-Origin Resource Sharing)
Configurado estrictamente para permitir peticiones solo desde dominios autorizados (definidos en `ALLOWED_ORIGINS`).

### Rate Limiting
Para prevenir ataques de fuerza bruta y DoS:
- **Límite**: Configurado por defecto a 100 peticiones por 15 minutos por IP.
- **Implementación**: `express-rate-limit`.

---

## 🐳 Seguridad en Docker

### Contenedores
- **Usuarios no root**: Los contenedores no deberían correr como root en producción (pendiente de implementación completa en Dockerfiles actuales).
- **Imágenes**: Usamos imágenes base oficiales y ligeras (Alpine/Slim) para reducir la superficie de ataque.

### Secretos
- **Variables de Entorno**: Las credenciales (DB passwords, API keys) se inyectan vía variables de entorno.
- **.env**: El archivo `.env` **nunca** debe comitearse al repositorio (está en `.gitignore`).

---

## 🚨 Reporte de Vulnerabilidades

Si descubres una vulnerabilidad de seguridad en CnCApp, por favor sigue estos pasos:

1.  **NO** abras un Issue público en GitHub.
2.  Envía un correo electrónico detallado a `seguridad@competencias.gob.ec` (o el contacto designado).
3.  Incluye pasos para reproducir la vulnerabilidad (PoC).
4.  El equipo de desarrollo responderá en un plazo de 48 horas.

---

## ✅ Checklist de Despliegue Seguro

Antes de pasar a producción:

- [ ] Cambiar contraseña por defecto de base de datos.
- [ ] Generar un nuevo `JWT_SECRET` criptográficamente seguro.
- [ ] Habilitar SSL/HTTPS.
- [ ] Establecer `NODE_ENV=production`.
- [ ] Deshabilitar logs de debug (`console.log`).
- [ ] Verificar reglas de Firewall (solo puertos 80/443 expuestos públicamente).

---

<div align="center">

**[⬆ Volver al Índice](INDEX.md)**

</div>
