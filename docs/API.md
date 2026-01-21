# Documentación de API RESTful - CnCApp

Bienvenido a la referencia completa de la API del Sistema de Gestión de Capacitaciones. Esta documentación detalla todos los endpoints disponibles, formatos de solicitud/respuesta, y códigos de error.

---

## Información General

- **Base URL**: `http://localhost:3000/api` (Desarrollo) / `https://api.cnc.gob.ec/api` (Producción)
- **Protocolo**: HTTP/1.1 (HTTPS requerido en Producción)
- **Formato de Comunicación**: JSON (`Content-Type: application/json`)
- **Codificación**: UTF-8

### Autenticación

La API utiliza **JWT (JSON Web Tokens)** para la autenticación.
Para acceder a endpoints protegidos, debe incluir el token en el header `Authorization`.

**Formato del Header:**
```http
Authorization: Bearer <tu_token_jwt_aqui>
```

### Convenciones de Respuesta Estandarizada

Todas las respuestas de la API siguen una estructura predecible:

**Éxito (2xx):**
Depende del endpoint, pero generalmente retorna el objeto solicitado o una confirmación.

**Error (4xx, 5xx):**
```json
{
  "status": "error",
  "message": "Descripción legible del error",
  "code": "ERROR_CODE_SPECIFIC",
  "details": {
    "field": "motivo del error de validación"
  }
}
```

---

## Endpoints

### 1. Autenticación (`/auth`)

#### Iniciar Sesión
Autentica a un usuario y retorna un token de acceso.

- **Método**: `POST`
- **Ruta**: `/auth/login`
- **Acceso**: Público

**Body Request:**
```json
{
  "ci": "1712345678",        // Cédula válida (10 dígitos)
  "password": "mypassword123" // Contraseña del usuario
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "Id_Usuario": 1,
    "CI": "1712345678",
    "Nombre": "Juan Pérez",
    "email": "juan@example.com",
    "Rol_Usuario": 2, // 1=User, 2=Admin, etc.
    "Estado": 1
  }
}
```

**Errores Comunes:**
- `401 Unauthorized`: "Credenciales incorrectas"
- `400 Bad Request`: "Faltan datos requeridos (CI o Password)"

#### Registrar Usuario
Crea una nueva cuenta de usuario en el sistema.

- **Método**: `POST`
- **Ruta**: `/auth/register`
- **Acceso**: Público

**Body Request:**
```json
{
  "CI": "1712345678",
  "email": "nuevo@usuario.com",
  "password": "PasswordSeguro123!",
  "Nombre1": "Juan",
  "Apellido1": "Pérez",
  "celular": "0991234567",
  "Genero": "Masculino",
  "Nacionalidad": "Ecuatoriana",
  "Etnia": "MESTIZO",
  "tipoParticipante": 0 // 0=Ciudadano, 1=Autoridad, 2=Funcionario, 3=Institución
}
```

**Response (201 Created):**
```json
{
  "message": "Usuario registrado exitosamente",
  "userId": 45
}
```

**Errores Comunes:**
- `409 Conflict`: "El usuario con CI o Email ya existe"
- `400 Bad Request`: "Error de validación en campos (ej: CI inválida)"

---

### 2. Gestión de Usuarios (`/users`)

#### Obtener Perfil (Yo)
Obtiene los datos del usuario autenticado actual.

- **Método**: `GET`
- **Ruta**: `/users/me`
- **Acceso**: Autenticado (Cualquier rol)

**Response (200 OK):**
```json
{
  "Id_Usuario": 1,
  "CI": "1712345678",
  "Nombre1": "Juan",
  "Nombre2": "Carlos",
  "Apellido1": "Pérez",
  "Apellido2": "López",
  "email": "juan@example.com",
  "celular": "0991234567",
  "convencional": "022345678",
  "foto_perfil_url": "https://...",
  "Rol_Usuario": 1,
  "tipo_participante": 0
}
```

#### Listar Usuarios (Admin)
Obtiene una lista paginada de usuarios registrados.

- **Método**: `GET`
- **Ruta**: `/users`
- **Acceso**: Admin (Rol 2)

**Query Params:**
- `page`: Número de página (default: 1)
- `limit`: Resultados por página (default: 10)
- `search`: Búsqueda por nombre o CI

**Response (200 OK):**
```json
{
  "data": [
    {
      "Id_Usuario": 1,
      "CI": "1712345678",
      "Nombre": "Juan Pérez",
      "email": "juan@example.com",
      "Rol_Usuario": 1,
      "Estado": 1
    }
    // ... más usuarios
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "pages": 15
  }
}
```

---

### 3. Capacitaciones (`/capacitaciones`)

#### Listar Capacitaciones Disponibles
Muestra las capacitaciones activas disponibles para inscripción.

- **Método**: `GET`
- **Ruta**: `/capacitaciones`
- **Acceso**: Público / Autenticado

**Query Params:**
- `estado`: Filtrar por estado (0=Pendiente, 1=Finalizada)
- `modalidad`: 'Virtual', 'Presencial', 'Hibrida'

