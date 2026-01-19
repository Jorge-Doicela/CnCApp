-- CreateTable
CREATE TABLE "Rol" (
    "Id_Rol" SERIAL NOT NULL,
    "nombre_rol" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "modulos" JSONB DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rol_pkey" PRIMARY KEY ("Id_Rol")
);

-- CreateTable
CREATE TABLE "Entidades" (
    "Id_Entidad" SERIAL NOT NULL,
    "Nombre_Entidad" VARCHAR(200) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Entidades_pkey" PRIMARY KEY ("Id_Entidad")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "Id_Usuario" SERIAL NOT NULL,
    "auth_uid" TEXT,
    "Nombre_Usuario" VARCHAR(200) NOT NULL,
    "CI_Usuario" VARCHAR(20) NOT NULL,
    "Email_Usuario" VARCHAR(200),
    "Telefono_Usuario" VARCHAR(20),
    "password" VARCHAR(255) NOT NULL,
    "Rol_Usuario" INTEGER,
    "Entidad_Usuario" INTEGER,
    "tipo_participante" INTEGER NOT NULL DEFAULT 0,
    "foto_perfil_url" TEXT,
    "firma_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("Id_Usuario")
);

-- CreateTable
CREATE TABLE "Provincias" (
    "Id_Provincia" SERIAL NOT NULL,
    "Nombre_Provincia" VARCHAR(100) NOT NULL,

    CONSTRAINT "Provincias_pkey" PRIMARY KEY ("Id_Provincia")
);

-- CreateTable
CREATE TABLE "Cantones" (
    "Id_Canton" SERIAL NOT NULL,
    "Nombre_Canton" VARCHAR(100) NOT NULL,
    "Id_Provincia" INTEGER NOT NULL,

    CONSTRAINT "Cantones_pkey" PRIMARY KEY ("Id_Canton")
);

-- CreateTable
CREATE TABLE "parroquia" (
    "Id_Parroquia" SERIAL NOT NULL,
    "Nombre_Parroquia" VARCHAR(100) NOT NULL,
    "Id_Canton" INTEGER NOT NULL,

    CONSTRAINT "parroquia_pkey" PRIMARY KEY ("Id_Parroquia")
);

-- CreateTable
CREATE TABLE "Capacitaciones" (
    "Id_Capacitacion" SERIAL NOT NULL,
    "Nombre_Capacitacion" VARCHAR(300) NOT NULL,
    "Descripcion" TEXT,
    "Fecha_Inicio" DATE,
    "Fecha_Fin" DATE,
    "Lugar" VARCHAR(200),
    "Cupos_Disponibles" INTEGER NOT NULL DEFAULT 0,
    "Modalidad" VARCHAR(50),
    "Estado" VARCHAR(50) NOT NULL DEFAULT 'Activa',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Capacitaciones_pkey" PRIMARY KEY ("Id_Capacitacion")
);

-- CreateTable
CREATE TABLE "Usuarios_Capacitaciones" (
    "Id_Inscripcion" SERIAL NOT NULL,
    "Id_Usuario" INTEGER NOT NULL,
    "Id_Capacitacion" INTEGER NOT NULL,
    "Fecha_Inscripcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Estado_Inscripcion" VARCHAR(50) NOT NULL DEFAULT 'Activa',
    "Asistio" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Usuarios_Capacitaciones_pkey" PRIMARY KEY ("Id_Inscripcion")
);

-- CreateTable
CREATE TABLE "Certificados" (
    "Id_Certificado" SERIAL NOT NULL,
    "Id_Usuario" INTEGER NOT NULL,
    "Id_Capacitacion" INTEGER NOT NULL,
    "Codigo_QR" TEXT NOT NULL,
    "Fecha_Emision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "PDF_URL" TEXT,

    CONSTRAINT "Certificados_pkey" PRIMARY KEY ("Id_Certificado")
);

-- CreateTable
CREATE TABLE "competencias" (
    "Id_Competencia" SERIAL NOT NULL,
    "Nombre_Competencia" VARCHAR(200) NOT NULL,

    CONSTRAINT "competencias_pkey" PRIMARY KEY ("Id_Competencia")
);

-- CreateTable
CREATE TABLE "instituciones_sistema" (
    "Id_Institucion" SERIAL NOT NULL,
    "Nombre_Institucion" VARCHAR(300) NOT NULL,
    "Tipo_Institucion" VARCHAR(100),

    CONSTRAINT "instituciones_sistema_pkey" PRIMARY KEY ("Id_Institucion")
);

-- CreateTable
CREATE TABLE "cargos" (
    "Id_Cargo" SERIAL NOT NULL,
    "Nombre_Cargo" VARCHAR(200) NOT NULL,

    CONSTRAINT "cargos_pkey" PRIMARY KEY ("Id_Cargo")
);

