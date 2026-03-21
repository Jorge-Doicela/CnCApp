-- CreateTable
CREATE TABLE "gad_parroquias" (
    "id_gad_parroquia" SERIAL NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,

    CONSTRAINT "gad_parroquias_pkey" PRIMARY KEY ("id_gad_parroquia")
);

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN "id_gad_parroquia" INTEGER;

-- CreateIndex
CREATE INDEX "usuarios_id_gad_parroquia_idx" ON "usuarios"("id_gad_parroquia");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_gad_parroquia_fkey" FOREIGN KEY ("id_gad_parroquia") REFERENCES "gad_parroquias"("id_gad_parroquia") ON DELETE SET NULL ON UPDATE CASCADE;
