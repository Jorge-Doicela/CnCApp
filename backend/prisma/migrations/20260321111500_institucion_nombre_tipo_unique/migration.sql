-- Drop old unique index/constraint on nombre only (if exists)
DROP INDEX IF EXISTS "instituciones_sistema_nombre_key";

-- Add composite unique to allow same nombre in different tipos
CREATE UNIQUE INDEX "instituciones_sistema_nombre_tipo_key"
ON "instituciones_sistema"("nombre", "tipo");
