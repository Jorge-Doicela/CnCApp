/*
  Warnings:

  - You are about to drop the column `etnia` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `genero` on the `Usuario` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "etnia",
DROP COLUMN "genero",
ADD COLUMN     "Id_Etnia" INTEGER,
ADD COLUMN     "Id_Genero" INTEGER;

-- CreateTable
CREATE TABLE "Generos" (
    "Id_Genero" SERIAL NOT NULL,
    "Nombre_Genero" VARCHAR(50) NOT NULL,

    CONSTRAINT "Generos_pkey" PRIMARY KEY ("Id_Genero")
);

-- CreateTable
CREATE TABLE "Etnias" (
    "Id_Etnia" SERIAL NOT NULL,
    "Nombre_Etnia" VARCHAR(50) NOT NULL,

    CONSTRAINT "Etnias_pkey" PRIMARY KEY ("Id_Etnia")
);

-- CreateIndex
CREATE UNIQUE INDEX "Generos_Nombre_Genero_key" ON "Generos"("Nombre_Genero");

-- CreateIndex
CREATE UNIQUE INDEX "Etnias_Nombre_Etnia_key" ON "Etnias"("Nombre_Etnia");

-- CreateIndex
CREATE INDEX "Usuario_Id_Genero_idx" ON "Usuario"("Id_Genero");

-- CreateIndex
CREATE INDEX "Usuario_Id_Etnia_idx" ON "Usuario"("Id_Etnia");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_Id_Genero_fkey" FOREIGN KEY ("Id_Genero") REFERENCES "Generos"("Id_Genero") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_Id_Etnia_fkey" FOREIGN KEY ("Id_Etnia") REFERENCES "Etnias"("Id_Etnia") ON DELETE SET NULL ON UPDATE CASCADE;
