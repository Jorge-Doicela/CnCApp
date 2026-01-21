# Guía de Contribución - CnCApp

¡Gracias por tu interés en contribuir al Sistema de Gestión de Capacitaciones del Consejo Nacional de Competencias!

Este documento establece las pautas para contribuir al proyecto, asegurando calidad, consistencia y un flujo de trabajo eficiente.

---

## Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Empezando](#empezando)
- [Flujo de Trabajo Git](#flujo-de-trabajo-git)
- [Estándares de Código](#estándares-de-código)
- [Proceso de Pull Request](#proceso-de-pull-request)
- [Reporte de Bugs](#reporte-de-bugs)

---

## Código de Conducta

Este proyecto se adhiere a un código de conducta estándar para fomentar un ambiente abierto y acogedor.
- **Respeto**: Trata a todos con respeto y consideración.
- **Inclusividad**: Damos la bienvenida a contribuidores de todos los orígenes.
- **Profesionalismo**: Acepta críticas constructivas y ofrécelas con amabilidad.

---

## Empezando

1.  **Fork** el repositorio en GitHub.
2.  **Clona** tu fork localmente:
    ```bash
    git clone https://github.com/TU-USUARIO/CnCApp.git
    ```
3.  **Configura** el entorno de desarrollo siguiendo la [Guía de Desarrollo](DEVELOPMENT.md).
4.  **Crea una rama** para tu trabajo basada en `main` (o `develop` si existe).

---

## Flujo de Trabajo Git

Utilizamos una variante simplificada de Gitflow.

### Ramas Principales
- `main`: Código de producción estable. No hacer commits directos aquí.

### Convención de Nombres de Rama

Usa el formato: `tipo/descripción-breve`

- `feat/nueva-funcionalidad`: Para nuevas características.
- `fix/descripcion-bug`: Para corrección de errores.
- `docs/actualizar-readme`: Para cambios en documentación.
- `refactor/limpieza-codigo`: Para mejoras de código sin cambios funcionales.
- `test/nuevos-tests`: Para agregar pruebas.

**Ejemplo**: `feat/registro-usuarios-backend`

### Mensajes de Commit

Seguimos la especificación **[Conventional Commits](https://www.conventionalcommits.org/)**.

Formato: `<tipo>(<alcance>): <descripción>`

Tipos permitidos:
- `feat`: Nueva característica.
- `fix`: Corrección de bug.
- `docs`: Documentación.
- `style`: Formato (espacios, comas, etc).
- `refactor`: Refactorización de código.
- `test`: Añadir o corregir tests.
- `chore`: Tareas de build, dependencias, etc.

**Ejemplo**:
```
feat(auth): implementar login con JWT y refresh token
```

---

## Estándares de Código

### General
- Todo el código debe estar escrito en **English** (variables, funciones, comentarios de código) o **Español** (textos de UI, documentación), pero sé consistente. *Nota: Este proyecto usa mezcla actualmente, favor priorizar nombres en inglés para código nuevo backend.*
- Elimina `console.log` antes de hacer commit.
- Usa `const` por defecto, `let` solo si es necesario. Nunca `var`.

### Backend (Node.js/TypeScript)
- Sigue los principios de **Clean Architecture**.
- Usa **Inyección de Dependencias**.
- Prefiere `async/await` sobre Promesas puras.
- Define tipos explícitos para retornos de funciones y parámetros.

### Frontend (Angular/Ionic)
- Usa **Standalone Components**.
- Evita lógica compleja en los templates HTML.
- Usa **Signals** para gestión de estado reactivo.
- Componentes pequeños y reutilizables.
- Toda suscripción a Observable debe ser desuscrita (o usar `async pipe` / `takeUntilDestroyed`).

### Linting y Formato
Corre los scripts de linting antes de subir cambios:

```bash
# Backend
npm run lint --prefix backend

# Frontend
npm run lint --prefix frontend
```

---

## Proceso de Pull Request

1.  Asegúrate de que tu código compila y pasa todos los tests.
2.  Actualiza la documentación si hiciste cambios en API o configuración.
3.  Haz Push de tu rama a tu fork.
4.  Abre un Pull Request (PR) hacia `main`.
5.  **Descripción del PR**:
    - Describe claramente qué cambios hiciste.
    - Vincula issues relacionados (ej: `Closes #123`).
    - Adjunta screenshots si hubo cambios visuales.
6.  Espera la revisión de código.
7.  Realiza los cambios solicitados si es necesario.

---

## Reporte de Bugs

Si encuentras un error, por favor abre un Issue incluyendo:
1.  **Título descriptivo**.
2.  **Pasos para reproducir** el error.
3.  **Comportamiento esperado** vs **Comportamiento real**.
4.  Screenshots o logs de error.
5.  Información del entorno (OS, Navegador, Versión).

---

<div align="center">

**[Volver al Inicio](../README.md)**

</div>
