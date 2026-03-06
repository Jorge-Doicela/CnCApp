/*
  Warnings:

  - You are about to drop the column `nacionalidad` on the `Usuario` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Instituciones_usuario" ADD COLUMN     "Id_Grado_Ocupacional" INTEGER;

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "nacionalidad",
ADD COLUMN     "Id_Nacionalidad" INTEGER;

-- CreateTable
CREATE TABLE "grados_ocupacionales" (
    "Id_Grado_Ocupacional" SERIAL NOT NULL,
    "Nombre_Grado" VARCHAR(200) NOT NULL,

    CONSTRAINT "grados_ocupacionales_pkey" PRIMARY KEY ("Id_Grado_Ocupacional")
);

-- CreateTable
CREATE TABLE "Nacionalidades" (
    "Id_Nacionalidad" SERIAL NOT NULL,
    "Nombre_Nacionalidad" VARCHAR(100) NOT NULL,

    CONSTRAINT "Nacionalidades_pkey" PRIMARY KEY ("Id_Nacionalidad")
);

-- CreateTable
CREATE TABLE "_FuncionarioCompetencias" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "grados_ocupacionales_Nombre_Grado_key" ON "grados_ocupacionales"("Nombre_Grado");

-- CreateIndex
CREATE UNIQUE INDEX "Nacionalidades_Nombre_Nacionalidad_key" ON "Nacionalidades"("Nombre_Nacionalidad");

-- CreateIndex
CREATE UNIQUE INDEX "_FuncionarioCompetencias_AB_unique" ON "_FuncionarioCompetencias"("A", "B");

-- CreateIndex
CREATE INDEX "_FuncionarioCompetencias_B_index" ON "_FuncionarioCompetencias"("B");

-- CreateIndex
CREATE INDEX "Usuario_Id_Nacionalidad_idx" ON "Usuario"("Id_Nacionalidad");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_Id_Nacionalidad_fkey" FOREIGN KEY ("Id_Nacionalidad") REFERENCES "Nacionalidades"("Id_Nacionalidad") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instituciones_usuario" ADD CONSTRAINT "Instituciones_usuario_Id_Grado_Ocupacional_fkey" FOREIGN KEY ("Id_Grado_Ocupacional") REFERENCES "grados_ocupacionales"("Id_Grado_Ocupacional") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FuncionarioCompetencias" ADD CONSTRAINT "_FuncionarioCompetencias_A_fkey" FOREIGN KEY ("A") REFERENCES "competencias"("id_competencias") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FuncionarioCompetencias" ADD CONSTRAINT "_FuncionarioCompetencias_B_fkey" FOREIGN KEY ("B") REFERENCES "FuncionarioGAD"("Id_Funcionario") ON DELETE CASCADE ON UPDATE CASCADE;
