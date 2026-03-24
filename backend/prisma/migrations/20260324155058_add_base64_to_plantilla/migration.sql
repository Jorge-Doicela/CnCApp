/*
  Warnings:

  - Made the column `estado` on table `cantones` required. This step will fail if there are existing NULL values in that column.
  - Made the column `estado` on table `parroquias` required. This step will fail if there are existing NULL values in that column.
  - Made the column `estado` on table `provincias` required. This step will fail if there are existing NULL values in that column.
  - Made the column `estado` on table `roles` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "certificados_codigo_qr_idx";

-- DropIndex
DROP INDEX "usuarios_auth_uid_idx";

-- DropIndex
DROP INDEX "usuarios_ci_usuario_idx";

-- AlterTable
ALTER TABLE "cantones" ALTER COLUMN "estado" SET NOT NULL;

-- AlterTable
ALTER TABLE "capacitaciones" ADD COLUMN     "latitud" DOUBLE PRECISION,
ADD COLUMN     "longitud" DOUBLE PRECISION,
ALTER COLUMN "horas" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "instituciones_sistema" ADD COLUMN     "id_tipo_institucion" INTEGER;

-- AlterTable
ALTER TABLE "parroquias" ALTER COLUMN "estado" SET NOT NULL;

-- AlterTable
ALTER TABLE "plantillas" ADD COLUMN     "base64_imagen" TEXT;

-- AlterTable
ALTER TABLE "provincias" ALTER COLUMN "estado" SET NOT NULL;

-- AlterTable
ALTER TABLE "roles" ALTER COLUMN "estado" SET NOT NULL;

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "id_tipo_institucion" INTEGER;

-- CreateTable
CREATE TABLE "tipo_institucion" (
    "id_tipo_institucion" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,

    CONSTRAINT "tipo_institucion_pkey" PRIMARY KEY ("id_tipo_institucion")
);

-- CreateTable
CREATE TABLE "regimen_especial" (
    "id_regimen_especial" SERIAL NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,

    CONSTRAINT "regimen_especial_pkey" PRIMARY KEY ("id_regimen_especial")
);

-- CreateTable
CREATE TABLE "_CapacitacionEntidades" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "tipo_institucion_nombre_key" ON "tipo_institucion"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "regimen_especial_nombre_key" ON "regimen_especial"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "_CapacitacionEntidades_AB_unique" ON "_CapacitacionEntidades"("A", "B");

-- CreateIndex
CREATE INDEX "_CapacitacionEntidades_B_index" ON "_CapacitacionEntidades"("B");

-- CreateIndex
CREATE INDEX "usuarios_id_tipo_institucion_idx" ON "usuarios"("id_tipo_institucion");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_tipo_institucion_fkey" FOREIGN KEY ("id_tipo_institucion") REFERENCES "tipo_institucion"("id_tipo_institucion") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instituciones_sistema" ADD CONSTRAINT "instituciones_sistema_id_tipo_institucion_fkey" FOREIGN KEY ("id_tipo_institucion") REFERENCES "tipo_institucion"("id_tipo_institucion") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CapacitacionEntidades" ADD CONSTRAINT "_CapacitacionEntidades_A_fkey" FOREIGN KEY ("A") REFERENCES "capacitaciones"("id_capacitacion") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CapacitacionEntidades" ADD CONSTRAINT "_CapacitacionEntidades_B_fkey" FOREIGN KEY ("B") REFERENCES "entidades"("id_entidad") ON DELETE CASCADE ON UPDATE CASCADE;
