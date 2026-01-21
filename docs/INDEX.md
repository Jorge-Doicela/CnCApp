# Documentación Técnica - CnCApp

Bienvenido a la documentación técnica del Sistema de Gestión de Capacitaciones del Consejo Nacional de Competencias.

---

## Guía de Navegación

Esta documentación está organizada por temas para facilitar su consulta:

### Primeros Pasos

| Documento | Descripción | Audiencia |
|-----------|-------------|-----------|
| [README Principal](../README.md) | Visión general del proyecto | Todos |
| [Guía de Desarrollo](DEVELOPMENT.md) | Setup y flujo de trabajo | Desarrolladores |
| [Docker Setup](DOCKER_SETUP.md) | Despliegue con Docker | DevOps, Desarrolladores |

### Arquitectura y Diseño

| Documento | Descripción | Audiencia |
|-----------|-------------|-----------|
| [Arquitectura del Sistema](ARCHITECTURE.md) | Diseño general y patrones | Arquitectos, Desarrolladores |
| [Base de Datos](DATABASE.md) | Schema, migraciones y relaciones | Desarrolladores, DBAs |
| [API Documentation](API.md) | Endpoints y ejemplos | Desarrolladores Frontend/Backend |

### Deployment y Operaciones

| Documento | Descripción | Audiencia |
|-----------|-------------|-----------|
| [Deployment Guide](DEPLOYMENT.md) | Despliegue en producción | DevOps, SysAdmins |
| [Seguridad](SECURITY.md) | Políticas y mejores prácticas | Todos |
| [Troubleshooting](TROUBLESHOOTING.md) | Solución de problemas comunes | Desarrolladores, DevOps |

### Colaboración

| Documento | Descripción | Audiencia |
|-----------|-------------|-----------|
| [Guía de Contribución](CONTRIBUTING.md) | Cómo contribuir al proyecto | Contribuidores |
| [Testing Guide](TESTING.md) | Estrategia y guías de testing | Desarrolladores, QA |
| [Changelog](CHANGELOG.md) | Historial de cambios | Todos |

---

## Estructura de la Documentación

```
docs/
├── INDEX.md                      # Este archivo (índice)
├── ARCHITECTURE.md                # Arquitectura del sistema
├── DEVELOPMENT.md                 # Guía de desarrollo
├── API.md                         # Documentación de API
├── DATABASE.md                    # Base de datos
├── DOCKER_SETUP.md                # Setup con Docker
├── DEPLOYMENT.md                  # Guía de despliegue
├── SECURITY.md                    # Seguridad
├── CONTRIBUTING.md                # Contribución
├── TESTING.md                     # Testing
├── TROUBLESHOOTING.md             # Solución de problemas
├── CHANGELOG.md                   # Historial de cambios
│
├── architecture/                  # Diagramas y diseños detallados
│   ├── backend-architecture.md
│   ├── frontend-architecture.md
│   └── diagrams/
│
├── api/                           # Documentación detallada de API
│   ├── authentication.md
│   ├── users.md
│   ├── capacitaciones.md
│   └── certificados.md
│
└── guides/                        # Guías específicas
    ├── mobile-build.md
    ├── environment-setup.md
    └── code-style.md
```

---

## Rutas Rápidas

### Para Desarrolladores Nuevos

1. Lee el [README principal](../README.md)
2. Sigue la [Guía de Desarrollo](DEVELOPMENT.md)
3. Revisa la [Arquitectura](ARCHITECTURE.md)
4. Consulta la [API Documentation](API.md)

### Para DevOps

1. Revisa [Docker Setup](DOCKER_SETUP.md)
2. Lee la [Guía de Deployment](DEPLOYMENT.md)
3. Consulta [Seguridad](SECURITY.md)
4. Ten a mano [Troubleshooting](TROUBLESHOOTING.md)

### Para Contribuidores

1. Lee la [Guía de Contribución](CONTRIBUTING.md)
2. Revisa la [Guía de Testing](TESTING.md)
3. Consulta el [Changelog](CHANGELOG.md)

---

## Búsqueda Rápida

### Backend
- [Clean Architecture](ARCHITECTURE.md#backend-clean-architecture)
- [Estructura de carpetas](DEVELOPMENT.md#estructura-backend)
- [Prisma y Base de Datos](DATABASE.md)
- [Autenticación JWT](API.md#autenticación)

### Frontend
- [Arquitectura Modular](ARCHITECTURE.md#frontend-modular-architecture)
- [Standalone Components](DEVELOPMENT.md#frontend-standalone)
- [Signals y Estado](DEVELOPMENT.md#gestión-de-estado)
- [Ionic Components](DEVELOPMENT.md#ui-components)

### DevOps
- [Docker Compose](DOCKER_SETUP.md)
- [Variables de Entorno](DEPLOYMENT.md#variables-de-entorno)
- [Nginx Configuration](DEPLOYMENT.md#nginx)
- [CI/CD](DEPLOYMENT.md#cicd)

---

## Diagramas

Los diagramas están escritos en Mermaid y se renderizan automáticamente en GitHub:

- [Arquitectura del Sistema](ARCHITECTURE.md#diagrama-general)
- [Flujo de Autenticación](ARCHITECTURE.md#flujo-de-autenticación)
- [Estructura de Base de Datos](DATABASE.md#diagrama-er)
- [Flujo de Certificación](ARCHITECTURE.md#flujo-de-certificación)

---

## Ayuda y Soporte

### Problemas Comunes

Consulta [Troubleshooting](TROUBLESHOOTING.md) para soluciones a problemas frecuentes:

- Errores de compilación
- Problemas de conexión a base de datos
- Issues con Docker
- Errores de autenticación

### Contacto

- **Email**: soporte@competencias.gob.ec
- **Documentación**: Esta carpeta
- **Issues**: GitHub Issues (si aplica)

---

## Convenciones

### Formato de Documentación

- Todos los documentos están en **Markdown**
- Usamos **GitHub Flavored Markdown**
- Los diagramas usan **Mermaid**
- Los ejemplos de código incluyen **syntax highlighting**

### Nomenclatura

- Archivos en **UPPERCASE.md** para documentos principales
- Carpetas en **lowercase** para subdirectorios
- Enlaces relativos para navegación interna

---

## Mantenimiento

Esta documentación se actualiza regularmente:

- **Cada release**: Actualizar CHANGELOG.md
- **Cambios de arquitectura**: Actualizar ARCHITECTURE.md
- **Nuevos endpoints**: Actualizar API.md
- **Cambios de schema**: Actualizar DATABASE.md

---

## Versión

**Última actualización**: Enero 2025
**Versión del sistema**: 1.0.0

---


