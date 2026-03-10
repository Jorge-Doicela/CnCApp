/*
  Warnings:

  - A unique constraint covering the columns `[codigo]` on the table `entidades` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[codigo]` on the table `roles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[codigo]` on the table `tipos_participante` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "autoridades" ADD COLUMN     "nivel_gobierno" VARCHAR(50);

-- AlterTable
ALTER TABLE "entidades" ADD COLUMN     "codigo" VARCHAR(50);

-- AlterTable
ALTER TABLE "funcionarios_gad" ADD COLUMN     "nivel_gobierno" VARCHAR(50);

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "codigo" VARCHAR(50);

-- AlterTable
ALTER TABLE "tipos_participante" ADD COLUMN     "codigo" VARCHAR(50);

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "estado" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "id_parroquia" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "entidades_codigo_key" ON "entidades"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "roles_codigo_key" ON "roles"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_participante_codigo_key" ON "tipos_participante"("codigo");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_parroquia_fkey" FOREIGN KEY ("id_parroquia") REFERENCES "parroquias"("id_parroquia") ON DELETE SET NULL ON UPDATE CASCADE;
