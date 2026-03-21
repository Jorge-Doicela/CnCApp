# Catálogo `gad_parroquias` (824)

- **`gad-parroquias.json`**: lista de nombres generada desde el SQL oficial.
- **Regenerar** (tras editar el SQL de tuplas `('NOMBRE'),`):

```bash
cd backend
Get-Content prisma/data/gad-parroquias-source.part1.sql -Raw | node prisma/tools/parse-gad-parroquias-sql.mjs
```

Luego ejecutar `npm run prisma:seed` (o migración + seed parcial) para volver a cargar la tabla.