-- CreateTable
CREATE TABLE "Autoridades" (
    "Id_Autoridad" SERIAL NOT NULL,
    "Id_Usuario" INTEGER NOT NULL,
    "Cargo" VARCHAR(200),
    "Entidad" VARCHAR(200),

    CONSTRAINT "Autoridades_pkey" PRIMARY KEY ("Id_Autoridad")
);

-- CreateTable
CREATE TABLE "FuncionarioGAD" (
    "Id_Funcionario" SERIAL NOT NULL,
    "Id_Usuario" INTEGER NOT NULL,
    "Cargo" VARCHAR(200),
    "Departamento" VARCHAR(200),

    CONSTRAINT "FuncionarioGAD_pkey" PRIMARY KEY ("Id_Funcionario")
);

-- CreateTable
CREATE TABLE "Instituciones_usuario" (
    "Id" SERIAL NOT NULL,
    "Id_Usuario" INTEGER NOT NULL,
    "Id_Institucion" INTEGER NOT NULL,

    CONSTRAINT "Instituciones_usuario_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "mancomunidades" (
    "Id_Mancomunidad" SERIAL NOT NULL,
    "Nombre_Mancomunidad" VARCHAR(300) NOT NULL,

    CONSTRAINT "mancomunidades_pkey" PRIMARY KEY ("Id_Mancomunidad")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rol_nombre_rol_key" ON "Rol"("nombre_rol");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_auth_uid_key" ON "Usuario"("auth_uid");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_CI_Usuario_key" ON "Usuario"("CI_Usuario");

-- CreateIndex
CREATE INDEX "Usuario_auth_uid_idx" ON "Usuario"("auth_uid");

-- CreateIndex
CREATE INDEX "Usuario_CI_Usuario_idx" ON "Usuario"("CI_Usuario");

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_Capacitaciones_Id_Usuario_Id_Capacitacion_key" ON "Usuarios_Capacitaciones"("Id_Usuario", "Id_Capacitacion");

-- CreateIndex
CREATE INDEX "Usuarios_Capacitaciones_Id_Usuario_idx" ON "Usuarios_Capacitaciones"("Id_Usuario");

-- CreateIndex
CREATE INDEX "Usuarios_Capacitaciones_Id_Capacitacion_idx" ON "Usuarios_Capacitaciones"("Id_Capacitacion");

-- CreateIndex
CREATE UNIQUE INDEX "Certificados_Codigo_QR_key" ON "Certificados"("Codigo_QR");

-- CreateIndex
CREATE INDEX "Certificados_Codigo_QR_idx" ON "Certificados"("Codigo_QR");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_Rol_Usuario_fkey" FOREIGN KEY ("Rol_Usuario") REFERENCES "Rol"("Id_Rol") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_Entidad_Usuario_fkey" FOREIGN KEY ("Entidad_Usuario") REFERENCES "Entidades"("Id_Entidad") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cantones" ADD CONSTRAINT "Cantones_Id_Provincia_fkey" FOREIGN KEY ("Id_Provincia") REFERENCES "Provincias"("Id_Provincia") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parroquia" ADD CONSTRAINT "parroquia_Id_Canton_fkey" FOREIGN KEY ("Id_Canton") REFERENCES "Cantones"("Id_Canton") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuarios_Capacitaciones" ADD CONSTRAINT "Usuarios_Capacitaciones_Id_Usuario_fkey" FOREIGN KEY ("Id_Usuario") REFERENCES "Usuario"("Id_Usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuarios_Capacitaciones" ADD CONSTRAINT "Usuarios_Capacitaciones_Id_Capacitacion_fkey" FOREIGN KEY ("Id_Capacitacion") REFERENCES "Capacitaciones"("Id_Capacitacion") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificados" ADD CONSTRAINT "Certificados_Id_Usuario_fkey" FOREIGN KEY ("Id_Usuario") REFERENCES "Usuario"("Id_Usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificados" ADD CONSTRAINT "Certificados_Id_Capacitacion_fkey" FOREIGN KEY ("Id_Capacitacion") REFERENCES "Capacitaciones"("Id_Capacitacion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Autoridades" ADD CONSTRAINT "Autoridades_Id_Usuario_fkey" FOREIGN KEY ("Id_Usuario") REFERENCES "Usuario"("Id_Usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuncionarioGAD" ADD CONSTRAINT "FuncionarioGAD_Id_Usuario_fkey" FOREIGN KEY ("Id_Usuario") REFERENCES "Usuario"("Id_Usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instituciones_usuario" ADD CONSTRAINT "Instituciones_usuario_Id_Usuario_fkey" FOREIGN KEY ("Id_Usuario") REFERENCES "Usuario"("Id_Usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instituciones_usuario" ADD CONSTRAINT "Instituciones_usuario_Id_Institucion_fkey" FOREIGN KEY ("Id_Institucion") REFERENCES "instituciones_sistema"("Id_Institucion") ON DELETE RESTRICT ON UPDATE CASCADE;
