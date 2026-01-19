/*
  Warnings:

  - You are about to drop the column `Cargo` on the `Autoridades` table. All the data in the column will be lost.
  - You are about to drop the column `Entidad` on the `Autoridades` table. All the data in the column will be lost.
  - You are about to drop the column `Descripcion` on the `Capacitaciones` table. All the data in the column will be lost.
  - You are about to drop the column `Estado` on the `Capacitaciones` table. All the data in the column will be lost.
  - You are about to drop the column `Lugar` on the `Capacitaciones` table. All the data in the column will be lost.
  - You are about to drop the column `Modalidad` on the `Capacitaciones` table. All the data in the column will be lost.
  - You are about to drop the column `Cargo` on the `FuncionarioGAD` table. All the data in the column will be lost.
  - You are about to drop the column `Departamento` on the `FuncionarioGAD` table. All the data in the column will be lost.
  - The primary key for the `Instituciones_usuario` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Id` on the `Instituciones_usuario` table. All the data in the column will be lost.
  - You are about to drop the column `Asistio` on the `Usuarios_Capacitaciones` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Autoridades" DROP COLUMN "Cargo",
DROP COLUMN "Entidad",
ADD COLUMN     "cargo" VARCHAR(200),
ADD COLUMN     "entidad" VARCHAR(200);

-- AlterTable
ALTER TABLE "Capacitaciones" DROP COLUMN "Descripcion",
DROP COLUMN "Estado",
DROP COLUMN "Lugar",
DROP COLUMN "Modalidad",
ADD COLUMN     "descripcion" TEXT,
ADD COLUMN     "estado" VARCHAR(50) NOT NULL DEFAULT 'Activa',
ADD COLUMN     "lugar" VARCHAR(200),
ADD COLUMN     "modalidad" VARCHAR(50);

-- AlterTable
ALTER TABLE "FuncionarioGAD" DROP COLUMN "Cargo",
DROP COLUMN "Departamento",
ADD COLUMN     "cargo" VARCHAR(200),
ADD COLUMN     "departamento" VARCHAR(200);

-- AlterTable
ALTER TABLE "Instituciones_usuario" DROP CONSTRAINT "Instituciones_usuario_pkey",
DROP COLUMN "Id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Instituciones_usuario_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Usuarios_Capacitaciones" DROP COLUMN "Asistio",
ADD COLUMN     "asistio" BOOLEAN NOT NULL DEFAULT false;
