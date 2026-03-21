# Catálogo `educacion_basica` (75)

- **Fuente de nombres**: `form-options-educacion.ts` → `educacionBasicaList`.
- **Tabla**: `educacion_basica` (sin `UNIQUE` en `nombre`; puede haber duplicados, p. ej. LICEO NAVAL GALÁPAGOS).
- **Uso en usuarios**: fila en `instituciones_usuario` con `id_educacion_basica` y `id_institucion` nulo. El front envía `institucion.institucion` como `e:<id>`; el resto del catálogo sigue siendo `i:<id>` o un número (legacy).

Tras migrar y sembrar: `npm run prisma:seed` (o solo la función `seedEducacionBasica` desde `seed-reference-catalogs.ts`).
