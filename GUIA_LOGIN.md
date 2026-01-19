# 🚀 Guía Rápida: Iniciar Sesión en CnCApp

## ⚠️ Requisitos Previos

Antes de poder iniciar sesión, necesitas:

### 1️⃣ PostgreSQL Corriendo

**Opción A: Iniciar servicio de PostgreSQL (Windows)**
```powershell
# Abrir Servicios de Windows
services.msc

# Buscar "postgresql-x64-17"
# Click derecho → Iniciar
```

**Opción B: Usar Docker Desktop**
```bash
# 1. Abrir Docker Desktop
# 2. Esperar a que inicie
# 3. Ejecutar:
docker run --name cnc-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=cnc_db -p 5432:5432 -d postgres:15
```

---

## 🔧 Configuración del Backend (Solo Primera Vez)

### Paso 1: Generar Cliente de Prisma
```bash
cd cnc-backend
npm run prisma:generate
```

### Paso 2: Crear Base de Datos
```bash
# Opción A: Si PostgreSQL está corriendo como servicio
$env:PGPASSWORD='TU_PASSWORD'; psql -U postgres -c "CREATE DATABASE cnc_db;"

# Opción B: Si usas Docker
# La base de datos ya se creó automáticamente
```

### Paso 3: Ejecutar Migraciones
```bash
npm run prisma:migrate
# Cuando te pregunte el nombre, escribe: init
```

Esto creará todas las tablas:
- Usuario
- Rol
- Capacitaciones
- Certificados
- Provincias, Cantones, Parroquias
- Y todas las demás...

### Paso 4: Insertar Datos Iniciales (Seed)

Crea un usuario administrador para probar:

```bash
npm run prisma:studio
```

Esto abre una interfaz visual donde puedes:
1. Ir a la tabla `Rol`
2. Crear rol "Administrador" con `Id_Rol = 1`
3. Crear rol "Usuario Regular" con `Id_Rol = 2`
4. Ir a la tabla `Usuario`
5. Crear un usuario de prueba

**O usa este script SQL:**
```sql
-- Insertar roles
INSERT INTO "Rol" ("nombre_rol", "descripcion") VALUES
  ('Administrador', 'Acceso total'),
  ('Usuario Regular', 'Acceso básico');

-- Insertar usuario de prueba (password: 123456)
INSERT INTO "Usuario" ("Nombre_Usuario", "CI_Usuario", "Email_Usuario", "password", "Rol_Usuario") VALUES
  ('Admin Test', '1234567890', 'admin@cnc.gob.ec', '$2b$10$YourHashedPasswordHere', 1);
```

---

## 🚀 Iniciar el Backend

```bash
cd cnc-backend
npm run dev
```

Deberías ver:
```
╔═══════════════════════════════════════════╗
║   🚀 CNC Backend API                      ║
║   📡 Puerto: 3000                         ║
║   🌍 Entorno: development                 ║
╚═══════════════════════════════════════════╝
```

**Probar que funciona:**
```bash
curl http://localhost:3000/health
```

---

## 📱 Conectar la App Móvil al Backend

### Paso 1: Actualizar `environment.ts`

Abre: `src/environments/environment.ts`

**Cambiar de:**
```typescript
export const environment = {
  production: false,
  supabaseUrl: 'http://192.168.1.223:8000',
  supabaseKey: 'eyJhbGc...',
  redirectUrl: 'http://localhost:8100/recuperar-password',
};
```

**A:**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',  // ← Nueva URL del backend
  redirectUrl: 'http://localhost:8100/recuperar-password',
};
```

### Paso 2: Actualizar Servicio de Autenticación

Necesitamos cambiar de Supabase a llamadas HTTP directas.

**Crear nuevo servicio:** `src/app/services/auth.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  register(data: any) {
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }

  login(ci: string, password: string) {
    return this.http.post(`${this.apiUrl}/auth/login`, { ci, password });
  }

  getProfile(token: string) {
    return this.http.get(`${this.apiUrl}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}
```

### Paso 3: Actualizar Página de Login

Abre: `src/app/pages/auth/login/login.page.ts`

**Cambiar el método de login:**

```typescript
import { AuthService } from 'src/app/services/auth.service';

export class LoginPage {
  constructor(
    private authService: AuthService,
    // ... otros servicios
  ) {}

  async onLogin() {
    const ci = this.loginForm.value.ci;
    const password = this.loginForm.value.password;

    this.authService.login(ci, password).subscribe({
      next: (response: any) => {
        // Guardar token
        localStorage.setItem('token', response.token);
        localStorage.setItem('user_role', response.user.rolId);
        localStorage.setItem('auth_uid', response.user.id);
        
        // Navegar al home
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Error en login:', error);
        this.presentToast('Cédula o contraseña incorrectos', 'danger');
      }
    });
  }
}
```

---

## 🧪 Probar el Login

### 1. Backend corriendo
```bash
# Terminal 1
cd cnc-backend
npm run dev
```

### 2. Frontend corriendo
```bash
# Terminal 2 (ya lo tienes corriendo)
ionic serve
```

### 3. Abrir la app
```
http://localhost:8100
```

### 4. Ir a Login
```
http://localhost:8100/login
```

### 5. Ingresar credenciales
```
CI: 1234567890
Password: 123456
```

---

## ❓ Problemas Comunes

### Error: "Cannot connect to database"
```bash
# Verificar que PostgreSQL está corriendo
# Windows: services.msc → postgresql-x64-17 → Iniciar
```

### Error: "Port 3000 already in use"
```bash
# Cambiar puerto en .env
PORT=3001
```

### Error: "CORS policy"
```bash
# Verificar que ALLOWED_ORIGINS en .env incluye:
ALLOWED_ORIGINS=http://localhost:8100
```

### Error: "Prisma Client not generated"
```bash
cd cnc-backend
npm run prisma:generate
```

---

## 📊 Checklist

- [ ] PostgreSQL corriendo
- [ ] Base de datos `cnc_db` creada
- [ ] Migraciones ejecutadas
- [ ] Roles insertados
- [ ] Usuario de prueba creado
- [ ] Backend corriendo en puerto 3000
- [ ] `environment.ts` actualizado
- [ ] `AuthService` creado
- [ ] Login page actualizada
- [ ] Frontend corriendo en puerto 8100
- [ ] Login funciona ✅

---

## 🎯 Siguiente Paso

Una vez que el login funcione, podemos:
1. Implementar el registro de usuarios
2. Crear los CRUDs de capacitaciones
3. Implementar funcionalidad offline
4. Generar certificados con QR

---

> **Nota:** Guarda este archivo. Lo necesitarás cada vez que reinicies el proyecto.
