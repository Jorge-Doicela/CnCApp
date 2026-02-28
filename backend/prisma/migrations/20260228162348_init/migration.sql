/*
  Warnings:

  - The primary key for the `competencias` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Id_Competencia` on the `competencias` table. All the data in the column will be lost.
  - You are about to drop the column `Nombre_Competencia` on the `competencias` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nombre_competencias]` on the table `competencias` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nombre_competencias` to the `competencias` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "competencias_Nombre_Competencia_key";

-- AlterTable
ALTER TABLE "Capacitaciones" ADD COLUMN     "Certificado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "Enlace_Virtual" VARCHAR(500),
ADD COLUMN     "Hora_Fin" VARCHAR(50),
ADD COLUMN     "Hora_Inicio" VARCHAR(50),
ADD COLUMN     "Horas" INTEGER;

-- AlterTable
ALTER TABLE "competencias" DROP CONSTRAINT "competencias_pkey",
DROP COLUMN "Id_Competencia",
DROP COLUMN "Nombre_Competencia",
ADD COLUMN     "descripcion" TEXT,
ADD COLUMN     "estado_competencia" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "fecha_ultima_actualizacion" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id_competencias" SERIAL NOT NULL,
ADD COLUMN     "nombre_competencias" VARCHAR(200) NOT NULL,
ADD CONSTRAINT "competencias_pkey" PRIMARY KEY ("id_competencias");

-- CreateIndex
CREATE INDEX "Capacitaciones_estado_idx" ON "Capacitaciones"("estado");

-- CreateIndex
CREATE INDEX "Capacitaciones_Fecha_Inicio_idx" ON "Capacitaciones"("Fecha_Inicio");

-- CreateIndex
CREATE INDEX "Capacitaciones_Fecha_Fin_idx" ON "Capacitaciones"("Fecha_Fin");

-- CreateIndex
CREATE INDEX "Capacitaciones_created_at_idx" ON "Capacitaciones"("created_at");

-- CreateIndex
CREATE INDEX "Certificados_Fecha_Emision_idx" ON "Certificados"("Fecha_Emision");

-- CreateIndex
CREATE INDEX "Certificados_Id_Usuario_idx" ON "Certificados"("Id_Usuario");

-- CreateIndex
CREATE INDEX "Certificados_Id_Capacitacion_idx" ON "Certificados"("Id_Capacitacion");

-- CreateIndex
CREATE INDEX "Usuario_created_at_idx" ON "Usuario"("created_at");

-- CreateIndex
CREATE INDEX "Usuario_Rol_Usuario_idx" ON "Usuario"("Rol_Usuario");

-- CreateIndex
CREATE INDEX "Usuario_Entidad_Usuario_idx" ON "Usuario"("Entidad_Usuario");

-- CreateIndex
CREATE INDEX "Usuario_Id_Provincia_idx" ON "Usuario"("Id_Provincia");

-- CreateIndex
CREATE INDEX "Usuario_Id_Canton_idx" ON "Usuario"("Id_Canton");

-- CreateIndex
CREATE INDEX "Usuarios_Capacitaciones_asistio_idx" ON "Usuarios_Capacitaciones"("asistio");

-- CreateIndex
CREATE INDEX "Usuarios_Capacitaciones_Estado_Inscripcion_idx" ON "Usuarios_Capacitaciones"("Estado_Inscripcion");

-- CreateIndex
CREATE INDEX "Usuarios_Capacitaciones_Fecha_Inscripcion_idx" ON "Usuarios_Capacitaciones"("Fecha_Inscripcion");

-- CreateIndex
CREATE UNIQUE INDEX "competencias_nombre_competencias_key" ON "competencias"("nombre_competencias");
