/*
  Warnings:

  - The primary key for the `cargos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Id_Cargo` on the `cargos` table. All the data in the column will be lost.
  - You are about to drop the column `Nombre_Cargo` on the `cargos` table. All the data in the column will be lost.
  - The primary key for the `competencias` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `estado_competencia` on the `competencias` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_ultima_actualizacion` on the `competencias` table. All the data in the column will be lost.
  - You are about to drop the column `id_competencias` on the `competencias` table. All the data in the column will be lost.
  - You are about to drop the column `nombre_competencias` on the `competencias` table. All the data in the column will be lost.
  - The primary key for the `grados_ocupacionales` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Id_Grado_Ocupacional` on the `grados_ocupacionales` table. All the data in the column will be lost.
  - You are about to drop the column `Nombre_Grado` on the `grados_ocupacionales` table. All the data in the column will be lost.
  - The primary key for the `instituciones_sistema` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Id_Institucion` on the `instituciones_sistema` table. All the data in the column will be lost.
  - You are about to drop the column `Nombre_Institucion` on the `instituciones_sistema` table. All the data in the column will be lost.
  - You are about to drop the column `Tipo_Institucion` on the `instituciones_sistema` table. All the data in the column will be lost.
  - The primary key for the `mancomunidades` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Id_Mancomunidad` on the `mancomunidades` table. All the data in the column will be lost.
  - You are about to drop the column `Nombre_Mancomunidad` on the `mancomunidades` table. All the data in the column will be lost.
  - You are about to drop the `Autoridades` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Cantones` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Capacitaciones` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Certificados` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Entidades` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Etnias` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FuncionarioGAD` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Generos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Instituciones_usuario` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Nacionalidades` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Plantillas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Provincias` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Rol` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TiposParticipante` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Usuario` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Usuarios_Capacitaciones` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `parroquia` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[nombre]` on the table `cargos` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nombre]` on the table `competencias` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nombre]` on the table `grados_ocupacionales` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nombre]` on the table `instituciones_sistema` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nombre` to the `cargos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `competencias` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `grados_ocupacionales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `instituciones_sistema` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `mancomunidades` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Autoridades" DROP CONSTRAINT IF EXISTS "Autoridades_Id_Usuario_fkey";

-- DropForeignKey
ALTER TABLE "Cantones" DROP CONSTRAINT IF EXISTS "Cantones_Id_Provincia_fkey";

-- DropForeignKey
ALTER TABLE "Capacitaciones" DROP CONSTRAINT IF EXISTS "Capacitaciones_Id_Plantilla_fkey";

-- DropForeignKey
ALTER TABLE "Certificados" DROP CONSTRAINT IF EXISTS "Certificados_Id_Capacitacion_fkey";

-- DropForeignKey
ALTER TABLE "Certificados" DROP CONSTRAINT IF EXISTS "Certificados_Id_Usuario_fkey";

-- DropForeignKey
ALTER TABLE "FuncionarioGAD" DROP CONSTRAINT IF EXISTS "FuncionarioGAD_Id_Usuario_fkey";

-- DropForeignKey
ALTER TABLE "Instituciones_usuario" DROP CONSTRAINT IF EXISTS "Instituciones_usuario_Id_Grado_Ocupacional_fkey";

-- DropForeignKey
ALTER TABLE "Instituciones_usuario" DROP CONSTRAINT IF EXISTS "Instituciones_usuario_Id_Institucion_fkey";

-- DropForeignKey
ALTER TABLE "Instituciones_usuario" DROP CONSTRAINT IF EXISTS "Instituciones_usuario_Id_Usuario_fkey";

-- DropForeignKey
ALTER TABLE "Usuario" DROP CONSTRAINT IF EXISTS "Usuario_Entidad_Usuario_fkey";

-- DropForeignKey
ALTER TABLE "Usuario" DROP CONSTRAINT IF EXISTS "Usuario_Id_Canton_fkey";

-- DropForeignKey
ALTER TABLE "Usuario" DROP CONSTRAINT IF EXISTS "Usuario_Id_Etnia_fkey";

-- DropForeignKey
ALTER TABLE "Usuario" DROP CONSTRAINT IF EXISTS "Usuario_Id_Genero_fkey";

-- DropForeignKey
ALTER TABLE "Usuario" DROP CONSTRAINT IF EXISTS "Usuario_Id_Nacionalidad_fkey";

-- DropForeignKey
ALTER TABLE "Usuario" DROP CONSTRAINT IF EXISTS "Usuario_Id_Provincia_fkey";

-- DropForeignKey
ALTER TABLE "Usuario" DROP CONSTRAINT IF EXISTS "Usuario_Id_Tipo_Participante_fkey";

-- DropForeignKey
ALTER TABLE "Usuario" DROP CONSTRAINT IF EXISTS "Usuario_Rol_Usuario_fkey";

-- DropForeignKey
ALTER TABLE "Usuarios_Capacitaciones" DROP CONSTRAINT IF EXISTS "Usuarios_Capacitaciones_Id_Capacitacion_fkey";

-- DropForeignKey
ALTER TABLE "Usuarios_Capacitaciones" DROP CONSTRAINT IF EXISTS "Usuarios_Capacitaciones_Id_Usuario_fkey";

-- DropForeignKey
ALTER TABLE "_FuncionarioCompetencias" DROP CONSTRAINT IF EXISTS "_FuncionarioCompetencias_A_fkey";

-- DropForeignKey
ALTER TABLE "_FuncionarioCompetencias" DROP CONSTRAINT IF EXISTS "_FuncionarioCompetencias_B_fkey";

-- DropForeignKey
ALTER TABLE "parroquia" DROP CONSTRAINT IF EXISTS "parroquia_Id_Canton_fkey";

-- DropIndex
DROP INDEX IF EXISTS "cargos_Nombre_Cargo_key";

-- DropIndex
DROP INDEX IF EXISTS "competencias_nombre_competencias_key";

-- DropIndex
DROP INDEX IF EXISTS "grados_ocupacionales_Nombre_Grado_key";

-- DropIndex
DROP INDEX IF EXISTS "instituciones_sistema_Nombre_Institucion_key";

-- AlterTable
ALTER TABLE "cargos" DROP CONSTRAINT IF EXISTS "cargos_pkey",
DROP COLUMN IF EXISTS "Id_Cargo",
DROP COLUMN IF EXISTS "Nombre_Cargo",
ADD COLUMN     "id_cargo" SERIAL NOT NULL,
ADD COLUMN     "nombre" VARCHAR(200) NOT NULL,
ADD CONSTRAINT "cargos_pkey" PRIMARY KEY ("id_cargo");

-- AlterTable
ALTER TABLE "competencias" DROP CONSTRAINT IF EXISTS "competencias_pkey",
DROP COLUMN IF EXISTS "estado_competencia",
DROP COLUMN IF EXISTS "fecha_ultima_actualizacion",
DROP COLUMN IF EXISTS "id_competencias",
DROP COLUMN IF EXISTS "nombre_competencias",
ADD COLUMN     "estado" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "id_competencia" SERIAL NOT NULL,
ADD COLUMN     "nombre" VARCHAR(200) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD CONSTRAINT "competencias_pkey" PRIMARY KEY ("id_competencia");

-- AlterTable
ALTER TABLE "grados_ocupacionales" DROP CONSTRAINT IF EXISTS "grados_ocupacionales_pkey",
DROP COLUMN IF EXISTS "Id_Grado_Ocupacional",
DROP COLUMN IF EXISTS "Nombre_Grado",
ADD COLUMN     "id_grado_ocupacional" SERIAL NOT NULL,
ADD COLUMN     "nombre" VARCHAR(200) NOT NULL,
ADD CONSTRAINT "grados_ocupacionales_pkey" PRIMARY KEY ("id_grado_ocupacional");

-- AlterTable
ALTER TABLE "instituciones_sistema" DROP CONSTRAINT IF EXISTS "instituciones_sistema_pkey",
DROP COLUMN IF EXISTS "Id_Institucion",
DROP COLUMN IF EXISTS "Nombre_Institucion",
DROP COLUMN IF EXISTS "Tipo_Institucion",
ADD COLUMN     "id_institucion" SERIAL NOT NULL,
ADD COLUMN     "nombre" VARCHAR(300) NOT NULL,
ADD COLUMN     "tipo" VARCHAR(100),
ADD CONSTRAINT "instituciones_sistema_pkey" PRIMARY KEY ("id_institucion");

-- AlterTable
ALTER TABLE "mancomunidades" DROP CONSTRAINT IF EXISTS "mancomunidades_pkey",
DROP COLUMN IF EXISTS "Id_Mancomunidad",
DROP COLUMN IF EXISTS "Nombre_Mancomunidad",
ADD COLUMN     "id_mancomunidad" SERIAL NOT NULL,
ADD COLUMN     "nombre" VARCHAR(300) NOT NULL,
ADD CONSTRAINT "mancomunidades_pkey" PRIMARY KEY ("id_mancomunidad");

-- DropTable
DROP TABLE IF EXISTS "Autoridades";

-- DropTable
DROP TABLE IF EXISTS "Cantones";

-- DropTable
DROP TABLE IF EXISTS "Capacitaciones";

-- DropTable
DROP TABLE IF EXISTS "Certificados";

-- DropTable
DROP TABLE IF EXISTS "Entidades";

-- DropTable
DROP TABLE IF EXISTS "Etnias";

-- DropTable
DROP TABLE IF EXISTS "FuncionarioGAD";

-- DropTable
DROP TABLE IF EXISTS "Generos";

-- DropTable
DROP TABLE IF EXISTS "Instituciones_usuario";

-- DropTable
DROP TABLE IF EXISTS "Nacionalidades";

-- DropTable
DROP TABLE IF EXISTS "Plantillas";

-- DropTable
DROP TABLE IF EXISTS "Provincias";

-- DropTable
DROP TABLE IF EXISTS "Rol";

-- DropTable
DROP TABLE IF EXISTS "TiposParticipante";

-- DropTable
DROP TABLE IF EXISTS "Usuario";

-- DropTable
DROP TABLE IF EXISTS "Usuarios_Capacitaciones";

-- DropTable
DROP TABLE IF EXISTS "parroquia";

-- CreateTable
CREATE TABLE "roles" (
    "id_rol" SERIAL NOT NULL,
    "nombre_rol" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "modulos" JSONB DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id_rol")
);

-- CreateTable
CREATE TABLE "entidades" (
    "id_entidad" SERIAL NOT NULL,
    "nombre_entidad" VARCHAR(200) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entidades_pkey" PRIMARY KEY ("id_entidad")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id_usuario" SERIAL NOT NULL,
    "auth_uid" TEXT,
    "nombre_usuario" VARCHAR(200) NOT NULL,
    "ci_usuario" VARCHAR(20) NOT NULL,
    "email_usuario" VARCHAR(200),
    "telefono_usuario" VARCHAR(20),
    "password" VARCHAR(255) NOT NULL,
    "rol_usuario" INTEGER,
    "entidad_usuario" INTEGER,
    "id_tipo_participante" INTEGER,
    "foto_perfil_url" TEXT,
    "firma_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "primer_nombre" VARCHAR(100),
    "segundo_nombre" VARCHAR(100),
    "primer_apellido" VARCHAR(100),
    "segundo_apellido" VARCHAR(100),
    "id_genero" INTEGER,
    "id_etnia" INTEGER,
    "id_nacionalidad" INTEGER,
    "fecha_nacimiento" DATE,
    "celular" VARCHAR(20),
    "id_provincia" INTEGER,
    "id_canton" INTEGER,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "provincias" (
    "id_provincia" SERIAL NOT NULL,
    "nombre_provincia" VARCHAR(100) NOT NULL,

    CONSTRAINT "provincias_pkey" PRIMARY KEY ("id_provincia")
);

-- CreateTable
CREATE TABLE "cantones" (
    "id_canton" SERIAL NOT NULL,
    "nombre_canton" VARCHAR(100) NOT NULL,
    "id_provincia" INTEGER NOT NULL,

    CONSTRAINT "cantones_pkey" PRIMARY KEY ("id_canton")
);

-- CreateTable
CREATE TABLE "parroquias" (
    "id_parroquia" SERIAL NOT NULL,
    "nombre_parroquia" VARCHAR(100) NOT NULL,
    "id_canton" INTEGER NOT NULL,

    CONSTRAINT "parroquias_pkey" PRIMARY KEY ("id_parroquia")
);

-- CreateTable
CREATE TABLE "capacitaciones" (
    "id_capacitacion" SERIAL NOT NULL,
    "tipo_evento" VARCHAR(100),
    "nombre_capacitacion" VARCHAR(300) NOT NULL,
    "descripcion" TEXT,
    "fecha_inicio" DATE,
    "fecha_fin" DATE,
    "lugar" VARCHAR(200),
    "cupos_disponibles" INTEGER NOT NULL DEFAULT 0,
    "modalidad" VARCHAR(50),
    "estado" VARCHAR(50) NOT NULL DEFAULT 'Activa',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_plantilla" INTEGER,
    "hora_inicio" VARCHAR(50),
    "hora_fin" VARCHAR(50),
    "horas" INTEGER,
    "enlace_virtual" VARCHAR(500),
    "certificado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "capacitaciones_pkey" PRIMARY KEY ("id_capacitacion")
);

-- CreateTable
CREATE TABLE "usuarios_capacitaciones" (
    "id_inscripcion" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_capacitacion" INTEGER NOT NULL,
    "fecha_inscripcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado_inscripcion" VARCHAR(50) NOT NULL DEFAULT 'Activa',
    "asistio" BOOLEAN NOT NULL DEFAULT false,
    "rol_capacitacion" VARCHAR(50) NOT NULL DEFAULT 'Participante',

    CONSTRAINT "usuarios_capacitaciones_pkey" PRIMARY KEY ("id_inscripcion")
);

-- CreateTable
CREATE TABLE "certificados" (
    "id_certificado" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_capacitacion" INTEGER NOT NULL,
    "codigo_qr" TEXT NOT NULL,
    "fecha_emision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pdf_url" TEXT,

    CONSTRAINT "certificados_pkey" PRIMARY KEY ("id_certificado")
);

-- CreateTable
CREATE TABLE "autoridades" (
    "id_autoridad" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "cargo" VARCHAR(200),
    "entidad" VARCHAR(200),

    CONSTRAINT "autoridades_pkey" PRIMARY KEY ("id_autoridad")
);

-- CreateTable
CREATE TABLE "funcionarios_gad" (
    "id_funcionario" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "cargo" VARCHAR(200),
    "departamento" VARCHAR(200),

    CONSTRAINT "funcionarios_gad_pkey" PRIMARY KEY ("id_funcionario")
);

-- CreateTable
CREATE TABLE "instituciones_usuario" (
    "id" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_institucion" INTEGER NOT NULL,
    "id_grado_ocupacional" INTEGER,

    CONSTRAINT "instituciones_usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plantillas" (
    "id_plantilla" SERIAL NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "imagen_url" TEXT,
    "configuracion" JSONB DEFAULT '{}',
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plantillas_pkey" PRIMARY KEY ("id_plantilla")
);

-- CreateTable
CREATE TABLE "generos" (
    "id_genero" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "generos_pkey" PRIMARY KEY ("id_genero")
);

-- CreateTable
CREATE TABLE "etnias" (
    "id_etnia" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "etnias_pkey" PRIMARY KEY ("id_etnia")
);

-- CreateTable
CREATE TABLE "tipos_participante" (
    "id_tipo_participante" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,

    CONSTRAINT "tipos_participante_pkey" PRIMARY KEY ("id_tipo_participante")
);

-- CreateTable
CREATE TABLE "nacionalidades" (
    "id_nacionalidad" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,

    CONSTRAINT "nacionalidades_pkey" PRIMARY KEY ("id_nacionalidad")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_rol_key" ON "roles"("nombre_rol");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_auth_uid_key" ON "usuarios"("auth_uid");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_ci_usuario_key" ON "usuarios"("ci_usuario");

-- CreateIndex
CREATE INDEX "usuarios_auth_uid_idx" ON "usuarios"("auth_uid");

-- CreateIndex
CREATE INDEX "usuarios_ci_usuario_idx" ON "usuarios"("ci_usuario");

-- CreateIndex
CREATE INDEX "usuarios_created_at_idx" ON "usuarios"("created_at");

-- CreateIndex
CREATE INDEX "usuarios_rol_usuario_idx" ON "usuarios"("rol_usuario");

-- CreateIndex
CREATE INDEX "usuarios_entidad_usuario_idx" ON "usuarios"("entidad_usuario");

-- CreateIndex
CREATE INDEX "usuarios_id_provincia_idx" ON "usuarios"("id_provincia");

-- CreateIndex
CREATE INDEX "usuarios_id_canton_idx" ON "usuarios"("id_canton");

-- CreateIndex
CREATE INDEX "usuarios_id_genero_idx" ON "usuarios"("id_genero");

-- CreateIndex
CREATE INDEX "usuarios_id_etnia_idx" ON "usuarios"("id_etnia");

-- CreateIndex
CREATE INDEX "usuarios_id_nacionalidad_idx" ON "usuarios"("id_nacionalidad");

-- CreateIndex
CREATE INDEX "usuarios_id_tipo_participante_idx" ON "usuarios"("id_tipo_participante");

-- CreateIndex
CREATE UNIQUE INDEX "provincias_nombre_provincia_key" ON "provincias"("nombre_provincia");

-- CreateIndex
CREATE INDEX "capacitaciones_estado_idx" ON "capacitaciones"("estado");

-- CreateIndex
CREATE INDEX "capacitaciones_fecha_inicio_idx" ON "capacitaciones"("fecha_inicio");

-- CreateIndex
CREATE INDEX "capacitaciones_fecha_fin_idx" ON "capacitaciones"("fecha_fin");

-- CreateIndex
CREATE INDEX "capacitaciones_created_at_idx" ON "capacitaciones"("created_at");

-- CreateIndex
CREATE INDEX "usuarios_capacitaciones_id_usuario_idx" ON "usuarios_capacitaciones"("id_usuario");

-- CreateIndex
CREATE INDEX "usuarios_capacitaciones_id_capacitacion_idx" ON "usuarios_capacitaciones"("id_capacitacion");

-- CreateIndex
CREATE INDEX "usuarios_capacitaciones_asistio_idx" ON "usuarios_capacitaciones"("asistio");

-- CreateIndex
CREATE INDEX "usuarios_capacitaciones_estado_inscripcion_idx" ON "usuarios_capacitaciones"("estado_inscripcion");

-- CreateIndex
CREATE INDEX "usuarios_capacitaciones_fecha_inscripcion_idx" ON "usuarios_capacitaciones"("fecha_inscripcion");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_capacitaciones_id_usuario_id_capacitacion_key" ON "usuarios_capacitaciones"("id_usuario", "id_capacitacion");

-- CreateIndex
CREATE UNIQUE INDEX "certificados_codigo_qr_key" ON "certificados"("codigo_qr");

-- CreateIndex
CREATE INDEX "certificados_codigo_qr_idx" ON "certificados"("codigo_qr");

-- CreateIndex
CREATE INDEX "certificados_fecha_emision_idx" ON "certificados"("fecha_emision");

-- CreateIndex
CREATE INDEX "certificados_id_usuario_idx" ON "certificados"("id_usuario");

-- CreateIndex
CREATE INDEX "certificados_id_capacitacion_idx" ON "certificados"("id_capacitacion");

-- CreateIndex
CREATE UNIQUE INDEX "generos_nombre_key" ON "generos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "etnias_nombre_key" ON "etnias"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_participante_nombre_key" ON "tipos_participante"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "nacionalidades_nombre_key" ON "nacionalidades"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "cargos_nombre_key" ON "cargos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "competencias_nombre_key" ON "competencias"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "grados_ocupacionales_nombre_key" ON "grados_ocupacionales"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "instituciones_sistema_nombre_key" ON "instituciones_sistema"("nombre");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_entidad_usuario_fkey" FOREIGN KEY ("entidad_usuario") REFERENCES "entidades"("id_entidad") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_canton_fkey" FOREIGN KEY ("id_canton") REFERENCES "cantones"("id_canton") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_provincia_fkey" FOREIGN KEY ("id_provincia") REFERENCES "provincias"("id_provincia") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_rol_usuario_fkey" FOREIGN KEY ("rol_usuario") REFERENCES "roles"("id_rol") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_genero_fkey" FOREIGN KEY ("id_genero") REFERENCES "generos"("id_genero") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_etnia_fkey" FOREIGN KEY ("id_etnia") REFERENCES "etnias"("id_etnia") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_nacionalidad_fkey" FOREIGN KEY ("id_nacionalidad") REFERENCES "nacionalidades"("id_nacionalidad") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_tipo_participante_fkey" FOREIGN KEY ("id_tipo_participante") REFERENCES "tipos_participante"("id_tipo_participante") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cantones" ADD CONSTRAINT "cantones_id_provincia_fkey" FOREIGN KEY ("id_provincia") REFERENCES "provincias"("id_provincia") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parroquias" ADD CONSTRAINT "parroquias_id_canton_fkey" FOREIGN KEY ("id_canton") REFERENCES "cantones"("id_canton") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capacitaciones" ADD CONSTRAINT "capacitaciones_id_plantilla_fkey" FOREIGN KEY ("id_plantilla") REFERENCES "plantillas"("id_plantilla") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_capacitaciones" ADD CONSTRAINT "usuarios_capacitaciones_id_capacitacion_fkey" FOREIGN KEY ("id_capacitacion") REFERENCES "capacitaciones"("id_capacitacion") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_capacitaciones" ADD CONSTRAINT "usuarios_capacitaciones_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificados" ADD CONSTRAINT "certificados_id_capacitacion_fkey" FOREIGN KEY ("id_capacitacion") REFERENCES "capacitaciones"("id_capacitacion") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificados" ADD CONSTRAINT "certificados_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "autoridades" ADD CONSTRAINT "autoridades_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funcionarios_gad" ADD CONSTRAINT "funcionarios_gad_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instituciones_usuario" ADD CONSTRAINT "instituciones_usuario_id_institucion_fkey" FOREIGN KEY ("id_institucion") REFERENCES "instituciones_sistema"("id_institucion") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instituciones_usuario" ADD CONSTRAINT "instituciones_usuario_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instituciones_usuario" ADD CONSTRAINT "instituciones_usuario_id_grado_ocupacional_fkey" FOREIGN KEY ("id_grado_ocupacional") REFERENCES "grados_ocupacionales"("id_grado_ocupacional") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FuncionarioCompetencias" ADD CONSTRAINT "_FuncionarioCompetencias_A_fkey" FOREIGN KEY ("A") REFERENCES "competencias"("id_competencia") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FuncionarioCompetencias" ADD CONSTRAINT "_FuncionarioCompetencias_B_fkey" FOREIGN KEY ("B") REFERENCES "funcionarios_gad"("id_funcionario") ON DELETE CASCADE ON UPDATE CASCADE;
