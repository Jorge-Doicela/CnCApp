# Frontend - CNC App

Aplicación móvil y web del Consejo Nacional de Competencias.

## 🎨 Tecnologías

- **Framework:** Angular 19
- **UI:** Ionic 8
- **Arquitectura:** Standalone Components
- **Estado:** Signals (sin RxJS para UI state)
- **Mobile:** Capacitor 7

## 🚀 Desarrollo

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm start
# Abre en http://localhost:8100

# Build de producción
npm run build
```

## 📱 Compilar para Android

```bash
# Build del frontend
npm run build

# Volver a la raíz y sincronizar con Capacitor
cd ..
npx cap sync android
npx cap open android
```

## 🏗️ Estructura

```
src/
├── app/
│   ├── pages/          # Páginas de la app
│   │   ├── auth/       # Login, Register
│   │   ├── admin/      # CRUD Administrativo
│   │   └── user/       # Perfil, Certificados
│   ├── services/       # Servicios con Signals
│   ├── guards/         # Guards funcionales
│   └── app.component.ts # Componente raíz standalone
├── assets/            # Imágenes, iconos
└── environments/      # Configuración por entorno
```

## 🔧 Características Modernas

- ✅ **Standalone Components** - Sin NgModules
- ✅ **Signals** - Reactividad moderna y performante
- ✅ **Functional Guards** - Guards con `inject()`
- ✅ **Lazy Loading** - Carga bajo demanda
- ✅ **PWA Ready** - Funciona offline

## 🌐 Configuración

Edita `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  redirectUrl: 'http://localhost:8100/recuperar-password'
};
```

## 📦 Scripts Disponibles

- `npm start` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm test` - Ejecutar tests
- `npm run lint` - Linter
