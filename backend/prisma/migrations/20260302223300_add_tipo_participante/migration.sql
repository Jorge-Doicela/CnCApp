/*
  Warnings:

  - You are about to drop the column `tipo_participante` on the `Usuario` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "tipo_participante",
ADD COLUMN     "Id_Tipo_Participante" INTEGER;

-- CreateTable
CREATE TABLE "TiposParticipante" (
    "Id_TipoParticipante" SERIAL NOT NULL,
    "Nombre_TipoParticipante" VARCHAR(100) NOT NULL,

    CONSTRAINT "TiposParticipante_pkey" PRIMARY KEY ("Id_TipoParticipante")
);

-- CreateIndex
CREATE UNIQUE INDEX "TiposParticipante_Nombre_TipoParticipante_key" ON "TiposParticipante"("Nombre_TipoParticipante");

-- CreateIndex
CREATE INDEX "Usuario_Id_Tipo_Participante_idx" ON "Usuario"("Id_Tipo_Participante");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_Id_Tipo_Participante_fkey" FOREIGN KEY ("Id_Tipo_Participante") REFERENCES "TiposParticipante"("Id_TipoParticipante") ON DELETE SET NULL ON UPDATE CASCADE;
