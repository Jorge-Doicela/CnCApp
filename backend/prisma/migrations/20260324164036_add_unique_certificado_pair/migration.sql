/*
  Warnings:

  - A unique constraint covering the columns `[id_usuario,id_capacitacion]` on the table `certificados` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "certificados_id_usuario_id_capacitacion_key" ON "certificados"("id_usuario", "id_capacitacion");
