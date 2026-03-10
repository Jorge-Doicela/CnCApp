/*
  Warnings:

  - A unique constraint covering the columns `[codigo_qr_evento]` on the table `capacitaciones` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "capacitaciones" ADD COLUMN     "codigo_qr_evento" VARCHAR(100);

-- CreateIndex
CREATE UNIQUE INDEX "capacitaciones_codigo_qr_evento_key" ON "capacitaciones"("codigo_qr_evento");