**Response (200 OK):**
```json
[
  {
    "Id_Capacitacion": 101,
    "Nombre_Capacitacion": "Gestión de Finanzas Públicas",
    "Descripcion_Capacitacion": "Curso intensivo de 40 horas...",
    "Fecha_Capacitacion": "2025-03-15T00:00:00.000Z",
    "Hora_Inicio": "08:00",
    "Hora_Fin": "17:00",
    "Modalidades": "Virtual",
    "Lugar_Capacitacion": "Zoom",
    "Horas": 40,
    "Cupos_Disponibles": 25,
    "Estado": 0
  }
]
```

#### Crear Capacitación (Admin)
Registra un nuevo evento de capacitación.

- **Método**: `POST`
- **Ruta**: `/capacitaciones`
- **Acceso**: Admin (Rol 2)

**Body Request:**
```json
{
  "Nombre_Capacitacion": "Liderazgo en Gobiernos Locales",
  "Descripcion_Capacitacion": "Taller para alcaldes y prefectos",
  "Fecha_Capacitacion": "2025-04-20",
  "Hora_Inicio": "09:00",
  "Hora_Fin": "13:00",
  "Modalidades": "Presencial",
  "Lugar_Capacitacion": "Auditorio CNC",
  "Horas": 4,
  "Cupos": 50
}
```

**Response (201 Created):**
```json
{
  "message": "Capacitación creada exitosamente",
  "Id_Capacitacion": 102
}
```

#### Inscribirse en Capacitación
Permite a un usuario inscribirse en un evento.

- **Método**: `POST`
- **Ruta**: `/capacitaciones/:id/inscribir`
- **Acceso**: Autenticado

**Response (200 OK):**
```json
{
  "message": "Inscripción realizada con éxito",
  "inscripcion": {
    "Id_Inscripcion": 505,
    "Estado": "Activa",
    "Fecha": "2025-01-21T..."
  }
}
```

**Errores Comunes:**
- `409 Conflict`: "Usuario ya inscrito en esta capacitación"
- `400 Bad Request`: "No hay cupos disponibles"

---

### 4. Certificados (`/certificados`)

#### Descargar Certificado
Genera la URL o stream del PDF del certificado.

- **Método**: `GET`
- **Ruta**: `/certificados/generar/:idCapacitacion`
- **Acceso**: Autenticado (El usuario debe haber aprobado la capacitación)

**Response (200 OK):**
```json
{
  "url": "https://api.cnc.gob.ec/storage/certificados/cert_123_abc.pdf",
  "hash": "a1b2c3d4e5f6...",
  "generado": true
}
```

**Errores Comunes:**
- `403 Forbidden`: "El usuario no cumple los requisitos para el certificado (Asistencia/Aprobación)"
- `404 Not Found`: "Capacitación no encontrada"

#### Validar Certificado (Público)
Verifica la autenticidad de un certificado mediante su código hash/QR.

- **Método**: `GET`
- **Ruta**: `/certificados/validar/:hash`
- **Acceso**: Público

**Response (200 OK):**
```json
{
  "valido": true,
  "certificado": {
    "Beneficiario": "Juan Pérez",
    "CI": "******5678",
    "Capacitacion": "Gestión de Finanzas Públicas",
    "Fecha_Emision": "2025-03-20",
    "Horas": 40,
    "Institucion": "Consejo Nacional de Competencias"
  }
}
```

**Response (404 Not Found):**
```json
{
  "valido": false,
  "message": "Certificado no encontrado o inválido"
}
```

---

### 5. Catálogos (`/catalogos`)

Endpoints de solo lectura para llenar selects en el frontend.

| Ruta | Descripción | Parámetros |
|------|-------------|------------|
| `GET /catalogos/provincias` | Lista todas las provincias | - |
| `GET /catalogos/cantones/:provinciaId` | Cantones de una provincia | `provinciaId` (int) |
| `GET /catalogos/parroquias/:cantonId` | Parroquias de un cantón | `cantonId` (int) |
| `GET /catalogos/roles` | Roles de usuario disponibles | - |
| `GET /catalogos/entidades` | Entidades para perfil usuario | - |
| `GET /catalogos/competencias` | Competencias GAD | - |

---

## Códigos de Estado HTTP

| Código | Significado | Descripción |
|--------|-------------|-------------|
| `200` | **OK** | La solicitud fue exitosa. |
| `201` | **Created** | Recurso creado exitosamente (ej: registro usuario). |
| `204` | **No Content** | Éxito pero sin cuerpo de respuesta. |
| `400` | **Bad Request** | Error de validación o solicitud mal formada. |
| `401` | **Unauthorized** | Falta token de autenticación o es inválido. |
| `403` | **Forbidden** | Token válido pero sin permisos para este recurso. |
| `404` | **Not Found** | El recurso solicitado no existe. |
| `409` | **Conflict** | Conflicto de datos (ej: duplicados). |
| `429` | **Too Many Requests** | Excedido el límite de tasa de solicitudes. |
| `500` | **Internal Server Error** | Error no controlado en el servidor. |

---

<div align="center">

**[Volver al Índice](INDEX.md)**

</div>
