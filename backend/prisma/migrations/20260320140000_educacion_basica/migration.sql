-- Catálogo educación básica (75 filas; nombres pueden repetirse)
CREATE TABLE "educacion_basica" (
    "id_educacion_basica" SERIAL NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    CONSTRAINT "educacion_basica_pkey" PRIMARY KEY ("id_educacion_basica")
);

-- Institución del sistema O fila de educacion_basica (exactamente una debe estar presente en la app)
ALTER TABLE "instituciones_usuario" ALTER COLUMN "id_institucion" DROP NOT NULL;

ALTER TABLE "instituciones_usuario" ADD COLUMN "id_educacion_basica" INTEGER;

CREATE INDEX "instituciones_usuario_id_educacion_basica_idx" ON "instituciones_usuario"("id_educacion_basica");

ALTER TABLE "instituciones_usuario" ADD CONSTRAINT "instituciones_usuario_id_educacion_basica_fkey" FOREIGN KEY ("id_educacion_basica") REFERENCES "educacion_basica"("id_educacion_basica") ON DELETE CASCADE ON UPDATE CASCADE;
